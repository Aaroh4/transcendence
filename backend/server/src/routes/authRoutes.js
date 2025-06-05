import { 
  loginOpts,
  logoutOpts, 
  tokenOpts, 
  googleAuthOpts 
} from '../schemas/loginSchemas.js'

async function loginRoutes (fastify, options) {	
	fastify.post('/api/login', loginOpts) //Vaatii request bodyssa: username, password. Palauttaa refresh ja authenticate JWT tokenit
	fastify.post('/api/token', tokenOpts) //Vaatii request bodyssa JWT refresh tokenin
	fastify.delete('/api/logout', logoutOpts) //Vaatii request bodyssa JWT refresh tokenin. Poistaa Userin tokenit asettaa statuksen 0 (offline) ja redirectaa etusivulle
	fastify.get('/api/googleauth/callback', googleAuthOpts)
	fastify.get('/api/googleauth', async (req, reply) => {
    const CLIENT_ID = process.env.CLIENT_ID
    const REDIRECT_URI = process.env.REDIRECT_URI
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile%20email&prompt=select_account`

    return reply.redirect(url)
  })
}

export default loginRoutes