import { GoogleGenerativeAI } from '@google/generative-ai';
import * as SecureStore from 'expo-secure-store';

const API_KEY_STORE = 'gemini_api_key';

export async function getApiKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(API_KEY_STORE);
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORE, key);
}

export async function clearApiKey(): Promise<void> {
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
