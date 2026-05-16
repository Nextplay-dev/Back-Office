<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { Users } from 'lucide-vue-next'

interface Props {
  days: dayjs.Dayjs[]
  bookings: any[]
  startHour?: number
  endHour?: number
  hourHeight?: number
  scrollToCurrentHour?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  startHour: 0,
  endHour: 24,
  hourHeight: 60,
  scrollToCurrentHour: false
})

const scrollContainer = ref<HTMLElement | null>(null)

const hourRange = computed(() => {
  const range = []
  for (let i = props.startHour; i < props.endHour; i++) {
    range.push(i)
  }
  return range
})

function getBookingsForDay(day: dayjs.Dayjs) {
  return props.bookings.filter(b => dayjs(b.start_at).isSame(day, 'day'))
}

function getBookingStyle(booking: any) {
  const start = dayjs(booking.start_at)
  const end = dayjs(booking.end_at)

  const startHour = start.hour()
  const startMinute = start.minute()
  const durationMinutes = end.diff(start, 'minute')

  const topOffset = ((startHour - props.startHour) * 60 + startMinute) * (props.hourHeight / 60)
  const height = durationMinutes * (props.hourHeight / 60)

  return {
    top: `${topOffset}px`,
    height: `${height}px`,
  }
}

function getCurrentTimeStyle() {
  const now = dayjs()
  const hour = now.hour()
  const minute = now.minute()

  if (hour < props.startHour || hour >= props.endHour) return { display: 'none' }

  const topOffset = ((hour - props.startHour) * 60 + minute) * (props.hourHeight / 60)
  return { top: `${topOffset}px` }
}

onMounted(() => {
  if (props.scrollToCurrentHour && scrollContainer.value) {
    const now = dayjs()
    const hour = now.hour()
    if (hour >= props.startHour && hour < props.endHour) {
      const topOffset = (hour - props.startHour) * props.hourHeight
      scrollContainer.value.scrollTop = topOffset - 100
    }
  }
})
</script>

<template>
  <div class="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
    <div class="flex border-b bg-muted/30">
      <div class="w-16 flex-shrink-0" />
      <div v-for="day in days" :key="day.toString()"
        class="flex-1 p-3 text-center text-[10px] font-bold uppercase text-muted-foreground border-l first:border-l-0">
        {{ day.format('ddd') }} {{ day.format('DD') }}
      </div>
    </div>

    <div class="flex-1 overflow-y-auto relative" ref="scrollContainer">
      <div class="flex min-w-full" :style="{ height: `${hourRange.length * hourHeight}px` }">
        <div class="w-16 flex-shrink-0 relative border-r bg-muted/5">
          <div v-for="hour in hourRange" :key="hour"
            class="absolute w-full pr-2 text-right text-[10px] text-muted-foreground font-mono"
            :style="{ top: `${(hour - startHour) * hourHeight - 6}px` }">
            {{ String(hour).padStart(2, '0') }}:00
          </div>
        </div>

        <div v-for="day in days" :key="day.toString()" class="flex-1 relative border-l first:border-l-0">
          <div v-for="hour in hourRange" :key="hour" class="absolute left-0 right-0 border-b border-muted/30"
            :style="{ top: `${(hour - startHour) * hourHeight}px`, height: `${hourHeight}px` }" />

          <div v-for="booking in getBookingsForDay(day)" :key="booking.id"
            class="absolute left-1 right-1 p-2 rounded-lg shadow-sm z-10 overflow-hidden group hover:z-20 transition-all cursor-pointer"
            :class="!booking.color ? 'bg-app-primary/10 text-app-primary border-l-4 border-app-primary' : 'border-l-4'"
            :style="[getBookingStyle(booking), booking.color ? { borderLeftColor: booking.color, backgroundColor: booking.color + '1A', color: booking.color } : {}]" @click="$emit('booking-click', booking)">
            <slot name="booking" :booking="booking">
              <div class="flex justify-between items-start">
                <span class="text-[9px] font-bold leading-none">{{ dayjs(booking.start_at).format('HH:mm') }} - {{
                  dayjs(booking.end_at).format('HH:mm') }}</span>
              </div>
              <p class="text-[10px] font-bold truncate mt-1">{{ booking.activity?.name || 'Booking' }}</p>
              <div
                class="flex items-center gap-1 text-[8px] text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity">
                <Users class="w-2 h-2" />
                <span>{{ booking.user?.name || 'Private Session' }}</span>
              </div>
            </slot>
          </div>

          <div v-if="day.isSame(dayjs(), 'day')"
            class="absolute left-0 right-0 border-t-2 border-red-400 z-30 pointer-events-none"
            :style="getCurrentTimeStyle()">
            <div class="absolute -left-1 -top-1 w-2 h-2 bg-red-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex-1 {
  flex: 1 1 0%;
}
</style>
