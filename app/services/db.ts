import { Platform } from 'react-native';
import { Chat, Message } from '../types';

function isWeb(): boolean {
  return Platform.OS === 'web';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== Web (localStorage) =====

function getWebChats(): Chat[] {
  const raw = localStorage.getItem('chats');
  return raw ? JSON.parse(raw) : [];
}

function saveWebChats(chats: Chat[]): void {
  localStorage.setItem('chats', JSON.stringify(chats));
}

function getWebMessages(chatId: string): Message[] {
  const raw = localStorage.getItem(`messages_${chatId}`);
  return raw ? JSON.parse(raw) : [];
}

function saveWebMessages(chatId: string, messages: Message[]): void {
  localStorage.setItem(`messages_${chatId}`, JSON.stringify(messages));
}

// ===== SQLite (Mobile) =====

let db: any;

async function getDb() {
  if (!db) {
    const SQLite = require('expo-sqlite');
    db = await SQLite.openDatabaseAsync('chatbot.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chatId TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE
      );
    `);
  }
  return db;
}

// ===== Public API =====

export async function initDatabase(): Promise<void> {
  if (isWeb()) return;
  await getDb();
}

export async function createChat(title: string): Promise<Chat> {
  const chat: Chat = {
    id: generateId(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isWeb()) {
    const chats = getWebChats();
    chats.unshift(chat);
    saveWebChats(chats);
    return chat;
  }

  const database = await getDb();
  await database.runAsync(
    'INSERT INTO chats (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
    [chat.id, chat.title, chat.createdAt, chat.updatedAt]
  );
  return chat;
}

export async function getChats(): Promise<Chat[]> {
  if (isWeb()) {
    return getWebChats();
  }
  const database = await getDb();
  return await database.getAllAsync<Chat>('SELECT * FROM chats ORDER BY updatedAt DESC');
}

export async function deleteChat(id: string): Promise<void> {
  if (isWeb()) {
    const chats = getWebChats().filter((c) => c.id !== id);
    saveWebChats(chats);
    localStorage.removeItem(`messages_${id}`);
    return;
  }
  const database = await getDb();
  await database.runAsync('DELETE FROM messages WHERE chatId = ?', [id]);
  await database.runAsync('DELETE FROM chats WHERE id = ?', [id]);
}

export async function addMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
  const msg: Message = {
    id: generateId(),
    chatId,
    role,
    content,
    timestamp: Date.now(),
  };

  if (isWeb()) {
    const messages = getWebMessages(chatId);
    messages.push(msg);
    saveWebMessages(chatId, messages);
    const chats = getWebChats().map((c) => (c.id === chatId ? { ...c, updatedAt: msg.timestamp } : c));
    saveWebChats(chats);
    return msg;
  }

  const database = await getDb();
  await database.runAsync(
    'INSERT INTO messages (id, chatId, role, content, timestamp) VALUES (?, ?, ?, ?, ?)',
    [msg.id, msg.chatId, msg.role, msg.content, msg.timestamp]
  );
  await database.runAsync('UPDATE chats SET updatedAt = ? WHERE id = ?', [msg.timestamp, chatId]);
  return msg;
}

export async function getMessages(chatId: string): Promise<Message[]> {
  if (isWeb()) {
    return getWebMessages(chatId);
  }
  const database = await getDb();
  return await database.getAllAsync<Message>(
    'SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC',
    [chatId]
  );
}

export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  if (isWeb()) {
    const chats = getWebChats().map((c) => (c.id === chatId ? { ...c, title } : c));
    saveWebChats(chats);
    return;
  }
  const database = await getDb();
  await database.runAsync('UPDATE chats SET title = ? WHERE id = ?', [title, chatId]);
}

export async function clearAllData(): Promise<void> {
  if (isWeb()) {
    localStorage.removeItem('chats');
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('messages_'));
    keys.forEach((k) => localStorage.removeItem(k));
    return;
  }
  const database = await getDb();
  await database.runAsync('DELETE FROM messages');
  await database.runAsync('DELETE FROM chats');
}