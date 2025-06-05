import authenticateToken from '../middleware/authentication.js'
import { logoutUser, loginUser, getToken, googleAuthHandler } from '../controllers/loginController.js'

const logoutOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        token: { type: 'string' },
      },
    },
  },
  preHandler: authenticateToken,
  handler: logoutUser,
}

const loginOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['email', 'password', 'captchaToken'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
        captchaToken: { type: 'string' },
      },
    },
  },
  handler: loginUser,
}

const tokenOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        token: { type: 'string' },
      },
    },
  },
  handler: getToken,
}

const googleAuthOpts = {
  schema: {},
  handler: googleAuthHandler,
}

export { loginOpts, logoutOpts, tokenOpts, googleAuthOpts }