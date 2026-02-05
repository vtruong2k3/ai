/**
 * Ollama API Types
 */

export interface OllamaModel {
    name: string;
    size: string;
    modified_at: string;
    digest?: string;
    details?: {
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
    };
}

export interface OllamaModelsResponse {
    models: OllamaModel[];
}

export interface OllamaChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    images?: string[];
}

export interface OllamaError {
    error: string;
    status_code?: number;
}
