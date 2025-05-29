import fp from 'fastify-plugin'
import { Logger, LogLevel } from './utils/logger.js';
import db from './dbInstance.js'

const log = new Logger(LogLevel.INFO);

async function dbInit(fastify, options) {
  log.info("Creating database");

//  db.exec(`
//    DROP TABLE IF EXISTS match_history;
//  `)

//  db.exec(`
//     DROP TABLE IF EXISTS tournament_players;
//  `)

//  db.exec(`
//     DROP TABLE IF EXISTS matches;
//  `)

//   db.exec(`
//      DROP TABLE IF EXISTS tournaments;
//   `)

// db.exec(`
//    DROP TABLE IF EXISTS tournaments;
// `)

//   db.exec(`
//     ALTER TABLE users RENAME COLUMN status TO online_status;
//  `);

//  db.exec(`
//     CREATE UNIQUE INDEX IF NOT EXISTS unique_number_index ON users (number);
//  `);

// db.exec(`
//   DROP TABLE IF EXISTS friends;
// `)


  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      google_id TEXT UNIQUE DEFAULT NULL,
      name TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      online_status INTEGER NOT NULL DEFAULT 0 CHECK(online_status IN (0 ,1)),
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      avatar TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      refresh_token TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      winner INTEGER,
      size INTEGER,
	    playerAmount INTEGER DEFAULT 0,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL CHECK(status IN ('created', 'ready', 'in_progress', 'completed')),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (winner) REFERENCES users(id) ON DELETE SET NULL
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS match_history (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      opponent_id INTEGER,
      user_score INTEGER,
      opponent_score INTEGER,
      winner_id INTEGER,
      round INTEGER,
      tournament_id INTEGER DEFAULT NULL,
      match_type TEXT CHECK(match_type IN ('single', 'tournament')),
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL,
      FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (opponent_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY,
      tournament_id INTEGER NOT NULL,
      round INTEGER NOT NULL,
      match_number INTEGER NOT NULL,
      player_one_id INTEGER DEFAULT NULL,
      player_two_id INTEGER DEFAULT NULL,
      player_one_prev_match INTEGER,
      player_two_prev_match INTEGER,
      winner_id INTEGER,
      room_id INTEGER DEFAULT NULL,
      status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting', 'in_progress', 'completed', 'bye')),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (player_one_id) REFERENCES users(id),
      FOREIGN KEY (player_two_id) REFERENCES users(id),
      FOREIGN KEY (winner_id) REFERENCES users(id),
      FOREIGN KEY (player_one_prev_match) REFERENCES matches(id),
      FOREIGN KEY (player_two_prev_match) REFERENCES matches(id)
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS tournament_players (
      id INTEGER PRIMARY KEY,
      tournament_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      is_ready INTEGER NOT NULL DEFAULT 0 CHECK(is_ready IN (0 ,1, 2)),
	  won_previous INTEGER DEFAULT 0,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(tournament_id, user_id)
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'declined', 'blocked')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
  
  db.prepare("DELETE FROM tournaments WHERE status != 'completed'").run()

  fastify.decorate("db", db);

  fastify.addHook("onClose", (fastify, done) => {
    db.close();
    done();
  });
  log.info("Database created successfully");
}

export default fp(dbInit);