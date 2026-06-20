// ---------------------------------------------------------------------------
// Event catalog for POST /api/integration/events — the single inbound hook the
// games platform uses to push player lifecycle + progression facts to the engine.
//
// These five values are the ONLY ones the backend accepts: event_type is
// validated against them (src/validations/integration.validation.ts) and any
// other value is rejected with 400.
//
// Every event shares the same envelope:
//   { event_id, event_type, external_id, origin?, email?, amount?, meta? }
//   - event_id    : unique & STABLE per fact -> the idempotency / dedupe key
//   - event_type  : one of the EVENT_TYPES below
//   - external_id : the platform's user id (string)
//   - origin      : defaults to the client's slug
//   - email       : only needed to LINK a player (USER_REGISTERED), optional after
//   - amount      : XP delta (XP_AWARDED) / deposit amount (DEPOSIT_MADE)
//   - meta        : free-form context
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
    drives: 'Account linking — maps (origin, external_id) → gamru player by email. Also fires the "Event: Registration" campaign trigger, delivering any matching welcome campaign to the player’s inbox.',
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
    type: 'DEPOSIT_MADE',
    category: 'Wallet',
    action: 'A player funds their wallet.',
    drives: 'Deposit segmentation — moves the player from the “no_deposit” to the “depositor” segment. Also fires the "Event: First Deposit" campaign trigger, delivering any matching deposit campaign to the player’s inbox.',
    fields: ['event_id', 'external_id', 'amount'],
    example: {
      event_id: 'DEPOSIT_MADE:P-1001:tx-55021',
      event_type: 'DEPOSIT_MADE',
      external_id: 'P-1001',
      amount: 100,
      meta: { method: 'card', currency: 'USD' },
    },
  },
  {
    type: 'XP_AWARDED',
    category: 'Progression',
    action: 'XP is granted directly (e.g. a manual or rule-based award).',
    drives: 'XP balance, then level & rank recompute against the configured ladder.',
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
    action: 'Reported when a player crosses a level threshold.',
    drives: 'Audit only — level is recomputed from XP, so this is recorded for history/notifications.',
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
    action: 'Reported when a player moves up a rank tier.',
    drives: 'Audit only — rank is recomputed from XP, so this is recorded for history/notifications.',
    fields: ['event_id', 'external_id', 'meta'],
    example: {
      event_id: 'RANK:P-1001:SILVER',
      event_type: 'RANK_UP',
      external_id: 'P-1001',
      meta: { from_rank: 'BRONZE', to_rank: 'SILVER' },
    },
  },
]

// The set of accepted event_type values, derived from the catalog.
export const EVENT_TYPES = EVENTS.map((e) => e.type)
