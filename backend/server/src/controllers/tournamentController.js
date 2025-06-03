import shuffle from '../utils/shuffle.js'
import { readyUpTimer } from '../utils/updateBracket.js'

const createTournament = async function(req, reply) {
  const { name, size } = req.body
  const userId = req.user.id
  const db = req.server.db
  try{
    const tournaments = db.prepare('SELECT * FROM tournaments WHERE created_by = ?')
      .all(userId)
    if (tournaments.length > 0) {
      const activeTournaments = tournaments.filter(item => {
      return item.status !== 'completed'
		  })
      if (activeTournaments.length > 0) {
        return reply.code(409).send({
          error: "User already has an active tournament started",
          status: activeTournaments.status
        })
      }
    }

    if (size != 4 && size != 8 && size != 16) return reply.code(400).send({ error: "Tournament size has to be 4, 8 or 16" })
    
    const result = db.prepare('INSERT INTO tournaments (name, created_by, size, status) VALUES (?, ?, ?, ?)')
      .run(name, userId, size, 'created')
    
    const tournament = {
      id: result.lastInsertRowid,
      name: name,
	    playerAmount: 0,
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
    const tournaments = db.prepare("SELECT * FROM tournaments WHERE status = 'created'")
      .all()

    if (tournaments.length === 0) return reply.send(tournaments)
    
    return reply.send(tournaments)
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message })
  }
}

const getTournamentAmount = async function(req, reply) {
	const db = req.server.db
	const { tournamentId } = req.params

	try {
		const playerAmount = db.prepare('SELECT playerAmount FROM tournaments WHERE id = ?')
		.get(tournamentId)
	
		if (!playerAmount) {
		  return reply.code(404).send({ error: 'Tournament not found' });
		}

		return reply.send(playerAmount);
	  } catch (err) {
		console.error(err);
		return reply.code(500).send({ error: 'Internal Server Error' });
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
	
		const hasJoined = db.prepare('SELECT * FROM tournament_players WHERE user_id = ?')
		  .all(user.id)
		
		if (hasJoined.length >= 1) return reply.code(409).send({ error: "User has already joined a tournament" })
		
    db.prepare('INSERT INTO tournament_players (user_id, tournament_id) VALUES(?, ?)')
		  .run(userId, tournamentId)
	
		const players = db.prepare('SELECT user_id FROM tournament_players WHERE tournament_id = ?')
		  .all(tournament.id)

    db.prepare('UPDATE tournaments SET playerAmount = ? WHERE id = ?')
		  .run(players.length, tournament.id)

		if (players.length === tournament.size) {
      db.prepare('UPDATE tournaments SET status = ? WHERE id = ?')
        .run('ready', tournament.id)
      db.prepare('UPDATE tournaments SET playerAmount = ? WHERE id = ?')
      .run(players.length, tournament.id)
      return startTournament(req, reply, tournamentId, tournament.name)
		}

		return reply.send({ 
		message: `User ${user.name} successfully joined tournament ${tournament.name}`,
		status: 'waiting',
		tournamentId: tournament.id
		})
	} catch (error) {
		console.log(error)
		return reply.code(500).send({ error: error.message })
	}
}
	
const startTournament = async function(req, reply, tournamentId, tournamentName) {
	const db = req.server.db
	
	try {
		const bracketTransaction = db.transaction(() => {
		const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?')
			.get(tournamentId)
	
		const players = db.prepare('SELECT user_id FROM tournament_players WHERE tournament_id = ?')
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

    setTimeout(async() => {
      readyUpTimer(tournamentId)
    }, 60000)

    return reply.send({ 
      message: `User ${req.user.name} successfully joined tournament ${tournamentName}`,
      status: 'in_progress',
      tournamentId: tournamentId
    })
	} catch (error) {
		console.log(error)
		return reply.code(500).send({ error: error.message })
	}
}

const getTournamentParticipant = async function(req, reply) {
  const db = req.server.db
  const userId = req.user.id
  const { tourType } = req.params;

  console.log(">> getTournamentParticipant called"); //delete
  console.log(userId, tourType); //delete

  try {
	let tournament;
	tournament = db.prepare("SELECT * FROM tournament_players WHERE user_id = ?")
	.all(userId)
	if (tournament.length === 0) return reply.code(404).send({ error: `No tournament found` });
	if (tourType === 'tourPage')
	{
		const realTournament = db.prepare("SELECT * FROM tournaments WHERE id = ? AND status = 'created'")
		.all(tournament[0].tournament_id)
		if (realTournament.length === 0) 
			return reply.code(404).send({ error: `No tournament found` })
		else 
			return reply.code(200).send({ tournament: realTournament[0] });
	}
	else if (tourType === 'gamePage')
	{
		const realTournament = db.prepare("SELECT * FROM tournaments WHERE id = ? AND status = 'in_progress'")
		.all(tournament[0].tournament_id)
		if (realTournament.length === 0) 
			return reply.code(404).send({ error: `No tournament found` })
		else 
			return reply.code(200).send({ tournament: realTournament[0] });
	}

    return reply.code(200).send({ tournament: tournament[0] });
  } catch (error) {
      console.log(error)
      return reply.code(500).send({ error: error.message })
  }
}

const leaveTournament = async function(req, reply) {
  const { tournamentId } = req.params
  const db = req.server.db
  const userId = req.user.id

  try {
    const inTournament = db.prepare('SELECT * FROM tournament_players WHERE tournament_id = ? AND user_id = ?')
      .get(tournamentId, userId)
    
    if (!inTournament) return reply.code(404).send({ error: `User is not in tournament ${tournamentId}` })

    db.prepare('DELETE FROM tournament_players WHERE tournament_id = ? AND user_id = ?')
      .run(tournamentId, userId)

    db.prepare('UPDATE tournaments SET playerAmount = MAX(playerAmount - 1, 0) WHERE id = ?')
		  .run(tournamentId)
    
	db.prepare('UPDATE tournaments SET playerAmount = MAX(playerAmount - 1, 0) WHERE id = ?')
	  .run(tournamentId)

    return reply.send({ error: `User ${userId} left tournament ${tournamentId}`})
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message })
  }
}

const getTournamentBracket = async function(req, reply) {
  const db = req.server.db
  const { tournamentId } = req.params

  try {
    const tournamentBracket = db
		.prepare(`SELECT * FROM matches
					WHERE tournament_id = ?
					ORDER BY round ASC, match_number ASC;`)
		.all(tournamentId)
    
    if (tournamentBracket.length < 1) return reply.code(404).send({ error: "No tournament found"})

		return reply.send({ bracket: tournamentBracket })
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message })
  }
}
export { 
  createTournament, 
  getTournaments, 
  joinTournament,
  getTournamentAmount,
  getTournamentParticipant,
  leaveTournament,
  getTournamentBracket
}