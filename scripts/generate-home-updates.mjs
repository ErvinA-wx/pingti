import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'docs/.vitepress/data/home-updates.json')
const MAX_ITEMS = 20

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

function resourcesFromCommit(hash, date) {
  const diff = git(['show', '--format=', '--unified=0', hash, '--', 'docs'])
  const resources = []

  for (const line of diff.split('\n')) {
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
    resources.push({
      title,
      href,
      details: details.slice(0, 72),
      date
    })
  }

  return resources
}

function latestResources() {
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

  const seen = new Set()
  const results = []
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
  `${JSON.stringify({ generatedAt: new Date().toISOString(), resources: latestResources() }, null, 2)}\n`
)
