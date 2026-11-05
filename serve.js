const path = require('node:path')
const express = require('express')
const app = require('./BackEnd/src/app')

const frontendDirectory = path.join(__dirname, 'FrontEnd', 'dist')

app.use(express.static(frontendDirectory, {
  index: false,
  setHeaders(response, filePath) {
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      response.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    }
  },
}))

app.use((request, response, next) => {
  if (request.path.startsWith('/api')) {
    return response.status(404).json({ error: 'Rota da API não encontrada.' })
  }

  if (request.method !== 'GET') return next()
  return response.sendFile(path.join(frontendDirectory, 'index.html'))
})

module.exports = app
