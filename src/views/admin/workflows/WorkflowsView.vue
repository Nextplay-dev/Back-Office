<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { workflowRoutes, locationRoutes, categoryRoutes } from '@/plugins/routes'
import { getEcho } from '@/plugins/echo'
import CategorySelector from '@/components/CategorySelector.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertOctagon,
} from 'lucide-vue-next'

const workflows = ref<any[]>([])
const availableWorkflows = ref<any[]>([])
const pendingReviews = ref<any[]>([])
const pendingReviewEdits = ref<Record<number, Record<string, any>>>({})
const reviewLoading = ref<Set<number>>(new Set())

const currentPage = ref(1)
const lastPage = ref(1)
const totalWorkflows = ref(0)
const loading = ref(false)
const loadingAvailable = ref(false)
const loadingReviews = ref(false)
const triggering = ref(false)

const isStartDialogOpen = ref(false)
const selectedWorkflow = ref<any | null>(null)
const formValues = ref<Record<string, any>>({})
const abortLoading = ref(false)
const deleteLoading = ref(false)

const isDetailsDialogOpen = ref(false)
const selectedDetailedWorkflow = ref<any | null>(null)
const logsContainer = ref<HTMLElement | null>(null)

watch(() => selectedDetailedWorkflow.value?.logs, () => {
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight
    }
  })
}, { deep: true })

const loadingDetails = ref(false)

async function loadWorkflows() {
  loading.value = true
  try {
    const { data } = await workflowRoutes.list(currentPage.value)
    workflows.value = data.data
    lastPage.value = data.meta.last_page
    totalWorkflows.value = data.meta.total
  } catch (e) {
  } finally {
    loading.value = false
  }
}

async function loadWorkflowDetails(id: number) {
  loadingDetails.value = true
  try {
    const { data } = await workflowRoutes.get(id)
    selectedDetailedWorkflow.value = data
  } catch (e) {
  } finally {
    loadingDetails.value = false
  }
}

function applyWorkflowEvent(payload: any) {
  const { action, workflow_id: workflowId, summary, pending_review: pendingReview, child_id: childId } = payload
  const normalizedWorkflowId = Number(workflowId)

  if (action === 'deleted') {
    workflows.value = workflows.value.filter((w: any) => Number(w.id) !== normalizedWorkflowId)
    if (Number(selectedDetailedWorkflow.value?.id) === normalizedWorkflowId) {
      isDetailsDialogOpen.value = false
      selectedDetailedWorkflow.value = null
    }
    return
  }

  if (action === 'created' && summary) {
    const exists = workflows.value.some((w: any) => Number(w.id) === Number(summary.id))
    if (!exists && currentPage.value === 1) {
      workflows.value.unshift(summary)
      totalWorkflows.value += 1
    }
    return
  }

  if (summary) {
    const index = workflows.value.findIndex((w: any) => Number(w.id) === normalizedWorkflowId)
    if (index !== -1) {
      workflows.value[index] = { ...workflows.value[index], ...summary }
    }

    if (Number(selectedDetailedWorkflow.value?.id) === normalizedWorkflowId) {
      selectedDetailedWorkflow.value = {
        ...selectedDetailedWorkflow.value,
        ...summary,
      }

      if (!isWorkflowActive(summary.status)) {
        stopDurationTimer()
      }
    }

    if (!isWorkflowActive(summary.status)) {
      loadPendingReviews()
    }
  }

  if (action === 'pending_review_added' && pendingReview) {
    const exists = pendingReviews.value.some((r: any) => Number(r.id) === Number(pendingReview.id))
    if (!exists) {
      pendingReviews.value.unshift(pendingReview)
    }
    if (!pendingReviewEdits.value[pendingReview.id]) {
      pendingReviewEdits.value[pendingReview.id] = {}
    }
    for (const [key, field] of Object.entries(pendingReview.fields || {})) {
      const f = field as any
      if (pendingReviewEdits.value[pendingReview.id][key] === undefined) {
        pendingReviewEdits.value[pendingReview.id][key] = f.value
      }
    }
  }

  if (action === 'pending_review_removed' && childId) {
    pendingReviews.value = pendingReviews.value.filter((r: any) => Number(r.id) !== Number(childId))
  }
}

function applyWorkflowLogLine(payload: any) {
  const { workflow_id: workflowId, log } = payload

  if (!log || Number(selectedDetailedWorkflow.value?.id) !== Number(workflowId)) {
    return
  }

  if (loadingDetails.value) {
    return
  }

  const existingLogs = selectedDetailedWorkflow.value.logs ?? []
  if (existingLogs.includes(log)) {
    return
  }

  selectedDetailedWorkflow.value.logs = [...existingLogs, log]
}

async function loadAvailableWorkflows() {
  loadingAvailable.value = true
  try {
    const { data } = await workflowRoutes.available()
    availableWorkflows.value = data
  } catch (e) {
  } finally {
    loadingAvailable.value = false
  }
}

async function loadPendingReviews() {
  loadingReviews.value = true
  try {
    const { data } = await workflowRoutes.pendingReviews()
    pendingReviews.value = data
    for (const review of data) {
      if (!pendingReviewEdits.value[review.id]) {
        pendingReviewEdits.value[review.id] = {}
      }
      for (const [key, field] of Object.entries(review.fields || {})) {
        const f = field as any
        if (pendingReviewEdits.value[review.id][key] === undefined) {
          pendingReviewEdits.value[review.id][key] = f.value
        }
      }
    }
  } catch (e) {
  } finally {
    loadingReviews.value = false
  }
}

const citySearchQuery = ref('')
const citySuggestions = ref<any[]>([])
const loadingCities = ref(false)
const cityGeoParamName = ref('')
let citySelectionPending = false

watch(citySearchQuery, async (query) => {
  if (citySelectionPending) {
    citySelectionPending = false
    return
  }
  if (cityGeoParamName.value) {
    formValues.value[cityGeoParamName.value] = null
  }
  citySuggestions.value = []
  if (query.length < 3) return
  loadingCities.value = true
  try {
    const { data } = await locationRoutes.citiesAutocomplete(query)
    citySuggestions.value = data.data || data
  } catch (e) {
  } finally {
    loadingCities.value = false
  }
})

async function selectCity(paramName: string, sug: any) {
  citySelectionPending = true
  cityGeoParamName.value = paramName
  citySearchQuery.value = sug.description
  citySuggestions.value = []
  try {
    const { data } = await locationRoutes.placeDetails(sug.placeId)
    const payload = data.data || data
    formValues.value[paramName] = {
      lat: payload.latitude,
      lon: payload.longitude,
      name: payload.label
    }
  } catch (e) {
    formValues.value[paramName] = null
  }
}

const placeSearchQuery = ref('')
const placeSuggestions = ref<any[]>([])
const loadingPlaces = ref(false)
const placeParamName = ref('')
let placeSelectionPending = false

watch(placeSearchQuery, async (query) => {
  if (placeSelectionPending) {
    placeSelectionPending = false
    return
  }
  if (placeParamName.value) {
    formValues.value[placeParamName.value] = null
  }
  placeSuggestions.value = []
  if (query.length < 3) return
  loadingPlaces.value = true
  try {
    const { data } = await locationRoutes.placesAutocomplete(query)
    placeSuggestions.value = data.data || data
  } catch (e) {
  } finally {
    loadingPlaces.value = false
  }
})

function selectPlace(paramName: string, sug: any) {
  placeSelectionPending = true
  placeParamName.value = paramName
  placeSearchQuery.value = sug.description
  placeSuggestions.value = []
  formValues.value[paramName] = {
    placeId: sug.placeId,
    name: sug.mainText || sug.description
  }
}

function openStartDialog(wf: any) {
  selectedWorkflow.value = wf
  citySearchQuery.value = ''
  citySuggestions.value = []
  placeSearchQuery.value = ''
  placeSuggestions.value = []
  const defaults: Record<string, any> = {}
  wf.parameters.forEach((param: any) => {
    defaults[param.name] = param.default
  })
  formValues.value = defaults
  isStartDialogOpen.value = true
}

async function triggerWorkflow() {
  if (!selectedWorkflow.value) return

  const unresolvedGeoParam = selectedWorkflow.value.parameters.find(
    (p: any) => p.type === 'geo' && !formValues.value[p.name]
  )
  if (unresolvedGeoParam) return

  const unresolvedPlaceParam = selectedWorkflow.value.parameters.find(
    (p: any) => p.type === 'google_place' && !formValues.value[p.name]
  )
  if (unresolvedPlaceParam) return

  // Convert radius from km to meters if present
  const params = { ...formValues.value }
  if (params.radius !== undefined && params.radius !== null) {
    params.radius = Number(params.radius)
  }

  triggering.value = true
  try {
    const { data } = await workflowRoutes.start({
      class: selectedWorkflow.value.class,
      params,
    })
    isStartDialogOpen.value = false
    await loadWorkflows()
    await loadPendingReviews()
    openDetailsDialog(Number(data.id))
  } catch (e) {
  } finally {
    triggering.value = false
  }
}

function updateTag(reviewId: number, fieldKey: string, index: number, value: string) {
  const tags = [...(pendingReviewEdits.value[reviewId]?.[fieldKey] ?? [])]
  tags[index] = value
  if (!pendingReviewEdits.value[reviewId]) {
    pendingReviewEdits.value[reviewId] = {}
  }
  pendingReviewEdits.value[reviewId][fieldKey] = tags
}

function removeTag(reviewId: number, fieldKey: string, index: number) {
  const tags = [...(pendingReviewEdits.value[reviewId]?.[fieldKey] ?? [])]
  tags.splice(index, 1)
  if (!pendingReviewEdits.value[reviewId]) {
    pendingReviewEdits.value[reviewId] = {}
  }
  pendingReviewEdits.value[reviewId][fieldKey] = tags
}

function addTag(reviewId: number, fieldKey: string) {
  if (!pendingReviewEdits.value[reviewId]) {
    pendingReviewEdits.value[reviewId] = {}
  }
  const tags = [...(pendingReviewEdits.value[reviewId]?.[fieldKey] ?? [])]
  tags.push('')
  pendingReviewEdits.value[reviewId][fieldKey] = tags
}

async function onCategoryChange(reviewId: number, newCategoryId: number | null, field: any) {
  if (!pendingReviewEdits.value[reviewId]) {
    pendingReviewEdits.value[reviewId] = {}
  }
  pendingReviewEdits.value[reviewId].category_id = newCategoryId
  if (newCategoryId) {
    try {
      const { data } = await categoryRoutes.get(newCategoryId)
      pendingReviewEdits.value[reviewId].category_name = data.name
    } catch {
      pendingReviewEdits.value[reviewId].category_name = field.category_name
    }
  } else {
    pendingReviewEdits.value[reviewId].category_name = field.category_name
  }
}

function getReviewFieldValue(reviewId: number, fieldKey: string, field: any): any {
  const edits = pendingReviewEdits.value[reviewId]
  return edits?.[fieldKey] !== undefined ? edits[fieldKey] : field.value
}

function collectReviewData(review: any): Record<string, any> {
  const edits = pendingReviewEdits.value[review.id] || {}
  const changed: Record<string, any> = {}
  for (const key of Object.keys(review.fields || {})) {
    const editedValue = edits[key]
    if (editedValue !== undefined) {
      changed[key] = editedValue
    }
  }
  if (changed.category_id !== undefined && edits.category_name !== undefined) {
    changed.category_name = edits.category_name
  }
  return changed
}

async function handleReview(childId: number, decision: 'approve' | 'reject') {
  reviewLoading.value = new Set([...reviewLoading.value, childId])
  try {
    const review = pendingReviews.value.find((r: any) => Number(r.id) === Number(childId))
    const data = decision === 'approve' && review ? collectReviewData(review) : undefined
    await workflowRoutes.signal(childId, decision, data)
  } catch (e) {
  } finally {
    reviewLoading.value = new Set([...reviewLoading.value].filter((id) => id !== childId))
  }
}

function isWorkflowActive(status?: string) {
  const normalized = status?.toLowerCase() ?? ''
  return normalized === 'running' || normalized === 'waiting'
}

const isSelectedWorkflowActive = computed(() =>
  isWorkflowActive(selectedDetailedWorkflow.value?.status)
)

function stopDurationTimer() {
  if (durationInterval) {
    clearInterval(durationInterval)
    durationInterval = null
  }
}

function patchWorkflowStatus(id: number, status: string, step: string) {
  const normalizedId = Number(id)

  const index = workflows.value.findIndex((w: any) => Number(w.id) === normalizedId)
  if (index !== -1) {
    workflows.value[index] = { ...workflows.value[index], status, step }
  }

  if (Number(selectedDetailedWorkflow.value?.id) === normalizedId) {
    selectedDetailedWorkflow.value = {
      ...selectedDetailedWorkflow.value,
      status,
      step,
    }
  }

  if (!isWorkflowActive(status)) {
    stopDurationTimer()
  }
}

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'secondary'
    case 'failed':
      return 'destructive'
    case 'running':
      return 'default'
    default:
      return 'outline'
  }
}

function formatDuration(createdAt: string, updatedAt?: string) {
  if (!createdAt) return ''
  const start = new Date(createdAt).getTime()
  const end = updatedAt ? new Date(updatedAt).getTime() : Date.now()
  const diffMs = end - start
  if (diffMs < 0) return '0s'
  const totalSec = Math.floor(diffMs / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`
}

const runningDuration = ref('')
let durationInterval: any = null

function updateDuration() {
  if (!selectedDetailedWorkflow.value || !selectedDetailedWorkflow.value.created_at) {
    runningDuration.value = ''
    return
  }
  const start = new Date(selectedDetailedWorkflow.value.created_at).getTime()
  const now = Date.now()
  const diffMs = now - start
  if (diffMs < 0) {
    runningDuration.value = '0s'
    return
  }
  const totalSec = Math.floor(diffMs / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  runningDuration.value = min > 0 ? `${min}m ${sec}s` : `${sec}s`
}

function openDetailsDialog(id: number) {
  isDetailsDialogOpen.value = true
  loadWorkflowDetails(id)
  updateDuration()
  stopDurationTimer()
  durationInterval = setInterval(updateDuration, 1000)
}

watch(isDetailsDialogOpen, (val) => {
  if (!val) {
    stopDurationTimer()
  }
})

async function handleAbort(id: number) {
  abortLoading.value = true
  patchWorkflowStatus(id, 'Failed', 'failed')

  try {
    await workflowRoutes.abort(id)
    await loadWorkflowDetails(id)
    await loadPendingReviews()
  } catch (e) {
  } finally {
    abortLoading.value = false
  }
}

async function handleDelete(id: number) {
  deleteLoading.value = true
  try {
    await workflowRoutes.delete(id)
    await loadPendingReviews()
  } catch (e) {
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  loadWorkflows()
  loadAvailableWorkflows()
  loadPendingReviews()

  try {
    const echo = getEcho()
    echo.private('workflows')
      .listen('.WorkflowUpdated', (payload: any) => {
        applyWorkflowEvent(payload)
      })
      .listen('.WorkflowLogLineAdded', (payload: any) => {
        applyWorkflowLogLine(payload)
      })
  } catch (err) {}
})

onUnmounted(() => {
  if (durationInterval) {
    clearInterval(durationInterval)
  }
  try {
    const echo = getEcho()
    echo.leave('workflows')
  } catch (err) {}
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">{{ $t('views.workflows.title') }}</h1>
      <p class="text-sm text-muted-foreground">{{ $t('views.workflows.subtitle') }}</p>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <Card class="md:col-span-1">
        <CardHeader>
          <CardTitle class="text-base">{{ $t('views.workflows.availableTitle') }}</CardTitle>
          <p class="text-xs text-muted-foreground">{{ $t('views.workflows.availableSubtitle') }}</p>
        </CardHeader>
        <CardContent>
          <div class="relative min-h-[150px] space-y-4">
            <div v-if="loadingAvailable" class="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 class="h-6 w-6 animate-spin text-primary" />
            </div>

            <div v-for="wf in availableWorkflows" :key="wf.class" class="p-4 border rounded-xl flex flex-col justify-between gap-3 bg-card hover:bg-accent/5 transition-all">
              <div>
                <h3 class="font-semibold text-sm">{{ wf.name }}</h3>
                <p class="text-xs text-muted-foreground mt-1">{{ wf.description }}</p>
              </div>
              <Button size="sm" class="w-full mt-2" @click="openStartDialog(wf)">
                <Play class="mr-2 h-3.5 w-3.5" />
                {{ $t('views.workflows.startIngest') }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle class="text-base">{{ $t('views.workflows.activeWorkflows') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="relative min-h-[200px]">
            <div v-if="loading && workflows.length === 0" class="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 class="h-8 w-8 animate-spin text-primary" />
            </div>

            <Table v-else-if="workflows.length > 0">
              <TableHeader>
                <TableRow>
                  <TableHead>{{ $t('views.workflows.workflowId') }}</TableHead>
                  <TableHead>{{ $t('views.workflows.status') }}</TableHead>
                  <TableHead>{{ $t('views.workflows.step') }}</TableHead>
                  <TableHead>{{ $t('views.workflows.created') }}</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in workflows" :key="item.id">
                  <TableCell class="font-mono">#{{ item.id }}</TableCell>
                  <TableCell>
                    <Badge :variant="getStatusVariant(item.status)">{{ item.status }}</Badge>
                  </TableCell>
                  <TableCell>
                    <span class="text-sm font-semibold capitalize">{{ item.step.replace('_', ' ') }}</span>
                    <div class="text-xs text-muted-foreground mt-0.5">
                      {{ formatDuration(item.created_at, isWorkflowActive(item.status) ? undefined : item.updated_at) }}
                      <span class="ml-2">({{ item.children_count }} sub-tasks)</span>
                    </div>
                  </TableCell>
                  <TableCell class="text-xs text-muted-foreground">
                    {{ new Date(item.created_at).toLocaleString() }}
                  </TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" class="h-8 w-8 p-0" @click="openDetailsDialog(item.id)">
                        <Eye class="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div v-else class="text-center py-10 text-muted-foreground">
              {{ $t('views.workflows.noWorkflows') }}
            </div>

            <div v-if="lastPage > 1" class="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="currentPage--; loadWorkflows()">
                <ChevronLeft class="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" :disabled="currentPage === lastPage" @click="currentPage++; loadWorkflows()">
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ $t('views.workflows.reviewsTitle') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="relative min-h-[150px]">
          <div v-if="loadingReviews" class="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 class="h-6 w-6 animate-spin text-primary" />
          </div>

          <Table v-else-if="pendingReviews.length > 0">
            <TableHeader>
              <TableRow>
                <TableHead>{{ $t('views.workflows.table.name') }}</TableHead>
                <TableHead>{{ $t('views.workflows.table.details') }}</TableHead>
                <TableHead class="text-right">{{ $t('views.workflows.table.actions') }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="review in pendingReviews" :key="review.id" :class="reviewLoading.has(review.id) ? 'opacity-50 pointer-events-none' : ''">
                <TableCell class="font-semibold align-top max-w-[200px] truncate">
                  {{ review.title }}
                </TableCell>
                <TableCell>
                  <div class="space-y-2 text-xs">
                    <div v-for="(field, key) in review.fields" :key="key" class="flex gap-2 items-start">
                      <span class="font-bold text-muted-foreground min-w-[120px] pt-1.5">{{ field.label }}:</span>
                      <input
                        v-if="field.type === 'text' || field.type === 'url'"
                        :type="field.type"
                        :value="getReviewFieldValue(review.id, String(key), field)"
                        @input="pendingReviewEdits[review.id][String(key)] = ($event.target as HTMLInputElement).value"
                        class="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <div v-else-if="field.type === 'category'" class="w-full">
                        <CategorySelector
                          :modelValue="pendingReviewEdits[review.id]?.category_id ?? field.value"
                          @update:modelValue="onCategoryChange(review.id, $event, field)"
                        />
                      </div>
                      <textarea
                        v-else-if="field.type === 'textarea'"
                        :value="getReviewFieldValue(review.id, String(key), field)"
                        @input="pendingReviewEdits[review.id][String(key)] = ($event.target as HTMLTextAreaElement).value"
                        class="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <div
                        v-else-if="field.type === 'tags'"
                        class="flex flex-wrap gap-1"
                      >
                        <div
                          v-for="(tag, ti) in (pendingReviewEdits[review.id]?.[String(key)] ?? field.value)"
                          :key="ti"
                          class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
                        >
                          <input
                            :value="tag"
                            @input="updateTag(review.id, String(key), Number(ti), ($event.target as HTMLInputElement).value)"
                            class="w-20 bg-transparent border-none outline-none p-0 text-xs"
                          />
                          <button
                            type="button"
                            class="text-muted-foreground hover:text-foreground"
                            @click="removeTag(review.id, String(key), Number(ti))"
                          >&times;</button>
                        </div>
                        <button
                          type="button"
                          class="inline-flex items-center rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                          @click="addTag(review.id, String(key))"
                        >+</button>
                      </div>
                      <span v-else class="text-foreground pt-1.5">{{ field.value }}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="text-right align-top">
                  <div class="flex justify-end gap-2">
                    <Button size="sm" variant="default" :disabled="reviewLoading.has(review.id)" @click="handleReview(review.id, 'approve')">
                      <Loader2 v-if="reviewLoading.has(review.id)" class="mr-1 h-3.5 w-3.5 animate-spin" />
                      <CheckCircle v-else class="mr-1 h-3.5 w-3.5" />
                      {{ $t('views.workflows.approve') }}
                    </Button>
                    <Button size="sm" variant="destructive" :disabled="reviewLoading.has(review.id)" @click="handleReview(review.id, 'reject')">
                      <Loader2 v-if="reviewLoading.has(review.id)" class="mr-1 h-3.5 w-3.5 animate-spin" />
                      <XCircle v-else class="mr-1 h-3.5 w-3.5" />
                      {{ $t('views.workflows.reject') }}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div v-else class="text-center py-10 text-muted-foreground">
            {{ $t('views.workflows.noPendingReviews') }}
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog v-model:open="isStartDialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ $t('views.workflows.startModalTitle', { name: selectedWorkflow?.name }) }}</DialogTitle>
        </DialogHeader>

        <form class="space-y-4 mt-2" @submit.prevent="triggerWorkflow">
          <div v-for="param in selectedWorkflow?.parameters" :key="param.name" class="space-y-2">
            <Label :for="param.name">{{ param.label }}{{ param.name === 'radius' ? ' (km)' : '' }}</Label>
            
            <div v-if="param.type === 'geo'" class="relative">
              <Input 
                type="text" 
                v-model="citySearchQuery" 
                placeholder="Type a city name (e.g. Lille)..." 
                required 
              />
              <div v-if="loadingCities" class="absolute right-3 top-2.5">
                <Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
              <div v-if="citySuggestions.length > 0" class="absolute z-50 w-full mt-1 border rounded-xl bg-popover text-popover-foreground shadow-md max-h-[200px] overflow-y-auto">
                <div 
                  v-for="sug in citySuggestions" 
                  :key="sug.placeId" 
                  class="px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm cursor-pointer border-b last:border-0"
                  @click="selectCity(param.name, sug)"
                >
                  {{ sug.description }}
                </div>
              </div>
              <div v-if="formValues[param.name]" class="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle class="h-3.5 w-3.5 text-secondary" />
                <span>Selected: {{ formValues[param.name]?.name }} ({{ formValues[param.name]?.lat?.toFixed(4) }}, {{ formValues[param.name]?.lon?.toFixed(4) }})</span>
              </div>
            </div>

            <div v-else-if="param.type === 'google_place'" class="relative">
              <Input 
                type="text" 
                v-model="placeSearchQuery" 
                placeholder="Search a Google Place (e.g. Urban Padel)..." 
                required 
              />
              <div v-if="loadingPlaces" class="absolute right-3 top-2.5">
                <Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
              <div v-if="placeSuggestions.length > 0" class="absolute z-50 w-full mt-1 border rounded-xl bg-popover text-popover-foreground shadow-md max-h-[200px] overflow-y-auto">
                <div 
                  v-for="sug in placeSuggestions" 
                  :key="sug.placeId" 
                  class="px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm cursor-pointer border-b last:border-0"
                  @click="selectPlace(param.name, sug)"
                >
                  {{ sug.description }}
                </div>
              </div>
              <div v-if="formValues[param.name]" class="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle class="h-3.5 w-3.5 text-secondary" />
                <span>Selected: {{ formValues[param.name]?.name }}</span>
              </div>
            </div>

            <Input 
              v-else 
              :id="param.name" 
              v-model="formValues[param.name]" 
              :type="param.type" 
              :step="param.type === 'number' ? 'any' : undefined" 
              :required="param.required" 
            />
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" @click="isStartDialogOpen = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="triggering || selectedWorkflow?.parameters.some((p: any) => p.type === 'geo' && !formValues[p.name]) || selectedWorkflow?.parameters.some((p: any) => p.type === 'google_place' && !formValues[p.name])">
              <Loader2 v-if="triggering" class="mr-2 h-4 w-4 animate-spin" />
              <Play v-else class="mr-2 h-4 w-4" />
              {{ triggering ? $t('views.workflows.triggering') : $t('views.workflows.triggerButton') }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog v-model:open="isDetailsDialogOpen">
      <DialogContent class="flex flex-col w-[min(96vw,72rem)] sm:max-w-[72rem] max-h-[92vh] p-0 gap-0 overflow-hidden">
        <DialogHeader class="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle>{{ $t('views.workflows.detailsTitle', { id: selectedDetailedWorkflow?.id }) }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <div v-if="loadingDetails" class="flex items-center justify-center py-16">
            <Loader2 class="h-8 w-8 animate-spin text-primary" />
          </div>

          <template v-else-if="selectedDetailedWorkflow">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="font-bold text-muted-foreground block">Status</span>
              <div class="flex items-center gap-2 mt-1">
                <Badge :variant="getStatusVariant(selectedDetailedWorkflow?.status || '')">
                  {{ selectedDetailedWorkflow?.status }}
                </Badge>
                <span v-if="isSelectedWorkflowActive && runningDuration" class="text-xs text-muted-foreground font-mono">
                  (Running since {{ runningDuration }})
                </span>
              </div>
            </div>
            <div>
              <span class="font-bold text-muted-foreground block">Current Step</span>
              <span class="font-semibold capitalize">
                {{ selectedDetailedWorkflow?.step?.replace('_', ' ') }}
              </span>
            </div>
            <div>
              <span class="font-bold text-muted-foreground block">Created At</span>
              <span class="text-xs text-muted-foreground">
                {{ selectedDetailedWorkflow?.created_at ? new Date(selectedDetailedWorkflow.created_at).toLocaleString() : '' }}
              </span>
            </div>
            <div>
              <span class="font-bold text-muted-foreground block">Duration</span>
              <span class="font-semibold">
                {{ formatDuration(selectedDetailedWorkflow?.created_at || '', isSelectedWorkflowActive ? undefined : selectedDetailedWorkflow?.updated_at) }}
              </span>
            </div>
            <div>
              <span class="font-bold text-muted-foreground block">Sub-tasks Count</span>
              <span class="font-semibold">
                {{ selectedDetailedWorkflow?.children_count ?? selectedDetailedWorkflow?.children?.length ?? 0 }}
              </span>
            </div>
          </div>

          <div class="border-t mt-6 pt-4">
            <h3 class="font-semibold text-sm mb-3 flex items-center gap-2">
              <AlertOctagon class="h-4 w-4 text-destructive" />
              {{ $t('views.workflows.exceptions') }}
            </h3>

            <div v-if="selectedDetailedWorkflow?.exceptions?.length > 0" class="space-y-4 min-h-[160px] max-h-[32vh] overflow-y-auto">
              <div v-for="(exc, i) in selectedDetailedWorkflow.exceptions" :key="i" class="p-3 border border-destructive/20 rounded-xl bg-destructive/5 text-xs space-y-2">
                <div class="font-bold text-destructive">{{ exc.class }}</div>
                <div class="font-medium text-foreground">{{ exc.message }}</div>
                <div class="text-muted-foreground">
                  File: <span class="font-mono text-muted-foreground">{{ exc.file }}</span> (line {{ exc.line }})
                </div>
                <pre class="bg-muted p-3 rounded text-[10px] max-w-full overflow-x-auto whitespace-pre-wrap break-all font-mono text-muted-foreground">{{ exc.trace }}</pre>
              </div>
            </div>

            <div v-else class="p-4 border rounded-xl bg-accent/5 text-center text-xs text-muted-foreground">
              {{ $t('views.workflows.noExceptions') }}
            </div>
          </div>

          <div class="border-t mt-6 pt-4">
            <h3 class="font-semibold text-sm mb-3 flex items-center gap-2">
              <Loader2 class="h-4 w-4 text-primary animate-spin" v-if="isSelectedWorkflowActive" />
              <CheckCircle class="h-4 w-4 text-secondary" v-else />
              {{ $t('views.workflows.logsTitle') }}
            </h3>

            <div v-if="selectedDetailedWorkflow?.logs?.length > 0" ref="logsContainer" class="p-4 border rounded-xl bg-card text-xs space-y-1.5 min-h-[280px] max-h-[38vh] overflow-y-auto font-mono text-muted-foreground">
              <div v-for="(log, i) in selectedDetailedWorkflow.logs" :key="i" class="leading-relaxed">
                {{ log }}
              </div>
              <div v-if="isSelectedWorkflowActive" class="flex items-center gap-2 mt-2 pt-1 border-t border-accent/20 text-primary">
                <Loader2 class="h-3 w-3 animate-spin" />
                <span class="italic text-[10px]">{{ $t('views.workflows.stillRunning') }}</span>
              </div>
            </div>

            <div v-else class="p-4 border rounded-xl bg-accent/5 text-center text-xs text-muted-foreground min-h-[280px] flex items-center justify-center">
              {{ $t('views.workflows.noLogs') }}
            </div>
          </div>
          </template>
        </div>

        <div v-if="selectedDetailedWorkflow && !loadingDetails" class="shrink-0 flex justify-between px-6 py-4 border-t bg-background">
          <div>
            <Button 
              v-if="isSelectedWorkflowActive" 
              variant="destructive" 
              size="sm" 
              :disabled="abortLoading" 
              @click="handleAbort(selectedDetailedWorkflow.id)"
            >
              <Loader2 v-if="abortLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ $t('views.workflows.abort') }}
            </Button>
          </div>
          <div class="flex gap-2">
            <Button type="button" variant="outline" size="sm" @click="isDetailsDialogOpen = false">
              {{ $t('views.workflows.close') }}
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              size="sm" 
              :disabled="deleteLoading" 
              @click="handleDelete(selectedDetailedWorkflow.id)"
            >
              <Loader2 v-if="deleteLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ $t('views.workflows.delete') }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
