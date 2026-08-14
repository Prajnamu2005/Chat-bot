import { create } from 'zustand';
import { Chat, Message } from '../types';
import * as DB from '../services/db';
import { sendMessage } from '../services/geminiService';

interface ChatStore {
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingText: string;
  error: string | null;

  loadChats: () => Promise<void>;
  createNewChat: () => Promise<string>;
  selectChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, title: string) => Promise<void>;
  sendUserMessage: (text: string) => Promise<void>;
  clearError: () => void;
  clearAllChats: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChatId: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  streamingText: '',
  error: null,

  loadChats: async () => {
    const chats = await DB.getChats();
    set({ chats });
  },

  createNewChat: async () => {
    const chat = await DB.createChat('New Chat');
    await get().loadChats();
    set({ activeChatId: chat.id, messages: [] });
    return chat.id;
  },

  selectChat: async (chatId: string) => {
    const messages = await DB.getMessages(chatId);
    set({ activeChatId: chatId, messages });
  },

  deleteChat: async (chatId: string) => {
    await DB.deleteChat(chatId);
    const state = get();
    if (state.activeChatId === chatId) {
      set({ activeChatId: null, messages: [] });
    }
    await state.loadChats();
  },

  renameChat: async (chatId: string, title: string) => {
    await DB.updateChatTitle(chatId, title);
    await get().loadChats();
  },

  sendUserMessage: async (text: string) => {
    const { activeChatId, messages } = get();
    if (!activeChatId) return;

    set({ isLoading: true, isStreaming: true, error: null, streamingText: '' });

    const userMsg = await DB.addMessage(activeChatId, 'user', text);
    set({ messages: [...messages, userMsg] });

    const history = [...messages, userMsg].map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    await sendMessage(
      text,
      history,
      (chunk) => set({ streamingText: chunk }),
      async () => {
        const { streamingText, activeChatId: currentChatId } = get();
        if (currentChatId && streamingText) {
          const assistantMsg = await DB.addMessage(currentChatId, 'assistant', streamingText);
          set((state) => ({
            messages: [...state.messages, assistantMsg],
            isStreaming: false,
            streamingText: '',
            isLoading: false,
          }));
          await get().loadChats();
        }
      },
      (error) => {
        set({ error, isLoading: false, isStreaming: false, streamingText: '' });
      }
    );
  },

  clearError: () => set({ error: null }),

  clearAllChats: async () => {
    await DB.clearAllData();
    set({ chats: [], activeChatId: null, messages: [] });
  },
}));