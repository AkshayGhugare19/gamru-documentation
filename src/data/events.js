// ---------------------------------------------------------------------------
// Event catalog for POST /api/integration/events — the single inbound hook the
// games platform uses to push player lifecycle + gameplay facts to the engine.
//
// Every event shares the same envelope:
//   { event_id, event_type, external_id, origin?, email?, amount?, meta? }
//   - event_id    : unique & STABLE per fact -> the idempotency / dedupe key
//   - event_type  : one of the EVENT_TYPES below
//   - external_id : the platform's user id (string)
//   - origin      : defaults to the client's slug
//   - email       : only needed to LINK a player (USER_REGISTERED), optional after
//   - amount      : XP delta / deposit / wager / win amount (event-specific)
//   - meta        : free-form context (game_id, bet, category, …)
//
// Each entry below: { type, action, drives, fields, example }
//   fields  : the envelope keys that matter for this event
//   example : a complete, copy-pasteable request body
// ---------------------------------------------------------------------------

export const EVENTS = [
  {
    type: 'USER_REGISTERED',
    category: 'Lifecycle',
    action: 'A player creates an account on the casino.',
    drives: 'Account linking — maps (origin, external_id) → gamru player by email.',
    fields: ['event_id', 'external_id', 'email'],
    example: {
      event_id: 'REG:P-1001',
      event_type: 'USER_REGISTERED',
      external_id: 'P-1001',
      origin: 'lucky-casino',
      email: 'jane@lucky-casino.com',
    },
  },
  {
    type: 'LOGIN',
    category: 'Lifecycle',
    action: 'A player logs in (de-duplicated to once per day by event_id).',
    drives: 'Login missions, daily streaks, “last seen”.',
    fields: ['event_id', 'external_id'],
    example: {
      event_id: 'LOGIN:P-1001:2026-06-10',
      event_type: 'LOGIN',
      external_id: 'P-1001',
    },
  },
  {
    type: 'DEPOSIT_MADE',
    category: 'Wallet',
    action: 'A player funds their wallet.',
    drives: 'Moves the player from “no_deposit” → “depositor”, deposit missions.',
    fields: ['event_id', 'external_id', 'amount'],
    example: {
      event_id: 'DEP:P-1001:tx-55021',
      event_type: 'DEPOSIT_MADE',
      external_id: 'P-1001',
      amount: 100,
      meta: { method: 'card', currency: 'USD' },
    },
  },
  {
    type: 'WITHDRAWAL',
    category: 'Wallet',
    action: 'A player withdraws funds.',
    drives: 'Segmentation, lifecycle analytics.',
    fields: ['event_id', 'external_id', 'amount'],
    example: {
      event_id: 'WD:P-1001:tx-55190',
      event_type: 'WITHDRAWAL',
      external_id: 'P-1001',
      amount: 40,
      meta: { method: 'bank', currency: 'USD' },
    },
  },
  {
    type: 'WAGER',
    category: 'Gameplay',
    action: 'A player places a bet / plays a round (the workhorse event).',
    drives: 'XP award, wager missions, turnover, favourite-category personalization.',
    fields: ['event_id', 'external_id', 'amount', 'meta'],
    example: {
      event_id: 'WAGER:P-1001:r-88421',
      event_type: 'WAGER',
      external_id: 'P-1001',
      amount: 5,
      meta: { game_id: 'g-100', game_category: 'slots', provider: 'NetEnt', bet: 5 },
    },
  },
  {
    type: 'CASINO_WIN',
    category: 'Gameplay',
    action: 'A player wins a round.',
    drives: 'Win missions, big-win triggers, analytics.',
    fields: ['event_id', 'external_id', 'amount', 'meta'],
    example: {
      event_id: 'WIN:P-1001:r-88421',
      event_type: 'CASINO_WIN',
      external_id: 'P-1001',
      amount: 42.5,
      meta: { game_id: 'g-100', game_category: 'slots', multiplier: 8.5 },
    },
  },
  {
    type: 'XP_AWARDED',
    category: 'Progression',
    action: 'XP is granted directly (e.g. a manual or rule-based award).',
    drives: 'XP balance, level & rank recompute.',
    fields: ['event_id', 'external_id', 'amount'],
    example: {
      event_id: 'XP:P-1001:bonus-7',
      event_type: 'XP_AWARDED',
      external_id: 'P-1001',
      amount: 50,
      meta: { reason: 'daily_bonus' },
    },
  },
  {
    type: 'LEVEL_UP',
    category: 'Progression',
    action: 'Emitted when a player crosses a level threshold.',
    drives: 'Level-up rewards, celebratory UI, notifications.',
    fields: ['event_id', 'external_id', 'meta'],
    example: {
      event_id: 'LVL:P-1001:7',
      event_type: 'LEVEL_UP',
      external_id: 'P-1001',
      meta: { from_level: 6, to_level: 7 },
    },
  },
  {
    type: 'RANK_UP',
    category: 'Progression',
    action: 'Emitted when a player moves up a rank tier.',
    drives: 'Rank rewards, tier badges, notifications.',
    fields: ['event_id', 'external_id', 'meta'],
    example: {
      event_id: 'RANK:P-1001:SILVER',
      event_type: 'RANK_UP',
      external_id: 'P-1001',
      meta: { from_rank: 'BRONZE', to_rank: 'SILVER' },
    },
  },
  {
    type: 'KYC',
    category: 'Lifecycle',
    action: 'A player completes / updates KYC verification.',
    drives: 'Verified segment, compliance-gated rewards.',
    fields: ['event_id', 'external_id', 'meta'],
    example: {
      event_id: 'KYC:P-1001',
      event_type: 'KYC',
      external_id: 'P-1001',
      meta: { status: 'VERIFIED', level: 2 },
    },
  },
]

// The set of accepted event_type values, derived from the catalog.
export const EVENT_TYPES = EVENTS.map((e) => e.type)
