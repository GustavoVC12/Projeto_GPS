const DB_NAME = 'pokapp-catalog-cache'
const STORE_NAME = 'catalogs'
const CATALOG_KEY = 'tcgp-cards-v1'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function readCachedCatalog() {
  try {
    const db = await openDatabase()
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(CATALOG_KEY)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  } catch { return null }
}

export async function saveCachedCatalog(cards) {
  try {
    const db = await openDatabase()
    await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(cards, CATALOG_KEY)
      request.onsuccess = resolve
      request.onerror = () => reject(request.error)
    })
  } catch { /* Cache local é opcional; catálogo continua vindo do BackEnd. */ }
}
