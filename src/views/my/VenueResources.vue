<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resourceRoutes } from '@/plugins/routes'
import type { ResourceModel } from '@/models/ResourceModel'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Boxes, Plus, Pencil, Trash2, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const venueId = Number(route.params.id)

const resources = ref<ResourceModel[]>([])
const loading = ref(true)
const dialogOpen = ref(false)
const submitting = ref(false)
const editingResource = ref<ResourceModel | null>(null)
const deletingId = ref<number | null>(null)

const form = ref({
  name: '',
  type: '',
  capacity: 1,
})

async function fetchResources() {
  loading.value = true
  try {
    const { data } = await resourceRoutes.list(venueId)
    resources.value = data
  } catch (e) {
    console.error('Failed to fetch resources', e)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingResource.value = null
  form.value = { name: '', type: '', capacity: 1 }
  dialogOpen.value = true
}


async function handleSubmit() {
  submitting.value = true
  try {
    if (editingResource.value) {
      await resourceRoutes.update(editingResource.value.id, form.value)
      toast.success('Resource updated successfully')
    } else {
      await resourceRoutes.create(venueId, form.value)
      toast.success('Resource created successfully')
    }
    dialogOpen.value = false
    await fetchResources()
  } catch (e) {
    toast.error('Failed to save resource')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number) {
  deletingId.value = id
  try {
    await resourceRoutes.delete(id)
    await fetchResources()
    toast.success('Resource deleted')
  } catch (e) {
    toast.error('Failed to delete resource')
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchResources)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold">{{ $t('views.myResources.list.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('views.myResources.list.subtitle') }}</p>
      </div>

      <Button @click="openCreate">
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('views.myResources.list.new') }}
      </Button>
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center p-12">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground/50" />
      </div>

      <div v-else-if="resources.length === 0" class="flex flex-col items-center justify-center p-12 text-center">
        <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Boxes class="h-6 w-6 text-muted-foreground/50" />
        </div>
        <h3 class="text-sm font-semibold">{{ $t('views.myResources.list.noResources') }}</h3>
        <p class="text-xs text-muted-foreground mt-1 max-w-[200px]">
          {{ $t('views.myResources.list.noResourcesDesc') }}
        </p>
        <Button variant="outline" size="sm" @click="openCreate" class="mt-4">
          {{ $t('views.myResources.list.addFirstValue') }}
        </Button>
      </div>

      <Table v-else>
        <TableHeader>
          <TableRow class="bg-muted/30">
            <TableHead>{{ $t('views.myResources.list.table.name') }}</TableHead>
            <TableHead>{{ $t('views.myResources.list.table.type') }}</TableHead>
            <TableHead class="text-center">{{ $t('views.myResources.list.table.capacity') }}</TableHead>
            <TableHead class="text-right">{{ $t('views.myResources.list.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="resource in resources" :key="resource.id" class="hover:bg-muted/20 transition-colors">
            <TableCell class="font-medium">{{ resource.name }}</TableCell>
            <TableCell>
              <Badge variant="secondary" class="capitalize">
                {{ resource.type }}
              </Badge>
            </TableCell>
            <TableCell class="text-center font-mono text-sm">{{ resource.capacity }}</TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button variant="ghost" size="sm" @click="router.push({ name: 'my-resource-detail', params: { id: venueId, resourceId: resource.id } })">
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
                      <AlertDialogTitle>{{ $t('views.myResources.list.delete.title') }}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {{ $t('views.myResources.list.delete.description', { name: resource.name }) }}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{{ $t('views.myResources.list.delete.cancel') }}</AlertDialogCancel>
                      <AlertDialogAction @click="handleDelete(resource.id)" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        <Loader2 v-if="deletingId === resource.id" class="mr-2 h-4 w-4 animate-spin" />
                        {{ $t('views.myResources.list.delete.confirm') }}
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

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ editingResource ? $t('common.actions.edit') : $t('views.myResources.list.new') }}</DialogTitle>
          <DialogDescription>
            Configure a resource for your venue.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="space-y-2">
            <Label for="name">{{ $t('views.myResources.list.table.name') }}</Label>
            <Input id="name" v-model="form.name" placeholder="e.g. Court #1" />
          </div>
          <div class="space-y-2">
            <Label for="type">{{ $t('views.myResources.list.table.type') }}</Label>
            <Input id="type" v-model="form.type" placeholder="e.g. padel, tennis" />
          </div>
          <div class="space-y-2">
            <Label for="capacity">{{ $t('views.myResources.list.table.capacity') }}</Label>
            <Input id="capacity" type="number" v-model="form.capacity" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="dialogOpen = false">{{ $t('common.actions.cancel') }}</Button>
          <Button type="submit" @click="handleSubmit" :disabled="submitting">
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingResource ? $t('common.actions.update') : $t('common.actions.create') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
