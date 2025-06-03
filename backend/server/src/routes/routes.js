import { getExternalIP } from '../utils/externalIp.js';

import { 
  getUserOpts, 
  getUsersOpts,
  searchUsersOpts,
  addUserOpts, 
  deleteUserOpts, 
  updateUserOpts, 
  updatePasswordOpts,
  dashboardOpts,
  uploadOpts
} from '../schemas/userSchemas.js'
import { 
  friendRequestOpts, 
  checkPendingOpts, 
  acceptRequestOpts,
  blockRequestOpts,
  getFriendsOpts,
  declineRequestOpts,
  removeFriendOpts
} from '../schemas/friendSchemas.js'
import { 
  getTournamentsOpts,
  createTournamentOpts,
  getTournamentPlayerAmountOpts,
  joinTournamentOpts,
  getTournamentParticipantOpts,
  leaveTournamentOpts,
  getTournamentBracketOpts
} from '../schemas/tournamentSchemas.js'
import { postDebugLogOpts } from '../schemas/debugSchemas.js';

let cachedIP = null;

async function root (fastify, options) {
  fastify.get('/', async (req, reply) => {
    try {
		return reply.sendFile('index.html');
    } catch (error) {
      console.log(error)
	  reply.code(500).send('Internal Server Error');
    }
	});

	fastify.get('/external-ip', async (request, reply) => {
		if (cachedIP) return reply.send({ ip: cachedIP });
		
		try {
			cachedIP = await getExternalIP();
			reply.send({ ip: cachedIP });
		} catch (err) {
			reply.code(500).send({ error: 'Failed to get IP' });
		}
	});
}

async function userRoutes (fastify, options) {
  fastify.get('/api/users', getUsersOpts) //Palauttaa User objektin joka käyttäjälle mikä sisältää: id, name, status(1 = online, 0 = offline), wins, losses, path avatariin
  fastify.get('/api/users/search', searchUsersOpts)
  fastify.get('/api/user/:id', getUserOpts) //Vaatii parametrina ID:n ja palauttaa User objektin id:n perusteella
  fastify.get('/api/dashboard', dashboardOpts) //mahdollista käyttää myöhemmin esim profiili sivuna, redirectaa käyttäjän loginin jälkeen
  fastify.put('/api/upload', uploadOpts) //Avatarin uploadaamiseen, ottaa kuva tiedoston ja tallentaa kuvan avatars kansioon ja pathin databaseen
  fastify.put('/api/user/:id', updateUserOpts) //Vaatii parametrina ID:n ja request bodyssa: name, email, number, password 
  fastify.put('/api/user/pwd/:id', updatePasswordOpts) //Vaatii Parametrina ID:n ja request bodyssa password
  fastify.delete('/api/user/delete', deleteUserOpts) //Vaatii parametrina ID:n ja poistaa kyseisen Userin
  fastify.post('/api/user', addUserOpts) //Vaatii request bodyssa: name, email, number, password
}

async function friendRoutes (fastify, options) {
  fastify.get('/api/friends', getFriendsOpts)
  fastify.get('/api/friend/check_pending', checkPendingOpts)
  fastify.post('/api/friend/request', friendRequestOpts) //Vaatii request bodyssa friendId joka on sen käyttäjän id joka halutaan lisätä kaveriksi
  fastify.post('/api/friend/accept', acceptRequestOpts)
  fastify.post('/api/friend/block', blockRequestOpts)
  fastify.post('/api/friend/decline', declineRequestOpts)
  fastify.delete('/api/friend/remove/:id', removeFriendOpts)
}

async function tournamentRoutes (fastify, options) {
  fastify.get('/api/tournaments', getTournamentsOpts)
  fastify.get('/api/tournament/:tournamentId/playerAmount', getTournamentPlayerAmountOpts)
  fastify.get('/api/tournament/participant/:tourType', getTournamentParticipantOpts)
  fastify.get('/api/tournament/:tournamentId', getTournamentParticipantOpts)
  fastify.get('/api/tournament/:tournamentId/bracket', getTournamentBracketOpts)
  fastify.post('/api/tournament/create', createTournamentOpts)
  fastify.post('/api/tournament/:tournamentId/join', joinTournamentOpts)
  fastify.delete('/api/tournament/:tournamentId/leave', leaveTournamentOpts)
}

async function debugRoutes(fastify, options) {
	console.log("✅ Registering /api/debug-log route");
  fastify.post('/api/debug-log', postDebugLogOpts);
}

export { root, userRoutes, friendRoutes, tournamentRoutes, debugRoutes }