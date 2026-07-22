<script setup lang="ts">
import { computed } from 'vue'
import homeUpdates from '../../data/home-updates.json'
import { data as rawPosts } from '../posts.data'

interface Resource {
  title: string
  href: string
  details: string
  type: string
  category: string
  date: string
}

interface Post {
  title: string
  url: string
  date: string | number
}

const MAX_ITEMS = 10

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

const formatDate = (date: string | number) => {
  const parsed = new Date(date)
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0')
  const day = String(parsed.getUTCDate()).padStart(2, '0')
  return `${month}/${day}`
}
</script>

<template>
  <section class="home-updates" aria-label="最新内容">
    <article class="update-panel">
      <div class="update-panel-header">
        <div>
          <p class="update-panel-eyebrow">// LAST_30_DAYS</p>
          <h2>新增平替资源</h2>
        </div>
        <a href="/posts" class="update-panel-link">[更新日志]</a>
      </div>

      <ul class="update-list resource-list" aria-label="最新 10 条平替资源">
        <li v-for="resource in resources" :key="resource.href">
          <div class="resource-heading">
            <a
              class="resource-title"
              :href="resource.href"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ resource.title }}
            </a>
            <time :datetime="resource.date">
              {{ formatDate(resource.date) }}
            </time>
          </div>
          <p class="resource-description" :title="resource.details">
            {{ resource.details }}
          </p>
          <div class="resource-meta">
            <span>[{{ resource.type }}]</span>
            <span>[分类: {{ resource.category }}]</span>
          </div>
        </li>
      </ul>
    </article>

    <article class="update-panel">
      <div class="update-panel-header">
        <div>
          <p class="update-panel-eyebrow">// BLOG_INDEX</p>
          <h2>博客文章</h2>
        </div>
        <a href="/blog" class="update-panel-link">[全部博客]</a>
      </div>

      <ol class="update-list blog-list" aria-label="最新 10 篇博客文章">
        <li v-for="post in posts" :key="post.url">
          <a :href="post.url">
            <span class="blog-index" aria-hidden="true"></span>
            <span class="update-list-title">{{ post.title }}</span>
            <time :datetime="String(post.date)">
              {{ formatDate(post.date) }}
            </time>
          </a>
        </li>
      </ol>
    </article>
  </section>
</template>

<style scoped>
.home-updates {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 0.75rem;
  width: min(100% - 2rem, 1152px);
  margin: 0 auto 2rem;
}

.update-panel {
  min-width: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 2px;
  background: var(--vp-c-bg);
}

.update-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0.7rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.update-panel-eyebrow {
  margin: 0 0 0.08rem;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.update-panel h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
  line-height: 1.25;
}

.update-panel-link {
  flex: none;
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.72rem;
  font-weight: 500;
  text-decoration: none;
}

.update-panel-link:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.update-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.update-list li + li {
  border-top: 1px solid var(--vp-c-divider);
}

.blog-list {
  counter-reset: blog-item;
}

.blog-list li {
  counter-increment: blog-item;
}

.blog-list a {
  display: grid;
  grid-template-columns: 2ch minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.44rem 0.7rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.blog-index::before {
  color: var(--vp-c-text-3);
  content: counter(blog-item, decimal-leading-zero);
  font-family: var(--vp-font-family-mono);
  font-size: 0.68rem;
}

.resource-list li {
  padding: 0.45rem 0.7rem 0.5rem;
}

.resource-heading {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  min-width: 0;
}

.resource-title {
  overflow: hidden;
  flex: 1;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.3;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-title:hover,
.blog-list a:hover .update-list-title {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.resource-description {
  display: -webkit-box;
  overflow: hidden;
  margin: 0.17rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.76rem;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.resource-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.18rem;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.64rem;
  line-height: 1.3;
}

.update-list-title {
  overflow: hidden;
  flex: 1;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-heading time,
.blog-list time {
  flex: none;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.66rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .home-updates {
    grid-template-columns: 1fr;
    width: min(100% - 1.5rem, 640px);
    gap: 0.75rem;
    margin-bottom: 1.75rem;
  }
}

@media (max-width: 420px) {
  .update-panel-header {
    gap: 0.4rem;
  }

  .resource-description {
    -webkit-line-clamp: 3;
  }
}
</style>
