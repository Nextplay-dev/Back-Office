<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { activityRoutes } from '@/plugins/routes'
import type { ActivityModel } from '@/models/ActivityModel'
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
import { Activity, Plus, Pencil, Trash2, Loader2, Clock } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const venueId = Number(route.params.id)

const activities = ref<ActivityModel[]>([])
const loading = ref(true)
const deletingId = ref<number | null>(null)

async function fetchActivities() {
  loading.value = true
  try {
    const { data } = await activityRoutes.list(venueId)
    activities.value = data
  } catch (e) {
    console.error('Failed to fetch activities', e)
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  deletingId.value = id
  try {
    await activityRoutes.delete(venueId, id)
    await fetchActivities()
    toast.success('Activity deleted')
  } catch (e) {
    toast.error('Failed to delete activity')
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchActivities)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold">{{ $t('views.myActivities.list.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('views.myActivities.list.subtitle') }}</p>
      </div>

      <Button @click="router.push({ name: 'my-activity-create', params: { id: venueId } })" class="w-full sm:w-auto">
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('views.myActivities.list.new') }}
      </Button>
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center p-12">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground/50" />
      </div>

      <div v-else-if="activities.length === 0" class="flex flex-col items-center justify-center p-12 text-center">
        <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Activity class="h-6 w-6 text-muted-foreground/50" />
        </div>
        <h3 class="text-sm font-semibold">{{ $t('views.myActivities.list.noActivities') }}</h3>
        <p class="text-xs text-muted-foreground mt-1 max-w-[200px]">
          {{ $t('views.myActivities.list.noActivitiesDesc') }}
        </p>
        <Button variant="outline" size="sm" @click="router.push({ name: 'my-activity-create', params: { id: venueId } })" class="mt-4">
          {{ $t('views.myActivities.list.addFirstValue') }}
        </Button>
      </div>

      <Table v-else>
        <TableHeader>
          <TableRow class="bg-muted/30">
            <TableHead>{{ $t('views.myActivities.list.table.name') }}</TableHead>
            <TableHead>{{ $t('views.myActivities.list.table.duration') }}</TableHead>
            <TableHead>{{ $t('views.myActivities.list.table.interval') }}</TableHead>
            <TableHead class="text-right">{{ $t('views.myActivities.list.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="activity in activities" :key="activity.id" class="hover:bg-muted/20 transition-colors">
            <TableCell class="font-bold">
              {{ activity.name }}
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <Clock class="h-3 w-3 text-muted-foreground" />
                <span>{{ activity.duration_minutes }} min</span>
              </div>
            </TableCell>
            <TableCell>
               <span class="text-muted-foreground">{{ activity.slot_interval_minutes }} min</span>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button variant="ghost" size="sm" @click="router.push({ name: 'my-activity-edit', params: { id: venueId, activityId: activity.id } })">
                  <Pencil class="h-4 w-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{{ $t('views.myActivities.list.delete.title') }}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {{ $t('views.myActivities.list.delete.description', { name: activity.name }) }}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{{ $t('views.myActivities.list.delete.cancel') }}</AlertDialogCancel>
                      <AlertDialogAction @click="handleDelete(activity.id)" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        <Loader2 v-if="deletingId === activity.id" class="mr-2 h-4 w-4 animate-spin" />
                        {{ $t('views.myActivities.list.delete.confirm') }}
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
  </div>
</template>
