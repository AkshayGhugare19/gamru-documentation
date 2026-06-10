import { FLOWS } from './flows'

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
    section: 'Core flows',
    links: FLOWS.map((f) => ({ label: f.title, to: `/flows/${f.id}` })),
  },
  {
    section: 'API reference — Gamru engine',
    platform: 'gamru',
    links: [{ label: 'Overview', to: '/api/gamru' }],
  },
  {
    section: 'API reference — Games platform',
    platform: 'games',
    links: [{ label: 'Overview', to: '/api/games' }],
  },
]

export const TOP_NAV = [
  { label: 'Docs', to: '/' },
  { label: 'Integration Guide', to: '/integration' },
  { label: 'Gamru API', to: '/api/gamru' },
  { label: 'Games API', to: '/api/games' },
]
