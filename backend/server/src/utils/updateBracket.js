import db from '../dbInstance.js'
import { rooms } from '../networking.js'

function updateBracket(winnerId, loserId, winnerScore, loserScore) {
  const updateMatches = db.transaction((winnerId, loserId) => {
    const match = db.prepare(`
      SELECT * FROM matches 
      WHERE (player_one_id = ? AND player_two_id = ? AND status = ?)
      OR (player_one_id = ? AND player_two_id = ? AND status = ?)
    `).get(winnerId, loserId, 'in_progress', loserId, winnerId, 'in_progress')
    
    if (!match) throw new Error('No in-progress match found')

    db.prepare('UPDATE matches SET status = ?, winner_id = ? WHERE id = ?')
      .run('completed', winnerId, match.id)
    db.prepare('UPDATE tournament_players SET is_ready = 0 , won_previous = 1 WHERE user_id = ? AND tournament_id = ?')
      .run(winnerId, match.tournament_id)

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
    
	db.prepare('UPDATE users SET wins = wins + 1 WHERE id = ?')
	.run(winnerId)

    db.prepare('UPDATE users SET losses = losses + 1 WHERE id = ?')
      .run(loserId)
    
	console.log("LOSERID::::::::: " + loserId);
	db.prepare('DELETE FROM tournament_players WHERE user_id = ? AND tournament_id = ?')
	.run(loserId, match.tournament_id)

    const nextMatch = db.prepare(`
      SELECT * FROM matches
      WHERE (player_one_prev_match = ? OR player_two_prev_match = ?)
      AND status = ?
    `).get(match.id, match.id, 'waiting')

	//const emptyPlayers = db.prepare("SELECT * FROM tournament_players WHERE tournament_id = ?")
    //	.all(match.tournamentId);

	//console.log(emptyPlayers.length === 0, " : " + match.tournamentId);

	//if (Object.keys(emptyPlayers.length === 0))
	//	db.prepare('UPDATE tournaments SET status = ?, winner = ? WHERE id = ?')
    //    .run('completed', 0, match.tournament_id)

    if (!nextMatch) {
      db.prepare('UPDATE tournaments SET status = ?, winner = ? WHERE id = ?')
        .run('completed', winnerId, match.tournament_id)
      db.prepare('DELETE FROM tournament_players WHERE tournament_id = ?')
        .run(match.tournament_id)
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

    if (nextMatch) {
      const matches = db.prepare('SELECT * FROM matches WHERE tournament_id = ? AND round = ?')
        .all(match.tournament_id, match.round)
      
      if (matches.length > 0) {
        const notCompleted = matches.filter(item => {
          return item.status !== 'completed'
        })
        if (notCompleted.length === 0) {
          setTimeout(() => {
            readyUpTimer(match.tournamentId)
          }, 60000)
        }
      }
    }
  })
  updateMatches(winnerId, loserId)
}

function updateMatchHistory(winnerId, loserId, winnerScore, loserScore) {
    db.prepare(`
      INSERT INTO match_history (
      user_id,
      opponent_id, 
      user_score, 
      opponent_score,
		  winner_id,
      match_type) VALUES (?, ?, ?, ?, ?, ?)
    `).run(winnerId, loserId, winnerScore, loserScore, winnerId, 'single')

    db.prepare(`
      INSERT INTO match_history (
      user_id,
      opponent_id, 
      user_score, 
      opponent_score,
      winner_id,
      match_type) VALUES (?, ?, ?, ?, ?, ?)
    `).run(loserId, winnerId, loserScore, winnerScore, winnerId, 'single')
    
    db.prepare('UPDATE users SET wins = wins + 1 WHERE id = ?')
      .run(winnerId)
    db.prepare('UPDATE users SET losses = losses + 1 WHERE id = ?')
      .run(loserId)
}

function readyUpTimer(tournamentId) {
  let players = db.prepare('SELECT * FROM tournament_players WHERE tournament_id = ? AND is_ready = ? AND won_previous = 0')
    .all(tournamentId, 0)

  if (players.length < 1) return

  db.prepare('UPDATE tournament_players SET is_ready = ? WHERE tournament_id = ? AND is_ready = ? AND won_previous = 0')
    .run(2, tournamentId, 0)

	db.prepare('UPDATE tournament_players SET won_previous = ? WHERE tournament_id = ? AND (is_ready = 0 OR 1)')
		.run(1, tournamentId)

  const playerIds = players.map(player => player.user_id)

  for (let i = 0; i < playerIds.length; i++) {
    const opponent = db.prepare('SELECT * FROM matches WHERE tournament_id = ? AND (player_one_id = ? OR player_two_id = ?)')
      .get(tournamentId, playerIds[i], playerIds[i])
    if (opponent.player_one_id === playerIds[i]) {
      db.prepare('UPDATE matches SET status = ? WHERE player_one_id = ? AND player_two_id = ? AND tournament_id = ?')
        .run('in_progress', playerIds[i], opponent.player_two_id, tournamentId)
		if (rooms[opponent.room_id])
			rooms[opponent.room_id].sockets[opponent.player_two_id].emit("disconnectWin");
      updateBracket(opponent.player_two_id, playerIds[i], 1, 0)
    } else {
      db.prepare('UPDATE matches SET status = ? WHERE player_one_id = ? AND player_two_id = ? AND tournament_id = ?')
        .run('in_progress', opponent.player_one_id, playerIds[i], tournamentId)
		if (rooms[opponent.room_id])
			rooms[opponent.room_id].sockets[opponent.player_one_id].emit("disconnectWin");
      updateBracket(opponent.player_one_id, playerIds[i], 1, 0)
    }
  }
}

export { updateBracket, updateMatchHistory, readyUpTimer }