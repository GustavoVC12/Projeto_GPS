const API_ROOT = 'https://api.tcgdex.net/v2'
const SUPPORTED_LANGUAGES = new Set(['pt', 'en'])
const cache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

async function request(path, language = 'pt') {
  const key = `${language}:${path}`
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  const response = await fetch(`${API_ROOT}/${language}/${path}`, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) {
    const error = new Error(`TCGdex respondeu com status ${response.status}`)
    error.status = response.status
    throw error
  }

  const value = await response.json()
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
  return value
}

function languageFrom(value) {
  const language = String(value || 'pt').toLowerCase()
  return SUPPORTED_LANGUAGES.has(language) ? language : 'pt'
}

function toAssetUrl(url, quality = 'high', format = 'webp') {
  if (!url) return ''
  return `${url.replace(/\/$/, '')}/${quality}.${format}`
}

async function listSets(language) {
  const series = await request('series/tcgp', languageFrom(language))
  return series.sets ?? []
}

async function getSet(setId, language) {
  return request(`sets/${encodeURIComponent(setId)}`, languageFrom(language))
}

async function listSetCards(setId, language) {
  const lang = languageFrom(language)
  const set = await getSet(setId, lang)
  let sourceSet = set
  if (!(sourceSet.cards?.length) && (sourceSet.cardCount?.official || sourceSet.cardCount?.total)) {
    sourceSet = await getSet(setId, 'en')
  }
  const summaries = sourceSet.cards ?? []
  const cards = new Array(summaries.length)
  let nextIndex = 0
  async function worker() {
    while (nextIndex < summaries.length) {
      const index = nextIndex++
      const summary = summaries[index]
      try {
        let card
        try {
          card = await request(`cards/${encodeURIComponent(summary.id)}`, lang)
        } catch {
          card = await request(`cards/${encodeURIComponent(summary.id)}`, 'en')
        }
        cards[index] = {
          ...card,
          image: toAssetUrl(card.image),
          setId: set.id,
          setName: set.name,
          setLogo: toAssetUrl(set.logo),
          setSymbol: toAssetUrl(set.symbol),
          serie: set.serie?.name ?? 'Pokémon TCG Pocket',
          setCardCount: sourceSet.cardCount?.total ?? summaries.length,
        }
      } catch {
        cards[index] = { ...summary, image: toAssetUrl(summary.image), types: [], setId: set.id, setName: set.name, setCardCount: sourceSet.cardCount?.total ?? summaries.length }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, summaries.length) }, worker))
  return {
    set: {
      id: set.id,
      name: set.name,
      logo: toAssetUrl(set.logo),
      symbol: toAssetUrl(set.symbol),
      serie: set.serie?.name ?? 'Outros',
      releaseDate: set.releaseDate ?? '',
      cardCount: sourceSet.cardCount?.total ?? set.cardCount?.total ?? summaries.length,
    },
    cards,
  }
}

async function getCard(cardId, language) {
  const card = await request(`cards/${encodeURIComponent(cardId)}`, languageFrom(language))
  return { ...card, image: toAssetUrl(card.image, 'high', 'webp') }
}

module.exports = { getCard, getSet, listSetCards, listSets }
