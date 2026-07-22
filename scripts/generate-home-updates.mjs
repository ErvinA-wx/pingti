import { execFileSync } from 'node:child_process'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'docs/.vitepress/data/home-updates.json')
const localContentDir = resolve(root, 'local-content')
const MAX_ITEMS = 20

const categoryByFile = {
  'ai.md': '人工智能',
  'audio.md': '音乐与音频',
  'developer-tools.md': '开发者工具',
  'downloading.md': '下载资源',
  'educational.md': '教育资源',
  'file-tools.md': '文件工具',
  'gaming.md': '游戏',
  'image-tools.md': '图像工具',
  'internet-tools.md': '网络工具',
  'mobile.md': '移动应用',
  'privacy.md': '隐私与安全',
  'reading.md': '阅读',
  'social-media-tools.md': '社交媒体工具',
  'system-tools.md': '系统工具',
  'text-tools.md': '文本工具',
  'video-tools.md': '视频工具',
  'video.md': '影视与流媒体'
}

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' })
}

function stripMarkdown(value) {
  return value
    .replace(/!?(\[[^\]]*\])\([^)]*\)/g, '$1')
    .replace(/[\*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function resourceType(url) {
  const hostname = new URL(url).hostname.replace(/^www\./, '')
  if (hostname === 'github.com') return 'GitHub'
  if (
    hostname === 'play.google.com' ||
    hostname === 'apps.apple.com' ||
    hostname === 'apps.microsoft.com'
  ) {
    return 'APP'
  }
  if (
    hostname.includes('addons.') ||
    hostname === 'chromewebstore.google.com'
  ) {
    return '扩展'
  }
  return '网站'
}

async function structuredLocalResources() {
  const files = (await readdir(localContentDir)).filter((file) =>
    file.endsWith('.json')
  )
  const resources = []

  for (const file of files) {
    const entries = JSON.parse(
      await readFile(resolve(localContentDir, file), 'utf8')
    )
    for (const entry of entries) {
      if (!entry.addedAt || !entry.category) continue
      resources.push({
        title: entry.name,
        href: entry.url,
        details: entry.description,
        type: entry.type || resourceType(entry.url),
        category: entry.category,
        date: entry.addedAt
      })
    }
  }

  return resources.sort((a, b) => b.date.localeCompare(a.date))
}

function resourcesFromCommit(hash, date) {
  const diff = git(['show', '--format=', '--unified=0', hash, '--', 'docs'])
  const resources = []
  let file = ''

  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/docs/')) {
      file = line.slice('+++ b/docs/'.length)
      continue
    }
    if (!line.startsWith('+') || line.startsWith('+++')) continue
    const added = line.slice(1).trim()
    if (!/^[-*+]\s+/.test(added)) continue

    const match = added.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/)
    if (!match) continue

    const [, rawTitle, href] = match
    const title = stripMarkdown(rawTitle)
    if (!title || /^(github|discord|guide|website)$/i.test(title)) continue

    const afterLink = added.slice(added.indexOf(match[0]) + match[0].length)
    const details = stripMarkdown(afterLink.replace(/^\s*(?:-|–|—|\/)\s*/, ''))
    if (!details) continue
    resources.push({
      title,
      href,
      details: details.slice(0, 72),
      type: resourceType(href),
      category: categoryByFile[file] || '其他资源',
      date
    })
  }

  return resources
}

async function latestResources() {
  const commits = git([
    'log',
    '--since=30 days ago',
    '--format=%H%x09%as',
    '--',
    'docs',
    ':(exclude)docs/posts'
  ])
    .trim()
    .split('\n')
    .filter(Boolean)

  const structured = await structuredLocalResources()
  const seen = new Set(structured.map(({ href }) => href))
  const results = [...structured]
  for (const record of commits) {
    if (results.length >= MAX_ITEMS) break
    const [hash, date] = record.split('\t')
    for (const resource of resourcesFromCommit(hash, date)) {
      if (seen.has(resource.href)) continue
      seen.add(resource.href)
      results.push(resource)
      if (results.length >= MAX_ITEMS) break
    }
  }
  return results
}

await mkdir(dirname(output), { recursive: true })
await writeFile(
  output,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), resources: (await latestResources()).slice(0, MAX_ITEMS) }, null, 2)}\n`
)
