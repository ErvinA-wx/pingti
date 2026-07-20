<script setup lang="ts">
import { computed, ref } from 'vue'
import { data as rawPosts } from './posts.data'

type PostCategory = 'upstream' | 'pingti'
type CategoryFilter = 'all' | PostCategory

interface Post {
  title: string
  url: string
  date: string | number
  category: PostCategory
}

const categories: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'all', label: '全部更新' },
  { value: 'upstream', label: 'FMHY 上游更新' },
  { value: 'pingti', label: '平替指南更新' }
]
const selectedCategory = ref<CategoryFilter>('all')

const posts = computed<Post[]>(() =>
  Array.isArray(rawPosts)
    ? rawPosts
    : (Object.values(rawPosts).flat() as Post[])
)

const categoryCount = (category: CategoryFilter) =>
  category === 'all'
    ? posts.value.length
    : posts.value.filter((post) => post.category === category).length

const groupedPosts = computed(() => {
  const postArray = posts.value.filter(
    (post) =>
      selectedCategory.value === 'all' ||
      post.category === selectedCategory.value
  )

  const groups: Record<string, Post[]> = {}

  for (const post of postArray) {
    const year = String(post.date).slice(0, 4)

    if (!groups[year]) groups[year] = []
    groups[year].push(post)
  }

  return Object.keys(groups)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({
      year,
      // Ensure posts within the year are sorted newest to oldest
      posts: groups[year].sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime()
        const dateB = new Date(b.date || 0).getTime()
        return dateB - dateA
      })
    }))
})

const formatDate = (timestamp: string | number): string => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC'
  })
}

const categoryLabel = (category: PostCategory) =>
  category === 'pingti' ? '平替指南更新' : 'FMHY 上游更新'
</script>

<template>
  <div>
    <section>
      <h1 class="flex items-center gap-2">博客</h1>
      <p>每月更新、公告、使用指南与精选资源。</p>
      也可以通过
      <a href="/feed.rss" target="_blank" title="RSS 订阅">
        <div
          class="i-carbon-rss vertical-top"
          style="width: 16px; height: 24px"
        />
        RSS 订阅。
      </a>
    </section>

    <nav class="category-filter" aria-label="博客分类">
      <button
        v-for="category in categories"
        :key="category.value"
        type="button"
        class="category-button"
        :class="{ active: selectedCategory === category.value }"
        :aria-pressed="selectedCategory === category.value"
        @click="selectedCategory = category.value"
      >
        {{ category.label }}
        <span>{{ categoryCount(category.value) }}</span>
      </button>
    </nav>

    <div class="posts-timeline">
      <div v-for="group in groupedPosts" :key="group.year" class="year-section">
        <h2 class="year-title">{{ group.year }}</h2>
        <div class="posts-list">
          <a
            v-for="post in group.posts"
            :key="post.url"
            :href="post.url"
            class="post-item"
          >
            <div class="post-meta">
              <span v-if="post.date" class="post-date">
                {{ formatDate(post.date) }}
              </span>
              <span class="post-title">{{ post.title }}</span>
              <span class="post-category">
                {{ categoryLabel(post.category) }}
              </span>
            </div>
            <svg
              class="post-arrow"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <path
                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPBadge {
  border: 1px solid transparent;
  border-radius: 8px;
  display: inline-flex;
  margin-left: 2px;
  padding: 0 10px;
  line-height: 22px;
  font-size: 12px;
  font-weight: 500;
  transform: translateY(-2px);
  align-items: center;
  gap: 0.2rem;
  padding-right: 10px;
  vertical-align: middle;
  color: var(--vp-badge-tip-text);
  background-color: transparent;
  border-color: var(--vp-custom-block-tip-outline);
}

.posts-timeline {
  margin-top: 2.5rem;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 2rem;
}

.category-button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-weight: 600;
}

.category-button:hover,
.category-button.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.category-button span {
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}

.year-section {
  margin-bottom: 3.5rem;
}

.year-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 1.25rem;
  padding-bottom: 0.25rem;
}

.posts-list {
  border-left: 2px solid var(--vp-c-divider);
  margin-left: 0.25rem;
  display: flex;
  flex-direction: column;
}

.post-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem 0.5rem 1.25rem;
  margin-left: -2px;
  border-left: 2px solid transparent;
  border-radius: 0 8px 8px 0;
  text-decoration: none !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.post-item:hover {
  background-color: var(--vp-c-bg-soft);
  border-left-color: var(--vp-c-brand-1);
}

.post-meta {
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
}

.post-date {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-weight: 500;
  white-space: nowrap;
  min-width: 55px;
  text-transform: uppercase;
}

.post-title {
  font-size: 1.05rem;
  font-weight: 500;
  transition: color 0.2s ease;
  color: var(--vp-c-text-1);
}

.post-category {
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  font-size: 0.75rem;
  white-space: nowrap;
}

.post-item:hover .post-title {
  color: var(--vp-c-brand-1);
}

.post-arrow {
  color: var(--vp-c-text-3);
  opacity: 0;
  transform: translateX(-4px);
  transition:
    transform 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
}

.post-item:hover .post-arrow {
  color: var(--vp-c-brand-1);
  opacity: 1;
  transform: translateX(4px);
}

@media (max-width: 640px) {
  .post-meta {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .post-title {
    width: calc(100% - 70px);
  }

  .post-category {
    margin-left: 70px;
  }
}
</style>
