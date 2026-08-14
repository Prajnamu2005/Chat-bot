export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type RootStackParamList = {
  ChatList: undefined;
  Chat: { chatId: string };
};