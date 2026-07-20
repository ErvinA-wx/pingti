import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const checkOnly = process.argv.includes('--check')
const root = process.cwd()
const targetFile = path.join(root, 'docs/ai.md')
const entriesFile = path.join(root, 'local-content/ai-tools.json')
const startMarker = '<!-- pingti-local-ai-tools:start -->'
const endMarker = '<!-- pingti-local-ai-tools:end -->'
const anchor = '## ▷ AI 提示词'

function canonicalUrl(value) {
  return value.replace(/\/$/, '').toLowerCase()
}

function removeManagedBlock(source) {
  const start = source.indexOf(startMarker)
  if (start === -1) {
    if (source.includes(endMarker)) {
      throw new Error(`缺少本地内容开始标记：${startMarker}`)
    }
    return source
  }
  const end = source.indexOf(endMarker, start)
  if (end === -1) throw new Error(`缺少本地内容结束标记：${endMarker}`)
  const before = source.slice(0, start).replace(/\n*$/, '\n\n')
  const after = source.slice(end + endMarker.length).replace(/^\n*/, '')
  return `${before}${after}`
}

function applyLocalAiTools(source, entries) {
  const base = removeManagedBlock(source)
  const knownUrls = new Set(
    [...base.matchAll(/https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?/gi)].map(
      ([url]) => canonicalUrl(url)
    )
  )
  const missing = entries.filter(({ url }) => !knownUrls.has(canonicalUrl(url)))

  if (missing.length === 0) return base
  if (!base.includes(anchor)) throw new Error(`未找到插入位置：${anchor}`)

  const block = [
    startMarker,
    '## ▷ 平替精选：AI 代理与开发工具',
    '',
    ...missing.map(
      ({ name, url, description }) => `* [${name}](${url}) - ${description}`
    ),
    endMarker,
    '',
    ''
  ].join('\n')

  return base.replace(anchor, `${block}${anchor}`)
}

const [source, entriesSource] = await Promise.all([
  readFile(targetFile, 'utf8'),
  readFile(entriesFile, 'utf8')
])
const result = applyLocalAiTools(source, JSON.parse(entriesSource))

if (result === source) {
  console.log('平替本地内容已是最新状态。')
} else if (checkOnly) {
  console.error('平替本地内容需要重新应用。')
  process.exitCode = 1
} else {
  await writeFile(targetFile, result)
  console.log('已应用平替本地内容，并按 GitHub 仓库地址去重。')
}
