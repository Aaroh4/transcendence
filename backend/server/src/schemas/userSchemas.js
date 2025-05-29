import { 
  getUsers,
  searchUsers,
  addUser,
  getUser,
  deleteUser,
  updateUser,
  updatePassword,
  uploadAvatar,
  getMatchHistory
} from '../controllers/userController.js'
import authenticateToken from '../middleware/authentication.js'
import User from '../models/userModel.js'
import MatchHistory from '../models/matchHistoryModel.js'

const getUsersOpts = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: User,
      },
    },
  },
  handler: getUsers,
}

const addUserOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email', 'password', 'captchaToken'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { 
			type: 'string',
			minLength: 8,
		},
		captchaToken: { type: 'string' },
      },
    },
    response: {
      201: User,
    },
  },
  handler: addUser,
}

const getUserOpts = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 }
      },
    },
    response: {
      200: User,
    },
  },
  handler: getUser,
}

const deleteUserOpts = {
  schema: {},
  preHandler: authenticateToken,
  handler: deleteUser,
}

const updateUserOpts = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 }
      },
    },
    body: {
      type: 'object',
      required: ['name', 'email', 'number'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        number: {
          type: 'string',
          pattern: "^\\+\\d{6,15}$",
        },
      },
    },
    response: {
      200: User,
    },
  },
  preHandler: authenticateToken,
  handler: updateUser,
}

const updatePasswordOpts = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 },
      },
    },
    body: {
      type: 'object',
      required: ['password'],
      properties: {
        password: { 
          type: 'string',
          minLength: 8,
         },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  preHandler: authenticateToken,
  handler: updatePassword,
}

const uploadOpts = {
  schema: {
    response: {
      204: {},
    },
  },
  preHandler: authenticateToken,
  handler: uploadAvatar,
}

const searchUsersOpts = {
  schema: {
    querystring: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'array',
        items: User,
      },
    },
  },
  handler: searchUsers,
}

const getMatchHistoryOpts = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: MatchHistory,
      },
    },
  },
  handler: getMatchHistory,
}

export {
  getUserOpts,
  getUsersOpts,
  addUserOpts,
  deleteUserOpts,
  updateUserOpts,
  updatePasswordOpts,
  uploadOpts,
  searchUsersOpts,
  getMatchHistoryOpts
}