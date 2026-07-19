/**
 *  Copyright (c) 2025 taskylizard. Apache License 2.0.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import type { DefaultTheme } from 'vitepress'

// @unocss-include

export const meta = {
  name: '平替指南',
  description: '互联网上最大的免费与开源替代资源中文合集！',
  hostname: 'https://pingti.org',
  keywords: ['平替', '免费资源', '开源软件', '工具导航', '中文指南'],
  build: {
    api: false,
    nsfw: false
  }
}

export const excluded = [
  'readme.md',
  'single-page',
  'single-page.md',
  'feedback.md',
  'index.md',
  'sandbox.md',
  'startpage.md'
]

// Strip the URL scheme and a leading "www." so "https://www.pi-hole.net/x" and
// "pi-hole.net/x" compare the same way. Shared by the build-time index
// (constants.ts) and the client search box so they normalize identically.
export const stripSchemeAndWww = (value: string) =>
  value.replace(/^[a-z][a-z0-9+.-]*:\/\//, '').replace(/^www\./, '')

const TRACKING_QUERY_PARAMS = new Set([
  'fbclid',
  'gclid',
  'gbraid',
  'mc_cid',
  'mc_eid',
  'wbraid'
])

export function normalizeSearchUrl(value: string) {
  const stripped = stripSchemeAndWww(value)
  const hashIndex = stripped.indexOf('#')
  const withoutHash = hashIndex === -1 ? stripped : stripped.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : stripped.slice(hashIndex + 1)
  const queryIndex = withoutHash.indexOf('?')

  if (queryIndex === -1) return hash ? `${withoutHash}#${hash}` : withoutHash

  const hostPath = withoutHash.slice(0, queryIndex)
  const params = new URLSearchParams(withoutHash.slice(queryIndex + 1))
  for (const key of [...params.keys()]) {
    if (key.startsWith('utm_') || TRACKING_QUERY_PARAMS.has(key)) {
      params.delete(key)
    }
  }

  const query = params.toString()
  return `${hostPath}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
}

const safeEnv = (key: string) =>
  typeof process !== 'undefined' ? process.env?.[key] : undefined

// Treat the common falsy spellings as "off", not just the exact string 'false'.
const isFalsy = (val?: string) =>
  ['false', '0', 'no', 'off'].includes((val ?? '').trim().toLowerCase())

if (isFalsy(safeEnv('FMHY_BUILD_NSFW'))) {
  meta.build.nsfw = false
}
if (isFalsy(safeEnv('FMHY_BUILD_API'))) {
  meta.build.api = false
}

const formatCommitRef = (commitRef: string) =>
  `<a href="https://github.com/ErvinA-wx/pingti/commit/${commitRef}">${commitRef.slice(0, 8)}</a>`

const cfStart = safeEnv('CF_PAGES_COMMIT_SHA')
const commitStart = safeEnv('COMMIT_REF')

export const commitRef =
  safeEnv('CF_PAGES') && cfStart
    ? formatCommitRef(cfStart)
    : commitStart
      ? formatCommitRef(commitStart)
      : 'dev'

export const feedback = `<a href="/other/contributing" class="feedback-footer">用心整理 ❤</a>`

export const socialLinks: DefaultTheme.SocialLink[] = [
  { icon: 'github', link: 'https://github.com/ErvinA-wx/pingti' }
]

export const nav: DefaultTheme.NavItem[] = [
  { text: '📰 博客', link: '/blog' },
  {
    text: '📮 提交',
    items: [
      { text: '🌐 提交网站信息', link: '/submit/site' },
      { text: '💡 提交用户需求', link: '/submit/request' },
      { text: '📋 提交说明', link: '/submit/' }
    ]
  },
  { text: '📑 更新日志', link: '/posts/changelog-sites' },
  { text: '📖 术语表', link: 'https://rentry.org/The-Piracy-Glossary' },
  {
    text: '💾 备份',
    link: '/other/backups'
  },
  {
    text: '🌱 生态系统',
    items: [
      { text: '🌐 搜索', link: '/posts/search' },
      { text: '❓ 常见问题', link: '/other/FAQ' },
      { text: '🔖 书签', link: 'https://github.com/fmhy/bookmarks' },
      { text: '✅ 安全卫士', link: 'https://github.com/fmhy/FMHY-SafeGuard' },
      { text: '🚀 起始页', link: '/startpage' },
      { text: '🔎 SearXNG', link: 'https://searx.fmhy.net/' },
      {
        text: '💡 站点探索',
        link: 'https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/find-new-sites/'
      },
      {
        text: '😇 SFW FMHY',
        link: 'https://fmhy.xyz/'
      },
      {
        text: '🏠 自托管',
        link: '/other/selfhosting'
      },
      { text: '🏞 壁纸', link: '/other/wallpapers' },
      { text: '💙 反馈', link: '/feedback' }
    ]
  }
]

export const sidebar: DefaultTheme.Sidebar | DefaultTheme.NavItemWithLink[] = [
  {
    text: '<span class="i-twemoji:books"></span> 新手指南',
    link: '/beginners-guide'
  },
  {
    text: '<span class="i-twemoji:newspaper"></span> 博客',
    link: '/blog'
  },
  {
    text: '<span class="i-twemoji:light-bulb"></span> 参与贡献',
    link: '/other/contributing'
  },
  {
    text: '资源分类',
    collapsed: false,
    items: [
      {
        text: '<span class="i-twemoji:name-badge"></span> 广告拦截 / 隐私',
        link: '/privacy'
      },
      {
        text: '<span class="i-twemoji:robot"></span> 人工智能',
        link: '/ai'
      },
      {
        text: '<span class="i-twemoji:television"></span> 电影 / 电视 / 动漫',
        link: '/video'
      },
      {
        text: '<span class="i-twemoji:musical-note"></span> 音乐 / 播客 / 电台',
        link: '/audio'
      },
      {
        text: '<span class="i-twemoji:video-game"></span> 游戏 / 模拟器',
        link: '/gaming'
      },
      {
        text: '<span class="i-twemoji:green-book"></span> 书籍 / 漫画',
        link: '/reading'
      },
      {
        text: '<span class="i-twemoji:floppy-disk"></span> 下载资源',
        link: '/downloading'
      },
      {
        text: '<span class="i-twemoji:cyclone"></span> BT 下载',
        link: '/torrenting'
      },
      {
        text: '<span class="i-twemoji:brain"></span> 教育资源',
        link: '/educational'
      },
      {
        text: '<span class="i-twemoji:mobile-phone"></span> Android / iOS',
        link: '/mobile'
      },
      {
        text: '<span class="i-twemoji:penguin"></span> Linux / macOS',
        link: '/linux-macos'
      },
      {
        text: '<span class="i-twemoji:globe-showing-asia-australia"></span> 多语言资源',
        link: '/non-english'
      },
      {
        text: '<span class="i-twemoji:file-folder"></span> 其他资源',
        link: '/misc'
      }
    ]
  },
  {
    text: '工具',
    collapsed: false,
    items: [
      {
        text: '<span class="i-twemoji:laptop"></span> 系统工具',
        link: '/system-tools'
      },
      {
        text: '<span class="i-twemoji:card-file-box"></span> 文件工具',
        link: '/file-tools'
      },
      {
        text: '<span class="i-twemoji:paperclip"></span> 网络工具',
        link: '/internet-tools'
      },
      {
        text: '<span class="i-twemoji:left-speech-bubble"></span> 社交媒体工具',
        link: '/social-media-tools'
      },
      {
        text: '<span class="i-twemoji:memo"></span> 文本工具',
        link: '/text-tools'
      },
      {
        text: '<span class="i-twemoji:alien-monster"></span> 游戏工具',
        link: '/gaming-tools'
      },
      {
        text: '<span class="i-twemoji:camera"></span> 图像工具',
        link: '/image-tools'
      },
      {
        text: '<span class="i-twemoji:videocassette"></span> 视频工具',
        link: '/video-tools'
      },
      {
        text: '<span class="i-twemoji:speaker-high-volume"></span> 音频工具',
        link: '/audio#audio-tools'
      },
      {
        text: '<span class="i-twemoji:red-apple"></span> 教育工具',
        link: '/educational#educational-tools'
      },
      {
        text: '<span class="i-twemoji:man-technologist"></span> 开发者工具',
        link: '/developer-tools'
      }
    ]
  },
  {
    text: '更多',
    collapsed: true,
    items: [
      meta.build.nsfw
        ? {
            text: '<span class="i-twemoji:no-one-under-eighteen"></span> NSFW',
            link: 'https://rentry.org/NSFW-Checkpoint'
          }
        : {},
      {
        text: '<span class="i-twemoji:warning"></span> 不安全站点',
        link: '/unsafe'
      },
      {
        text: '<span class="i-twemoji:wastebasket"></span> 最近移除',
        link: '/recently-removed'
      },
      {
        text: '<span class="i-twemoji:package"></span> 存档',
        link: '/storage'
      }
    ]
  }
]
