<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import homeUpdates from '../../data/home-updates.json'

const resources = homeUpdates.resources
const index = ref(0)

const resource = computed(() => resources[index.value] ?? resources[0])

onMounted(() => {
  if (resources.length > 1) {
    index.value = Math.floor(Math.random() * resources.length)
  }
})
</script>

<template>
  <a
    v-if="resource"
    class="VPButton medium alt"
    :href="resource.href"
    target="_blank"
    rel="noopener noreferrer"
    :title="`随机打开近 30 天更新的资源：${resource.title}`"
  >
    查看平替资源
  </a>
</template>
