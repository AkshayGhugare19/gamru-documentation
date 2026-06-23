// ---------------------------------------------------------------------------
// End-to-end flows. Each flow tells one story across the games platform and the
// gamru engine. A flow has:
//   intro    : short plain-English framing
//   actors   : who participates
//   steps    : ordered [{ title, body, endpoints?: [endpointId] }]
//   sequence : compact call trace (array of "A -> B : message")
//   notes    : gotchas / guarantees
// ---------------------------------------------------------------------------

export const FLOWS = [
  {
    id: 'onboarding',
    title: 'Player onboarding & account linking',
    tag: 'Identity',
    intro:
      'A new player signs up on the casino. The platform mirrors them into gamru so every later XP/deposit/mission event can be attached to a single gamru player record. Linking is by email.',
    actors: ['Player', 'Games platform', 'Gamru engine'],
    steps: [
      {
        title: 'Player registers on the casino',
        body: 'The player submits the signup form. The games platform creates the local user row and issues access + refresh tokens.',
        endpoints: ['games-register', 'games-login'],
      },
      {
        title: 'Platform pushes USER_REGISTERED to gamru',
        body: 'Immediately after signup the platform fires a fire-and-forget event carrying the player email. gamru looks up (or links) a player by that email and stores an external_accounts mapping of (origin, external_id) → gamru player_id. If signup fails to reach gamru, nothing breaks — the link is re-established the next time an event arrives with the email.',
        endpoints: ['gamru-integration-events'],
      },
      {
        title: 'Every later event resolves through the link',
        body: 'Once linked, XP_AWARDED / DEPOSIT_MADE / WAGER events that arrive with only external_id are matched to the gamru player. An event for an unlinked player returns { applied:false, reason:"player_not_found" } and is safe to retry after the link exists.',
      },
    ],
    sequence: [
      'Player -> Games: POST /api/auth/register',
      'Games -> Games: create user, issue tokens',
      'Games -> Gamru: POST /api/integration/events (USER_REGISTERED, email)',
      'Gamru -> Gamru: link external_id -> player by email',
      'Gamru --> Games: { applied:true }',
    ],
    notes: [
      'event_id format is USER_REGISTERED:{userId} so a replay is deduped.',
      'Linking is idempotent — re-sending USER_REGISTERED never creates a duplicate player.',
    ],
  },

  {
    id: 'xp-leveling',
    title: 'XP, levels & ranks',
    tag: 'Progression',
    intro:
      'As the player plays, the casino awards XP and forwards it to gamru. gamru is the single source of truth for XP totals, level and rank — the casino never computes them itself.',
    actors: ['Player', 'Games platform', 'Gamru engine'],
    steps: [
      {
        title: 'Player plays a round',
        body: 'The client records the action. The platform writes a local activity_log and computes the XP for it, multiplying by any active booster the player owns.',
        endpoints: ['games-activity'],
      },
      {
        title: 'Platform forwards XP to gamru',
        body: 'The platform calls add-xp by email with the (boosted) amount and an optional game block (id, name, category, provider, turnover). The game block feeds the player’s casino personalization aggregate.',
        endpoints: ['gamru-players-add-xp'],
      },
      {
        title: 'gamru recomputes level & rank',
        body: 'gamru adds the XP, recomputes the level/rank from the ranks ladder, and auto-grants any per-level rewards configured on the ladder. It returns the fresh snapshot.',
        endpoints: ['gamru-gam-add'],
      },
      {
        title: 'Player sees updated progression',
        body: 'The profile screen reads the snapshot back from gamru (level, rank, % to next, XP ledger).',
        endpoints: ['games-profile', 'games-profile-xp'],
      },
    ],
    sequence: [
      'Player -> Games: POST /api/activity (GAME_PLAY, idempotencyKey)',
      'Games -> Games: log activity, xp = base × booster',
      'Games -> Gamru: POST /api/players/by-email/add-xp { email, amount, game }',
      'Gamru -> Gamru: add XP, recompute level/rank, grant level rewards',
      'Gamru --> Games: { xp_points, level, rank_name, xp_to_next }',
      'Player -> Games: GET /api/profile (renders progression)',
    ],
    notes: [
      'idempotencyKey on /api/activity prevents a double award if the client retries.',
      'gam_xp_transactions enforces unique (player_id, event_id) on the gamru side too.',
      'If gamru is unreachable the activity is still logged locally; XP syncs on the next successful call.',
    ],
  },

  {
    id: 'deposit-segmentation',
    title: 'Deposit → segmentation',
    tag: 'CRM',
    intro:
      'A deposit is more than money — it moves the player between CRM segments so marketing can target “first depositors”, churned depositors, etc.',
    actors: ['Player', 'Games platform', 'Gamru engine'],
    steps: [
      {
        title: 'Player deposits',
        body: 'The platform credits the wallet and updates deposit_count / total_deposit locally.',
        endpoints: ['games-wallet-deposit'],
      },
      {
        title: 'Platform fires DEPOSIT_MADE',
        body: 'A fire-and-forget event carries the amount and meta { deposit_count, balance_after }. event_id is DEPOSIT_MADE:{userId}:{uuid} so each deposit is unique.',
        endpoints: ['gamru-integration-events'],
      },
      {
        title: 'gamru re-tags and re-segments',
        body: 'gamru removes the “no_deposit” tag, adds “depositor”, records deposit metrics in transactional_data, and triggers an async segment recount so dynamic audiences update.',
        endpoints: ['gamru-segments-preview', 'gamru-segments-players'],
      },
      {
        title: 'Campaigns can now target the player',
        body: 'A campaign bound to the “Depositors” segment + a trigger will pick the player up on its next evaluation.',
        endpoints: ['gamru-campaigns-add'],
      },
    ],
    sequence: [
      'Player -> Games: POST /api/wallet/deposit { amount }',
      'Games -> Games: balance += amount; deposit_count++',
      'Games -> Gamru: POST /api/integration/events (DEPOSIT_MADE, amount, meta)',
      'Gamru -> Gamru: tag depositor, update transactional_data, recount segments',
      'Gamru --> Games: { applied:true }',
    ],
    notes: [
      'Deposit sync is best-effort: a sync failure never blocks the deposit.',
      'Dynamic segments resolve membership at evaluation time — the recount just keeps counts fresh.',
    ],
  },

  {
    id: 'missions',
    title: 'Missions — author, play, progress, claim',
    tag: 'Gamification',
    intro:
      'The flagship loop. An operator authors a mission in gamru; the player works toward it on the casino; gameplay events drive progress inside gamru; the player claims the reward. gamru owns the definition AND the progress.',
    actors: ['Operator', 'Player', 'Games platform', 'Gamru engine'],
    steps: [
      {
        title: 'Operator authors the mission',
        body: 'In the gamru console (Gamification → Missions) the operator sets the objective event (Wager / Win / Deposit / Login / KYC …), a measure (count or amount), a target, optional sub-conditions (game category, min bet) and the reward “chest”. Status ACTIVE makes it live. Stored in the missions table (JSONB data).',
        endpoints: ['gamru-gam-add', 'gamru-gam-paginate'],
      },
      {
        title: 'Player sees the mission',
        body: 'The casino lists missions for the player — the catalog comes from gamru’s player snapshot, merged with the player’s local participation status.',
        endpoints: ['games-missions-list'],
      },
      {
        title: 'Player joins (optional) and plays',
        body: 'The player opts in (one IN_PROGRESS per bucket) and starts playing. Each qualifying round emits a gameplay event.',
        endpoints: ['games-missions-join', 'games-activity'],
      },
      {
        title: 'Events drive progress in the engine',
        body: 'Each qualifying play is forwarded to gamru via the integration activity hook. The mission engine finds the player’s IN_PROGRESS missions whose objective matches the event (wager / bet_count / win / login), checks sub-conditions (min bet, game), and adds the delta to the player’s progress row. When the target is reached the mission becomes COMPLETED. The casino computes nothing — it just forwards the play and caches what gamru returns.',
        endpoints: ['games-activity', 'gamru-int-activity', 'gamru-int-missions-progress-post'],
      },
      {
        title: 'Player claims the chest',
        body: 'On a COMPLETED mission the player taps claim. The platform calls gamru’s integration claim, which applies the reward (XP via the rank engine, tokens, or records bonus_cash/free_spins), writes a player_rewards row + audit log, and flips the mission to CLAIMED.',
        endpoints: ['games-missions-claim', 'gamru-int-missions-claim'],
      },
    ],
    sequence: [
      'Operator -> Gamru: POST /api/gamification/missions/add (ACTIVE)',
      'Player -> Games: GET /api/missions (proxies GET /api/missions)',
      'Player -> Games: POST /api/missions/:id/join  ──▶  Gamru: POST /api/missions/:id/join',
      'Player -> Games: POST /api/activity (play)  ──▶  Gamru: POST /api/activity { email, stake, win, gameKey }',
      'Gamru -> Gamru: match mission, +delta to mission_participants, COMPLETED at target',
      'Player -> Games: POST /api/missions/:id/claim  ──▶  Gamru: POST /api/missions/:id/claim',
      'Gamru --> Games: { reward granted }  -> mission CLAIMED',
    ],
    notes: [
      'Mission state machine: IN_PROGRESS → COMPLETED → CLAIMED (LOCKED / EXPIRED reserved).',
      'Period reset is driven by the bundle periodicity: daily→date, weekly→ISO week, monthly→month, else lifetime.',
      'The casino UI auto-refreshes (~10s and on focus) and toasts on new completions so progress earned mid-play appears without a reload.',
    ],
  },

  {
    id: 'mission-bundles',
    title: 'Mission bundles (quests)',
    tag: 'Gamification',
    intro:
      'A bundle groups missions into a quest with a banner, a periodicity that controls reset, and an eligibility (all players or a segment). Bundle progress (e.g. 4/9) is derived from its missions.',
    actors: ['Operator', 'Player', 'Games platform', 'Gamru engine'],
    steps: [
      {
        title: 'Operator builds the bundle',
        body: 'In gamru (Gamification → Mission Bundles) the operator sets name + banners, periodicity (Daily/Weekly/Monthly/Lifetime), priority, dates, the member mission IDs, and eligibility (All Players or a Segment). Status ACTIVE publishes it.',
        endpoints: ['gamru-gam-add'],
      },
      {
        title: 'Player opens the Missions tab',
        body: 'The casino renders bundle cards (banner, periodicity badge, completed/total, a 🎁 pill when a chest is ready). Expanding a bundle shows the mission roadmap.',
        endpoints: ['games-bundles-list'],
      },
      {
        title: 'Player progresses missions in the bundle',
        body: 'Missions inside a bundle are an independent track (no per-bucket exclusivity). They progress from the same forwarded gameplay events as standalone missions — the play carries the bundleId so gamru advances that bundle’s track.',
        endpoints: ['games-activity', 'gamru-int-activity'],
      },
      {
        title: 'Player claims per-mission chests',
        body: 'Each completed mission in the bundle is claimed individually (the claim carries the bundleId); the bundle’s completed/total recomputes.',
        endpoints: ['games-bundles-claim', 'gamru-int-missions-claim'],
      },
    ],
    sequence: [
      'Operator -> Gamru: POST /api/gamification/mission-bundles/add (periodicity, missions[], eligibility)',
      'Player -> Games: GET /api/mission-bundles',
      'Player -> Games: POST /api/mission-bundles/:bundleId/missions/:missionId/claim',
      'Games -> Gamru: POST /api/missions/:missionId/claim { email, bundleId }',
    ],
    notes: [
      'Periodicity controls when the bundle’s missions reset for the player.',
      'Eligibility by segment reuses the CRM segment engine.',
    ],
  },

  {
    id: 'tournaments',
    title: 'Tournaments & leaderboards',
    tag: 'Competition',
    intro:
      'Operators run time-boxed tournaments in gamru. The casino submits player scores; gamru keeps the authoritative standings, settles the prize pool on end, and the player claims their prize into the reward ledger.',
    actors: ['Operator', 'Player', 'Games platform', 'Gamru engine'],
    steps: [
      {
        title: 'Operator creates the tournament',
        body: 'Created as a gamification item (feature tournaments) with industry, eligible games, a schedule and a prize pool.',
        endpoints: ['gamru-gam-add'],
      },
      {
        title: 'Player joins the race',
        body: 'The casino lists active tournaments from gamru and shows state (SCHEDULED / IN_PROGRESS / ENDED). Scoring auto-registers, or the player can explicitly join.',
        endpoints: ['games-tournaments-list', 'gamru-int-tournaments-list', 'gamru-int-tournaments-join'],
      },
      {
        title: 'Platform submits scores',
        body: 'As the player earns points the casino posts them to gamru’s integration score endpoint; gamru accumulates the running score and re-ranks. Plays of games not in the tournament are ignored.',
        endpoints: ['games-tournaments-score', 'gamru-int-tournaments-score'],
      },
      {
        title: 'Standings, settlement & claim',
        body: 'gamru ranks participants (score DESC). When the tournament ends it settles the prize pool to the top-3 (50 / 30 / 20) and marks them eligible. The player then CLAIMS — gamru grants the prize into their reward ledger (consistent with mission rewards) and marks the standing CLAIMED.',
        endpoints: ['gamru-int-tournaments-leaderboard', 'gamru-int-tournaments-progress', 'gamru-int-tournaments-claim'],
      },
    ],
    sequence: [
      'Operator -> Gamru: POST /api/gamification/tournaments/add (prize_pool)',
      'Player -> Games: GET /api/tournaments  ──▶  Gamru: GET /api/tournaments',
      'Player -> Games: POST /api/tournaments/:id/score { points }  ──▶  Gamru: POST /api/tournaments/:id/score',
      'Gamru -> Gamru: accumulate score + re-rank; on end settle top-3 (50/30/20)',
      'Player -> Games: POST /api/tournaments/:id/claim  ──▶  Gamru: POST /api/tournaments/:id/claim',
      'Gamru --> Games: { prize granted into reward ledger }  -> standing CLAIMED',
    ],
    notes: [
      'Scores accumulate per (email, tournamentId); gamru owns ranking and the prize split.',
      'Prizes are no longer paid to a local wallet — they land in the player’s gamru reward ledger and are claimed like any other reward.',
    ],
  },

  {
    id: 'rewards',
    title: 'Rewards & claiming',
    tag: 'Economy',
    intro:
      'gamru is the reward ledger of record. Rewards appear (from missions, levels, manual grants), the player claims them on the casino, and gamru applies and records them.',
    actors: ['Player', 'Games platform', 'Gamru engine'],
    steps: [
      {
        title: 'Reward is created',
        body: 'A reward lands in gamru from a mission completion, a level-up auto-grant, or an operator’s manual grant. Status starts IN_PROGRESS / GRANTED.',
        endpoints: ['gamru-players-rewards'],
      },
      {
        title: 'Player sees rewards & a pending badge',
        body: 'The casino lists rewards from gamru (local fallback only if the email doesn’t resolve) and shows an unclaimed badge count. Pending rewards also surface as virtual notifications.',
        endpoints: ['games-rewards-list', 'games-rewards-pending', 'games-notifications'],
      },
      {
        title: 'Player claims',
        body: 'The platform proxies the claim to gamru; gamru flips the reward to CLAIMED and writes the audit row. If gamru can’t resolve the player it falls back to a local claim.',
        endpoints: ['games-rewards-claim', 'gamru-players-reward-claim'],
      },
    ],
    sequence: [
      'Player -> Games: GET /api/rewards',
      'Games -> Gamru: POST /api/players/by-email (read gamification.rewards)',
      'Player -> Games: POST /api/rewards/:id/claim',
      'Games -> Gamru: POST /api/players/:id/rewards/:rewardId/claim',
      'Gamru --> Games: { status: CLAIMED }',
    ],
    notes: ['The local user_rewards table is only a fallback; gamru is authoritative whenever the player resolves.'],
  },

  {
    id: 'reward-shop',
    title: 'Reward shop & boosters',
    tag: 'Economy',
    intro:
      'Players spend tokens on products and boosters. The purchase is an atomic token charge in gamru; an XP booster then multiplies future XP on the casino.',
    actors: ['Player', 'Games platform', 'Gamru engine'],
    steps: [
      {
        title: 'Player browses the shop',
        body: 'The casino shows the token-spend catalog with affordability flags, sourced from gamru reward_shop.',
        endpoints: ['games-shop-products'],
      },
      {
        title: 'Player buys',
        body: 'The platform proxies the purchase to gamru, which deducts tokens and decrements stock atomically (deduction + stock + audit all-or-nothing). The local purchase mirror is best-effort.',
        endpoints: ['games-shop-buy', 'gamru-players-shop-purchase'],
      },
      {
        title: 'Booster takes effect',
        body: 'If the product is an XP booster it becomes active; the casino reads active boosters and multiplies XP on subsequent activity before forwarding to gamru.',
        endpoints: ['games-shop-boosters', 'games-activity'],
      },
    ],
    sequence: [
      'Player -> Games: GET /api/reward-shop/products',
      'Player -> Games: POST /api/reward-shop/buy { productId }',
      'Games -> Gamru: POST /api/players/:id/reward-shop/purchase (atomic)',
      'Gamru --> Games: { tokens_remaining, tokens_spent }',
      'Games -> Games: activate booster -> future XP × multiplier',
    ],
    notes: [
      'Token balance and stock are owned by gamru; the casino never decrements them locally.',
      'If the local history mirror fails the purchase still succeeds.',
    ],
  },

  {
    id: 'campaigns',
    title: 'CRM campaigns end-to-end',
    tag: 'CRM',
    intro:
      'The marketing side. An operator defines a segment, a template, a trigger and a frequency cap, then runs a campaign — all inside gamru. Player events from the casino feed the segments that campaigns target.',
    actors: ['Operator', 'Gamru engine', 'Player'],
    steps: [
      {
        title: 'Build the audience',
        body: 'Create a segment (STATIC or DYNAMIC) and preview its membership in the audience builder.',
        endpoints: ['gamru-segments-add', 'gamru-segments-preview'],
      },
      {
        title: 'Author the message',
        body: 'Create a channel template (EMAIL / SMS / ONSITE / WEBPUSH / INAPP) with subject + content and test recipients.',
        endpoints: ['gamru-templates-add'],
      },
      {
        title: 'Define trigger & guardrails',
        body: 'Create a custom trigger (builder rule tree) and a frequency cap so the channel can’t over-message.',
        endpoints: ['gamru-triggers-add', 'gamru-caps-add'],
      },
      {
        title: 'Launch & measure',
        body: 'Create the campaign binding segment + template + trigger, then track deliveries/opens/clicks and read campaign analytics.',
        endpoints: ['gamru-campaigns-add', 'gamru-analytics-track', 'gamru-analytics-campaigns'],
      },
    ],
    sequence: [
      'Operator -> Gamru: POST /api/segments/add  (+ preview)',
      'Operator -> Gamru: POST /api/templates/add',
      'Operator -> Gamru: POST /api/custom-triggers/add  + POST /api/frequency-caps/add',
      'Operator -> Gamru: POST /api/campaigns/add',
      'Gamru -> Gamru: evaluate trigger vs segment, respect caps, send',
      'Operator -> Gamru: GET /api/analytics/campaigns',
    ],
    notes: ['Unsubscribes are recorded via /api/unsubscribe-reports and suppress future sends.'],
  },

  {
    id: 'rank-level-bonuses',
    title: 'Rank & level bonuses',
    tag: 'Economy',
    intro:
      'Bonuses are DEFINED on the games platform (name, type, amount, and amount_type RM/BM) but TRIGGERED by GAMRU progression. An operator pins a bonus id onto a rank or a specific level; reaching that level (or completing every level in the rank) grants the bonus to the player, who claims it on the casino into a Real-Money / Bonus-Money wallet. GAMRU keeps a read-only mirror of both the bonus definitions and the claims so operators can see everything in one place.',
    actors: ['Operator', 'Player', 'Games platform', 'Gamru engine'],
    steps: [
      {
        title: 'Admin — define the bonus (games platform)',
        body: 'On the games platform an admin creates a bonus: bonusName, bonusType (e.g. BONUS_CASH), amount, amountType (RM = Real Money, BM = Bonus Money) and status. Each bonus gets a UUID to copy. (These definitions live on the games platform; GAMRU only mirrors them — see the last step.)',
      },
      {
        title: 'Admin — pin the bonus id on a rank/level (GAMRU)',
        body: 'In the GAMRU Ranks wizard the operator pastes bonus UUIDs: per-level via the level grid (data.levels[].bonus_ids) and/or rank-wide (data.bonus_ids). On save GAMRU fetches each pinned bonus definition from the games platform and snapshots it into the `bonuses` table (source = Games platform).',
        endpoints: ['gamru-gam-add', 'gamru-bonuses-list'],
      },
      {
        title: 'GAMRU delivers the pinned ids in the player payload',
        body: 'When the games platform reads a player (POST /players/by-email) GAMRU returns the rank ladder with each level’s bonus_ids and each rank’s bonus_ids. The games platform reconciles grants on every profile read — no GAMRU→games call is needed for granting.',
        endpoints: ['gamru-players-by-email'],
      },
      {
        title: 'Player — earn the bonus',
        body: 'A LEVEL bonus is granted as soon as the player reaches that level. A RANK bonus is granted only once the player has completed EVERY level in that rank (their current level reaches the rank’s top level). The grant is idempotent and surfaces as an IN_PROGRESS reward with a Claim button.',
      },
      {
        title: 'Player — claim into the RM/BM wallet',
        body: 'The player claims on the casino. An RM bonus credits real money, a BM bonus credits bonus money, and the total wallet balance is re-summed (balance = real_money + bonus_money). A second claim is rejected.',
      },
      {
        title: 'Claim is mirrored back to GAMRU',
        body: 'After a successful claim the games platform fire-and-forgets the claim to GAMRU, which records it in the `user_bonuses` ledger (user_id, source_type LEVEL/RANK, source_id, amount, amount_type, source) and refreshes the bonus snapshot. Operators view synced bonuses and claims in GAMRU → Gamification → Bonuses (two tabs, searchable, paginated).',
        endpoints: ['gamru-user-bonuses-record', 'gamru-user-bonuses-list'],
      },
    ],
    sequence: [
      'Operator -> Gamru: POST /api/gamification/ranks/add (data.levels[].bonus_ids, data.bonus_ids)',
      'Gamru -> Games: GET /api/bonuses/catalog/:id (snapshot definition)',
      'Games -> Gamru: POST /api/players/by-email (reads levels[].bonus_ids, ranks[].bonus_ids)',
      'Games -> Games: reconcile grants on profile read (level reached / rank completed)',
      'Player -> Games: claim bonus -> credit RM/BM wallet',
      'Games -> Gamru: POST /api/user-bonuses/record (mirror the claim)',
      'Operator -> Gamru: GET /api/bonuses , GET /api/user-bonuses',
    ],
    notes: [
      'amount_type RM credits real money, BM credits bonus money; balance = real_money + bonus_money.',
      'LEVEL bonus = granted on reaching the level. RANK bonus = granted only after ALL levels in the rank are completed.',
      'GAMRU’s bonuses / user_bonuses tables are a read mirror — the bonus definitions and the wallet credit are owned by the games platform.',
      'Granting needs no GAMRU→games call (ids ride the player payload); only the snapshot fetch and the claim-mirror cross platforms.',
    ],
  },
]

export function flowById(id) {
  return FLOWS.find((f) => f.id === id)
}
