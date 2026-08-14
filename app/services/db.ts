import * as SQLite from 'expo-sqlite';
import { Chat, Message } from '../types';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
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

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function createChat(title: string): Promise<Chat> {
  const chat: Chat = {
    id: generateId(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.runAsync(
    'INSERT INTO chats (id, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
    [chat.id, chat.title, chat.createdAt, chat.updatedAt]
  );
  return chat;
}

export async function getChats(): Promise<Chat[]> {
  return await db.getAllAsync<Chat>('SELECT * FROM chats ORDER BY updatedAt DESC');
}

export async function deleteChat(id: string): Promise<void> {
  await db.runAsync('DELETE FROM messages WHERE chatId = ?', [id]);
  await db.runAsync('DELETE FROM chats WHERE id = ?', [id]);
}

export async function addMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
  const msg: Message = {
    id: generateId(),
    chatId,
    role,
    content,
    timestamp: Date.now(),
  };
  await db.runAsync(
    'INSERT INTO messages (id, chatId, role, content, timestamp) VALUES (?, ?, ?, ?, ?)',
    [msg.id, msg.chatId, msg.role, msg.content, msg.timestamp]
  );
  await db.runAsync('UPDATE chats SET updatedAt = ? WHERE id = ?', [msg.timestamp, chatId]);
  return msg;
}

export async function getMessages(chatId: string): Promise<Message[]> {
  return await db.getAllAsync<Message>(
    'SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC',
    [chatId]
  );
}

export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  await db.runAsync('UPDATE chats SET title = ? WHERE id = ?', [title, chatId]);
}

export async function clearAllData(): Promise<void> {
  await db.runAsync('DELETE FROM messages');
  await db.runAsync('DELETE FROM chats');
}
