const fs = require('node:fs')
const path = require('node:path')
const { DatabaseSync } = require('node:sqlite')

const bundledDirectory = path.join(__dirname, '../../data')
const isVercel = process.env.VERCEL === '1'
const directory = process.env.POKAPP_DATA_DIR || (isVercel
  ? path.join(require('node:os').tmpdir(), 'pokapp-data')
  : bundledDirectory)
fs.mkdirSync(directory, { recursive: true })

const databasePath = path.join(directory, 'pokapp.sqlite')
if (isVercel && !fs.existsSync(databasePath)) {
  const bundledDatabasePath = path.join(bundledDirectory, 'pokapp.sqlite')
  if (!fs.existsSync(bundledDatabasePath)) {
    throw new Error(`Catálogo local não encontrado no pacote da Vercel: ${bundledDatabasePath}`)
  }
  fs.copyFileSync(bundledDatabasePath, databasePath)
}

const db = new DatabaseSync(databasePath)
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS sets (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, symbol TEXT,
    serie TEXT, release_date TEXT, card_count INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, set_id TEXT NOT NULL,
    set_name TEXT, image TEXT, rarity TEXT, types TEXT, data TEXT NOT NULL,
    FOREIGN KEY(set_id) REFERENCES sets(id)
  );
  CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(set_id);
  CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name COLLATE NOCASE);
`)

const setUpsert = db.prepare(`INSERT INTO sets(id,name,logo,symbol,serie,release_date,card_count)
  VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,logo=excluded.logo,
  symbol=excluded.symbol,serie=excluded.serie,release_date=excluded.release_date,card_count=excluded.card_count`)
const cardUpsert = db.prepare(`INSERT INTO cards(id,name,set_id,set_name,image,rarity,types,data)
  VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,set_id=excluded.set_id,
  set_name=excluded.set_name,image=excluded.image,rarity=excluded.rarity,types=excluded.types,data=excluded.data`)

function saveSet(set) { setUpsert.run(set.id, set.name, set.logo, set.symbol, set.serie, set.releaseDate, set.cardCount) }
function saveCards(cards) {
  db.exec('BEGIN')
  try {
    cards.forEach(card => cardUpsert.run(
      card.id, card.name, card.setId, card.setName, card.image, card.rarity,
      JSON.stringify(card.types || []), JSON.stringify(card),
    ))
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
function listSets() { return db.prepare('SELECT * FROM sets ORDER BY release_date DESC, name').all() }
function searchCards({ q = '', setId = '', type = '', rarity = '', limit = 200, offset = 0 } = {}) {
  const filters = []; const values = []
  if (q) { filters.push('(name LIKE ? OR id LIKE ? OR set_name LIKE ?)'); values.push(`%${q}%`, `%${q}%`, `%${q}%`) }
  if (setId) { filters.push('set_id = ?'); values.push(setId) }
  if (rarity) { filters.push('rarity = ?'); values.push(rarity) }
  if (type) { filters.push('types LIKE ?'); values.push(`%"${type}"%`) }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
  const total = db.prepare(`SELECT COUNT(*) AS count FROM cards ${where}`).get(...values).count
  const rows = db.prepare(`SELECT data FROM cards ${where} ORDER BY name COLLATE NOCASE LIMIT ? OFFSET ?`).all(...values, limit, offset)
  return { data: rows.map(row => JSON.parse(row.data)), total, limit, offset }
}
function cardCount() { return db.prepare('SELECT COUNT(*) AS count FROM cards').get().count }
function checkpoint() { db.exec('PRAGMA wal_checkpoint(TRUNCATE)') }

module.exports = { saveSet, saveCards, listSets, searchCards, cardCount, checkpoint }
