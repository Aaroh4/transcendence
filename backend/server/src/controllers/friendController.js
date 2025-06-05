const friendRequest = async function(req, reply) {
  const userId = req.user.id
  const friendId = req.body.friendId
  const db = req.server.db

  if (!friendId) return reply.code(400).send({ error: "friend id is required" })

  if (userId === friendId) return reply.code(400).send({ error: "Cannot send friend request to yourself" })

  try {
    const existing = db
      .prepare('SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)')
      .get(userId, friendId, friendId, userId)

    if (existing) {
      if (existing.status === 'pending') {
        return reply.code(400).send({ error: "Friend request already sent" })
      } else if (existing.status === 'accepted') {
        return reply.code(400).send({ error: "Users are already friends" })
      } else if (existing.status === 'blocked') {
        return reply.code(400).send({ error: "User is blocked" })
      } else if (existing.status === 'declined') {
        db.prepare('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?')
          .run('pending', userId, friendId)
        return reply.send({ message: "Friend request re-sent after being declined" })
      }
    }

    db.prepare("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)")
      .run(userId, friendId, 'pending')

    return reply.send({ message: "Friend request sent successfully" })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const checkPending = async function(req, reply) {
  const db = req.server.db

  try {
    const friendRequests = db.prepare(`
      SELECT users.name, users.id, users.avatar
      FROM friends 
      JOIN users ON users.id = friends.user_id
      WHERE friend_id = ? AND status = ?
    `).all(req.user.id, 'pending')
    
    if (friendRequests.length === 0) return reply.code(204).send()
    
    return reply.send({
      request_count: friendRequests.length,
      data: friendRequests
    })
  } catch (error) {
    console.error('Database error:', error)
    return reply.code(500).send({ error: error.message })
  }
}

const acceptRequest = async function(req, reply) {
  const userId = req.user.id
  const friendId = req.body.friendId
  const db = req.server.db

  if (!friendId) return reply.code(400).send({ error: "friend id is required" })

  try{
    const request = db.prepare('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?')
      .get(friendId, userId)

    if (!request) return reply.code(404).send({ error: `No friend requests found from user: ${friendId}` })

    db.prepare('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?')
      .run('accepted', friendId, userId)
    
    const existingReverse = db.prepare('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?')
      .get(userId, friendId)
    
    if (!existingReverse) {
      db.prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)')
        .run(userId, friendId, 'accepted')
    }
    return reply.send({ error: `Friend request from user ${friendId} was accepted` })

  } catch (error) {
    console.error('Database error:', error)
    return reply.code(500).send({ error: error.message })
  }
}

const blockRequest = async function(req, reply) {
  const userId = req.user.id
  const friendId = req.body.friendId
  const db = req.server.db

  if (!friendId) return reply.code(400).send({ error: "friend id is required" })

  try{
    const request = db.prepare('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?')
      .get(friendId, userId)
  
    if (!request) return reply.code(404).send({ error: `No friend requests found from user: ${friendId}` })

    db.prepare('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?')
      .run('blocked', friendId, userId)

    return reply.send({ error: `Friend request from user ${friendId} was blocked`})
  } catch (error) {
    console.error('Database error:', error)
    return reply.code(500).send({ error: error.message })
  }
}

const getFriends = async function(req, reply) {
  const db = req.server.db

  try {
    const friends = db.prepare(`
      SELECT users.*
      FROM friends
      JOIN users ON users.id = friends.friend_id
      WHERE friends.user_id = ? AND friends.status = ?
    `).all(req.user.id, 'accepted')

    if (friends.length === 0) return reply.code(204).send()

    return reply.send(friends)
  } catch (error) {
    console.error('Database error:', error)
    return reply.code(500).send({ error: error.message })
  }
}

const declineRequest = async function(req, reply) {
  const userId = req.user.id
  const friendId = req.body.friendId
  const db = req.server.db

  if (!friendId) return reply.code(400).send({ error: "friend id is required" })

  try{
    const request = db.prepare('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?')
      .get(friendId, userId)
  
    if (!request) return reply.code(404).send({ error: `No friend requests found from user: ${friendId}` })

    db.prepare('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?')
      .run('declined', friendId, userId)

    return reply.send({error:`Friend request from user ${friendId} was declined`})
  } catch (error) {
    console.error('Database error:', error)
    return reply.code(500).send({ error: error.message })
  }
}

const removeFriend = async function(req, reply) {
  const userId = req.user.id
  const friendId = req.params.id
  const db = req.server.db

  try {
    const areFriends = db.prepare('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?')
      .get(userId, friendId)
    
    if (!areFriends) return reply.code(404).send({ message: `User ${friendId} is not on your friend list` })
    
    db.prepare(`DELETE FROM friends 
      WHERE (user_id = ? AND friend_id = ?) 
      OR (user_id = ? AND friend_id = ?)
    `).run(userId, friendId, friendId, userId)

    return reply.send({error: `Friend with id: ${friendId} has been removed`})
  } catch (error) {
    console.error('Database error:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export { 
  friendRequest, 
  checkPending, 
  acceptRequest, 
  blockRequest, 
  getFriends,
  declineRequest,
  removeFriend
}