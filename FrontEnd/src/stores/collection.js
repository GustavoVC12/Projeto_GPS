import { defineStore } from 'pinia'

const STORAGE_KEY = 'pokapp-collection-v1'
const SAVED_COLLECTIONS_KEY = 'pokapp-named-collections-v1'
function readStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
function readSavedCollections() {
  try { return JSON.parse(localStorage.getItem(SAVED_COLLECTIONS_KEY) || '[]') } catch { return [] }
}

export const useCollectionStore = defineStore('collection', {
  state: () => ({ cards: readStorage(), savedCollections: readSavedCollections() }),
  getters: {
    selectedIds: state => new Set(Object.keys(state.cards)),
    count: state => Object.values(state.cards).reduce((sum, card) => sum + (card.quantity || 1), 0),
    bySet: state => {
      const groups = {}
      Object.values(state.cards).forEach(card => {
        if (!groups[card.setId]) groups[card.setId] = { id: card.setId, name: card.setName, logo: card.setLogo, symbol: card.setSymbol, serie: card.serie, cardCount: 0, cards: [] }
        groups[card.setId].cardCount = Math.max(groups[card.setId].cardCount, card.setCardCount || 0)
        groups[card.setId].cards.push(card)
      })
      return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name))
    },
  },
  actions: {
    persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cards)) },
    persistSavedCollections() { localStorage.setItem(SAVED_COLLECTIONS_KEY, JSON.stringify(this.savedCollections)) },
    toggle(card) {
      if (this.cards[card.id]) delete this.cards[card.id]
      else this.cards[card.id] = { ...card, setCardCount: card.setCardCount || card.setTotal || 0, quantity: 1 }
      this.persist()
    },
    setQuantity(id, quantity) {
      const card = this.cards[id]
      if (!card) return
      if (quantity <= 0) delete this.cards[id]
      else card.quantity = Math.min(2, quantity)
      this.persist()
    },
    clearSet(setId) {
      Object.keys(this.cards).filter(id => this.cards[id].setId === setId).forEach(id => delete this.cards[id])
      this.persist()
    },
    saveCollection(name) {
      const title = name.trim()
      const cards = Object.values(this.cards).map(card => ({ ...card }))
      if (!title || !cards.length) return false
      this.savedCollections.unshift({
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: title,
        cards,
        createdAt: new Date().toISOString(),
      })
      this.persistSavedCollections()
      return true
    },
    deleteCollection(id) {
      this.savedCollections = this.savedCollections.filter(collection => collection.id !== id)
      this.persistSavedCollections()
    },
    updateSavedCollectionCard(collectionId, cardId, quantity) {
      this.savedCollections = this.savedCollections.map(saved => {
        if (saved.id !== collectionId) return saved
        const cards = quantity <= 0
          ? saved.cards.filter(card => card.id !== cardId)
          : saved.cards.map(card => card.id === cardId ? { ...card, quantity: Math.min(2, quantity) } : card)
        return { ...saved, cards }
      })
      this.persistSavedCollections()
    },
    toggleSavedCollectionCard(collectionId, card) {
      const saved = this.savedCollections.find(item => item.id === collectionId)
      if (!saved) return
      const hasCard = saved.cards.some(item => item.id === card.id)
      this.savedCollections = this.savedCollections.map(item => item.id !== collectionId ? item : {
        ...item,
        cards: hasCard
          ? item.cards.filter(existing => existing.id !== card.id)
          : [...item.cards, { ...card, quantity: 1 }],
      })
      this.persistSavedCollections()
    },
    renameSavedCollection(collectionId, name) {
      this.savedCollections = this.savedCollections.map(item => item.id === collectionId ? { ...item, name: name.slice(0, 40) } : item)
      this.persistSavedCollections()
    },
  },
})
