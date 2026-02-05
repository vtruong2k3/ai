/* eslint-disable @typescript-eslint/no-explicit-any */
import { OllamaModelsResponse, OllamaModel, OllamaError } from '@/types/ollama.types';

/**
 * Ollama Service
 * Centralized API calls to Ollama server
 */

const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';

class OllamaService {
    private baseUrl: string;

    constructor(baseUrl: string = OLLAMA_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Fetch all available models from Ollama
     * @returns Promise with array of models
     * @throws Error if request fails
     */
    async getModels(): Promise<OllamaModel[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: OllamaModelsResponse = await response.json();
            return data.models || [];
        } catch (error) {
            console.error('Failed to fetch Ollama models:', error);
            throw error;
        }
    }

    /**
     * Check if Ollama server is running
     * @returns Promise with boolean
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000), // 5s timeout
            });
            return response.ok;
        } catch (error) {
            console.error('Ollama health check failed:', error);
            return false;
        }
    }

    /**
     * Get model information
     * @param modelName - Name of the model
     * @returns Promise with model info
     */
    async getModelInfo(modelName: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/show`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: modelName }),
            });

            if (!response.ok) {
                throw new Error(`Failed to get model info: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Failed to get info for model ${modelName}:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const ollamaService = new OllamaService();

// Export class for testing or custom instances
export default OllamaService;
