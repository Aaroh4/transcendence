import bcrypt from 'bcrypt'
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getUsers = async function (req, reply) {
  const db = req.server.db

  try {
    const users = db.prepare("SELECT * FROM users").all()

    if (users.length === 0) {
      return reply.code(404).send({ error: "No users found" })
    }
    return reply.send(users)
  } catch (error) {
      return reply.code(500).send({ error: error.message })
  }
}

const addUser = async function (req, reply) {
  const { name, email, password, captchaToken } = req.body
  const db = req.server.db
  const avatar = process.env.DEFAULT_AVATAR
  let hashedPassword = password
  const passwordPattern = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>?])/
  
  if (!passwordPattern.test(password)) {
    return reply.code(400).send({ error: 'Password must contain at least one digit, one letter, and one special character.' })
  }

  if (password) {
    const salt = await bcrypt.genSalt(10)
    hashedPassword = await bcrypt.hash(password, salt)
  }

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
		console.error('CAPTCHA verification failed:', data['error-codes']); 
	return reply.code(400).send({ error: 'Invalid CAPTCHA' });
	}

  try {
    const insertStatement = db.prepare('INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)')
    const result = insertStatement.run(name, email, hashedPassword, avatar)

    const user = {
      id: result.lastInsertRowid,
      name,
      email,
      avatar
    }

    return reply.code(201).send(user)
  } catch (error) {
    console.log(error)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return reply.code(409).send({ error: "Username or email already in use" })
    } else {
      return reply.code(500).send({ error: error.message })
    }
  }
}

const getUser = async function (req, reply) {
  const { id } = req.params
  const db = req.server.db

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?')
      .get(id)

    if (!user) {
      return reply.code(404).send({ error: "User not found" })
    }

    return reply.send(user)
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const deleteUser = async function (req, reply) {
  const db = req.server.db
  const userId = req.user.id

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?')
      .get(userId)
    
    if (!user) return reply.code(404).send({ error: "User not found"})
    
    db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?')
      .run(userId)

    db.prepare('DELETE FROM users WHERE id = ?')
      .run(userId)
    
    return reply.code(204).send()
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message })
  }
}

const updateUser = async function (req, reply) {
  const {id} = req.params
  const { name, email } = req.body
  const db = req.server.db

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?')
      .get(id)
    if (!user) {
      return reply.code(404).send({ error: 'User not found' })
    }

    db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
      .run(name, email, id)

    return reply.send({
      id,
      name,
      email
    })
  } catch (error) {
    console.log(error)
      return reply.code(500).send({ error: error.message })
  }
}

const updatePassword = async function (req, reply) {
  const {id} = req.params
  const { password } = req.body
  const db = req.server.db
  const passwordPattern = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>?])/

  if (!passwordPattern.test(password)) {
    return reply.code(400).send({ error: 'Password must contain at least one digit, one letter, and one special character.' })
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?')
      .get(id)

    if (!user) return reply.code(404).send({ error: 'User not found' })

    let hashedPassword = password

    if (password) {
      const salt = await bcrypt.genSalt(10)
      hashedPassword = await bcrypt.hash(password, salt)
    }

    db.prepare('UPDATE users SET password = ? WHERE id = ?')
      .run(hashedPassword, id)
   
    return reply.send({ message: `Password was changed for user ${id}` })
  } catch (error) {
    console.log(error)

    if (error.code === 'FST_ERR_VALIDATION') {
      return reply.code(400).send({ error: 'Minimum length for password is 8 and it has to contain atleast 1 digit and 1 special character' })
    } else {
      return reply.code(500).send({ error: error.message })
    }
  }
}

const uploadAvatar = async function(req, reply) {
  try {
    const userId = req.user.id
    const db = req.server.db
    const avatar = await req.file()
    const pump = util.promisify(pipeline)
    
    const uploadDir = path.join(__dirname, '../../public/avatars')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(avatar.mimetype)) {
      return reply.code(400).send({ error: 'Invalid file type' })
    }

    const uniqueId = crypto.randomBytes(16).toString('hex')
    const extension = path.extname(avatar.filename)
    const uniqueFilename = `${uniqueId}${extension}`
    const filePath = path.join(uploadDir, uniqueFilename)

    await pump(avatar.file, fs.createWriteStream(filePath))

    const avatarPath = `avatars/${uniqueFilename}`
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?')
      .run(avatarPath, userId)
    
    return reply.code(200).send({ avatar: avatarPath })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const searchUsers = async function(req, reply) {
  const db = req.server.db
  const { query } = req.query
  try {
    const results = db.prepare(`
      SELECT * FROM users
      WHERE name LIKE ? COLLATE NOCASE
    `).all(`%${query}%`)

    return reply.send(results)
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message })
  }
}

const getMatchHistory = async function (req, reply) {
  const db = req.server.db
  const { id } = req.params

  try {
    const matchHistory = db.prepare("SELECT * FROM match_history WHERE user_id = ?")
      .all(id)

    if (matchHistory.length === 0) {
      return reply.code(404).send({ error: "User has no match history" })
    }
    return reply.send(matchHistory)
  } catch (error) {
      return reply.code(500).send({ error: error.message })
  }
}

export { 
  getUser,
  addUser,
  getUsers,
  deleteUser,
  updateUser,
  updatePassword,
  getMatchHistory,
  uploadAvatar,
  searchUsers
}