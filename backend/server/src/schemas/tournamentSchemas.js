import { 
  createTournament,
  getTournaments,
  joinTournament,
  setReady,
  startTournament,
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

const startTournamentOpts = {
  schema: {
    params: {
      type: 'object',
      properties: {
        tournamentId: { type: 'integer', minimum: 1 },
      },
      required: ['tournamentId'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          bracket: {
            type: 'array',
            items: Match,
          },
        },
      },
    },
  },
  preHandler: authenticateToken,
  handler: startTournament,
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
  joinTournamentOpts,
  startTournamentOpts,
  getTournamentParticipantOpts
}