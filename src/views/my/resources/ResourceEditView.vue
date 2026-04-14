<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resourceRoutes } from '@/plugins/routes'
import type { ResourceModel } from '@/models/ResourceModel'
import {
  Tabs,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Settings, Clock, AlertTriangle } from 'lucide-vue-next'

import { computed } from 'vue'

const route = useRoute()
const router = useRouter()
const resourceId = Number(route.params.resourceId)
const venueId = Number(route.params.id)

const resource = ref<ResourceModel | null>(null)
const loading = ref(true)

const activeTab = computed(() => {
  if (route.name === 'my-resource-availability') return 'availability'
  if (route.name === 'my-resource-exceptions') return 'exceptions'
  return 'details'
})

function handleTabChange(value: string | number) {
  const nameMap: Record<string, string> = {
    details: 'my-resource-edit',
    availability: 'my-resource-availability',
    exceptions: 'my-resource-exceptions'
  }
  router.push({ name: nameMap[String(value)], params: { id: venueId, resourceId } })
}

async function fetchResource() {
  loading.value = true
  try {
    const { data } = await resourceRoutes.get(resourceId)
    resource.value = data
  } catch (e) {
    console.error('Failed to fetch resource', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchResource)
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="sm" @click="router.push({ name: 'my-resource-detail', params: { id: venueId, resourceId } })">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h2 class="text-xl font-bold">{{ resource?.name || $t('views.myResources.detail.loading') }}</h2>
        <p class="text-sm text-muted-foreground">#{{ resourceId }}</p>
      </div>
    </div>

    <Tabs :model-value="activeTab" @update:model-value="handleTabChange" class="w-full">
      <TabsList class="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="details" class="gap-2">
          <Settings class="h-3.5 w-3.5" />
          {{ $t('views.myResources.detail.tabs.general') }}
        </TabsTrigger>
        <TabsTrigger value="availability" class="gap-2">
          <Clock class="h-3.5 w-3.5" />
          {{ $t('views.myResources.detail.tabs.availability') }}
        </TabsTrigger>
        <TabsTrigger value="exceptions" class="gap-2">
          <AlertTriangle class="h-3.5 w-3.5" />
          {{ $t('views.myResources.detail.tabs.exceptions') }}
        </TabsTrigger>
      </TabsList>

      <div v-if="resource" class="mt-6">
        <RouterView :resource="resource" :resource-id="resource.id" @updated="fetchResource" />
      </div>
      <div v-else class="flex items-center justify-center p-12">
        <Loader2 class="h-6 w-6 animate-spin" />
      </div>
    </Tabs>
  </div>
</template>
