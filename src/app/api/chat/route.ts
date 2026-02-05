/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { createGroq } from '@ai-sdk/groq';

export const runtime = 'nodejs';

// Initialize Providers
const ollama = createOllama({
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
});

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    console.log('[Chat API] ===== New Request =====');
    try {
        const body = await req.json();
        console.log('[Chat API] Request body keys:', Object.keys(body));
        console.log('[Chat API] Request body:', JSON.stringify(body, null, 2));

        // SDK v5 sends messages differently - can be in 'messages' or need to construct from current message
        let messages = body.messages;
        const { model = 'deepseek-r1:8b', files = [] } = body;

        console.log('[Chat API] Extracted messages:', messages, 'Type:', typeof messages, 'IsArray:', Array.isArray(messages));

        // If no messages array, SDK v5 might send just the new message
        if (!messages || !Array.isArray(messages)) {
            console.log('[Chat API] messages is not a valid array, constructing...');
            // Try to get from body directly or construct minimal messages array
            if (body.content || body.role) {
                messages = [{ role: body.role || 'user', content: body.content || '' }];
            } else if (body.message) {
                // SDK v5 might send a single 'message' object
                messages = [body.message];
            } else {
                // Fallback
                console.error('[Chat API] ERROR: No valid messages format found in request body:', body);
                messages = [];
            }
        }

        console.log('[Chat API] Final messages array:', messages, 'Length:', messages?.length);

        if (!messages || messages.length === 0) {
            throw new Error('No messages provided in request');
        }

        // Determine Provider
        // Priority:
        // 1. If explicit env var AI_PROVIDER is set
        // 2. If in Production -> Groq
        // 3. If in Development -> Ollama
        let provider;
        let modelName = model;

        const isProduction = process.env.NODE_ENV === 'production';
        const preferGroq = process.env.AI_PROVIDER === 'groq' || (isProduction && process.env.GROQ_API_KEY);

        if (preferGroq) {
            provider = groq;
            // Map Ollama models to Groq equivalents if needed, or use a default Groq model
            // Common Groq models: llama-3.1-8b-instant, llama-3.3-70b-versatile, mixtral-8x7b-32768
            if (modelName.includes('deepseek') || modelName.includes('llama')) {
                modelName = 'llama-3.1-8b-instant'; // Fallback to fast Llama 3.1 on Groq
            }
            console.log('[Chat API] Using Groq provider with model:', modelName);
        } else {
            provider = ollama;
            console.log('[Chat API] Using Ollama provider with model:', modelName);
        }

        // Convert messages manually instead of using convertToCoreMessages
        // because SDK v5's function has issues with certain message formats
        console.log('[Chat API] Converting messages manually...');
        interface MessageInput {
            role: 'user' | 'assistant' | 'system';
            content?: string;
            text?: string;
        }

        interface ApiMessage {
            role: 'user' | 'assistant' | 'system';
            content: string | Array<{ type: string; text?: string; image?: string }>;
        }

        const coreMessages: ApiMessage[] = messages.map((msg: MessageInput) => ({
            role: msg.role,
            content: msg.content || msg.text || '',
        }));
        console.log('[Chat API] Converted messages count:', coreMessages.length);

        // Handle images for the last message if present
        if (files.length > 0) {
            const lastMessage = coreMessages[coreMessages.length - 1];
            if (lastMessage.role === 'user') {
                interface FileInput {
                    type: string;
                    data: string;
                }

                const imageParts = files
                    .filter((f: FileInput) => f.type.startsWith('image/'))
                    .map((f: FileInput) => ({ type: 'image' as const, image: f.data }));

                if (imageParts.length > 0) {
                    lastMessage.content = [
                        { type: 'text', text: typeof lastMessage.content === 'string' ? lastMessage.content : '' },
                        ...imageParts
                    ];
                }
            }
        }

        console.log('[Chat API] Calling streamText with model:', modelName);
        console.log('[Chat API] First message:', coreMessages[0]);
        console.log('[Chat API] Last message:', coreMessages[coreMessages.length - 1]);

        const result = await streamText({
            model: provider(modelName) as any,
            messages: coreMessages as any,
            onFinish: (result) => {
                console.log('[Chat API] Stream finished.');
                console.log('[Chat API] Token usage:', result.usage);
                console.log('[Chat API] Finish reason:', result.finishReason);
                console.log('[Chat API] Full text length:', result.text.length);
            },
            onError: (error) => {
                console.error('[Chat API] Stream error:', error);
            },
        });

        console.log('[Chat API] Returning response...');
        return result.toTextStreamResponse();
    } catch (error) {
        console.error('[Chat API] ERROR:', error);
        console.error('[Chat API] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return new Response(
            JSON.stringify({
                error: 'Failed to process chat request',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
