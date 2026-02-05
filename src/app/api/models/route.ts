import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Supported Groq Models with metadata to match Ollama's format
const GROQ_MODELS = [
    {
        name: 'llama-3.1-8b-instant',
        model: 'llama-3.1-8b-instant',
        modified_at: new Date().toISOString(),
        size: 0,
        digest: 'groq-llama3.1-8b',
        details: { family: 'llama3.1', parameter_size: '8b', quantization_level: 'instant' }
    },
    {
        name: 'llama-3.3-70b-versatile',
        model: 'llama-3.3-70b-versatile',
        modified_at: new Date().toISOString(),
        size: 0,
        digest: 'groq-llama3.3-70b',
        details: { family: 'llama3.3', parameter_size: '70b', quantization_level: 'versatile' }
    },
    {
        name: 'mixtral-8x7b-32768',
        model: 'mixtral-8x7b-32768',
        modified_at: new Date().toISOString(),
        size: 0,
        digest: 'groq-mixtral',
        details: { family: 'mixtral', parameter_size: '8x7b', quantization_level: 'fp16' }
    },
    {
        name: 'gemma2-9b-it',
        model: 'gemma2-9b-it',
        modified_at: new Date().toISOString(),
        size: 0,
        digest: 'groq-gemma2',
        details: { family: 'gemma2', parameter_size: '9b', quantization_level: 'it' }
    }
];

export async function GET() {
    try {
        // Determine Provider
        const isProduction = process.env.NODE_ENV === 'production';
        const preferGroq = process.env.AI_PROVIDER === 'groq' || (isProduction && process.env.GROQ_API_KEY);

        if (preferGroq) {
            return NextResponse.json({ models: GROQ_MODELS });
        }

        // Fallback to Ollama (Local)
        const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        try {
            const response = await fetch(`${ollamaUrl}/api/tags`);
            if (!response.ok) {
                // If Ollama is down/unreachable, return empty or error? 
                // Better to return empty list to not break UI, or just throw to let catch handle it
                throw new Error('Failed to fetch from Ollama');
            }
            const data = await response.json();
            return NextResponse.json(data);
        } catch (ollamaError) {
            console.error('Error fetching from Ollama:', ollamaError);
            // If Ollama fails (e.g. not running), at least we don't crash the whole UI
            return NextResponse.json({ models: [] });
        }
    } catch (error) {
        console.error('Models API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}
