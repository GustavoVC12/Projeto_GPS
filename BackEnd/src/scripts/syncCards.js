const { syncAllCards } = require('../services/catalogSync')

syncAllCards()
  .then(result => {
    console.log(`Sincronização concluída: ${result.localCards} cartas em ${result.sets} expansões.`)
    if (result.failures.length) console.warn('Expansões com falha:', result.failures)
  })
  .catch(error => { console.error('Falha ao sincronizar catálogo:', error); process.exitCode = 1 })
