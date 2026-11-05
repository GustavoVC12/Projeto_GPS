const express = require('express')
const { getCard, getSet, listSetCards, listSets } = require('../services/tcgdexService')

const router = express.Router()
const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)

router.get('/sets', asyncRoute(async (req, res) => {
  const sets = await listSets(req.query.lang)
  res.json({ data: sets })
}))

router.get('/sets/:setId', asyncRoute(async (req, res) => {
  const set = await getSet(req.params.setId, req.query.lang)
  res.json({ data: set })
}))

router.get('/sets/:setId/cards', asyncRoute(async (req, res) => {
  const result = await listSetCards(req.params.setId, req.query.lang)
  res.json({ data: result.cards, set: result.set })
}))

router.get('/cards/:cardId', asyncRoute(async (req, res) => {
  const card = await getCard(req.params.cardId, req.query.lang)
  res.json({ data: card })
}))

module.exports = router
