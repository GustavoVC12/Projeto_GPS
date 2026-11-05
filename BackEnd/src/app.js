const express = require('express')
const tcgdexRoutes = require('./routes/tcgdexRoutes')

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'PokApp API' }))
app.use('/api/tcgdex', tcgdexRoutes)

app.use((error, _req, res, _next) => {
  const status = error.status || (error.name === 'TimeoutError' ? 504 : 502)
  res.status(status).json({ error: 'Não foi possível consultar o catálogo agora.', detail: error.message })
})

module.exports = app
