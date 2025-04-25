import { logoutUser, loginUser, getToken, googleAuthHandler } from '../controllers/loginController.js'
import authenticateToken from '../../server/src/middleware/authentication.js'

const logoutOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' },
      },
    },
  },
  handler: logoutUser,
}

const loginOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['username', 'password', 'captchaToken'],
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