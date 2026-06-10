import { FLOWS } from './flows'
import { GUIDES } from './guides'

// Sidebar structure. Each link is { label, to }. `to` matches react-router paths.
export const NAV = [
  {
    section: 'Getting started',
    links: [
      { label: 'Introduction', to: '/' },
      { label: 'Architecture', to: '/architecture' },
      { label: 'Authentication & security', to: '/auth' },
      { label: 'Integration guide', to: '/integration' },
    ],
  },
  {
    section: 'Use Gamru Service',
    links: [
      { label: 'How to use Gamru', to: '/use-gamru-service' },
      { label: 'API reference — by capability', to: '/gamru-service-api' },
    ],
  },
  {
    section: 'Guides — use Gamru in your app',
    links: [
      { label: 'All guides', to: '/guides' },
      ...GUIDES.map((g) => ({ label: g.title, to: `/guides/${g.id}` })),
    ],
  },
  {
    section: 'Core flows',
    links: FLOWS.map((f) => ({ label: f.title, to: `/flows/${f.id}` })),
  },
  {
    section: 'API reference — Gamru engine',
    platform: 'gamru',
    links: [{ label: 'Overview', to: '/api/gamru' }],
  },
]

export const TOP_NAV = [
  { label: 'Docs', to: '/' },
  { label: 'Use Gamru Service', to: '/use-gamru-service' },
  { label: 'Gamru API', to: '/gamru-service-api' },
  { label: 'Endpoint detail', to: '/api/gamru' },
]
