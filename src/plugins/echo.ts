import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { useAuthStore } from '@/stores/auth'

let echoInstance: Echo<any> | null = null

export function getEcho(): Echo<any> {
  if (echoInstance) {
    return echoInstance
  }

  const authStore = useAuthStore()

  const host = import.meta.env.VITE_REVERB_HOST || window.location.hostname
  const key = import.meta.env.VITE_REVERB_APP_KEY || 'IUYGFDftyujnbvRE4578765434567UJnbvcftyui45678'
  const scheme = import.meta.env.VITE_REVERB_SCHEME || (window.location.protocol === 'https:' ? 'https' : 'http')
  const port = import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : (scheme === 'https' ? 443 : 8080)
  
  const apiBaseUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.host}`
  const authEndpoint = `${apiBaseUrl.replace(/\/$/, '')}/v1/broadcasting/auth`

  const PusherConstructor = (Pusher as any).Pusher || (Pusher as any).default || Pusher

  const client = new PusherConstructor(key, {
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    cluster: 'mt1',
    channelAuthorization: {
      endpoint: authEndpoint,
      transport: 'ajax',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
    },
  })

  echoInstance = new Echo({
    broadcaster: 'pusher',
    client: client,
  })

  return echoInstance
}
