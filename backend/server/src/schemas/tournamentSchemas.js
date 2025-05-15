import { 
  createTournament,
  getTournaments,
  getTournamentAmount,
  joinTournament,
  getTournamentParticipant,
  leaveTournament,
  getTournamentBracket
} from '../controllers/tournamentController.js'
import Tournament from '../models/tournamentModel.js'
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

const getTournamentParticipantOpts = {
  schema: {
	params: {
		type: 'object',
		required: ['tourType'],
		properties: {
			tourType: { type: 'string' }
		}
	}
  },
  preHandler: authenticateToken,
  handler: getTournamentParticipant,
}

const leaveTournamentOpts = {
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
  handler: leaveTournament,
}

const getTournamentBracketOpts = {
  schema: {
    params: {
      type: 'object',
      required: ['tournamentId'],
      properties: {
        tournamentId: { type: 'integer' },
      },
    },
  },
  handler: getTournamentBracket,
}

export { 
  createTournamentOpts,
  getTournamentsOpts,
  getTournamentPlayerAmountOpts,
  joinTournamentOpts,
  getTournamentParticipantOpts,
  leaveTournamentOpts,
  getTournamentBracketOpts
}