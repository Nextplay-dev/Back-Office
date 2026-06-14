<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Dumbbell,
  Tag,
  Users,
  Shield,
  Bug,
} from 'lucide-vue-next'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const route = useRoute()
const authStore = useAuthStore()

const adminNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, name: 'admin-dashboard', permission: 'back-office.administration.dashboard' },
  { title: 'Venues', icon: Dumbbell, name: 'admin-venues', permission: 'back-office.administration.venues' },
  { title: 'Categories', icon: Tag, name: 'admin-categories', permission: 'back-office.administration.categories' },
  { title: 'Users', icon: Users, name: 'admin-users', permission: 'back-office.administration.users' },
  { title: 'Roles', icon: Shield, name: 'admin-roles', permission: 'back-office.administration.roles' },
  { title: 'Bug Reports', icon: Bug, name: 'admin-bugReports', permission: 'back-office.administration.bug-reports' },
]

const filteredAdminNavItems = computed(() => {
  return adminNavItems.filter(item => {
    if (!item.permission) return true
    return authStore.canAccess(item.permission)
  })
})

function isActive(name: string) {
  return route.name === name || String(route.name).startsWith(name)
}
</script>

<template>
  <SidebarGroup v-if="filteredAdminNavItems.length > 0">
    <SidebarGroupLabel class="px-3 text-[10px] font-black uppercase tracking-widest text-sidebar-foreground/30">
      {{ $t('components.sidebar.administration') }}
    </SidebarGroupLabel>
    <SidebarGroupContent class="px-2 mt-2">
      <SidebarMenu>
        <SidebarMenuItem v-for="item in filteredAdminNavItems" :key="item.name">
          <SidebarMenuButton :is-active="isActive(item.name)" as-child
            class="h-10 px-3 rounded-xl hover:bg-primary/5 transition-all">
            <RouterLink :to="{ name: item.name }" class="flex items-center gap-3">
              <div
                class="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <component :is="item.icon" class="h-3.5 w-3.5 text-primary" />
              </div>
              <span class="font-semibold text-sm">{{ $t('components.sidebar.' + item.name.replace('admin-', ''))
                }}</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
