const API_ROOT = import.meta.env.VITE_API_URL || '/api'
const TCGDEX_ROOT = 'https://api.tcgdex.net/v2/pt'

async function getJsonFrom(root, path) {
  const response = await fetch(`${root}${path}`, { headers: { accept: 'application/json' } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.detail || body.error || `PokApp API respondeu ${response.status}`)
  return body
}

async function getJson(path) {
  try {
    return await getJsonFrom(API_ROOT, path)
  } catch (backendError) {
    try {
      const route = path.replace(/^\/tcgdex/, '')
      if (route.startsWith('/sets?')) {
        const { sets = [] } = await getJsonFrom(TCGDEX_ROOT, route.replace('/sets?', '/series/tcgp?'))
        return { data: sets }
      }
      const cardsRoute = route.match(/^\/sets\/([^/]+)\/cards(?:\?.*)?$/)
      if (cardsRoute) {
        const set = await getJsonFrom(TCGDEX_ROOT, `/sets/${cardsRoute[1]}`)
        const sourceSet = set.cards?.length || !(set.cardCount?.official || set.cardCount?.total)
          ? set
          : await getJsonFrom('https://api.tcgdex.net/v2/en', `/sets/${cardsRoute[1]}`)
        return { data: sourceSet.cards || [], set }
      }
      return await getJsonFrom(TCGDEX_ROOT, route)
    } catch (tcgdexError) {
      throw new Error(`BackEnd: ${backendError.message}. TCGdex: ${tcgdexError.message}`)
    }
  }
}

export async function getSets() {
  const { data } = await getJson('/tcgdex/sets?lang=pt')
  const sets = Array.isArray(data) ? data : data?.sets || []
  return sets.map(set => ({
    id: set.id,
    name: set.name,
    logo: set.logo ? `${set.logo}.webp` : '',
    symbol: set.symbol ? `${set.symbol}.webp` : '',
    cardCount: set.cardCount?.total ?? 0,
    releaseDate: set.releaseDate ?? '',
    serie: set.serie?.name ?? 'Outros',
  }))
}

export async function getCards(setId) {
  const { data, set } = await getJson(`/tcgdex/sets/${encodeURIComponent(setId)}/cards?lang=pt`)
  const cards = Array.isArray(data) ? data : data?.cards || []
  const fallbackSet = set || {}
  return cards.filter(card => card.name).map(card => ({
    ...card,
    image: card.image.includes('/high.') ? card.image : `${card.image.replace(/\/$/, '')}/high.webp`,
    types: card.types || [],
    rarity: card.rarity || '',
    setId: card.setId || fallbackSet.id || setId,
    setName: card.setName || fallbackSet.name || '',
    setLogo: card.setLogo || (fallbackSet.logo ? `${fallbackSet.logo}.webp` : ''),
    setSymbol: card.setSymbol || (fallbackSet.symbol ? `${fallbackSet.symbol}.webp` : ''),
    serie: card.serie || fallbackSet.serie?.name || 'Pokémon TCG Pocket',
    setCardCount: card.setCardCount || fallbackSet.cardCount?.total || cards.length,
  }))
}

export async function getFeaturedCards(sets) {
  if (!sets.length) return []
  const selected = [...sets].sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || '')).slice(0, 3)
  const pages = await Promise.all(selected.map(set => getCards(set.id)))
  return pages.flat()
}
