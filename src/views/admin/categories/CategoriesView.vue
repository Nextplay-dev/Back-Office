<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { activityCategoryRoutes } from '@/plugins/routes'
import type { ActivityCategoryModel } from '@/models/ActivityCategoryModel'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const categories = ref<ActivityCategoryModel[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const loading = ref(false)
const deletingId = ref<number | null>(null)

async function loadCategories() {
  loading.value = true
  try {
    const { data } = await activityCategoryRoutes.list(currentPage.value)
    categories.value = data.data
    lastPage.value = data.meta.last_page
    total.value = data.meta.total
  } finally {
    loading.value = false
  }
}

async function deleteCategory(id: number) {
  deletingId.value = id
  try {
    await activityCategoryRoutes.delete(id)
    await loadCategories()
  } finally {
    deletingId.value = null
  }
}

onMounted(loadCategories)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold">Categories</h2>
        <p class="text-sm text-muted-foreground">{{ total }} total</p>
      </div>
      <Button v-if="authStore.canAccess('activity-category.create')" @click="router.push({ name: 'categories-create' })">
        <Plus class="mr-2 h-4 w-4" /> New Category
      </Button>
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/30">
            <TableHead class="w-12">#</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Color</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="5" class="py-12 text-center text-muted-foreground">
              <Loader2 class="mx-auto h-6 w-6 animate-spin" />
            </TableCell>
          </TableRow>
          <TableRow v-else-if="!categories.length">
            <TableCell colspan="5" class="py-12 text-center text-muted-foreground text-sm">
              No categories found.
            </TableCell>
          </TableRow>
          <TableRow
            v-for="category in categories"
            :key="category.id"
            class="hover:bg-muted/20 transition-colors"
          >
            <TableCell class="font-mono text-xs text-muted-foreground">{{ category.id }}</TableCell>
            <TableCell>
               <div v-if="category.icon" class="h-8 w-8 flex items-center justify-center rounded-lg bg-muted text-lg">
                 {{ category.icon }}
               </div>
               <span v-else class="text-muted-foreground text-sm">—</span>
            </TableCell>
            <TableCell class="font-medium">{{ category.name }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <div
                    v-if="category.color"
                    class="h-4 w-4 rounded-full border border-border"
                    :style="{ backgroundColor: category.color }"
                ></div>
                <span class="text-sm font-mono text-muted-foreground">{{ category.color || '—' }}</span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button
                  v-if="authStore.canAccess('activity-category.update')"
                  size="sm"
                  variant="ghost"
                  @click="router.push({ name: 'categories-edit', params: { id: category.id } })"
                >
                  <Pencil class="h-4 w-4" />
                </Button>
                <AlertDialog v-if="authStore.canAccess('activity-category.delete')">
                  <AlertDialogTrigger as-child>
                    <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete category?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{{ category.name }}" will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        @click="deleteCategory(category.id)"
                      >
                        <Loader2 v-if="deletingId === category.id" class="mr-2 h-4 w-4 animate-spin" />
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-between text-sm text-muted-foreground">
      <span>Page {{ currentPage }} of {{ lastPage }}</span>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage <= 1"
          @click="currentPage--; loadCategories()"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage >= lastPage"
          @click="currentPage++; loadCategories()"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
