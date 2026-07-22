<script setup lang="ts">
import { computed } from 'vue'
import homeUpdates from '../../data/home-updates.json'
import { data as rawPosts } from '../posts.data'

interface Resource {
  title: string
  href: string
  details?: string
  date: string
}

interface Post {
  title: string
  url: string
  date: string | number
}

const MAX_ITEMS = 20

const resources = computed<Resource[]>(() =>
  (homeUpdates.resources as Resource[]).slice(0, MAX_ITEMS)
)

const posts = computed<Post[]>(() => {
  const allPosts = Array.isArray(rawPosts)
    ? rawPosts
    : (Object.values(rawPosts).flat() as Post[])

  return [...allPosts]
    .sort(
      (a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    )
    .slice(0, MAX_ITEMS)
})

const formatDate = (date: string | number) =>
  new Date(date).toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC'
  })
</script>

<template>
  <section class="home-updates" aria-label="最新内容">
    <article class="update-panel">
      <div class="update-panel-header">
        <div>
          <p class="update-panel-eyebrow">最近 30 天</p>
          <h2>新增资源</h2>
        </div>
        <a href="/posts" class="update-panel-link">
          更新日志
          <span>→</span>
        </a>
      </div>

      <ul class="update-list" aria-label="最新 20 条资源">
        <li v-for="resource in resources" :key="resource.href">
          <a
            :href="resource.href"
            target="_blank"
            rel="noopener noreferrer"
            :title="resource.details || resource.title"
          >
            <span class="update-list-title">{{ resource.title }}</span>
            <time :datetime="resource.date">
              {{ formatDate(resource.date) }}
            </time>
          </a>
        </li>
      </ul>
    </article>

    <article class="update-panel">
      <div class="update-panel-header">
        <div>
          <p class="update-panel-eyebrow">持续更新</p>
          <h2>博客文章</h2>
        </div>
        <a href="/blog" class="update-panel-link">
          全部博客
          <span>→</span>
        </a>
      </div>

      <ul class="update-list" aria-label="最新 20 篇博客文章">
        <li v-for="post in posts" :key="post.url">
          <a :href="post.url">
            <span class="update-list-title">{{ post.title }}</span>
            <time :datetime="String(post.date)">
              {{ formatDate(post.date) }}
            </time>
          </a>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.home-updates {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  width: min(100% - 2rem, 1152px);
  margin: 0 auto 2.75rem;
}

.update-panel {
  min-width: 0;
  padding: 1.35rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg-soft);
}

.update-panel-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.update-panel-eyebrow {
  margin: 0 0 0.2rem;
  color: var(--vp-c-text-3);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.update-panel h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
  line-height: 1.35;
}

.update-panel-link {
  flex: none;
  color: var(--vp-c-brand-1);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

.update-panel-link:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.update-panel-link span {
  display: inline-block;
  transition: transform 0.2s ease;
}

.update-panel-link:hover span {
  transform: translateX(2px);
}

.update-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.update-list li + li {
  border-top: 1px solid var(--vp-c-divider);
}

.update-list a {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.62rem 0.1rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.update-list a:hover .update-list-title {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.update-list-title {
  overflow: hidden;
  flex: 1;
  color: var(--vp-c-text-1);
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.update-list time {
  flex: none;
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .home-updates {
    grid-template-columns: 1fr;
    width: min(100% - 1.5rem, 640px);
    gap: 1rem;
    margin-bottom: 2.25rem;
  }

  .update-panel {
    padding: 1.15rem;
    border-radius: 16px;
  }
}

@media (max-width: 420px) {
  .update-panel-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
