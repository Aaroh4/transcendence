import db from '../dbInstance.js'

function updateBracket(winnerId, loserId, winnerScore, loserScore) {
  const updateMatches = db.transaction((winnerId, loserId) => {
	console.log("winnerId", winnerId);
	console.log("loserId", loserId);
    const match = db.prepare(`
      SELECT * FROM matches 
      WHERE (player_one_id = ? AND player_two_id = ? AND status = ?)
      OR (player_one_id = ? AND player_two_id = ? AND status = ?)
    `).get(winnerId, loserId, 'in_progress', loserId, winnerId, 'in_progress')
    
    if (!match) throw new Error('No in-progress match found')
    
    db.prepare(`
      INSERT INTO match_history (
      user_id,
      opponent_id, 
      user_score, 
      opponent_score, 
      winner_id,
      round,
      tournament_id,
      match_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(winnerId, loserId, winnerScore, loserScore, winnerId, match.round, match.tournament_id, 'tournament')

    db.prepare(`
      INSERT INTO match_history (
      user_id,
      opponent_id, 
      user_score, 
      opponent_score,  
      winner_id,
      round,
      tournament_id,
      match_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(loserId, winnerId, loserScore, winnerScore, winnerId, match.round, match.tournament_id, 'tournament')

    db.prepare('UPDATE matches SET status = ?, winner_id = ? WHERE id = ?')
      .run('completed', winnerId, match.id)

	console.log("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAATNAANCNASDNCNASDCNDOASCISDJCOIASCOPJASCDASICUOICASDOCIDUASCOIUASD");

	  db.prepare('DELETE FROM tournament_players WHERE user_id = ? AND tournament_id = ?')
      .run(loserId, match.tournament_id)

    const nextMatch = db.prepare(`
      SELECT * FROM matches
      WHERE (player_one_prev_match = ? OR player_two_prev_match = ?)
      AND status = ?
    `).get(match.id, match.id, 'waiting')

    if (!nextMatch) {
      db.prepare('UPDATE tournaments SET status = ?, winner = ? WHERE id = ?')
        .run('completed', match.winner_id, match.tournament_id)
    } else if (match.id === nextMatch.player_one_prev_match) {
      db.prepare(`
        UPDATE matches SET player_one_id = ?
        WHERE id = ?
      `).run(winnerId, nextMatch.id)
    } else if (match.id === nextMatch.player_two_prev_match) {
      db.prepare(`
        UPDATE matches SET player_two_id = ?
        WHERE id = ?
      `).run(winnerId, nextMatch.id)
    }
  })
  updateMatches(winnerId, loserId)
}

export default updateBracket