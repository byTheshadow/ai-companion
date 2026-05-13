// IndexedDB 封装（使用 idb 库）

import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'ai_companion_phone'
const DB_VERSION = 1

interface ACPDBSchema {
  messages: {
    key: string
    value: import('@/data/types').Message
    indexes: {
      'by-conversation': string
      'by-timestamp': number
    }
  }
  conversations: {
    key: string
    value: import('@/data/types').Conversation
  }
  images: {
    key: string
    value: {
      id: string
      data: string // base64
      character_id: string
      caption: string
      created_at: number
    }
  }
}

let dbInstance: IDBPDatabase<ACPDBSchema> | null = null

async function getDB(): Promise<IDBPDatabase<ACPDBSchema>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<ACPDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // messages store
      if (!db.objectStoreNames.contains('messages')) {
        const msgStore = db.createObjectStore('messages', { keyPath: 'id' })
        msgStore.createIndex('by-conversation', 'conversation_id')
        msgStore.createIndex('by-timestamp', 'timestamp')
      }
      // conversations store
      if (!db.objectStoreNames.contains('conversations')) {
        db.createObjectStore('conversations', { keyPath: 'id' })
      }
      // images store
      if (!db.objectStoreNames.contains('images')) {
        const imgStore = db.createObjectStore('images', { keyPath: 'id' })
        imgStore.createIndex('by-character', 'character_id')
      }
    },
  })

  return dbInstance
}

//===== Messages =====
export async function addMessage(msg: import('@/data/types').Message) {
  const db = await getDB()
  await db.put('messages', msg)
}

export async function getMessagesByConversation(convId: string): Promise<import('@/data/types').Message[]> {
  const db = await getDB()
  return db.getAllFromIndex('messages', 'by-conversation', convId)
}

export async function deleteMessagesByConversation(convId: string) {
  const db = await getDB()
  const msgs = await db.getAllKeysFromIndex('messages', 'by-conversation', convId)
  const tx = db.transaction('messages', 'readwrite')
  await Promise.all(msgs.map(id => tx.store.delete(id)))
  await tx.done
}

// ===== Conversations =====
export async function getAllConversations(): Promise<import('@/data/types').Conversation[]> {
  const db = await getDB()
  return db.getAll('conversations')
}

export async function getConversation(id: string) {
  const db = await getDB()
  return db.get('conversations', id)
}

export async function saveConversation(conv: import('@/data/types').Conversation) {
  const db = await getDB()
  await db.put('conversations', conv)
}

export async function deleteConversation(id: string) {
  const db = await getDB()
  await db.delete('conversations', id)await deleteMessagesByConversation(id)
}

// ===== Images =====
export async function saveImage(img: { id: string; data: string; character_id: string; caption: string; created_at: number }) {
  const db = await getDB()
  await db.put('images', img)
}

export async function getImagesByCharacter(charId: string) {
  const db = await getDB()
  return db.getAllFromIndex('images', 'by-character', charId)
}

export async function getAllImages() {
  const db = await getDB()
  return db.getAll('images')
}

export async function deleteImage(id: string) {
  const db = await getDB()
  await db.delete('images', id)
}

// ===== 全量导出/导入 =====
export async function exportAllDB() {
  const db = await getDB()
  return {
    messages: await db.getAll('messages'),
    conversations: await db.getAll('conversations'),
    images: await db.getAll('images'),
  }
}

export async function importAllDB(data: {
  messages?: import('@/data/types').Message[]
  conversations?: import('@/data/types').Conversation[]
  images?: { id: string; data: string; character_id: string; caption: string; created_at: number }[]
}) {
  const db = await getDB()
  if (data.messages) {
    const tx = db.transaction('messages', 'readwrite')
    await Promise.all(data.messages.map(m => tx.store.put(m)))
    await tx.done
  }
  if (data.conversations) {
    const tx = db.transaction('conversations', 'readwrite')
    await Promise.all(data.conversations.map(c => tx.store.put(c)))
    await tx.done
  }
  if (data.images) {
    const tx = db.transaction('images', 'readwrite')
    await Promise.all(data.images.map(i => tx.store.put(i)))
    await tx.done
  }
}

export async function clearAllDB() {
  const db = await getDB()
  await db.clear('messages')
  await db.clear('conversations')
  await db.clear('images')
}
