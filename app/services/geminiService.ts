import { GoogleGenerativeAI } from '@google/generative-ai';
import { Platform } from 'react-native';

const API_KEY_STORE = 'gemini_api_key';

function isWeb(): boolean {
  return Platform.OS === 'web';
}

export async function getApiKey(): Promise<string | null> {
  if (isWeb()) {
    return localStorage.getItem(API_KEY_STORE);
  }
  const SecureStore = require('expo-secure-store');
  return await SecureStore.getItemAsync(API_KEY_STORE);
}

export async function setApiKey(key: string): Promise<void> {
  if (isWeb()) {
    localStorage.setItem(API_KEY_STORE, key);
    return;
  }
  const SecureStore = require('expo-secure-store');
  await SecureStore.setItemAsync(API_KEY_STORE, key);
}

export async function clearApiKey(): Promise<void> {
  if (isWeb()) {
    localStorage.removeItem(API_KEY_STORE);
    return;
  }
  const SecureStore = require('expo-secure-store');
  await SecureStore.deleteItemAsync(API_KEY_STORE);
}

export async function sendMessage(
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    onError('API key not set. Go to Settings to add your Gemini API key.');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(message);

    let response = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      response += text;
      onChunk(response);
    }
    onDone();
  } catch (error: any) {
    onError(error.message || 'Failed to get response from Gemini');
  }
}