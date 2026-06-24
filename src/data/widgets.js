// ---------------------------------------------------------------------------
// Widgets — embeddable iframe gamification UI.
//
// Gamru ships every feature as a drop-in widget you embed on ANY website with
// one line of HTML. No API plumbing on the page: the widget is a self-sizing
// iframe served by gamru at /widget/<type>, gated by GET /api/widget/validate
// and fed by the existing player snapshot (POST /players/by-email).
//
// Two audiences:
//   USER  — a developer embeds widgets on the frontend (this file's FRONTEND
//           content): the loader script, the <div class="gamification_widget">
//           tag, per-widget config attributes and the full type catalog.
//   ADMIN — an operator creates / updates widgets in gamru (Settings → Widget /
//           iFrame Setup): pick a client + type, set status / expiry / allowed
//           domains, style the look in the live-preview editor, copy the snippet.
//
// Every snippet, attribute and field below is the real one — pulled from
// public/embed.js, pages/widget/WidgetView.tsx and the widget_configurations
// model + validation.
// ---------------------------------------------------------------------------

// -- the embeddable widget catalog -------------------------------------------
// PAGE widgets (the 9 managed in the admin CRUD) render a full feature block.
// INLINE widgets are compact "data" chips that shrink-wrap their content.

export const PAGE_WIDGETS = [
  {
    type: 'mission',
    label: 'Mission',
    icon: 'Target',
    desc: 'The mission catalog as image-led cards — duration, VIP and status badges, reward chips, and a rich detail panel with the mission’s games grid. Read-only (the player joins/claims in your own UI).',
  },
  {
    type: 'tournament',
    label: 'Tournament',
    icon: 'Trophy',
    desc: 'Active tournaments with their state and prizes. Tap one for the standings and rules.',
  },
  {
    type: 'reward-shop',
    label: 'Reward Shop',
    icon: 'Coins',
    desc: 'The token-spend catalog with prices and stock. The player can buy an item straight from the iframe (charges tokens atomically).',
  },
  {
    type: 'rewards',
    label: 'Rewards',
    icon: 'Gift',
    desc: 'The player’s rewards with status. Pending rewards can be claimed in-place from inside the widget.',
  },
  {
    type: 'campaign',
    label: 'Campaign',
    icon: 'Megaphone',
    desc: 'Recent CRM activity for the player, surfaced from the gamification logs.',
  },
  {
    type: 'rankings',
    label: 'Rankings',
    icon: 'BarChart3',
    desc: 'The rank ladder and where the player currently sits on it.',
  },
  {
    type: 'profile',
    label: 'User Profile',
    icon: 'User',
    desc: 'A profile card: avatar, level, rank, XP and token balance in one panel.',
  },
  {
    type: 'status',
    label: 'User Status',
    icon: 'Activity',
    desc: 'A compact status strip — current level, rank and progress to the next tier.',
  },
  {
    type: 'progress',
    label: 'Progress',
    icon: 'TrendingUp',
    desc: 'The XP progress bar with the amount of XP remaining to the next rank.',
  },
]

export const INLINE_WIDGETS = [
  {
    type: 'points',
    label: 'Points (Level / Rank / Tokens + XP)',
    icon: 'Sparkles',
    desc: 'The compact Level · Rank · Tokens card with an XP progress bar — the all-in-one stats widget.',
  },
  {
    type: 'avatar',
    label: 'Avatar',
    icon: 'CircleUser',
    desc: 'The player’s avatar inside a conic-gradient progress ring, with an optional level badge. Sizes: small / medium / large.',
  },
  {
    type: 'tokens',
    label: 'Tokens',
    icon: 'Coins',
    desc: 'A single inline chip showing the player’s current token balance.',
  },
  {
    type: 'badge-level',
    label: 'Level Badge',
    icon: 'Shield',
    desc: 'Just the level badge — a tiny inline element you can drop next to a username.',
  },
]

// -- plain-English quick start (4 steps) -------------------------------------
// Beginner-friendly: no jargon. Each step has one short job + one code line.

export const QUICK_START = [
  {
    title: 'Get your two details',
    plain:
      'Ask your Gamru admin for your Auth Key (it looks like ck_live_…). You also need the email of the person who is logged in on your site. That is everything you need — no coding setup, no install.',
    note: 'Auth Key = who you are. Email = whose stats to show.',
  },
  {
    title: 'Add the script — one time per page',
    plain:
      'Paste this near the bottom of your page, just before </body>. Put your Auth Key and the logged-in user’s email inside it. Do this only once, even if you show many widgets.',
    code: `<script
  src="https://gamru-frontend.netlify.app/embed.js"
  data-auth-key="ck_live_9f2c..."
  data-email="player@example.com">
</script>`,
    codeLabel: 'paste once, before </body>',
  },
  {
    title: 'Place a widget where you want it',
    plain:
      'Wherever something should appear (profile,points, missions, rewards…), paste this one line. Pick what to show by changing data-type. Want three things? Paste it three times with different types.',
    code: `<div class="gamification_widget" data-type="profile"></div>`,

    codeLabel: 'paste anywhere a widget should show',
  },
  {
    title: 'Refresh and you’re done',
    plain:
      'Reload the page. The widget appears on its own, sized to fit, showing live data. It refreshes by itself — you never call an API or store anything. To add more, repeat step 3 with another data-type.',
    note: 'See the full list of data-type values further down this page.',
  },
]

// The complete, copy-this-whole-thing example for the quick start.
export const FULL_EXAMPLE = `<!-- 1) Show the player's points and their missions -->
<div class="gamification_widget" data-type="profile"></div>
<div class="gamification_widget" data-type="points"></div>
<div class="gamification_widget" data-type="mission"></div>
<div class="gamification_widget" data-type="mission-bundle"></div>
<div class="gamification_widget" data-type="tournament"></div>
<div class="gamification_widget" data-type="reward-shop"></div>
<div class="gamification_widget" data-type="rewards"></div>
<div class="gamification_widget" data-type="campaign"></div>
<div class="gamification_widget" data-type="rankings"></div>
<div class="gamification_widget" data-type="status"></div>
<div class="gamification_widget" data-type="progress"></div>
<div class="gamification_widget" data-type="points"></div>
<div class="gamification_widget" data-type="mission"></div>

<!-- 2) Add the loader once, near the end of the page -->
<script
  src="https://gamru-frontend.netlify.app/embed.js"
  data-auth-key="ck_live_9f2c..."
  data-email="player@example.com">
</script>`

// Every widget in one list, plus a lookup by its data-type value.
export const ALL_WIDGETS = [...PAGE_WIDGETS, ...INLINE_WIDGETS]
export const widgetByType = (type) => ALL_WIDGETS.find((w) => w.type === type)

// -- code snippets (the real embed contract) ---------------------------------

export const SCRIPT_EMBED = `<!-- 1. Drop a widget anywhere a feature should appear -->
<div class="gamification_widget" data-type="profile"></div>
<div class="gamification_widget" data-type="points"></div>
<div class="gamification_widget" data-type="mission"></div>
<div class="gamification_widget" data-type="mission-bundle"></div>
<div class="gamification_widget" data-type="tournament"></div>
<div class="gamification_widget" data-type="reward-shop"></div>
<div class="gamification_widget" data-type="rewards"></div>
<div class="gamification_widget" data-type="campaign"></div>
<div class="gamification_widget" data-type="rankings"></div>
<div class="gamification_widget" data-type="status"></div>
<div class="gamification_widget" data-type="progress"></div>
<div class="gamification_widget" data-type="points"></div>
<div class="gamification_widget" data-type="mission"></div>

<!-- 2. Include the loader ONCE per page (usually before </body>) -->
<script
  src="https://gamru-frontend.netlify.app/embed.js"
  data-client-id="lucky-casino"
  data-auth-key="ck_live_9f2c..."
  data-email="player@example.com">
</script>`

export const IFRAME_EMBED = `<!-- No script? Embed a single widget as a raw iframe.
     embed=1 renders it bare (transparent, no chrome). -->

Profile:

<iframe
  src="https://gamru-frontend.netlify.app/widget/profile?clientId=lucky-casino&authKey=ck_live_9f2c...&email=player@example.com&embed=1"
  width="100%"
  height="800"
  frameborder="0">
</iframe>

mission:

<iframe
  src="https://gamru-frontend.netlify.app/widget/mission?clientId=lucky-casino&authKey=ck_live_9f2c...&email=player@example.com&embed=1"
  width="100%"
  height="800"
  frameborder="0">
</iframe>

mission-bundle:

<iframe
  src="https://gamru-frontend.netlify.app/widget/mission-bundle?clientId=lucky-casino&authKey=ck_live_9f2c...&email=player@example.com&embed=1"
  width="100%"
  height="800"
  frameborder="0">
</iframe>

tournament:

<iframe
  src="https://gamru-frontend.netlify.app/widget/tournament?clientId=lucky-casino&authKey=ck_live_9f2c...&email=player@example.com&embed=1"
  width="100%"
  height="800"
  frameborder="0">
</iframe>

reward-shop:

<iframe
  src="https://gamru-frontend.netlify.app/widget/reward-shop?clientId=lucky-casino&authKey=ck_live_9f2c...&email=player@example.com&embed=1"
  width="100%"
  height="800"
  frameborder="0">
</iframe>

rewards:

<iframe
  src="https://gamru-frontend.netlify.app/widget/rewards?clientId=lucky-casino&authKey=ck_live_9f2c...&email=player@example.com&embed=1"
  width="100%"
  height="800"
  frameborder="0">
</iframe>

campaign:

<iframe
  src="https://gamru-frontend.netlify.app/widget/campaign?clientId=lucky-casino&authKey=ck_live_9f2c...&email=player@example.com&embed=1"
  width="100%"
  height="800"
  frameborder="0">
</iframe>

rankings:

<iframe
  src="https://gamru-frontend.netlify.app/widget/rankings?clientId=lucky-casino&authKey=ck_live_9f2c...&email=player@example.com&embed=1"
  width="100%"
  height="800"
  frameborder="0">
</iframe>

status:

<iframe
  src="https://gamru-frontend.netlify.app/widget/status?clientId=lucky-casino&authKey=ck_live_9f2c...&email=player@example.com&embed=1"
  width="100%"
  height="800"
  frameborder="0">
</iframe>

progress:

<iframe
  src="https://gamru-frontend.netlify.app/widget/progress?clientId=lucky-casino&authKey=ck_live_9f2c...&email=player@example.com&embed=1"
  width="100%"
  height="800"
  frameborder="0">
</iframe>
`

export const REACT_EMBED = `// In a SPA, load embed.js once, then re-scan after a route/render adds widgets.
import { useEffect } from 'react'

export function GamificationWidget({ type }) {
  useEffect(() => {
    // The loader exposes a manual hook for client-rendered pages.
    window.GamruWidgets?.scan()
  }, [type])
  return <div className="gamification_widget" data-type={type} />
}

// Include the loader once in index.html:
// <script src="https://gamru-frontend.netlify.app/embed.js"
//   data-client-id="lucky-casino" data-auth-key="ck_live_9f2c..."
//   data-email="player@example.com"></script>`

export const WIDGET_ENV = `# Frontend .env — these power the "Widgets" tab / SDK on your platform.
VITE_GAMRU_WIDGET_BASE=https://gamru-frontend.netlify.app   # serves /widget/<type> and /embed.js
VITE_GAMRU_API_BASE=https://gamru-backend-2.onrender.com/api # gamru backend (widget list / validate)
VITE_GAMRU_WIDGET_AUTH_KEY=ck_live_9f2c...   # your client auth_key (same value as the backend key)
VITE_GAMRU_CLIENT_ID=lucky-casino            # optional — slug / skin_id / id of your client`

export const LIST_FETCH = `// "Create-driven" embedding: render only the widgets the operator turned on.
// GET /api/widget/list returns the client's ACTIVE widget configs.
const base = import.meta.env.VITE_GAMRU_API_BASE
const authKey = import.meta.env.VITE_GAMRU_WIDGET_AUTH_KEY
const clientId = import.meta.env.VITE_GAMRU_CLIENT_ID

const res = await fetch(\`\${base}/widget/list?clientId=\${clientId}&authKey=\${authKey}\`)
const { data } = await res.json()
// data -> [{ id, type, name, appearance }, ...]  — render one <div> per row:
// data.map(w => <div className="gamification_widget" data-type={w.type} />)`

// -- per-script & per-element attributes -------------------------------------

export const SCRIPT_ATTRS = [
  { name: 'data-client-id', type: 'string', required: false, desc: 'Your client slug / skin_id / id (optional — the auth key alone identifies you).' },
  { name: 'data-auth-key', type: 'string', required: true, desc: 'Your client auth_key (same value as GAMRU_CLIENT_AUTH_KEY). Required.' },
  { name: 'data-email', type: 'string', required: true, desc: 'The signed-in player’s email — selects whose stats the widgets show.' },
  { name: 'data-base', type: 'string', required: false, desc: 'Override the origin serving /widget and /embed.js. Defaults to the script’s own origin.' },
]

export const ELEMENT_ATTRS = [
  { name: 'data-type', type: 'string', required: true, desc: 'Which widget to render (see the catalog) — e.g. mission, points, avatar.' },
  { name: 'data-gamification-type', type: 'string', required: false, desc: 'For the gamification-data widget: rank | level | token | xp.' },
  { name: 'data-size', type: 'string', required: false, desc: 'Inline size preset (avatar / badge): small | medium | large.' },
  { name: 'data-show-level', type: 'boolean', required: false, desc: 'avatar widget — overlay the level badge on the ring.' },
  { name: 'data-progress-type', type: 'string', required: false, desc: 'Which progress metric the progress widget bars.' },
  { name: 'data-text-color', type: 'string', required: false, desc: 'Override the text colour for an inline widget.' },
  { name: 'data-reverse', type: 'boolean', required: false, desc: 'Flip the layout direction of an inline widget.' },
]

// -- admin: widget configuration record --------------------------------------

export const CONFIG_FIELDS = [
  { name: 'client_id', type: 'uuid', required: true, desc: 'Which client (casino / skin) the widget belongs to.' },
  { name: 'name', type: 'string', required: true, desc: 'A label for the operator — 2–120 chars.' },
  { name: 'type', type: 'enum', required: true, desc: 'One of the 13 widget types (9 page + 4 inline).' },
  { name: 'status', type: "'ACTIVE' | 'INACTIVE'", required: false, desc: 'INACTIVE widgets fail validation with “Widget inactive”. Default ACTIVE.' },
  { name: 'expiry_date', type: 'ISO date | null', required: false, desc: 'After this date the widget returns “Widget expired”.' },
  { name: 'allowed_domains', type: 'string[] | null', required: false, desc: 'Whitelist of sites allowed to embed it. Empty = any domain.' },
  { name: 'appearance', type: 'object | null', required: false, desc: 'Full look-and-feel (theme, colours, layout, size) — see below.' },
]

export const APPEARANCE_GROUPS = [
  {
    title: 'Theme & colour',
    fields: ['theme (dark / light)', 'accent_color', 'bg_color', 'bg_image', 'surface_color', 'text_color', 'muted_color', 'border_color'],
  },
  {
    title: 'Layout & size',
    fields: ['radius', 'font_size', 'spacing', 'layout (comfortable / compact)', 'padding', 'margin', 'align (left / center / right)', 'max_width', 'width', 'min_height', 'full_width'],
  },
  {
    title: 'Inline presets & responsive',
    fields: ['size (small / medium / large)', 'mobile.font_size', 'mobile.spacing'],
  },
]

// -- the admin create/update walkthrough -------------------------------------

export const ADMIN_STEPS = [
  {
    title: 'Open Widget / iFrame Setup',
    body: 'In the gamru console go to Settings → Widget / iFrame Setup. You see the list of widgets already created for your clients, each with its type, status and a one-click copy of its embed snippet. Hit “Create” to add a new one.',
  },
  {
    title: 'Pick a client and a widget type',
    body: 'Choose which client (casino / skin) the widget belongs to and which feature it renders — one of the 9 page widgets (Mission, Tournament, Reward Shop, Rewards, Campaign, Rankings, User Profile, User Status, Progress) or the 4 inline data widgets (Points, Avatar, Tokens, Level Badge). Give it a name so you can find it later.',
  },
  {
    title: 'Set access: status, expiry & allowed domains',
    body: 'Status ACTIVE/INACTIVE flips the widget on or off instantly. Optionally set an expiry date, and list the domains allowed to embed it. When a config exists for a (client, type) pair, GET /api/widget/validate enforces all three — INACTIVE → “Widget inactive”, past expiry → “Widget expired”, off-list domain → “Domain Not Allowed”.',
  },
  {
    title: 'Style it in the live-preview editor',
    body: 'The editor is a full page: a form on the left (Basics · Theme & colours · Layout & size) and a sticky live preview on the right with a desktop / mobile toggle. Everything is token-driven, so theme, accent, background image, radius, spacing, alignment, width and per-breakpoint overrides update the preview as you type. The preview renders your real catalog (missions, shop items, ranks), not dummy data.',
  },
  {
    title: 'Copy the snippet and ship',
    body: 'Save, then copy either the drop-in <script> + <div class="gamification_widget"> snippet or the raw <iframe> snippet. Paste it onto any site, swap in the player’s email, and the widget renders with the look you configured. Edit anytime; toggle status or delete to retire it.',
  },
]

// -- validation error reference ----------------------------------------------

export const VALIDATION_ERRORS = [
  { msg: 'Unauthorized', when: 'No auth key supplied (neither ?authKey= nor x-client-auth-key).' },
  { msg: 'Invalid Auth Key', when: 'The auth key doesn’t match any client.' },
  { msg: 'Invalid Client', when: 'A clientId was passed but doesn’t match the key’s client.' },
  { msg: 'Widget inactive', when: 'A config exists for (client, type) but its status is INACTIVE.' },
  { msg: 'Widget expired', when: 'The config’s expiry_date is in the past.' },
  { msg: 'Domain Not Allowed', when: 'The embedding site isn’t in allowed_domains.' },
  { msg: 'Unknown widget type: …', when: 'The data-type isn’t one of the renderable widget types.' },
]
