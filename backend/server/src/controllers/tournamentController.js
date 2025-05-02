import shuffle from '../utils/shuffle.js'

const createTournament = async function(req, reply) {
  const { name, size } = req.body
  const userId = req.user.id
  const db = req.server.db
  try{
    const tournaments = db.prepare('SELECT * FROM tournaments WHERE created_by = ?')
      .all(userId)

    if (tournaments.length > 0) {
      const activeTournaments = tournaments.map(item => {
        item.status !== 'completed'
      })
      if (activeTournaments.length > 0) {
        return reply.code(409).send({ 
          error: "User already has an active tournament started",
          status: activeTournaments.status
        })
      }
    }

    const result = db.prepare('INSERT INTO tournaments (name, created_by, size, status) VALUES (?, ?, ?, ?)')
      .run(name, userId, size, 'created')
    
    const tournament = {
      id: result.lastInsertRowid,
      name: name,
      size: size,
      created_by: userId,
      status: 'created'
    }

    return reply.send(tournament)
  } catch (error) {
	console.log(error)
    return reply.code(500).send({ error: error.message })
  }
}

const getTournaments = async function(req, reply) {
  const db = req.server.db

  try {
    const tournaments = db.prepare('SELECT * FROM tournaments')
      .all()


    if (tournaments.length === 0) return reply.code(404).send({ error: "No tournaments found" })
    
    return reply.send(tournaments)
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const joinTournament = async function(req, reply) {
  const { tournamentId } = req.params
  const userId = req.user.id
  const db = req.server.db

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?')
      .get(userId)

    if (!user) return reply.code(404).send({ error: "user not found" })
    
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(tournamentId)
    
    if (!tournament) {
      return reply.code(404).send({ error: "tournament not found" })
    } else if (tournament.status !== 'created') {
        return reply.code(409).send({ 
        error: "Unable to join tournament",
        status: tournament.status
      })
    }

    const hasJoined = db.prepare('SELECT * FROM tournament_players WHERE tournament_id = ? AND user_id = ?')
      .get(tournamentId, user.id)
    
    if (hasJoined) return reply.code(409).send({ error: "User has already joined this tournament" })

    db.prepare('INSERT INTO tournament_players (user_id, tournament_id) VALUES(?, ?)')
      .run(userId, tournamentId)

    const players = db.prepare('SELECT user_id FROM tournament_players WHERE tournament_id = ?')
      .all(tournament.id)

    if (players.length === tournament.size) {
      db.prepare('UPDATE tournaments SET status = ? WHERE id = ?')
        .run('ready', tournament.id)
      return reply.send({ 
        message: `User ${user.name} successfully joined tournament ${tournament.name}`,
        status: 'ready',
        tournamentId: tournament.id
      })
    }
    return reply.send({ 
      message: `User ${user.name} successfully joined tournament ${tournament.name}`,
      status: 'waiting',
      tournamentId: tournament.id
    })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const setReady = async function(req, reply) {
  const { tournamentId } = req.params
  const db = req.server.db

  try {
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(tournamentId)
    
    if (!tournament) return reply.code(404).send({ error: `No tournament found with id ${tournamentId}` })
    
    const player = db.prepare('SELECT * FROM tournament_players WHERE tournament_id = ? AND user_id = ?')
      .get(tournamentId, req.user.id)
    
    if (!player) return reply.code(404).send({ error: `Player not found in tournament ${tournamentId}` })

    db.prepare('UPDATE tournament_players SET is_ready = 1 WHERE tournament_id = ? AND user_id = ?')
      .run(tournament.id, player.user_id)

    const readyPlayers = db.prepare('SELECT user_id FROM tournament_players WHERE tournament_id = ? AND is_ready = 1')
      .all(tournamentId)

    const playerIds = readyPlayers.map(player => player.user_id)
    let updatedTournament = tournament
    
    if (readyPlayers.length === tournament.size) {
      db.prepare('UPDATE tournaments SET status = ? WHERE id = ?')
        .run('ready', tournament.id)

      updatedTournament = db.prepare('SELECT * FROM tournaments WHERE id = ?')
        .get(tournament.id)

      return reply.send({ players: playerIds, tournament: updatedTournament })
    }

    return reply.send({ players: playerIds, tournament: tournament })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const startTournament = async function(req, reply) {
  const { tournamentId } = req.params
  const db = req.server.db

  try {
    const bracketTransaction = db.transaction(() => {
      const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?')
        .get(tournamentId)

      const players = db.prepare('SELECT user_id FROM tournament_players WHERE tournament_id = ? AND is_ready = 1')
        .all(tournamentId)

      const playerIds = players.map(player => player.user_id)
      
      if (!tournament || !players || players.length === 0) {
        return reply.code(404).send({ error: "No tournament or players found" })
      } else if (players.length !== tournament.size) {
        return reply.code(409).send({ error: "All players are not ready" })
      }

      const numberOfRounds = Math.log2(tournament.size)
      const allMatchIds = new Map()
      let matchesInRound = Math.floor(tournament.size / 2)

      shuffle(playerIds)
  
      for (let round = 1; round <= numberOfRounds; round++) {
        let playerOnePrevMatch = null
        let playerTwoPrevMatch = null
        let playerOne = null
        let playerTwo = null
        const roundMatchIds = []
  
        for (let match = 0; match < matchesInRound; match++) {
          if (round > 1) {
            const prevRoundMatches = allMatchIds.get(round - 1)
            playerOnePrevMatch = prevRoundMatches[match * 2] || null
            playerTwoPrevMatch = prevRoundMatches[match * 2 + 1] || null
          } else {
              playerOne = playerIds[match * 2] || null
              playerTwo = playerIds[match * 2 + 1] || null
          }
          const insertStatement = db
            .prepare(`INSERT INTO matches 
                      (tournament_id, round, match_number, player_one_id, player_two_id, player_one_prev_match, player_two_prev_match)
                      VALUES (?, ?, ?, ?, ?, ?, ?);`)
          const result = insertStatement.run(
            tournament.id, 
            round, 
            match + 1, 
            playerOne, 
            playerTwo, 
            playerOnePrevMatch, 
            playerTwoPrevMatch
          )
          roundMatchIds.push(result.lastInsertRowid)
        }
        allMatchIds.set(round, roundMatchIds)
        matchesInRound = Math.floor(matchesInRound / 2)
      }
      db.prepare('UPDATE tournaments SET status = ? WHERE id = ?')
        .run('in_progress', tournamentId)
    })
    bracketTransaction()

    const tournamentBracket = db
      .prepare(`SELECT * FROM matches
                WHERE tournament_id = ?
                ORDER BY round ASC, match_number ASC;`)
      .all(tournamentId)

    return reply.send({ bracket: tournamentBracket })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const getTournamentParticipant = async function(req, reply) {
  const { tournamentId } = req.params
  const db = req.server.db

  try {
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ? AND status = ?')
    .get(tournamentId, 'in_progress')

    if (!tournament) return reply.code(404).send({ error: `No tournament found with id ${tournamentId} and status in_progress` })
    
    const player = db.prepare('SELECT * FROM tournament_players WHERE tournament_id = ? AND user_id = ?')
      .get(tournamentId, req.user.id)
    
    if (!player) return reply.code(404).send({ error: `Player not found in tournament ${tournamentId}` })
    
	console.log("AAAAAAASD");
    return reply.code(204).send()
  } catch (error) {
      console.log(error)
      return reply.code(500).send({ error: error.message })
  }
}

function findGameRoom() {
  const userId = 1

  const match = db.prepare('SELECT * FROM matches WHERE (player_one_id = ? OR player_two_id = ?) AND status = ?')
    .get(userId, userId, 'waiting')
  
  if (!match) {

  }

  if (!match.room_id) {
    const roomId = 1

    db.prepare('UPDATE matches room_id = ? WHERE id = ?')
      .run(roomId, match.id)
  } else {
    
  }
}

export { 
  createTournament, 
  getTournaments, 
  joinTournament, 
  setReady, 
  startTournament,
  getTournamentParticipant
}