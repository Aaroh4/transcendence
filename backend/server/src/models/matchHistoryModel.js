const MatchHistory = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    user_id: { type: 'integer' },
    opponent_id: { type: 'integer' },
    user_score: { type: 'integer' },
    opponent_score: { type: 'integer' },
    winner_id: { type: 'integer' },
    round: { type: 'string' },
    tournament_id: { type: 'integer' },
    match_type: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
  },
}

export default MatchHistory