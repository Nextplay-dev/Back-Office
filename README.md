# Nextplay Back-Office

Administrative dashboard and operations interface for the Nextplay platform.

The back-office allows venue managers and platform administrators to manage venues, sports resources, tournament scheduling, durable ingestion workflows, bug reports, and user access.

---

## Architecture & Design

The application is built as a single-page app (SPA) structured around domain-driven views, Pinia stores, and real-time event subscriptions:

- **State Management**: Centralized domain stores (`src/stores`) using Pinia with typed states, actions, and persistence layers.
- **Real-Time Integration**: Live event broadcasting integration via Laravel Echo and Laravel Reverb (`pusher-js`) to keep calendars and status boards up to date.
- **UI Components & Styling**: Built on Tailwind CSS v4, Reka UI (headless primitives), and Lucide icons for an accessible design system.
- **Form Handling & Validation**: Typed form schemas using Vee-Validate and Zod.
- **Data Tables & Calendars**: Complex administrative grids powered by TanStack Table v8 and custom resource scheduler views.
- **Internationalization**: Full multi-language support (English / French) via `vue-i18n`.

---

## Technical Highlights

- **Framework**: Vue 3 (`<script setup>`, Composition API)
- **Language**: TypeScript 6
- **Tooling & Bundler**: Vite 8 with `vue-tsc` for strict type checking
- **Design System**: Tailwind CSS 4, Reka UI primitives
- **Realtime**: Laravel Echo with Reverb client
- **Mapping**: Leaflet for geographical venue positioning

---

## Project Structure

```
src/
├── assets/          # Static branding, images, and base styling
├── components/      # Reusable UI widgets and atomic components
│   └── ui/          # Reka UI and custom accessible primitives
├── i18n/            # Localization dictionaries (en, fr)
├── lib/             # Utility helpers and formatters
├── models/          # TypeScript domain models and API contracts
├── plugins/         # Axios instance, Echo real-time client, toast plugins
├── router/          # Vue Router configurations and navigation guards
├── stores/          # Pinia stores (auth, venues, bookings, tournaments, workflows)
└── views/           # Administrative screen pages and dashboards
```

---

## Getting Started

### Requirements

- Node.js 20+
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Nextplay-dev/Back-Office.git
   cd Back-Office
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Configure your backend API target and Reverb keys in `.env`:
   ```ini
   VITE_API_URL=http://localhost:8000
   VITE_REVERB_APP_KEY=your-reverb-app-key
   VITE_REVERB_HOST=localhost
   VITE_REVERB_PORT=8080
   VITE_REVERB_SCHEME=http
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## Testing & Quality

```bash
# Type-check and production build
npm run build
```

---

## License

Proprietary - All rights reserved
