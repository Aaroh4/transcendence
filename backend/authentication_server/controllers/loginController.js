import bcrypt from 'bcrypt'
import axios from 'axios'
import { verifyIdToken, completeLogin, generateAccessToken, completeGoogleLogin } from '../services/authenticationServices.js'
import { nameGenerator, isNameTaken } from '../services/nameGenerator.js'

const logoutUser = async function(req, reply) {
  const { token } = req.body
  const db = req.server.db
  const userId = req.user.id

  try{
    const user = db.prepare('SELECT * FROM users WHERE id = ?')
      .get(userId)

    if (!user) return reply.code(404).send({ error: "User not found"})
    
    if (token) {
      db.prepare('DELETE FROM refresh_tokens WHERE user_id = ? AND refresh_token = ?')
      .run(userId, token)
    }

    db.prepare('UPDATE users SET online_status = 0 WHERE id = ?')
      .run(userId)

    return reply.code(303).redirect('/')
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message })
  }
}

const loginUser = async function (req, reply) {
  const { email, password, captchaToken } = req.body
  const db = req.server.db

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?')
      .get(email)

    if (!user) return reply.code(401).send({ error: 'Incorrect email or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return reply.code(401).send({ error: 'Incorrect email or password' })

    if (!captchaToken) return reply.code(400).send({ error: 'Token is required' })

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.CAPTCHA_SECRET,
      response: captchaToken,
    }),
    });

	const data = await res.json();

	if (!data.success) {
	return reply.code(400).send({ error: 'Invalid CAPTCHA' });
	}

    return completeLogin(req, reply, user)
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message })
  }
}

const getToken = async function(req, reply) {
  const { id, token } = req.body
  const db = req.server.db

  if (!token) return reply.code(401).send({ error: "No refresh token provided "})
  
  const refreshToken = db.prepare('SELECT * FROM refresh_tokens WHERE refresh_token = ? AND user_id = ?')
    .get(token, id)

  if (!refreshToken) return reply.code(403).send({ error: "Invalid refresh token" })

  try {
    const user = await req.server.jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(req, { id: user.id, name: user.name });
    
    return reply.send({ accessToken });
  } catch (error) {
    console.log(error)
    return reply.code(403).send({ error: "Invalid or expired refresh token" });
  }
}

const googleAuthHandler = async function(req, reply) {
  const { code } = req.query
  const db = req.server.db

  if(!code) return reply.code(400).send({ error: 'Authorization code is required' })

  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code',
    })

    const { id_token } = data
    const profile =  await verifyIdToken(id_token)
    let user

    try {
      user = await db.prepare('SELECT id, name FROM users WHERE google_id = ?')
        .get(profile.sub)

      if(!user) {
        const avatar = process.env.DEFAULT_AVATAR
        let name = nameGenerator()

        while (await isNameTaken(req, name)) {
          name = nameGenerator()
        }

        db.prepare('INSERT INTO users (email, name, google_id, avatar) VALUES (?, ?, ?, ?)')
          .run(profile.email, name, profile.sub, avatar)
    
        const newUser = await db.prepare('SELECT id, name FROM users WHERE google_id = ?')
          .get(profile.sub)

        return completeGoogleLogin(req, reply, newUser)
      } 
    } catch (dbError) {
      console.error('Error with database', dbError)
      return reply.code(500).send({ error: dbError.message })
    }

    return completeGoogleLogin(req, reply, user)
  } catch (error) {
    console.error("Google Auth Error:", error.response?.data || error.message)
    if (error.response) {
      if (error.response.status === 400) {
        return reply.code(400).send({ error: 'Invalid request to Google API' })
      }
      if (error.response.status === 401) {
        return reply.code(401).send({ error: 'Invalid or expired Google authentication token' })
      }
    }

    if (error.message && error.message === 'Email is not verified by Google') {
      return reply.code(400).send({ error: 'Email not verified by Google. Please verify your email.' })
    }
  
    return reply.code(500).send({ error: error.message })
  }
}

export { loginUser, logoutUser, getToken, googleAuthHandler }