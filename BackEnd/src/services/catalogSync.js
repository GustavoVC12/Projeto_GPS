const database = require('./cardDatabase')
const { listSetCards, listSets } = require('./tcgdexService')

let activeSync

async function syncAllCards() {
  if (activeSync) return activeSync
  activeSync = (async () => {
    const sets = await listSets('pt')
    let imported = 0
    const failures = []
    for (const summary of sets) {
      try {
        const { set, cards } = await listSetCards(summary.id, 'pt')
        database.saveSet(set)
        database.saveCards(cards)
        imported += cards.length
      } catch (error) {
        failures.push({ setId: summary.id, message: error.message })
      }
    }
    database.checkpoint()
    return { sets: sets.length, cards: imported, localCards: database.cardCount(), failures }
  })()
  try { return await activeSync } finally { activeSync = null }
}

module.exports = { syncAllCards }
