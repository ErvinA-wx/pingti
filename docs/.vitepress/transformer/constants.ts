import { meta } from '../constants'

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
interface Header {
  [file: string]: { title: string; description: string }
}

export const headers: Header = {
  'privacy.md': {
    title: '广告拦截 / 隐私',
    description: '广告拦截、隐私、VPN、代理与杀毒软件'
  },
  'ai.md': {
    title: '人工智能',
    description: '聊天机器人、文本生成、图像生成与 AI 工具'
  },
  'mobile.md': {
    title: 'Android / iOS',
    description: '应用、越狱与 Android 模拟器'
  },
  'audio.md': {
    title: '音乐 / 播客 / 电台',
    description: '音频流媒体、下载与 BT 资源'
  },
  'beginners-guide.md': {
    title: '新手指南',
    description: '面向新手的指南与常见问题'
  },
  'downloading.md': {
    title: '下载资源',
    description: '下载站、软件站与开放目录'
  },
  'educational.md': {
    title: '教育资源',
    description: '课程、纪录片与学习资源'
  },
  'gaming.md': {
    title: '游戏 / 模拟器',
    description: '游戏下载、ROM 与游戏工具'
  },
  'linux-macos.md': {
    title: 'Linux / macOS',
    description: '应用、软件站与游戏'
  },
  'misc.md': {
    title: '其他资源',
    description: '扩展、索引、新闻、健康、美食与趣味内容'
  },
  'nsfwpiracy.md': {
    title: 'NSFW',
    description: 'NSFW Indexes, Streaming, Downloading'
  },
  'non-english.md': {
    title: '多语言资源',
    description: '世界各地的免费资源网站'
  },
  'reading.md': {
    title: '书籍 / 漫画',
    description: '书籍、漫画、杂志与报纸'
  },
  'gaming-tools.md': {
    title: '游戏工具',
    description: '游戏优化、启动器与多人游戏工具'
  },
  'developer-tools.md': {
    title: '开发者工具',
    description: 'Git、托管、应用与软件开发'
  },
  'image-tools.md': {
    title: '图像工具',
    description: '图像编辑、生成与压缩工具'
  },
  'audio-tools.md': {
    title: '音频工具',
    description: '音频播放器、编辑器与下载工具'
  },
  'system-tools.md': {
    title: '系统工具',
    description: '系统、硬件、Windows 镜像与个性化工具'
  },
  'file-tools.md': {
    title: '文件工具',
    description: '下载管理、文件托管与压缩归档工具'
  },
  'video-tools.md': {
    title: '视频工具',
    description: '视频播放、编辑、直播与动画工具'
  },
  'text-tools.md': {
    title: '文本工具',
    description: '文本编辑、粘贴板、字体与翻译工具'
  },
  'internet-tools.md': {
    title: '网络工具',
    description: '浏览器、扩展与搜索引擎'
  },
  'social-media-tools.md': {
    title: '社交媒体工具',
    description: 'Discord、Reddit 与 YouTube 工具'
  },
  'storage.md': {
    title: '存档',
    description: '从主要页面拆分出的扩展内容'
  },
  'torrenting.md': {
    title: 'BT 下载',
    description: 'BT 客户端、站点与追踪器'
  },
  'video.md': {
    title: '电影 / 电视 / 动漫',
    description: '视频流媒体、下载与 BT 资源'
  },
  'base64.md': {
    title: 'Base64',
    description: 'Base64 storage'
  },
  'unsafe.md': {
    title: '不安全站点',
    description: '应当避免的不安全或有害站点'
  },
  'recently-removed.md': {
    title: '最近移除的站点',
    description: '最近从资源库中移除的站点列表'
  }
} as const

export const excluded = [
  'readme.md',
  'single-page',
  'feedback.md',
  'index.md',
  'latest.md',
  'sandbox.md',
  'startpage.md'
]

export function getHeader(id: string) {
  const title =
    '<div class="space-y-2 not-prose"><h1 class="text-4xl font-extrabold tracking-tight text-primary underline lg:text-5xl lg:leading-[3.5rem]">'

  const description = '<p class="text-black dark:text-text-2">'

  const feedback = meta.build.api ? '<Feedback />' : ''

  const data = headers[id]
  let header = '---\n'
  header += `title: "${data.title}"\n`
  header += `description: ${data.description}\n`
  header += '---\n'
  header += `${title}${data.title}</h1>\n`
  header += `${description}${data.description}</p></div>\n\n${feedback}\n\n`
  return header
}
