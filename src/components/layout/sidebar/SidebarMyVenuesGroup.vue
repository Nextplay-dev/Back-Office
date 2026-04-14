<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMyVenuesStore } from '@/stores/myVenues'
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
import { ChevronRight, LayoutDashboard, Box, Activity } from 'lucide-vue-next'
import CategoryIcon from '../../CategoryIcon.vue'

const route = useRoute()
const myVenuesStore = useMyVenuesStore()
const openStates = ref<Record<number, boolean>>({})

function isActive(name: string) {
  return route.name === name || String(route.name).startsWith(name)
}

onMounted(async () => {
  try {
    await myVenuesStore.fetchVenues()

    if (route.name?.toString().startsWith('my-')) {
      const id = Number(route.params.id)
      if (id) openStates.value = { [id]: true }
    }
  } catch (e) {
    console.error('Failed to fetch managed venues', e)
  }
})

watch(() => route.params.id, (newId) => {
  if (route.name?.toString().startsWith('my-') && newId) {
    openStates.value = { [Number(newId)]: true }
  }
})
</script>

<template>
  <SidebarGroup v-if="myVenuesStore.venues.length > 0" class="border-t border-sidebar-border/50 pt-4">
    <SidebarGroupLabel class="px-3 text-[10px] font-black uppercase tracking-widest text-sidebar-foreground/30">
      {{ $t('components.sidebar.myVenues') }}
    </SidebarGroupLabel>
    <SidebarMenu class="px-2 mt-2">
      <Collapsible v-for="venue in myVenuesStore.venues" :key="venue.id" as-child v-model:open="openStates[venue.id]"
        class="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger as-child>
            <SidebarMenuButton :tooltip="venue.name"
              class="h-10 px-3 rounded-xl hover:bg-primary/5 group-data-[state=open]/collapsible:bg-primary/5 transition-all">
              <div
                class="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <CategoryIcon v-if="venue.category" :icon="venue.category.icon" :color="venue.category.color"
                  class="h-3.5 w-3.5 text-primary" />
              </div>
              <span class="truncate font-semibold text-sm">{{ venue.name }}</span>
              <ChevronRight
                class="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-sidebar-foreground/20" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent class="pl-2 pt-1">
            <SidebarMenuSub class="border-l-2 border-primary/10 ml-3 pe-0 me-0">
              <SidebarMenuSubItem>
                <SidebarMenuSubButton as-child
                  :is-active="isActive('my-venue-overview') && route.params.id == String(venue.id)"
                  class="h-9 px-4 rounded-lg hover:bg-primary/5 transition-all text-xs font-medium">
                  <RouterLink :to="{ name: 'my-venue-overview', params: { id: venue.id } }">
                    <LayoutDashboard class="h-3.5 w-3.5 mr-2 opacity-50" />
                    <span>{{ $t('components.sidebar.myVenueOverview') }}</span>
                  </RouterLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>

              <SidebarMenuSubItem>
                <SidebarMenuSubButton as-child
                  :is-active="isActive('my-venue-activities') && route.params.id == String(venue.id)"
                  class="h-9 px-4 rounded-lg hover:bg-primary/5 transition-all text-xs font-medium">
                  <RouterLink :to="{ name: 'my-venue-activities', params: { id: venue.id } }">
                    <Activity class="h-3.5 w-3.5 mr-2 opacity-50" />
                    <span>{{ $t('components.sidebar.myVenueActivities') }}</span>
                  </RouterLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>

              <SidebarMenuSubItem>
                <RouterLink :to="{ name: 'my-venue-resources', params: { id: venue.id } }">
                  <SidebarMenuSubButton
                    class="h-10 px-3 rounded-xl hover:bg-primary/5 group-data-[state=open]/collapsible:bg-primary/5 transition-all"
                    :is-active="isActive('my-venue-resources') && route.params.id == String(venue.id)">
                    <Box class=" h-3.5 w-3.5 mr-2 opacity-50" />
                    <span>{{ $t('components.sidebar.myVenueResources') }}</span>
                  </SidebarMenuSubButton>
                </RouterLink>
              </SidebarMenuSubItem>

              <SidebarMenuSub class="border-l-2 border-primary/10 ml-4">
                <SidebarMenuSubItem v-for="resource in venue.resources" :key="resource.id">
                  <SidebarMenuSubButton as-child
                    :is-active="isActive('my-resource-detail') && route.params.id == String(venue.id) && route.params.resourceId == String(resource.id)"
                    class="h-9 px-4 rounded-lg hover:bg-primary/5 transition-all text-xs font-medium">
                    <RouterLink :to="{ name: 'my-resource-detail', params: { id: venue.id, resourceId: resource.id } }">
                      <Box class="h-3.5 w-3.5 mr-2 opacity-50" />
                      <span>{{ resource.name }}</span>
                    </RouterLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

              </SidebarMenuSub>

            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>
