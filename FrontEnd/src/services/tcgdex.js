const API_ROOT = import.meta.env.VITE_API_URL || '/api'
const TCGDEX_ROOT = 'https://api.tcgdex.net/v2/pt'
const POCKET_IMAGE_ROOT = 'https://raw.githubusercontent.com/Vociferix/ptcgp-images/master/cards'

function imageForPocketCard(card, setId) {
  if (card.image) return card.image.includes('/high.') ? card.image : `${card.image.replace(/\/$/, '')}/high.webp`
  if (!card.localId) return ''
  const number = String(card.localId).padStart(3, '0')
  return `${POCKET_IMAGE_ROOT}/${setId}/${number}.png`
}

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
    if (import.meta.env.VITE_TCGDEX_FALLBACK !== 'true') {
      throw new Error(`A API do PokApp não respondeu. Inicie o BackEnd local e tente novamente. (${backendError.message})`)
    }
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
        let cards = sourceSet.cards || []
        if (new URLSearchParams(route.split('?')[1] || '').get('includeBoosterDetails') === '1') {
          let nextIndex = 0
          async function worker() {
            while (nextIndex < cards.length) {
              const index = nextIndex++
              const cardId = cards[index].id
              try {
                cards[index] = await getJsonFrom(TCGDEX_ROOT, `/cards/${encodeURIComponent(cardId)}`)
              } catch {
                try {
                  cards[index] = await getJsonFrom('https://api.tcgdex.net/v2/en', `/cards/${encodeURIComponent(cardId)}`)
                } catch {
                  // Keep the card summary when its detail endpoint is unavailable.
                }
              }
            }
          }
          await Promise.all(Array.from({ length: Math.min(8, cards.length) }, worker))
        }
        return { data: cards, set }
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

export async function getSetDetails(setId) {
  const { data } = await getJson(`/tcgdex/sets/${encodeURIComponent(setId)}?lang=pt`)
  if (data?.boosters?.length) return data
  try {
    const englishSet = await getJsonFrom('https://api.tcgdex.net/v2/en', `/sets/${encodeURIComponent(setId)}`)
    if (englishSet?.boosters?.length) return englishSet
  } catch {
    // Retain the localized data if the English set endpoint is unavailable.
  }
  return data
}

export async function getCards(setId, { includeBoosterDetails = false } = {}) {
  const boosterQuery = includeBoosterDetails ? '&includeBoosterDetails=1' : ''
  const { data, set } = await getJson(`/tcgdex/sets/${encodeURIComponent(setId)}/cards?lang=pt${boosterQuery}`)
  let cards = Array.isArray(data) ? data : data?.cards || []
  if (includeBoosterDetails && cards.length && !cards.every(card => Object.hasOwn(card, 'boosters'))) {
    const detailedCards = new Map()
    let nextIndex = 0
    async function worker() {
      while (nextIndex < cards.length) {
        const index = nextIndex++
        const card = cards[index]
        try {
          detailedCards.set(card.id, await getJsonFrom(TCGDEX_ROOT, `/cards/${encodeURIComponent(card.id)}`))
        } catch {
          try {
            detailedCards.set(card.id, await getJsonFrom('https://api.tcgdex.net/v2/en', `/cards/${encodeURIComponent(card.id)}`))
          } catch {
            // Keep the locally cached card summary if its detail is unavailable.
          }
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(8, cards.length) }, worker))
    cards = cards.map(card => ({ ...card, ...(detailedCards.get(card.id) || {}) }))
  }
  const fallbackSet = set || {}
  return cards.filter(card => card.name).map(card => ({
    ...card,
    image: imageForPocketCard(card, card.setId || fallbackSet.id || setId),
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

export async function getAllCards() {
  const firstPage = await getJson('/tcgdex/cards?limit=200&offset=0')
  if (firstPage.total) {
    const pages = await Promise.all(Array.from({ length: Math.ceil(firstPage.total / 200) - 1 }, (_, index) =>
      getJson(`/tcgdex/cards?limit=200&offset=${(index + 1) * 200}`)))
    return [firstPage, ...pages].flatMap(page => page.data || []).map(card => ({
      ...card,
      image: imageForPocketCard(card, card.setId),
    }))
  }
  if (firstPage.cached) return []
  const sets = await getSets()
  const pages = await Promise.all(sets.map(set => getCards(set.id)))
  return pages.flat()
}

export async function getFeaturedCards(sets) {
  if (!sets.length) return []
  const selected = [...sets].sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || '')).slice(0, 3)
  const pages = await Promise.all(selected.map(set => getCards(set.id)))
  return pages.flat()
}
