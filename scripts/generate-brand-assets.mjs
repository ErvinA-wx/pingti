import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = resolve(root, 'docs/public')
const sourceMark = resolve(publicDir, 'pwa_icon.png')
const sourceHero = resolve(publicDir, 'hero/pthero-1120.webp')
const iconsDir = resolve(publicDir, 'icons')
const ogDir = resolve(publicDir, 'og')

await Promise.all([
  mkdir(iconsDir, { recursive: true }),
  mkdir(ogDir, { recursive: true })
])

const iconBuffer = async (size, padding = 0) => {
  const innerSize = size - padding * 2
  const mark = await sharp(sourceMark)
    .resize(innerSize, innerSize, {
      fit: 'cover',
      position: 'centre'
    })
    .png({ compressionLevel: 9 })
    .toBuffer()

  if (padding === 0) return mark

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: '#050609'
    }
  })
    .composite([{ input: mark, left: padding, top: padding }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

const iconSpecs = [
  ['favicon-16x16.png', 16, 0],
  ['favicon-32x32.png', 32, 0],
  ['icon-192.png', 192, 0],
  ['icon-512.png', 512, 0],
  ['icon-maskable-512.png', 512, 64],
  ['apple-touch-icon-152.png', 152, 0],
  ['apple-touch-icon-167.png', 167, 0],
  ['apple-touch-icon-180.png', 180, 0]
]

const generatedIcons = new Map()
for (const [file, size, padding] of iconSpecs) {
  const buffer = await iconBuffer(size, padding)
  generatedIcons.set(file, buffer)
  await writeFile(resolve(iconsDir, file), buffer)
}

function makeIco(images) {
  const headerSize = 6
  const entrySize = 16
  let offset = headerSize + entrySize * images.length
  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)

  const entries = images.map(({ size, buffer }) => {
    const entry = Buffer.alloc(entrySize)
    entry.writeUInt8(size === 256 ? 0 : size, 0)
    entry.writeUInt8(size === 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(buffer.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += buffer.length
    return entry
  })

  return Buffer.concat([
    header,
    ...entries,
    ...images.map(({ buffer }) => buffer)
  ])
}

const faviconSizes = [16, 32, 48, 256]
const faviconImages = await Promise.all(
  faviconSizes.map(async (size) => ({ size, buffer: await iconBuffer(size) }))
)
await writeFile(resolve(publicDir, 'favicon.ico'), makeIco(faviconImages))

const markData = (
  await sharp(sourceMark)
    .resize(150, 150, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer()
).toString('base64')

const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#090b10"/>
      <stop offset="1" stop-color="#151924"/>
    </linearGradient>
    <radialGradient id="cyan" cx="0" cy="0" r="1" gradientTransform="translate(220 160) rotate(35) scale(500 360)">
      <stop stop-color="#36c5e8" stop-opacity=".18"/>
      <stop offset="1" stop-color="#36c5e8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="violet" cx="0" cy="0" r="1" gradientTransform="translate(1040 560) rotate(210) scale(520 360)">
      <stop stop-color="#8b7cf6" stop-opacity=".16"/>
      <stop offset="1" stop-color="#8b7cf6" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="logoClip"><rect x="78" y="118" width="150" height="150" rx="20"/></clipPath>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#cyan)"/>
  <rect width="1200" height="630" fill="url(#violet)"/>
  <rect x="48" y="48" width="1104" height="534" rx="28" fill="none" stroke="#ffffff" stroke-opacity=".11"/>
  <image href="data:image/png;base64,${markData}" x="78" y="118" width="150" height="150" clip-path="url(#logoClip)"/>
  <rect x="78" y="118" width="150" height="150" rx="20" fill="none" stroke="#ffffff" stroke-opacity=".10"/>
  <text x="278" y="194" fill="#f8fafc" font-family="PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif" font-size="76" font-weight="700" letter-spacing="2">平替指南</text>
  <text x="282" y="255" fill="#aeb8c8" font-family="PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif" font-size="31" font-weight="500">发现更自由、更实用的免费与开源替代方案</text>
  <line x1="82" y1="344" x2="1118" y2="344" stroke="#ffffff" stroke-opacity=".12"/>
  <g font-family="PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif" font-size="28" font-weight="600">
    <rect x="82" y="390" width="142" height="62" rx="12" fill="#ffffff" fill-opacity=".075" stroke="#ffffff" stroke-opacity=".10"/>
    <text x="117" y="430" fill="#dbe5f3">免费</text>
    <rect x="242" y="390" width="142" height="62" rx="12" fill="#ffffff" fill-opacity=".075" stroke="#ffffff" stroke-opacity=".10"/>
    <text x="277" y="430" fill="#dbe5f3">开源</text>
    <rect x="402" y="390" width="142" height="62" rx="12" fill="#ffffff" fill-opacity=".075" stroke="#ffffff" stroke-opacity=".10"/>
    <text x="437" y="430" fill="#dbe5f3">隐私</text>
    <rect x="562" y="390" width="142" height="62" rx="12" fill="#ffffff" fill-opacity=".075" stroke="#ffffff" stroke-opacity=".10"/>
    <text x="597" y="430" fill="#dbe5f3">实用</text>
  </g>
  <text x="82" y="527" fill="#7fd6ea" font-family="Inter, ui-monospace, monospace" font-size="28" font-weight="600">pingti.org</text>
  <text x="1118" y="527" fill="#8994a6" text-anchor="end" font-family="PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif" font-size="23">开放 · 平等 · 协作 · 分享</text>
</svg>`

await sharp(Buffer.from(ogSvg))
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(resolve(ogDir, 'pingti-social-v1.png'))

await sharp(sourceHero)
  .resize(1200, 630, {
    fit: 'contain',
    position: 'centre',
    background: '#050609'
  })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(resolve(ogDir, 'pingti-twitter-hero-v2.png'))

const sourceMeta = await sharp(sourceMark).metadata()
console.log(
  `品牌资产已生成：源图 ${sourceMeta.width}×${sourceMeta.height}，图标 ${iconSpecs.length} 个，OG 与 X 卡片均为 1200×630。`
)
