import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const checkOnly = process.argv.includes('--check')
const root = process.cwd()
const sections = [
  {
    targetFile: 'docs/ai.md',
    entriesFile: 'local-content/ai-tools.json',
    id: 'ai-tools',
    anchor: '## ▷ AI 提示词',
    heading: '平替精选：AI 代理与开发工具',
    article:
      '[延伸阅读：10 款 AI 代理与开发工具推荐、适用场景与风险对比](/posts/pingti-ai-tools-2026-07)'
  },
  {
    targetFile: 'docs/social-media-tools.md',
    entriesFile: 'local-content/content-creator-tools.json',
    id: 'creator-tools',
    anchor: '# ► 社交媒体工具',
    heading: '平替精选：中文内容创作与发布工具',
    article:
      '[选型指南：10 款中文内容创作、剪辑与多平台发布工具](/posts/content-creator-tools-2026)'
  }
]

function canonicalUrl(value) {
  return value.replace(/\/$/, '').toLowerCase()
}

function removeManagedBlock(source, startMarker, endMarker) {
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

function applyLocalSection(source, entries, section) {
  const startMarker = `<!-- pingti-local-${section.id}:start -->`
  const endMarker = `<!-- pingti-local-${section.id}:end -->`
  const base = removeManagedBlock(source, startMarker, endMarker)
  const knownUrls = new Set(
    [...base.matchAll(/https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?/gi)].map(
      ([url]) => canonicalUrl(url)
    )
  )
  const missing = entries.filter(({ url }) => !knownUrls.has(canonicalUrl(url)))

  if (missing.length === 0) return base
  if (!base.includes(section.anchor)) {
    throw new Error(`未找到插入位置：${section.anchor}`)
  }

  const block = [
    startMarker,
    `## ▷ ${section.heading}`,
    '',
    `> ${section.article}`,
    '',
    ...missing.map(
      ({ name, url, description }) => `* [${name}](${url}) - ${description}`
    ),
    endMarker,
    '',
    ''
  ].join('\n')

  const insertion = `${block}${section.anchor}`
  return section.anchor.startsWith('# ►')
    ? base.replace(section.anchor, `${section.anchor}\n\n${block.trimEnd()}`)
    : base.replace(section.anchor, insertion)
}

for (const section of sections) {
  const [source, entriesSource] = await Promise.all([
    readFile(path.join(root, section.targetFile), 'utf8'),
    readFile(path.join(root, section.entriesFile), 'utf8')
  ])
  const result = applyLocalSection(source, JSON.parse(entriesSource), section)

  if (result === source) {
    console.log(`${section.heading}已是最新状态。`)
  } else if (checkOnly) {
    console.error(`${section.heading}需要重新应用。`)
    process.exitCode = 1
  } else {
    await writeFile(path.join(root, section.targetFile), result)
    console.log(`已应用${section.heading}，并按 GitHub 仓库地址去重。`)
  }
}
