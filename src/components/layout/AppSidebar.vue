<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Dumbbell,
  Tag,
  Users,
  LogOut,
  ChevronUp,
  Zap,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, name: 'dashboard' },
  { title: 'Activities', icon: Dumbbell, name: 'activities', permission: 'activity.view' },
  { title: 'Categories', icon: Tag, name: 'categories', permission: 'activity-category.update' },
  { title: 'Users', icon: Users, name: 'users', permission: 'user.view' },
]

const filteredNavItems = computed(() => {
  return navItems.filter(item => {
    if (!item.permission) return true
    return authStore.canAccess(item.permission)
  })
})

function isActive(name: string) {
  return route.name === name || String(route.name).startsWith(name)
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <Sidebar>
    <SidebarHeader class="p-4">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Zap class="h-5 w-5 text-primary" />
        </div>
        <div>
          <p class="text-sm font-bold text-sidebar-foreground">NextPlay</p>
          <p class="text-[11px] text-sidebar-foreground/50">Back Office</p>
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in filteredNavItems" :key="item.name">
              <SidebarMenuButton :is-active="isActive(item.name)" as-child>
                <RouterLink :to="{ name: item.name }" class="flex items-center gap-3">
                  <component :is="item.icon" class="h-4 w-4" />
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton class="w-full">
                <div
                  class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary shrink-0">
                  {{ authStore.user?.name?.charAt(0)?.toUpperCase() ?? 'A' }}
                </div>
                <div class="flex flex-col items-start min-w-0">
                  <span class="truncate text-sm font-medium text-sidebar-foreground">{{ authStore.user?.name ?? 'Admin'
                    }}</span>
                  <span class="truncate text-[11px] text-sidebar-foreground/50">{{ authStore.user?.email ?? '' }}</span>
                </div>
                <ChevronUp class="ml-auto h-4 w-4 shrink-0 text-sidebar-foreground/50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" class="w-56">
              <DropdownMenuItem class="text-destructive cursor-pointer" @click="handleLogout">
                <LogOut class="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
