import { GoogleGenerativeAI } from '@google/generative-ai';

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key || key === 'your_api_key_here') {
    throw new Error('API key not configured. Add your Gemini API key to the .env file.');
  }
  return key;
}

export async function sendMessage(
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  let apiKey: string;
  try {
    apiKey = getApiKey();
  } catch (error: any) {
    onError(error.message);
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

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