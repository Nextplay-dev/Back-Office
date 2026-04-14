<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-vue-next'

const route = useRoute()
const { t, locale } = useI18n()

const pageTitle = computed(() => {
  const name = String(route.name)
  if (name.startsWith('admin-dashboard')) return t('components.sidebar.dashboard')
  if (name.startsWith('admin-venues')) return t('components.sidebar.venues')
  if (name.startsWith('admin-categories')) return t('components.sidebar.categories')
  if (name.startsWith('admin-users')) return t('components.sidebar.users')
  if (name.startsWith('admin-roles')) return t('components.sidebar.roles')
  if (name.startsWith('my-dashboard')) return t('components.sidebar.dashboard')
  if (name.startsWith('my-venue-overview')) return t('components.sidebar.myVenues')
  return t('components.sidebar.admin')
})

function setLanguage(lang: 'en' | 'fr') {
  localStorage.setItem('lang', lang)
  locale.value = lang
}
</script>

<template>
  <header class="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
    <SidebarTrigger class="-ml-1" />
    <Separator orientation="vertical" class="mr-2 h-4" />
    <div class="flex flex-1 items-center justify-between">
      <h1 class="text-sm font-semibold text-foreground">{{ pageTitle }}</h1>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="h-9 w-9 hover:bg-muted/50 cursor-pointer">
            <Globe class="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-36">
          <DropdownMenuItem @click="setLanguage('en')"
            :class="{ 'bg-primary/10 font-bold text-primary': locale === 'en' }" class="cursor-pointer">
            🇬🇧 English
          </DropdownMenuItem>
          <DropdownMenuItem @click="setLanguage('fr')"
            :class="{ 'bg-primary/10 font-bold text-primary': locale === 'fr' }" class="cursor-pointer">
            🇫🇷 Français
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
