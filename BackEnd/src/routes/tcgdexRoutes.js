const express = require('express')
const { getCard, getSet, listSetCards, listSets } = require('../services/tcgdexService')
const cardDatabase = require('../services/cardDatabase')
const { syncAllCards } = require('../services/catalogSync')

const router = express.Router()
const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)

router.get('/sets', asyncRoute(async (req, res) => {
  const localSets = cardDatabase.listSets()
  res.json({ data: localSets.length ? localSets : await listSets(req.query.lang), cached: localSets.length > 0 })
}))

router.get('/cards', (req, res) => {
  const result = cardDatabase.searchCards({
    q: String(req.query.q || '').slice(0, 100),
    setId: String(req.query.setId || ''),
    type: String(req.query.type || ''),
    rarity: String(req.query.rarity || ''),
    limit: Math.min(200, Math.max(1, Number(req.query.limit) || 100)),
    offset: Math.max(0, Number(req.query.offset) || 0),
  })
  res.json({ ...result, cached: true })
})

router.post('/sync', asyncRoute(async (_req, res) => res.json(await syncAllCards())))

router.get('/sets/:setId', asyncRoute(async (req, res) => {
  const set = await getSet(req.params.setId, req.query.lang)
  res.json({ data: set })
}))

router.get('/sets/:setId/cards', asyncRoute(async (req, res) => {
  const cached = cardDatabase.searchCards({ setId: req.params.setId, limit: 1000 })
  if (cached.total) return res.json({ data: cached.data, set: cardDatabase.listSets().find(item => item.id === req.params.setId), cached: true })
  const result = await listSetCards(req.params.setId, req.query.lang)
  res.json({ data: result.cards, set: result.set })
}))

router.get('/cards/:cardId', asyncRoute(async (req, res) => {
  const card = await getCard(req.params.cardId, req.query.lang)
  res.json({ data: card })
}))

module.exports = router
