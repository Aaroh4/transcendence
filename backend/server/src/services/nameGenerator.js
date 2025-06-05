import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

const nameGenerator = () => {
  const username = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '',
    length: 2,
    style: 'lowerCase',
  }) + Math.floor(Math.random() * 100)
  
  return username
}

const isNameTaken = async function(req, name) {
  const user = req.server.db
  .prepare('SELECT * FROM users WHERE name = ?')
  .get(name)

  if (!user) return false
  return true
}

export { nameGenerator, isNameTaken }