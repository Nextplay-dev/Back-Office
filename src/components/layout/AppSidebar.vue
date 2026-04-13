<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SidebarAdminGroup from './sidebar/SidebarAdminGroup.vue'
import SidebarMyActivitiesGroup from './sidebar/SidebarMyActivitiesGroup.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  LogOut,
  ChevronUp,
  Zap,
} from 'lucide-vue-next'
import { useMyActivitiesStore } from '@/stores/myActivities'

const router = useRouter()
const authStore = useAuthStore()
const myActivitiesStore = useMyActivitiesStore()

async function handleLogout() {
  myActivitiesStore.reset()
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <Sidebar>
    <RouterLink :to="{ name: 'dashboard' }">
      <SidebarHeader class="p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Zap class="h-5 w-5 text-primary" />
          </div>
          <div>
            <p class="text-sm font-bold text-sidebar-foreground">NextPlay</p>
            <p class="text-[11px] text-sidebar-foreground/50">{{ $t('components.header.backOffice') }}</p>
          </div>
        </div>
      </SidebarHeader>
    </RouterLink>

    <SidebarContent>
      <SidebarMyActivitiesGroup />
      <SidebarAdminGroup />
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
                  <span class="truncate text-sm font-medium text-sidebar-foreground">{{ authStore.user?.name ?? $t('components.sidebar.admin') }}</span>
                  <span class="truncate text-[11px] text-sidebar-foreground/50">{{ authStore.user?.email ?? '' }}</span>
                </div>
                <ChevronUp class="ml-auto h-4 w-4 shrink-0 text-sidebar-foreground/50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" class="w-56">
              <DropdownMenuItem class="text-destructive cursor-pointer" @click="handleLogout">
                <LogOut class="mr-2 h-4 w-4" />
                {{ $t('components.header.logout') }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
