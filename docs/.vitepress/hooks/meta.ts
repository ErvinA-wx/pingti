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

import type { HeadConfig, TransformContext } from 'vitepress'

const DEFAULT_DESCRIPTION =
  '发现更自由、更实用的免费与开源软件、网站、应用与数字服务替代方案。'
const DEFAULT_SOCIAL_IMAGE = '/og/pingti-social-v1.png'

const NOINDEX_PAGES = new Set([
  'feedback.md',
  'sandbox.md',
  'startpage.md',
  'submit/request.md',
  'submit/site.md'
])

const AUTHOR_PROFILES: Record<string, string> = {
  Kai: 'https://github.com/Kai-FMHY',
  nbats: 'https://github.com/nbats',
  Q: 'https://github.com/qiracy',
  taskylizard: 'https://github.com/taskylizard',
  zinklog: 'https://github.com/zinklog2'
}

function resolveAuthors(value: unknown) {
  const names = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : []

  return names
    .map((name) => String(name).trim())
    .filter(Boolean)
    .map((name) => ({
      '@type': 'Person',
      name,
      ...(AUTHOR_PROFILES[name] ? { url: AUTHOR_PROFILES[name] } : {})
    }))
}

export function generateMeta(context: TransformContext, hostname: string) {
  const head: HeadConfig[] = []
  const { pageData } = context

  if (pageData.isNotFound) return head
  if (NOINDEX_PAGES.has(pageData.relativePath)) {
    head.push(['meta', { name: 'robots', content: 'noindex,follow' }])
  }
  if (Object.keys(pageData.frontmatter).length === 0) return head

  const url = `${hostname}/${pageData.relativePath.replace(/((^|\/)index)?\.md$/, '$2')}`
  const isPost = pageData.relativePath.startsWith('posts/')
  const pageTitle = pageData.frontmatter.title || pageData.title || '平替指南'
  const socialTitle =
    pageData.relativePath === 'index.md'
      ? '平替指南｜免费与开源替代方案导航'
      : `${pageTitle} · 平替指南`
  const description = pageData.frontmatter.description || DEFAULT_DESCRIPTION
  const imagePath = pageData.frontmatter.image || DEFAULT_SOCIAL_IMAGE
  const imageUrl = `${hostname}/${imagePath.replace(/^\//, '')}`
  const imageType = imagePath.endsWith('.webp') ? 'image/webp' : 'image/png'

  head.push(
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:type', content: isPost ? 'article' : 'website' }],
    ['meta', { property: 'og:site_name', content: '平替指南' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { name: 'twitter:url', content: url }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'og:title', content: socialTitle }],
    ['meta', { name: 'twitter:title', content: socialTitle }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { property: 'og:image', content: imageUrl }],
    ['meta', { property: 'og:image:secure_url', content: imageUrl }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:type', content: imageType }],
    ['meta', { property: 'og:image:alt', content: socialTitle }],
    ['meta', { name: 'twitter:image', content: imageUrl }],
    ['meta', { name: 'twitter:image:alt', content: socialTitle }]
  )

  if (pageData.frontmatter.tag) {
    head.push([
      'meta',
      { property: 'article:tag', content: pageData.frontmatter.tag }
    ])
  }

  if (pageData.frontmatter.date) {
    head.push([
      'meta',
      {
        property: 'article:published_time',
        content: pageData.frontmatter.date
      }
    ])
  }

  const modifiedTime =
    pageData.frontmatter.updated ||
    (pageData.lastUpdated && pageData.frontmatter.lastUpdated !== false
      ? pageData.lastUpdated
      : null)
  if (modifiedTime) {
    head.push([
      'meta',
      {
        property: 'article:modified_time',
        content: new Date(modifiedTime).toISOString()
      }
    ])
  }

  const image = imageUrl
  const authors = resolveAuthors(pageData.frontmatter.authors)
  const structuredData = isPost
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            headline: pageData.frontmatter.title,
            description: pageData.frontmatter.description,
            url,
            inLanguage: 'zh-CN',
            datePublished: pageData.frontmatter.date,
            dateModified:
              pageData.frontmatter.updated ||
              (pageData.lastUpdated
                ? new Date(pageData.lastUpdated).toISOString()
                : pageData.frontmatter.date),
            image,
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
            author:
              authors.length > 0
                ? authors
                : { '@type': 'Organization', name: '平替指南', url: hostname },
            publisher: {
              '@type': 'Organization',
              name: '平替指南',
              url: hostname,
              logo: {
                '@type': 'ImageObject',
                url: `${hostname}/icons/icon-512.png`
              }
            }
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: '首页',
                item: `${hostname}/`
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: '博客',
                item: `${hostname}/posts`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: pageData.frontmatter.title,
                item: url
              }
            ]
          }
        ]
      }
    : pageData.relativePath === 'index.md'
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': `${hostname}/#organization`,
              name: '平替指南',
              alternateName: 'Pingti',
              url: hostname,
              logo: `${hostname}/icons/icon-512.png`,
              sameAs: ['https://github.com/ErvinA-wx/pingti']
            },
            {
              '@type': 'WebSite',
              '@id': `${hostname}/#website`,
              name: '平替指南',
              alternateName: 'Pingti',
              url: hostname,
              description: pageData.frontmatter.description,
              inLanguage: 'zh-CN',
              publisher: { '@id': `${hostname}/#organization` }
            }
          ]
        }
      : null

  if (structuredData) {
    head.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(structuredData)
    ])
  }

  return head
}
