const app = require('./app')

const port = Number(process.env.PORT) || 3000
app.listen(port, () => console.log(`PokApp API disponível em http://localhost:${port}`))
