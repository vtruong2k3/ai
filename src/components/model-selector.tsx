'use client';

import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Cpu } from 'lucide-react';
import { ollamaService } from '@/services/ollama.service';
import { OllamaModel } from '@/types/ollama.types';

interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (model: string) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAvailableModels = async () => {
        try {
            setLoading(true);
            // Fetch from our own API which handles Provider logic (Ollama vs Groq)
            const response = await fetch('/api/models');
            if (!response.ok) throw new Error('Failed to fetch models');
            const data = await response.json();
            setModels(data.models || []);
        } catch (error) {
            console.error('Failed to fetch models:', error);
            setModels([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailableModels();
    }, []);

    return (
        <div className="flex items-center gap-1 md:gap-2">
            <Cpu className="h-3 w-3 md:h-4 md:w-4 text-slate-500" />
            <Select value={selectedModel} onValueChange={onModelChange} disabled={loading}>
                <SelectTrigger className="w-[140px] sm:w-[180px] md:w-[200px] h-8 md:h-9 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs md:text-sm">
                    <SelectValue placeholder={loading ? 'Loading...' : 'Select model'} />
                </SelectTrigger>
                <SelectContent>
                    {models.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                            {model.name}
                        </SelectItem>
                    ))}
                    {models.length === 0 && !loading && (
                        <SelectItem value="none" disabled>
                            No models found
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
