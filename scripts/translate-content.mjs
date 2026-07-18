import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visitParents } from 'unist-util-visit-parents'

const ROOT = process.cwd()
const TRANSLATION_DIR = path.join(ROOT, 'translation')
const GLOSSARY_FILE = path.join(TRANSLATION_DIR, 'glossary.json')
const MEMORY_FILE = path.join(TRANSLATION_DIR, 'memory.jsonl')
const STATUS_FILE = path.join(TRANSLATION_DIR, 'status.json')
const MODEL = 'deepseek-v4-flash'
const API_BASE = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com'
const BALANCE_EXIT_CODE = 42
const DEFAULT_BATCH_SIZE = 24
const DEFAULT_CONCURRENCY = 4
const EXCLUDED_FILES = new Set([
  'docs/recently-removed.md',
  'docs/public/single-page.md'
])
const BLOCK_TYPES = new Set(['heading', 'paragraph', 'tableCell'])
const SKIP_ANCESTORS = new Set([
  'code',
  'inlineCode',
  'html',
  'image',
  'imageReference',
  'yaml'
])

class BalanceRequiredError extends Error {
  constructor(message = 'DeepSeek API 余额不足') {
    super(message)
    this.name = 'BalanceRequiredError'
  }
}

function parseArgs(argv) {
  const options = {
    check: false,
    dryRun: false,
    batchSize: DEFAULT_BATCH_SIZE,
    concurrency: DEFAULT_CONCURRENCY,
    maxBatches: Number.POSITIVE_INFINITY,
    changedSince: '',
    files: []
  }

  for (const argument of argv) {
    if (argument === '--') continue
    if (argument === '--check') options.check = true
    else if (argument === '--dry-run') options.dryRun = true
    else if (argument.startsWith('--batch-size=')) {
      options.batchSize = Number(argument.split('=')[1])
    } else if (argument.startsWith('--concurrency=')) {
      options.concurrency = Number(argument.split('=')[1])
    } else if (argument.startsWith('--max-batches=')) {
      options.maxBatches = Number(argument.split('=')[1])
    } else if (argument.startsWith('--changed-since=')) {
      options.changedSince = argument.split('=').slice(1).join('=')
    } else if (argument.startsWith('--files=')) {
      options.files = argument
        .split('=')
        .slice(1)
        .join('=')
        .split(',')
        .filter(Boolean)
    } else {
      throw new Error(`未知参数：${argument}`)
    }
  }

  for (const [name, value] of [
    ['batch-size', options.batchSize],
    ['concurrency', options.concurrency],
    ['max-batches', options.maxBatches]
  ]) {
    if (!Number.isFinite(value) && name !== 'max-batches') {
      throw new Error(`${name} 必须是数字`)
    }
    if (Number.isFinite(value) && value < 1) {
      throw new Error(`${name} 必须大于 0`)
    }
  }

  return options
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

async function atomicWrite(file, content) {
  const temporaryFile = `${file}.tmp`
  await fs.writeFile(temporaryFile, content)
  await fs.rename(temporaryFile, file)
}

async function writeStatus(state, details = {}) {
  await atomicWrite(
    STATUS_FILE,
    `${JSON.stringify(
      {
        state,
        model: MODEL,
        updatedAt: new Date().toISOString(),
        ...details
      },
      null,
      2
    )}\n`
  )
}

async function loadMemory() {
  const memory = new Map()
  let content = ''
  try {
    content = await fs.readFile(MEMORY_FILE, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  for (const line of content.split('\n')) {
    if (!line.trim()) continue
    const entry = JSON.parse(line)
    memory.set(entry.hash, entry)
  }
  return memory
}

async function saveMemory(memory) {
  const entries = [...memory.values()].sort((left, right) =>
    left.hash.localeCompare(right.hash)
  )
  const content = entries.map((entry) => JSON.stringify(entry)).join('\n')
  await atomicWrite(MEMORY_FILE, content ? `${content}\n` : '')
}

function normalizeRepoPath(file) {
  return path.relative(ROOT, file).split(path.sep).join('/')
}

async function resolveFiles(options) {
  let files = execFileSync('git', ['ls-files', '-z', '--', 'docs'], {
    cwd: ROOT,
    encoding: 'utf8'
  })
    .split('\0')
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(ROOT, file))
  files = files.filter((file) => {
    const repoPath = normalizeRepoPath(file)
    return !repoPath.includes('/public/') && !EXCLUDED_FILES.has(repoPath)
  })

  if (options.changedSince) {
    const changed = new Set(
      execFileSync(
        'git',
        ['diff', '--name-only', `${options.changedSince}...HEAD`, '--', 'docs'],
        { cwd: ROOT, encoding: 'utf8' }
      )
        .split('\n')
        .filter((file) => file.endsWith('.md'))
    )
    files = files.filter((file) => changed.has(normalizeRepoPath(file)))
  }

  if (options.files.length) {
    const requested = new Set(options.files)
    files = files.filter((file) => requested.has(normalizeRepoPath(file)))
  }

  return files.sort()
}

function countCharacters(value, expression) {
  return [...value.matchAll(expression)].length
}

function isTranslatable(value, doNotTranslate) {
  const trimmed = value.trim()
  if (!trimmed || doNotTranslate.has(trimmed)) return false
  if (/^(?:https?:\/\/|mailto:|www\.)/i.test(trimmed)) return false
  if (/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(trimmed)) return false
  if (/^[a-z0-9_-]+\.[a-z0-9._/-]+$/i.test(trimmed)) return false
  if (/^[\W\d_]+$/u.test(trimmed)) return false

  const latin = countCharacters(trimmed, /[A-Za-z]/g)
  const chinese = countCharacters(trimmed, /[\u3400-\u9fff]/g)
  if (latin < 3) return false
  // A completed translation can legitimately contain many Latin characters in
  // product names, acronyms and protected links. Once Chinese prose is present,
  // do not send the block back for repeated translation.
  if (chinese > 0) return false
  return true
}

function frontmatterEndOffset(source) {
  if (!source.startsWith('---\n')) return 0
  const end = source.indexOf('\n---\n', 4)
  return end === -1 ? 0 : end + 5
}

function collectFrontmatterSegments(source, repoPath, glossary) {
  const endOffset = frontmatterEndOffset(source)
  if (!endOffset) return []
  const frontmatter = source.slice(0, endOffset)
  const segments = []
  const expression = /^(title|description|headTitle|excerpt):\s*(.+)$/gm
  let match
  while ((match = expression.exec(frontmatter))) {
    const value = match[2].trim()
    if (!isTranslatable(value, glossary.doNotTranslateSet)) continue
    const relativeStart = match[0].lastIndexOf(match[2])
    const start = match.index + relativeStart
    segments.push({
      file: repoPath,
      start,
      end: start + match[2].length,
      source: match[2],
      context: match[0],
      kind: 'frontmatter'
    })
  }
  return segments
}

function collectMarkdownSegments(source, repoPath, glossary) {
  const parser = unified().use(remarkParse)
  const tree = parser.parse(source)
  const segments = []
  const yamlEnd = frontmatterEndOffset(source)

  visitParents(tree, (node, ancestors) => {
    if (!BLOCK_TYPES.has(node.type) || !node.position) return
    if (node.position.start.offset < yamlEnd) return
    if (ancestors.some((ancestor) => SKIP_ANCESTORS.has(ancestor.type))) return
    if (ancestors.some((ancestor) => BLOCK_TYPES.has(ancestor.type))) return

    const positionedChildren = (node.children || []).filter(
      (child) => child.position?.start?.offset !== undefined
    )
    const start = positionedChildren.length
      ? positionedChildren[0].position.start.offset
      : node.position.start.offset
    const end = positionedChildren.length
      ? positionedChildren.at(-1).position.end.offset
      : node.position.end.offset
    const raw = source.slice(start, end)
    if (!isTranslatable(raw, glossary.doNotTranslateSet)) return

    segments.push({
      file: repoPath,
      start,
      end,
      source: raw,
      context: raw.slice(0, 2400),
      kind: node.type
    })
  })

  return [
    ...collectFrontmatterSegments(source, repoPath, glossary),
    ...segments
  ]
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function protectText(value, doNotTranslate) {
  const protectedValues = []
  let text = value
  const candidates = [
    ...doNotTranslate.sort((left, right) => right.length - left.length)
  ]

  function replace(candidate) {
    const token = `⟦P${String(protectedValues.length).padStart(4, '0')}⟧`
    protectedValues.push({ token, value: candidate })
    return token
  }

  text = text.replace(
    /(!?)\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|[^\s)]+)\)/g,
    replace
  )
  text = text.replace(/`[^`\n]+`/g, replace)
  text = text.replace(/<[^>\n]+>/g, replace)
  text = text.replace(
    /https?:\/\/[^\s)\]}>,]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,
    replace
  )
  for (const candidate of candidates) {
    const expression = new RegExp(escapeRegExp(candidate), 'g')
    text = text.replace(expression, replace)
  }
  text = text.replace(/^!!!(?:note|warning|info|tip|danger)\b/i, replace)

  return { text, protectedValues }
}

function restoreText(value, protectedValues) {
  let restored = value
  for (const { token, value: original } of protectedValues) {
    const occurrences = restored.split(token).length - 1
    if (occurrences !== 1) {
      throw new Error(`占位符 ${token} 数量异常：${occurrences}`)
    }
    restored = restored.replace(token, original)
  }
  return restored
}

function protectedSignature(source) {
  const parser = unified().use(remarkParse)
  const tree = parser.parse(source)
  const signature = { links: [], code: [], images: [] }
  visitParents(tree, (node) => {
    if (node.type === 'link') signature.links.push(node.url)
    else if (node.type === 'definition') signature.links.push(node.url)
    else if (node.type === 'image') {
      signature.images.push(`${node.url}\u0000${node.title || ''}`)
    } else if (node.type === 'code' || node.type === 'inlineCode') {
      signature.code.push(`${node.lang || ''}\u0000${node.value}`)
    }
  })
  for (const values of Object.values(signature)) values.sort()
  return JSON.stringify(signature)
}

function buildGlossaryPrompt(glossary) {
  const terms = Object.entries(glossary.terms)
    .map(([source, target]) => `- ${source} => ${target}`)
    .join('\n')
  return `术语表：\n${terms}\n\n不得翻译或改写的名称已替换为 ⟦P0000⟧ 形式的占位符。`
}

function createBatches(segments, batchSize) {
  const batches = []
  let current = []
  let characters = 0
  for (const segment of segments) {
    const nextCharacters = segment.protectedText.length + segment.context.length
    if (
      current.length &&
      (current.length >= batchSize || characters + nextCharacters > 24_000)
    ) {
      batches.push(current)
      current = []
      characters = 0
    }
    current.push(segment)
    characters += nextCharacters
  }
  if (current.length) batches.push(current)
  return batches
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function fetchJson(url, init, attempts = 5) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init)
      const body = await response.text()
      if (response.status === 402) throw new BalanceRequiredError()
      if (!response.ok) {
        const error = new Error(
          `DeepSeek API ${response.status}: ${body.slice(0, 500)}`
        )
        error.status = response.status
        throw error
      }
      return body ? JSON.parse(body) : {}
    } catch (error) {
      if (error instanceof BalanceRequiredError) throw error
      lastError = error
      const retryable =
        !error.status || error.status === 429 || error.status >= 500
      if (!retryable || attempt === attempts) throw error
      await wait(Math.min(1000 * 2 ** (attempt - 1), 15_000))
    }
  }
  throw lastError
}

async function checkBalance(apiKey) {
  const result = await fetchJson(`${API_BASE}/user/balance`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  })
  if (!result.is_available) throw new BalanceRequiredError()
  return result.balance_infos || []
}

async function translateBatch(batch, apiKey, glossaryPrompt) {
  const payload = {
    model: MODEL,
    thinking: { type: 'disabled' },
    temperature: 0.2,
    max_tokens: 32_000,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `我们是专业的简体中文本地化编辑。把输入 JSON 中每个片段忠实、自然、完整地翻译成简体中文。\n\n规则：\n1. 只输出合法 JSON，格式必须是 {"translations":[{"id":"原 id","text":"译文"}]}。\n2. 返回的 id 数量和顺序必须与输入完全一致，不能合并、拆分或遗漏。\n3. 所有 ⟦P0000⟧ 形式占位符必须原样保留一次；允许根据中文语序移动完整占位符，但不能改变内容。\n4. 不添加原文没有的事实、警告或推荐。\n5. 中文使用自然、简洁的互联网产品表达；软件、网站、协议和品牌名保持原样。\n6. 完整保留 Markdown 标记、链接括号、强调符号和 VitePress 容器标记。\n7. 避免使用第二人称“你”或“您”；优先使用“可以”“建议”“请”或省略主语。\n8. context 只用于理解上下文，不要翻译或返回 context。\n9. 保留片段开头和结尾的空白。\n\n${glossaryPrompt}`
      },
      {
        role: 'user',
        content: JSON.stringify({
          task: '请以 JSON 返回全部片段的简体中文译文',
          segments: batch.map((segment) => ({
            id: segment.id,
            text: segment.protectedText,
            context: segment.context
          }))
        })
      }
    ]
  }

  const response = await fetchJson(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  const choice = response.choices?.[0]
  if (!choice?.message?.content) throw new Error('DeepSeek 返回空内容')
  if (choice.finish_reason !== 'stop') {
    throw new Error(`DeepSeek 返回未完成：${choice.finish_reason}`)
  }
  const parsed = JSON.parse(choice.message.content)
  const translations = parsed.translations
  if (!Array.isArray(translations) || translations.length !== batch.length) {
    throw new Error('DeepSeek 返回的片段数量与输入不一致')
  }

  return batch.map((segment, index) => {
    const result = translations[index]
    if (result.id !== segment.id || typeof result.text !== 'string') {
      throw new Error(`DeepSeek 返回片段顺序或格式错误：${segment.id}`)
    }
    let translation
    try {
      translation = restoreText(result.text, segment.protectedValues)
    } catch (error) {
      throw new Error(
        `${error.message}；片段 ${segment.id}：${segment.protectedText.slice(0, 500)}`
      )
    }
    if (protectedSignature(segment.source) !== protectedSignature(translation)) {
      throw new Error(
        `片段链接、图片或代码结构发生变化；片段 ${segment.id}：${segment.protectedText.slice(0, 500)}`
      )
    }
    return {
      segment,
      translation,
      usage: response.usage
    }
  })
}

async function translateBatchWithRetries(batch, apiKey, glossaryPrompt) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await translateBatch(batch, apiKey, glossaryPrompt)
    } catch (error) {
      if (error instanceof BalanceRequiredError) throw error
      lastError = error
      if (attempt < 3) {
        console.warn(`批次格式校验失败，准备重试 ${attempt}/3：${error.message}`)
        await wait(attempt * 1000)
      }
    }
  }
  throw lastError
}

async function translateBatchResilient(batch, apiKey, glossaryPrompt) {
  try {
    return await translateBatchWithRetries(batch, apiKey, glossaryPrompt)
  } catch (error) {
    if (error instanceof BalanceRequiredError || batch.length === 1) throw error
    const middle = Math.ceil(batch.length / 2)
    console.warn(
      `批次连续校验失败，拆分为 ${middle} + ${batch.length - middle} 个片段继续。`
    )
    const left = await translateBatchResilient(
      batch.slice(0, middle),
      apiKey,
      glossaryPrompt
    )
    const right = await translateBatchResilient(
      batch.slice(middle),
      apiKey,
      glossaryPrompt
    )
    return [...left, ...right]
  }
}

async function runPool(items, concurrency, worker) {
  let cursor = 0
  let stopped = false
  let fatalError

  async function runWorker() {
    while (!stopped) {
      const index = cursor
      cursor += 1
      if (index >= items.length) return
      try {
        await worker(items[index], index)
      } catch (error) {
        stopped = true
        fatalError ||= error
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, runWorker)
  )
  if (fatalError) throw fatalError
}

async function applyTranslations(files, segments) {
  const byFile = new Map()
  for (const segment of segments) {
    if (!segment.translation || segment.translation === segment.source) continue
    const replacements = byFile.get(segment.file) || []
    replacements.push(segment)
    byFile.set(segment.file, replacements)
  }

  for (const [repoPath, replacements] of byFile) {
    const file = path.join(ROOT, repoPath)
    const original = files.get(repoPath)
    const originalSignature = protectedSignature(original)
    let translated = original
    for (const replacement of replacements.sort(
      (left, right) => right.start - left.start
    )) {
      translated =
        translated.slice(0, replacement.start) +
        replacement.translation +
        translated.slice(replacement.end)
    }
    const translatedSignature = protectedSignature(translated)
    if (originalSignature !== translatedSignature) {
      throw new Error(`${repoPath} 的链接、图片或代码结构在翻译后发生变化`)
    }
    unified().use(remarkParse).parse(translated)
    await atomicWrite(file, translated)
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const glossary = await readJson(GLOSSARY_FILE)
  glossary.doNotTranslateSet = new Set(glossary.doNotTranslate)
  const memory = await loadMemory()
  const selectedFiles = await resolveFiles(options)
  const sources = new Map()
  const segments = []

  for (const file of selectedFiles) {
    const repoPath = normalizeRepoPath(file)
    const source = await fs.readFile(file, 'utf8')
    sources.set(repoPath, source)
    for (const segment of collectMarkdownSegments(source, repoPath, glossary)) {
      const { text, protectedValues } = protectText(
        segment.source,
        glossary.doNotTranslate
      )
      const unprotectedText = text.replace(/⟦P\d{4}⟧/g, '')
      if (!isTranslatable(unprotectedText, new Set())) continue
      const hash = sha256(
        `${glossary.version}\u0000${segment.source}\u0000${segment.context}`
      )
      const cached = memory.get(hash)
      const validCached =
        cached &&
        protectedSignature(segment.source) ===
          protectedSignature(cached.translation)
      if (cached && !validCached) memory.delete(hash)
      segments.push({
        ...segment,
        id: `${repoPath}:${segment.start}`,
        hash,
        protectedText: text,
        protectedValues,
        translation: validCached ? cached.translation : undefined
      })
    }
  }

  const pending = segments.filter((segment) => !segment.translation)
  const cachedCount = segments.length - pending.length
  console.log(
    `扫描 ${selectedFiles.length} 个文件、${segments.length} 个英文片段；缓存命中 ${cachedCount}，待翻译 ${pending.length}。`
  )

  if (options.check || options.dryRun) {
    if (pending.length) {
      console.log('\n待翻译片段示例：')
      for (const segment of pending.slice(0, 20)) {
        const preview = segment.source.replace(/\s+/g, ' ').slice(0, 180)
        console.log(`- ${segment.file} (${segment.kind}): ${preview}`)
      }
    }
    await writeStatus(options.check ? 'checked' : 'dry_run', {
      files: selectedFiles.length,
      segments: segments.length,
      cached: cachedCount,
      pending: pending.length
    })
    if (options.check && pending.length) process.exitCode = 1
    return
  }

  if (!pending.length) {
    await applyTranslations(sources, segments)
    await writeStatus('complete', {
      files: selectedFiles.length,
      segments: segments.length,
      cached: cachedCount,
      pending: 0
    })
    return
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('缺少 DEEPSEEK_API_KEY 环境变量')

  try {
    const balance = await checkBalance(apiKey)
    console.log(
      `DeepSeek 余额可用：${balance.map((item) => `${item.total_balance} ${item.currency}`).join(' / ') || '可用'}`
    )
  } catch (error) {
    if (!(error instanceof BalanceRequiredError)) throw error
    await writeStatus('balance_required', {
      files: selectedFiles.length,
      segments: segments.length,
      cached: cachedCount,
      pending: pending.length,
      message: 'DeepSeek 余额不足。充值后重新运行相同命令即可从翻译记忆继续。'
    })
    console.error('DeepSeek 余额不足；翻译记忆和断点状态已经保留。')
    process.exitCode = BALANCE_EXIT_CODE
    return
  }

  const batches = createBatches(pending, options.batchSize).slice(
    0,
    options.maxBatches
  )
  const glossaryPrompt = buildGlossaryPrompt(glossary)
  let completedBatches = 0
  let translatedCount = 0
  let promptTokens = 0
  let completionTokens = 0
  let checkpointQueue = Promise.resolve()

  try {
    await writeStatus('running', {
      files: selectedFiles.length,
      segments: segments.length,
      cached: cachedCount,
      pending: pending.length,
      batches: batches.length
    })
    await runPool(batches, options.concurrency, async (batch) => {
      const results = await translateBatchResilient(
        batch,
        apiKey,
        glossaryPrompt
      )
      for (const result of results) {
        result.segment.translation = result.translation
        memory.set(result.segment.hash, {
          hash: result.segment.hash,
          source: result.segment.source,
          translation: result.translation,
          model: MODEL,
          updatedAt: new Date().toISOString()
        })
      }
      promptTokens += results[0]?.usage?.prompt_tokens || 0
      completionTokens += results[0]?.usage?.completion_tokens || 0
      translatedCount += results.length
      completedBatches += 1
      checkpointQueue = checkpointQueue.then(async () => {
        await saveMemory(memory)
        await writeStatus('running', {
          files: selectedFiles.length,
          segments: segments.length,
          cached: cachedCount,
          translated: translatedCount,
          pending: pending.length - translatedCount,
          completedBatches,
          batches: batches.length,
          usage: { promptTokens, completionTokens }
        })
      })
      await checkpointQueue
      console.log(
        `完成批次 ${completedBatches}/${batches.length}，新增 ${translatedCount} 个片段。`
      )
    })
  } catch (error) {
    await saveMemory(memory)
    if (error instanceof BalanceRequiredError) {
      await writeStatus('balance_required', {
        files: selectedFiles.length,
        segments: segments.length,
        cached: cachedCount,
        translated: translatedCount,
        pending: pending.length - translatedCount,
        completedBatches,
        batches: batches.length,
        usage: { promptTokens, completionTokens },
        message: 'DeepSeek 余额不足。充值后重新运行相同命令即可从翻译记忆继续。'
      })
      console.error('DeepSeek 余额不足；翻译记忆和断点状态已经保留。')
      process.exitCode = BALANCE_EXIT_CODE
      return
    }
    await writeStatus('failed', {
      pending: pending.length - translatedCount,
      message: error.message
    })
    throw error
  }

  await applyTranslations(sources, segments)
  const remaining = pending.length - translatedCount
  await writeStatus(remaining ? 'partial' : 'complete', {
    files: selectedFiles.length,
    segments: segments.length,
    cached: cachedCount,
    translated: translatedCount,
    pending: remaining,
    completedBatches,
    batches: batches.length,
    usage: { promptTokens, completionTokens }
  })
}

main().catch(async (error) => {
  console.error(error.stack || error.message)
  try {
    await writeStatus('failed', { message: error.message })
  } catch {
    // 保留原始错误。
  }
  process.exitCode = 1
})
