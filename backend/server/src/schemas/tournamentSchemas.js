import { 
  createTournament,
  getTournaments,
  getTournamentAmount,
  joinTournament,
  setReady,
  getTournamentParticipant
} from '../controllers/tournamentController.js'
import Tournament from '../models/tournamentModel.js'
import Match from '../models/matchModel.js'
import authenticateToken from '../middleware/authentication.js'

const createTournamentOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        size: {type: 'integer' },
      },
    },
  },
  preHandler: authenticateToken,
  handler: createTournament,
}

const getTournamentsOpts = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: Tournament,
      },
    },
  },
  handler: getTournaments,
}

const getTournamentPlayerAmountOpts = {
	schema: {
	  response: {
		200: {
		  type: 'object',
		  properties: {
			playerAmount: { type: 'integer' }
		  }
		}
	  }
	},
	handler: getTournamentAmount,
}

const joinTournamentOpts = {
  schema: {
    params: {
      type: 'object',
      required: ['tournamentId'],
      properties: {
        tournamentId: { type: 'integer' }
      },
    },
  },
  preHandler: authenticateToken,
  handler: joinTournament,
}

const setReadyOpts = {
  schema: {
    params: {
      type: 'object',
      properties: {
        tournamentId: { type: 'integer', minimum: 1 },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          players: { 
            type: 'array',
            items: { type: 'integer' },
          },
          tournament: Tournament
        },
      },
    },
  },
  preHandler: authenticateToken,
  handler: setReady,
}

const getTournamentParticipantOpts = {
  schema: {
    params: {
      type: 'object',
      required: ['tournamentId'],
      properties: {
        tournamentId: { type: 'integer' },
      },
    },
  },
  preHandler: authenticateToken,
  handler: getTournamentParticipant,
}

export { 
  createTournamentOpts,
  getTournamentsOpts,
  getTournamentPlayerAmountOpts,
  joinTournamentOpts,
  setReadyOpts,
  getTournamentParticipantOpts
}