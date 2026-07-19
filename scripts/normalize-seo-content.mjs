import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const checkOnly = process.argv.includes('--check')
const postsDir = path.resolve('docs/posts')

function normalizePost(source) {
  const postTag = source.match(/<Post\s+authors=(['"])(.*?)\1\s*\/?>/)
  const authorNames = (postTag?.[2] ?? '')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((name) => name.replace(/^['"]|['"]$/g, '').trim())
    .filter(Boolean)

  let normalized = source
  if (authorNames.length > 0 && !/^authors:/m.test(normalized)) {
    normalized = normalized.replace(
      /^(---\n[\s\S]*?)(\n---)/,
      `$1\nauthors: [${authorNames.join(', ')}]$2`
    )
  }

  const lines = normalized.split('\n')
  let seenPost = false
  let fence = ''
  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim()
    const fenceMatch = trimmed.match(/^(```+|~~~+)/)
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0]
      else if (fence === fenceMatch[1][0]) fence = ''
      continue
    }
    if (!fence && /<Post\b/.test(lines[index])) seenPost = true
    if (seenPost && !fence && /^#\s+/.test(lines[index])) {
      lines[index] = `#${lines[index]}`
    }
  }

  return lines.join('\n')
}

const changed = []
for (const file of (await readdir(postsDir)).filter((name) =>
  name.endsWith('.md')
)) {
  const fullPath = path.join(postsDir, file)
  const source = await readFile(fullPath, 'utf8')
  const normalized = normalizePost(source)
  if (normalized === source) continue
  changed.push(path.relative(process.cwd(), fullPath))
  if (!checkOnly) await writeFile(fullPath, normalized)
}

if (checkOnly && changed.length > 0) {
  console.error(`以下文章需要 SEO 规范化：\n${changed.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(
    changed.length > 0
      ? `已规范化 ${changed.length} 篇文章的作者与标题层级。`
      : '文章 SEO 结构无需调整。'
  )
}
