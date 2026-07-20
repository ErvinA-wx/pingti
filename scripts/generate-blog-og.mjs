import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

function readArg(name) {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? undefined : process.argv[index + 1]
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function wrapText(value, maxUnits) {
  const lines = []
  let line = ''
  let units = 0

  for (const character of value) {
    if (character === '|') {
      if (line) lines.push(line.trim())
      line = ''
      units = 0
      continue
    }

    const weight = /[\u0000-\u00ff]/.test(character) ? 0.55 : 1
    if (units + weight > maxUnits && line) {
      lines.push(line.trim())
      line = character
      units = weight
    } else {
      line += character
      units += weight
    }
  }

  if (line) lines.push(line.trim())
  return lines.slice(0, 3)
}

const slug = readArg('slug')
const title = readArg('title')
const subtitle = readArg('subtitle') || '平替指南 · 中文 AI 工具推荐与选型参考'

if (!slug || !/^[a-z0-9-]+$/.test(slug) || !title) {
  console.error(
    '用法：pnpm blog:og -- --slug <slug> --title <标题，可用 | 强制换行> [--subtitle <副标题>]'
  )
  process.exit(1)
}

const titleLines = wrapText(title, 16)
const titleSvg = titleLines
  .map(
    (line, index) =>
      `<tspan x="88" dy="${index === 0 ? 0 : 82}">${escapeXml(line)}</tspan>`
  )
  .join('')
const outputDirectory = path.join(process.cwd(), 'docs/public/posts')
const outputPath = path.join(outputDirectory, `${slug}.png`)

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#071727"/>
      <stop offset="0.58" stop-color="#102c42"/>
      <stop offset="1" stop-color="#185676"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#73d7ff"/>
      <stop offset="1" stop-color="#8d8bff"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="55"/></filter>
  </defs>
  <rect width="1200" height="630" rx="0" fill="url(#background)"/>
  <circle cx="1075" cy="110" r="170" fill="#4bbff2" opacity="0.18" filter="url(#blur)"/>
  <circle cx="1010" cy="560" r="220" fill="#8d6dff" opacity="0.16" filter="url(#blur)"/>
  <path d="M90 86h74" stroke="url(#accent)" stroke-width="8" stroke-linecap="round"/>
  <text x="88" y="152" fill="#9edfff" font-size="30" font-weight="650" font-family="PingFang SC,Noto Sans CJK SC,Microsoft YaHei,sans-serif">PINGTI.ORG · 平替指南</text>
  <text x="88" y="260" fill="#f7fbff" font-size="64" font-weight="750" letter-spacing="-1" font-family="PingFang SC,Noto Sans CJK SC,Microsoft YaHei,sans-serif">${titleSvg}</text>
  <text x="88" y="548" fill="#c7dbea" font-size="27" font-weight="450" font-family="PingFang SC,Noto Sans CJK SC,Microsoft YaHei,sans-serif">${escapeXml(subtitle)}</text>
  <g transform="translate(905 236)">
    <rect x="0" y="0" width="210" height="210" rx="46" fill="#ffffff" opacity="0.08" stroke="#a4dcf4" stroke-opacity="0.34"/>
    <path d="M55 105h100M105 55v100" stroke="#8ddcff" stroke-width="16" stroke-linecap="round"/>
    <circle cx="105" cy="105" r="72" fill="none" stroke="#9c91ff" stroke-width="8" stroke-dasharray="24 16"/>
  </g>
</svg>`

await mkdir(outputDirectory, { recursive: true })
await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outputPath)

console.log(`已生成博客社交图片：${outputPath}`)
