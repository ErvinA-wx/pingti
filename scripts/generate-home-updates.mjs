import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, 'local-content/projects.json')
const dataDir = resolve(root, 'docs/.vitepress/data')
const homeOutput = resolve(dataDir, 'home-updates.json')
const databaseOutput = resolve(dataDir, 'project-database.json')
const MAX_HOME_ITEMS = 20
const RETENTION_DAYS = 180

const databaseFields = [
  'id',
  'name',
  'url',
  'type',
  'category',
  'categoryHref',
  'collection',
  'addedAt',
  'status',
  'description',
  'aliases'
]

function validateProjects(projects) {
  const required = databaseFields.filter((field) => field !== 'aliases')
  const ids = new Set()
  const urls = new Set()

  projects.forEach((project, index) => {
    const missing = required.filter(
      (field) => typeof project[field] !== 'string' || !project[field].trim()
    )
    if (missing.length > 0) {
      throw new Error(
        `projects.json 第 ${index + 1} 条缺少字段：${missing.join('、')}`
      )
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(project.addedAt)) {
      throw new Error(
        `projects.json 第 ${index + 1} 条 addedAt 必须使用 YYYY-MM-DD 格式`
      )
    }
    if (ids.has(project.id)) throw new Error(`项目 ID 重复：${project.id}`)
    if (urls.has(project.url)) throw new Error(`项目 URL 重复：${project.url}`)
    ids.add(project.id)
    urls.add(project.url)
  })
}

const projects = JSON.parse(await readFile(source, 'utf8'))
validateProjects(projects)
projects.sort(
  (a, b) =>
    b.addedAt.localeCompare(a.addedAt) || a.name.localeCompare(b.name, 'zh-CN')
)

const generatedAt = new Date().toISOString()
const activeProjects = projects.filter((project) => project.status === 'active')

await mkdir(dataDir, { recursive: true })
await Promise.all([
  writeFile(
    databaseOutput,
    `${JSON.stringify(
      {
        generatedAt,
        retentionDays: RETENTION_DAYS,
        fields: databaseFields,
        projects: activeProjects
      },
      null,
      2
    )}\n`
  ),
  writeFile(
    homeOutput,
    `${JSON.stringify(
      {
        generatedAt,
        resources: activeProjects.slice(0, MAX_HOME_ITEMS).map((project) => ({
          title: project.name,
          href: project.url,
          internalHref: `/latest#${project.id}`,
          details: project.description,
          type: project.type,
          category: project.category,
          categoryHref: project.categoryHref,
          date: project.addedAt
        }))
      },
      null,
      2
    )}\n`
  )
])
