import { OAuth2Client } from 'google-auth-library'
const client = new OAuth2Client(process.env.CLIENT_ID);

function generateAccessToken (req, user) {
  return req.server.jwt.sign(user, { expiresIn: '1h' })
}

async function verifyIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID, 
  })

  const payload = ticket.getPayload()

  if (!payload.email_verified) {
    throw new Error('Email is not verified by Google');
  }

  return payload
}

const completeLogin = async function(req, reply, user) {
  const db = req.server.db

  try {
    const accessToken = generateAccessToken(req, { id: user.id, name: user.name })
    const refreshToken = req.server.jwt.sign(
      { id: user.id, name: user.name }, 
      process.env.REFRESH_TOKEN_SECRET, 
      { expiresIn: '7d' }
    )
    db.prepare('UPDATE users SET online_status = 1 WHERE name = ?')
      .run(user.name)
  
    db.prepare('INSERT INTO refresh_tokens (user_id, refresh_token) VALUES (?, ?)')
      .run(user.id, refreshToken)
  
    return reply.send({ userId: user.id, name: user.name, accessToken: accessToken, refreshToken: refreshToken })
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message})
  }
}

const completeGoogleLogin = async function(req, reply, user) {
  try {
    const accessToken = generateAccessToken(req, { id: user.id, name: user.name })
    const refreshToken = req.server.jwt.sign({ id: user.id, name: user.name }, process.env.REFRESH_TOKEN_SECRET)
  
    const updateStatement = req.server.db.prepare('UPDATE users SET online_status = 1 WHERE name = ?')
    updateStatement.run(user.name)
  
    const insertStatement = req.server.db.prepare('INSERT INTO refresh_tokens (user_id, refresh_token) VALUES (?, ?)')
    insertStatement.run(user.id, refreshToken)
  

    const html = `
    <html>
      <body>
        <script>
          window.opener.postMessage({
            userId: ${JSON.stringify(user.id)},
            name: ${JSON.stringify(user.name)},
            accessToken: ${JSON.stringify(accessToken)},
            refreshToken: ${JSON.stringify(refreshToken)}
          }, 'http://localhost:5173');
          window.close();
        </script>
      </body>
    </html>
  `;
  return (reply.header('Content-Type', 'text/html').send(html));

  } catch (error) {
    console.log(error)

    const html = `
    <html>
      <body>
        <script>
          window.opener.postMessage({
            error: "Google login failed. Please try again."
          }, 'http://localhost:5173');
          window.close();
        </script>
      </body>
    </html>
    `;
    return reply.header('Content-Type', 'text/html').send(html);
    // return reply.code(500).send({ error: error.message})
  }
}

export { completeLogin, completeGoogleLogin, verifyIdToken, generateAccessToken }
