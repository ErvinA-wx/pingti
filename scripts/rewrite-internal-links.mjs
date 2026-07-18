import { execFileSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = process.cwd()
const EXCLUDED_FILES = new Set([
  'scripts/rewrite-internal-links.mjs',
  'scripts/rewrite-internal-links.test.mjs'
])
const LOCAL_ORIGIN = 'https://pingti.org'
const TEXT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsonl',
  '.md',
  '.mjs',
  '.ts',
  '.vue',
  '.yaml',
  '.yml'
])

function parseArgs(argv) {
  const options = { check: false }
  for (const argument of argv) {
    if (argument === '--check') options.check = true
    else throw new Error(`未知参数：${argument}`)
  }
  return options
}

export function rewriteInternalLinks(content) {
  return content
    .replace(
      /https?:\/\/(?:www\.)?fmhy\.net(?=[:/?#\s)"'`<>\]}]|$)/gi,
      LOCAL_ORIGIN
    )
    .replace(
      /(?<![A-Za-z0-9.@-])(?:www\.)?fmhy\.net(?![A-Za-z0-9.-])/gi,
      'pingti.org'
    )
}

function trackedTextFiles() {
  return execFileSync('git', ['ls-files', '-z'], {
    cwd: ROOT,
    encoding: 'utf8'
  })
    .split('\0')
    .filter(Boolean)
    .filter((file) => !EXCLUDED_FILES.has(file))
    .filter((file) => TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()))
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const changed = []
  let replacements = 0

  for (const repoPath of trackedTextFiles()) {
    const file = path.join(ROOT, repoPath)
    const original = await fs.readFile(file, 'utf8')
    const rewritten = rewriteInternalLinks(original)
    if (rewritten === original) continue

    changed.push(repoPath)
    replacements +=
      [...original.matchAll(/https?:\/\/(?:www\.)?fmhy\.net/gi)].length +
      [
        ...original.matchAll(
          /(?<![A-Za-z0-9.@/-])(?:www\.)?fmhy\.net(?![A-Za-z0-9.-])/gi
        )
      ].length

    if (!options.check) await fs.writeFile(file, rewritten)
  }

  if (!changed.length) {
    console.log('站内链接检查通过：未发现指向 FMHY 主站的旧域名。')
    return
  }

  console.log(
    `${options.check ? '发现' : '已重写'} ${changed.length} 个文件中的 ${replacements} 个 FMHY 主站域名引用。`
  )
  for (const file of changed) console.log(`- ${file}`)
  if (options.check) process.exitCode = 1
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error.stack || error.message)
    process.exitCode = 1
  })
}
