<script setup lang="ts">
import { computed } from 'vue'
import database from '../../data/project-database.json'

interface Project {
  id: string
  name: string
  url: string
  type: string
  category: string
  categoryHref: string
  addedAt: string
  description: string
}

const DAY_MS = 24 * 60 * 60 * 1000
const retentionDays = database.retentionDays || 180
const cutoff = new Date(database.generatedAt).getTime() - retentionDays * DAY_MS

const projects = computed<Project[]>(() =>
  (database.projects as Project[]).filter(
    (project) => new Date(`${project.addedAt}T00:00:00Z`).getTime() >= cutoff
  )
)

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-')
  return `${year}/${month}/${day}`
}
</script>

<template>
  <section class="latest-resources" aria-labelledby="latest-summary">
    <p id="latest-summary" class="latest-summary">
      // WINDOW={{ retentionDays }}D · COUNT={{ projects.length }}
    </p>

    <ol class="project-list">
      <li v-for="project in projects" :id="project.id" :key="project.id">
        <article>
          <header class="project-header">
            <h2>
              <a :href="`#${project.id}`">{{ project.name }}</a>
              <a
                class="project-external"
                :href="project.url"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`访问 ${project.name} 官方项目`"
                :title="`访问 ${project.name} 官方项目`"
              >
                ↗
              </a>
            </h2>
            <time :datetime="project.addedAt">
              {{ formatDate(project.addedAt) }}
            </time>
          </header>
          <div class="project-meta">
            <span>[{{ project.type }}]</span>
            <a :href="project.categoryHref">[分类: {{ project.category }}]</a>
          </div>
          <p>{{ project.description }}</p>
        </article>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.latest-resources {
  margin-top: 1.5rem;
}

.latest-summary {
  margin: 0 0 0.65rem;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
}

.project-list {
  margin: 0;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 2px;
  list-style: none;
}

.project-list li {
  scroll-margin-top: 88px;
}

.project-list li + li {
  border-top: 1px solid var(--vp-c-divider);
}

.project-list article {
  padding: 0.65rem 0.8rem;
}

.project-list li:target article {
  background: var(--vp-c-bg-soft);
  box-shadow: inset 3px 0 0 var(--vp-c-brand-1);
}

.project-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.project-header h2 {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  margin: 0;
  border: 0;
  padding: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
  line-height: 1.35;
}

.project-header h2 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.project-header h2 a:hover,
.project-meta a:hover {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.project-header h2 .project-external {
  color: var(--vp-c-brand-1);
}

.project-header time,
.project-meta {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

.project-header time {
  flex: none;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.15rem;
}

.project-meta a {
  color: inherit;
  text-decoration: none;
}

.project-list p {
  margin: 0.3rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.55;
}

@media (max-width: 640px) {
  .project-list article {
    padding: 0.6rem 0.65rem;
  }

  .project-header {
    gap: 0.5rem;
  }

  .project-header h2 {
    font-size: 0.92rem;
  }
}
</style>
