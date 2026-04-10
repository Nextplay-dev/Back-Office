<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMyActivitiesStore } from '@/stores/myActivities'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ChevronRight } from 'lucide-vue-next'
import CategoryIcon from '../../CategoryIcon.vue'

const route = useRoute()
const myActivitiesStore = useMyActivitiesStore()
const openStates = ref<Record<number, boolean>>({})

function isActive(name: string) {
  return route.name === name || String(route.name).startsWith(name)
}

onMounted(async () => {
  try {
    await myActivitiesStore.fetchActivities()

    // Initial open state based on current route
    if (route.name === 'my-activity-overview') {
      const id = Number(route.params.id)
      if (id) openStates.value = { [id]: true }
    }
  } catch (e) {
    console.error('Failed to fetch managed activities', e)
  }
})

// Update open state when navigating
watch(() => route.params.id, (newId) => {
  if (route.name === 'my-activity-overview' && newId) {
    openStates.value = { [Number(newId)]: true }
  }
})
</script>

<template>
  <SidebarGroup v-if="myActivitiesStore.activities.length > 0" class="border-t border-sidebar-border/50 pt-4">
    <SidebarGroupLabel class="px-3 text-[10px] font-black uppercase tracking-widest text-sidebar-foreground/30">
      {{ $t('components.sidebar.myActivities') }}
    </SidebarGroupLabel>
    <SidebarMenu class="px-2 mt-2">
      <Collapsible v-for="activity in myActivitiesStore.activities" :key="activity.id" as-child
        v-model:open="openStates[activity.id]"
        class="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger as-child>
            <SidebarMenuButton :tooltip="activity.name"
              class="h-10 px-3 rounded-xl hover:bg-primary/5 group-data-[state=open]/collapsible:bg-primary/5 transition-all">
              <div
                class="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <CategoryIcon v-if="activity.category" :icon="activity.category.icon"
                  :color="activity.category.color" class="h-3.5 w-3.5 text-primary" />
              </div>
              <span class="truncate font-semibold text-sm">{{ activity.name }}</span>
              <ChevronRight
                class="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-sidebar-foreground/20" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent class="pl-6 pt-1">
            <SidebarMenuSub class="border-l-2 border-primary/10 ml-3">
              <SidebarMenuSubItem>
                <SidebarMenuSubButton as-child
                  :is-active="isActive('my-activity-overview') && route.params.id == String(activity.id)"
                  class="h-9 px-4 rounded-lg hover:bg-primary/5 transition-all text-xs font-medium">
                  <RouterLink :to="{ name: 'my-activity-overview', params: { id: activity.id } }">
                    <span>{{ $t('components.sidebar.myActivityOverview') }}</span>
                  </RouterLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>
