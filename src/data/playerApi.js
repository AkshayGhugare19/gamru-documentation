// ---------------------------------------------------------------------------
// PLAYER API — Missions & Tournaments (the games-platform endpoints a PLAYER's
// app calls with their own JWT).
//
// These are NOT Gamru endpoints. Missions and tournaments are AUTHORED in Gamru;
// the games backend (my-game-platform-backend) fetches that catalog live per
// player and merges it with the player's local PARTICIPATION (join / progress /
// claim / score), which Gamru does not store. This file documents exactly what
// the player-facing routes accept and return, extracted from:
//   src/modules/mission/controller/mission.controller.ts   + service/mission.engine.ts
//   src/modules/tournament/controller/tournament.controller.ts + service/tournament.service.ts
//   src/route/{mission,tournament}.routes.ts
//
// Envelope: every response is wrapped by successResponse():
//   { success: true, message: "<msg>", data: <payload>, timestamp: "ISO" }
// Auth: Authorization: Bearer <accessToken>  (the player JWT). A missing/expired
//   token returns 401 { success:false, message:"Unauthorized" }.
//
// Each endpoint: { id, platform:'games', group, method, path, title, auth:'player',
//   summary, params?, body?, response:{ status, example }, errors?:[{ code, when }] }
// ---------------------------------------------------------------------------

const j = (o) => JSON.stringify(o, null, 2)

// ---- realistic sample payloads (mirror the real DTOs) ---------------------

// A full MissionDTO (mission.engine.ts → MissionDTO). Every field the player UI
// can read is present so you can build the whole card from one object.
const MISSION_DTO = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  name: 'High Roller Slots',
  description: 'Wager big on slots this week.',
  category: 'Slots',
  bucket: 'Casino', // 'Casino' | 'Sport' — the exclusivity bucket
  vip: false,
  duration_days: 7,
  large_image: 'https://cdn/.../high-roller.png',
  status: 'IN_PROGRESS', // AVAILABLE | IN_PROGRESS | COMPLETED | CLAIMED
  objective_type: 'wager', // wager | bet_count | win | login | deposit | …
  measure: 'amount', // 'count' | 'amount'
  target: 15000,
  progress: 4200,
  condition: 'Wager $15000', // human label
  game_category: 'slots',
  min_bet: 1,
  min_multiplier: null,
  bet_currency: 'All Currencies',
  games: ['starburst', 'gates-of-olympus'],
  start_date: '2026-06-10',
  end_date: '2026-06-17',
  reward_type: 'bonus_cash',
  reward_amount: 50,
  reward_label: '50 Bonus Bets x $2',
  max_bonus: 100,
  bonus_wagering: 'Excluded',
  deposit_required: false,
  wagering_required: true,
  more_details: 'Bonus credited within 24h of claiming.',
  tags: ['weekly', 'slots'],
}

const MISSION_BRANDING = {
  banner_desktop: 'https://cdn/.../missions-banner-desktop.png',
  banner_mobile: 'https://cdn/.../missions-banner-mobile.png',
}

// A full TournamentDTO (tournament.service.ts → TournamentDTO).
const TOURNAMENT_DTO = {
  id: 'tour-weekend-race',
  name: 'Weekend Slots Race',
  description: 'Climb the board on slots all weekend.',
  industry: 'Casino', // 'Casino' | 'Sports' | …
  tournament_type: 'leaderboard',
  games: ['starburst', 'gates-of-olympus'],
  period: 'WEEKLY',
  large_image: 'https://cdn/.../race-large.png',
  small_image: 'https://cdn/.../race-small.png',
  min_bet: 1,
  max_bets: null,
  buy_in: null,
  start_date: '2026-06-13',
  end_date: '2026-06-16',
  leaderboard_size: 100,
  prize_pool: 1000,
  eligibility_type: 'all',
  segment: null,
  tags: ['weekend', 'slots'],
  state: 'IN_PROGRESS', // SCHEDULED | IN_PROGRESS | ENDED
}

const TOURNAMENT_BRANDING = {
  banner_desktop: 'https://cdn/.../tournaments-banner-desktop.png',
  banner_mobile: 'https://cdn/.../tournaments-banner-mobile.png',
  tag_color_casino: '#9013fe',
  tag_color_sport: '#417505',
}

const LEADERBOARD = [
  { rank: 1, user_id: 'u-ace', name: 'Ace', score: 9000, is_me: false, prize: 500 },
  { rank: 2, user_id: 'u-jane', name: 'Jane', score: 6400, is_me: true, prize: 300 },
  { rank: 3, user_id: 'u-bo', name: 'Bo', score: 5100, is_me: false, prize: 200 },
]

// ---- the endpoints --------------------------------------------------------

export const PLAYER_MISSION_ENDPOINTS = [
  {
    id: 'pm-list',
    platform: 'games', group: 'Missions', method: 'GET', path: '/api/missions',
    title: 'List my missions', auth: 'player',
    summary:
      'The Missions page. Returns the live Gamru mission catalog for THIS player, with each mission already merged with the player’s own participation — so status and progress are per-player. branding holds the page banners. If Gamru is unreachable the catalog comes back empty (the page still renders) rather than erroring.',
    response: {
      status: 200,
      example: j({
        success: true,
        message: 'Missions',
        data: { branding: MISSION_BRANDING, missions: [MISSION_DTO] },
        timestamp: '2026-06-16T10:00:00.000Z',
      }),
    },
  },
  {
    id: 'pm-get',
    platform: 'games', group: 'Missions', method: 'GET', path: '/api/missions/:id',
    title: 'Get one mission', auth: 'player',
    summary:
      'A single mission with the player’s live status and progress merged in — use it for the mission detail / drawer. id is the Gamru mission uuid.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'Gamru mission id' }] },
    response: {
      status: 200,
      example: j({ success: true, message: 'Mission', data: MISSION_DTO, timestamp: '2026-06-16T10:00:00.000Z' }),
    },
    errors: [{ code: '404 Mission not found', when: 'No mission with that id is in the player’s Gamru catalog.' }],
  },
  {
    id: 'pm-join',
    platform: 'games', group: 'Missions', method: 'POST', path: '/api/missions/:id/join',
    title: 'Join a mission', auth: 'player',
    summary:
      'Opt the player into a mission. Creates (or resets) the participation row at progress 0 with status IN_PROGRESS. Exclusivity: only ONE mission may be IN_PROGRESS per bucket (Casino / Sport) — joining another in the same bucket cancels the current one. Re-joining a mission you already started just resets its progress. No request body. Returns the joined mission.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'Gamru mission id' }] },
    response: {
      status: 200,
      example: j({
        success: true,
        message: 'Mission joined',
        data: { ...MISSION_DTO, status: 'IN_PROGRESS', progress: 0 },
        timestamp: '2026-06-16T10:00:00.000Z',
      }),
    },
    errors: [
      { code: '404 Mission not found', when: 'The id isn’t in the player’s Gamru catalog.' },
      { code: '400 This mission is not configured correctly', when: 'The mission’s objective target is 0 / missing in Gamru.' },
    ],
  },
  {
    id: 'pm-progress',
    platform: 'games', group: 'Missions', method: 'POST', path: '/api/activity',
    title: 'mission progress (record a play)', auth: 'player',
    summary:
      'There is NO manual “set progress” endpoint — progress is earned, not written. You record each gameplay action here; the engine then advances every IN_PROGRESS mission whose objective matches: wager / bet_count missions tick on each play (count missions +1, amount missions add the stake), win missions advance only on a win (by the win amount), and login missions advance on a LOGIN. Sub-conditions are enforced — a play below data.min_bet, or of a game not in data.games, is skipped. At the target the mission flips to COMPLETED. Re-fetch GET /api/missions/:id (or the list) to show the new progress; the reference UI also polls ~10s. idempotencyKey makes a retried play safe — it won’t double-count progress.',
    body: {
      fields: [
        { name: 'type', type: "'GAME_PLAY' | 'BET_PLACE' | 'LOGIN'", required: true, desc: 'the action — GAME_PLAY/BET_PLACE drive wager/bet_count/win missions; LOGIN drives login missions' },
        { name: 'idempotencyKey', type: 'string', required: true, desc: '6–120 chars, unique per play — prevents double-award & double-progress on retry' },
        { name: 'gameId', type: 'string', required: false, desc: 'game id (also usable as the games sub-condition key)' },
        { name: 'amount', type: 'number', required: false, desc: '≥ 0 — XP/turnover for this play; fallback stake when meta.bet is absent' },
        { name: 'meta.bet', type: 'number', required: false, desc: 'stake / turnover — advances wager missions and gates data.min_bet' },
        { name: 'meta.win', type: 'boolean', required: false, desc: 'true on a winning play — advances win missions' },
        { name: 'meta.winAmount', type: 'number', required: false, desc: 'amount won — added to amount-measured win missions' },
        { name: 'meta.game / meta.gameId / meta.name', type: 'string', required: false, desc: 'game route key — matched against the mission’s data.games list' },
        { name: 'meta.category / meta.provider', type: 'string', required: false, desc: 'optional — feed casino personalization' },
      ],
    },
    bodyExample: {
      type: 'GAME_PLAY',
      idempotencyKey: 'play-2026-06-16-abc123',
      gameId: 'starburst',
      amount: 5,
      meta: { game: 'starburst', category: 'slots', provider: 'NetEnt', bet: 5, win: true, winAmount: 12 },
    },
    response: {
      status: 201,
      example: j({
        success: true,
        message: 'Activity recorded',
        data: {
          duplicate: false,
          xpAwarded: 5,
          boostMultiplier: 1,
          breakdown: { base: 5, streakBonus: 0, dailyBonus: 0 },
          xpTotal: 1290,
        },
        timestamp: '2026-06-16T10:00:00.000Z',
      }),
    },
    errors: [
      { code: '400 idempotencyKey is required (prevents double-award)', when: 'idempotencyKey missing or < 6 chars.' },
      { code: '400 Unsupported activity type', when: 'type is not GAME_PLAY / BET_PLACE / LOGIN.' },
      { code: '503 Gamru client service is disabled', when: 'Gamru rejected the client key (operator must re-enable it).' },
    ],
  },
  {
    id: 'pm-claim',
    platform: 'games', group: 'Missions', method: 'POST', path: '/api/missions/:id/claim',
    title: 'Claim a completed mission', auth: 'player',
    summary:
      'Claim the reward of a COMPLETED mission. The games backend resolves the player’s Gamru id by email and calls Gamru (POST /api/players/:id/missions/:missionId/claim) — Gamru is the reward ledger, so the reward lands in the player’s “Special Bonuses”. On success the local participation flips to CLAIMED. No request body. Returns the reward label to show in the success toast.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'Gamru mission id' }] },
    response: {
      status: 200,
      example: j({
        success: true,
        message: 'Mission reward claimed',
        data: { reward_label: '50 Bonus Bets x $2' },
        timestamp: '2026-06-16T10:00:00.000Z',
      }),
    },
    errors: [
      { code: '404 Mission not started', when: 'The player has no participation row for this mission.' },
      { code: '409 Mission reward already claimed', when: 'It is already CLAIMED.' },
      { code: '409 Mission not completed yet', when: 'Status is not COMPLETED — progress hasn’t hit the target.' },
      { code: '503 Could not reach the rewards service — try again', when: 'Gamru couldn’t be reached to grant the reward; safe to retry.' },
    ],
  },
  {
    id: 'pm-cancel',
    platform: 'games', group: 'Missions', method: 'POST', path: '/api/missions/:id/cancel',
    title: 'Cancel a mission', auth: 'player',
    summary:
      'Abandon a running mission. The participation row is removed, so the mission returns to AVAILABLE with progress reset to 0. Use it to free the player’s Casino / Sport slot for a different mission. No request body. data is null on success.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'Gamru mission id' }] },
    response: {
      status: 200,
      example: j({ success: true, message: 'Mission cancelled', data: null, timestamp: '2026-06-16T10:00:00.000Z' }),
    },
    errors: [
      { code: '404 Mission not started', when: 'There is nothing to cancel.' },
      { code: '409 A claimed mission can’t be cancelled', when: 'The mission is already CLAIMED.' },
    ],
  },
]

export const PLAYER_TOURNAMENT_ENDPOINTS = [
  {
    id: 'pt-list',
    platform: 'games', group: 'Tournaments', method: 'GET', path: '/api/tournaments',
    title: 'List my tournaments', auth: 'player',
    summary:
      'The Tournaments page. Returns the live Gamru tournament catalog for this player, each with a derived state (SCHEDULED / IN_PROGRESS / ENDED) and the page branding (incl. tag colours). There is NO join step — a player appears on a board the moment they score. Side effect: any tournament whose state is ENDED is settled here (top-3 prize pool payout, runs once).',
    response: {
      status: 200,
      example: j({
        success: true,
        message: 'Tournaments',
        data: { branding: TOURNAMENT_BRANDING, tournaments: [TOURNAMENT_DTO] },
        timestamp: '2026-06-16T10:00:00.000Z',
      }),
    },
  },
  {
    id: 'pt-history',
    platform: 'games', group: 'Tournaments', method: 'GET', path: '/api/tournaments/history',
    title: 'My tournament history', auth: 'player',
    summary:
      'Every tournament the player has actually played (had at least one play or score), newest first. Reads from the local snapshot, so it still renders after a tournament leaves the Gamru catalog. rank is the player’s current position on that tournament’s board; games_played lists per-game play counts (most played first).',
    response: {
      status: 200,
      example: j({
        success: true,
        message: 'Tournament history',
        data: [
          {
            tournament_id: 'tour-weekend-race',
            name: 'Weekend Slots Race',
            player_name: 'Jane',
            player_email: 'jane@lucky-casino.com',
            industry: 'Casino',
            image: 'https://cdn/.../race-large.png',
            plays: 42,
            games_played: [
              { game: 'starburst', plays: 30 },
              { game: 'gates-of-olympus', plays: 12 },
            ],
            xp: 6400,
            rank: 2,
            last_played_at: '2026-06-15T21:14:00.000Z',
          },
        ],
        timestamp: '2026-06-16T10:00:00.000Z',
      }),
    },
  },
  {
    id: 'pt-get',
    platform: 'games', group: 'Tournaments', method: 'GET', path: '/api/tournaments/:id',
    title: 'Get one tournament (with leaderboard)', auth: 'player',
    summary:
      'A single tournament plus its ranked leaderboard (capped at leaderboard_size). Each row carries is_me so you can highlight the player, and prize (their share of the pool, populated once the tournament has ENDED and settled). If the tournament has ended, prizes are settled here before the standings are returned.',
    params: { fields: [{ name: 'id', type: 'string', required: true, desc: 'Gamru tournament id' }] },
    response: {
      status: 200,
      example: j({
        success: true,
        message: 'Tournament',
        data: { branding: TOURNAMENT_BRANDING, tournament: TOURNAMENT_DTO, leaderboard: LEADERBOARD },
        timestamp: '2026-06-16T10:00:00.000Z',
      }),
    },
    errors: [{ code: '404 Tournament not found', when: 'No tournament with that id is in the player’s Gamru catalog.' }],
  },
  {
    id: 'pt-score',
    platform: 'games', group: 'Tournaments', method: 'POST', path: '/api/tournaments/:id/score',
    title: 'Submit a score', auth: 'player',
    summary:
      'Add points the player earned from a play. points is added to their running score (negatives and non-numbers are clamped to 0, the value is rounded). If game is supplied it must be one of the tournament’s configured games — otherwise the points are ignored (applied: 0) so a stray game can’t pollute the board. The delta is mirrored to Gamru’s leaderboard (fire-and-forget; a Gamru outage never fails the call). Returns the new running score and how much was applied.',
    params: { fields: [{ name: 'id', type: 'string', required: true, desc: 'Gamru tournament id' }] },
    body: {
      fields: [
        { name: 'points', type: 'number', required: true, desc: 'points earned this play (clamped ≥ 0, rounded)' },
        { name: 'game', type: 'string', required: false, desc: 'game route key played — must match the tournament, else ignored' },
      ],
    },
    bodyExample: { points: 250, game: 'starburst' },
    response: {
      status: 200,
      example: j({
        success: true,
        message: 'Score recorded',
        data: { tournament_id: 'tour-weekend-race', score: 6650, applied: 250 },
        timestamp: '2026-06-16T10:00:00.000Z',
      }),
    },
    errors: [{ code: '404 Tournament not found', when: 'The id isn’t in the player’s Gamru catalog.' }],
  },
]

// These are player-facing routes on the games platform — tag them so the
// Endpoint reference surfaces them in the USER panel alongside the Gamru S2S
// endpoints a consuming platform calls.
for (const e of [...PLAYER_MISSION_ENDPOINTS, ...PLAYER_TOURNAMENT_ENDPOINTS]) {
  e.audience = 'user'
}
