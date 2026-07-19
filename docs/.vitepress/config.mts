import { fileURLToPath } from 'node:url'
import consola from 'consola'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import OptimizeExclude from 'vite-plugin-optimize-exclude'
import { VitePWA } from 'vite-plugin-pwa'
import Terminal from 'vite-plugin-terminal'
import { defineConfig } from 'vitepress'
import {
  commitRef,
  feedback,
  meta,
  nav,
  search,
  sidebar,
  socialLinks
} from './constants'
import { generateFeed, generateMeta } from './hooks'
import { defs, emojiRender, movePlugin } from './markdown/emoji'
import { headersPlugin } from './markdown/headers'
import { toggleStarredPlugin } from './markdown/toggleStarred'
import { transformsPlugin } from './transformer'
import { replaceNoteLink } from './utils/markdown'

// @unocss-include

const baseUrl = '/'
export default defineConfig({
  title: '平替指南',
  description: meta.description,
  titleTemplate: ':title • 平替指南',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,
  appearance: true,
  base: baseUrl,
  srcExclude: ['README.md', 'public/single-page.md', 'single-page'],
  ignoreDeadLinks: true,
  sitemap: {
    hostname: meta.hostname,
    transformItems: (items) => {
      const excludedPaths = new Set([
        '/feedback',
        '/sandbox',
        '/startpage',
        '/submit/request',
        '/submit/site'
      ])

      return items.filter((item) => {
        const pathname = new URL(item.url, meta.hostname).pathname.replace(
          /\/$/,
          ''
        )
        return !excludedPaths.has(pathname)
      })
    }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#7bc5e4' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh_CN' }],
    ['link', { rel: 'icon', href: '/fmhy.ico' }],
    [
      'link',
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: '平替指南 RSS 订阅',
        href: '/feed.rss'
      }
    ],
    // PWA
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    [
      'link',
      { rel: 'alternate icon', href: '/pwa_icon.png', type: 'image/png' }
    ],
    ['meta', { name: 'keywords', content: meta.keywords.join(' ') }],
    [
      'link',
      { rel: 'apple-touch-icon', href: '/pwa_icon.png', sizes: '192x192' }
    ],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
    ],
    // Redirect to main site if embedded in iframe
    [
      'script',
      {},
      `
        (function() {
          if (window.self !== window.top) {
              window.top.location = window.location.href;
          }
        })();
        `
    ],
    // Apply the saved theme synchronously before the page paints, so users
    // who picked a non-default theme don't briefly see the default one.
    [
      'script',
      {},
      `
        (function() {
          try {
            var d = document.documentElement;
            var mode = localStorage.getItem('vitepress-display-mode');
            var amoled = localStorage.getItem('vitepress-amoled-enabled') === 'true';
            var themeName = localStorage.getItem('vitepress-theme-name');
            var varsJson = localStorage.getItem('vitepress-theme-vars');

            if (!mode) {
              mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            if (mode === 'dark') {
              d.classList.add('dark');
              d.classList.remove('light');
            } else {
              d.classList.add('light');
              d.classList.remove('dark');
            }

            if (mode === 'dark' && amoled) d.classList.add('amoled');
            else d.classList.remove('amoled');

            if (themeName === 'monochrome') d.classList.add('monochrome');
            else d.classList.remove('monochrome');

            if (varsJson) {
              var vars = JSON.parse(varsJson);
              for (var k in vars) {
                if (Object.prototype.hasOwnProperty.call(vars, k) && k.indexOf('--vp-') === 0) {
                  d.style.setProperty(k, vars[k]);
                }
              }
            }
          } catch (e) {}
        })();
        `
    ],
    [
      'script',
      {},
      `
        (function() {
          try {
            var today = new Date();
            if (today.getMonth() === 5) {
              document.documentElement.classList.add('june');
              function applyJuneFavicon() {
                var links = document.querySelectorAll("link[rel*='icon']");
                links.forEach(function(link) {
                  if (link.getAttribute('href') !== '/june_icon.webp') {
                    link.setAttribute('href', '/june_icon.webp');
                    if (link.hasAttribute('type')) {
                      link.setAttribute('type', 'image/webp');
                    }
                  }
                });
              }
              function applyJuneLogo() {
                var logos = document.querySelectorAll("img.logo, img[src*='fmhy.ico']");
                logos.forEach(function(img) {
                  if (img.getAttribute('src') !== '/june_icon.webp') {
                    img.setAttribute('src', '/june_icon.webp');
                  }
                });
              }
              applyJuneFavicon();
              applyJuneLogo();
              // Favicons live in <head>; scope the observer there instead of the whole document.
              new MutationObserver(applyJuneFavicon).observe(document.head, {
                childList: true,
                attributes: true,
                attributeFilter: ['href', 'type']
              });
              // The nav logo isn't in <head>; re-apply it on route changes (see theme/index.ts).
              window.__fmhyApplyJuneLogo = applyJuneLogo;
            }
          } catch (e) {}
        })();
        `
    ]
  ],
  transformHead: async (context) => generateMeta(context, meta.hostname),
  buildEnd: async (context) => {
    try {
      await generateFeed(context)
      consola.success('Build hooks completed successfully.')
    } catch (error) {
      consola.error('Build hook failed:', error)
      throw error
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },

    resolve: {
      alias: [
        {
          find: /^.*VPSwitchAppearance\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/ThemeDropdown.vue', import.meta.url)
          )
        },
        {
          find: /^.*VPLocalSearchBox\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/VPLocalSearchBox.vue', import.meta.url)
          )
        },
        {
          find: /^.*VPNav\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/VPNav.vue', import.meta.url)
          )
        }
      ]
    },
    optimizeDeps: { exclude: ['workbox-window'] },
    plugins: [
      OptimizeExclude(),
      Terminal({
        console: 'terminal',
        output: ['console', 'terminal']
      }),
      UnoCSS({
        configFile: fileURLToPath(
          new URL('../../unocss.config.ts', import.meta.url)
        )
      }),
      AutoImport({
        dts: '../.cache/imports.d.ts',
        imports: ['vue', 'vitepress'],
        vueTemplate: true,
        biomelintrc: {
          enabled: true,
          filepath: './.cache/imports.json'
        }
      }),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          // Precache only the app shell; images and pages go through runtimeCaching below.
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,woff2}'],
          globIgnores: ['**/*localSearchIndex*.js'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpe?g|svg|webp|ico)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 // 1 day
                }
              }
            }
          ]
        },
        // Use docs/public/manifest.json (linked in head) instead of a generated one.
        manifest: false
      }),
      transformsPlugin(),
      {
        name: 'custom:adjust-order',
        configResolved(c) {
          movePlugin(
            c.plugins as any,
            'vitepress',
            'before',
            'unocss:transformers:pre'
          )
          movePlugin(
            c.plugins as any,
            'custom:transform-content',
            'before',
            'vitepress'
          )
        }
      }
    ],
    build: {
      // Shut the fuck up
      chunkSizeWarningLimit: Number.POSITIVE_INFINITY
    }
  },
  markdown: {
    emoji: { defs },
    config(md) {
      md.use(emojiRender)
      md.use(toggleStarredPlugin)
      meta.build.api && md.use(headersPlugin)
      replaceNoteLink(md)
    }
  },
  themeConfig: {
    search,
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色主题',
    darkModeSwitchTitle: '切换到深色主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    langMenuLabel: '切换语言',
    skipToContentLabel: '跳到正文',
    outline: {
      level: 'deep',
      label: '本页目录'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    notFound: {
      title: '页面未找到',
      quote: '这个页面可能已移动、删除，或者链接有误。',
      linkLabel: '返回首页',
      linkText: '返回首页'
    },
    footer: {
      message: `${feedback} (rev: ${commitRef})`,
      copyright:
        `© ${new Date().getFullYear()} 平替指南。` +
        `<br/>本站仅整理公开信息，不托管任何第三方文件。`
    },
    editLink: {
      pattern: 'https://github.com/ErvinA-wx/pingti/edit/main/docs/:path',
      text: '📝 编辑此页'
    },
    logo: {
      src: '/fmhy.ico',
      alt: '平替指南 Logo'
    },
    nav,
    sidebar,
    socialLinks
  }
})
