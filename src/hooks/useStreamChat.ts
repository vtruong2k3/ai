/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import type { Message } from '@/types/chat.types';

export interface UseStreamChatOptions {
    id?: string;
    initialMessages?: Message[];
    body?: Record<string, any>;
    onFinish?: (message: Message) => void;
    onError?: (error: Error) => void;
}

export interface UseStreamChatReturn {
    messages: Message[];
    status: 'idle' | 'loading' | 'streaming' | 'error';
    sendMessage: (content: string) => Promise<void>;
    setMessages: (messages: Message[]) => void;
    error: Error | null;
}

export function useStreamChat(options: UseStreamChatOptions = {}): UseStreamChatReturn {
    const { id, initialMessages = [], body = {}, onFinish, onError } = options;

    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [status, setStatus] = useState<'idle' | 'loading' | 'streaming' | 'error'>('idle');
    const [error, setError] = useState<Error | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (content: string) => {
        const userMessage: Message = {
            id: nanoid(),
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
        };

        // Add user message immediately
        setMessages(prev => [...prev, userMessage]);
        setStatus('loading');
        setError(null);

        // Create assistant message placeholder
        const assistantMessageId = nanoid();
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
        };

        try {
            // Create abort controller for cancellation
            abortControllerRef.current = new AbortController();

            console.log('[useStreamChat] Sending request to /api/chat');
            console.log('[useStreamChat] Request payload:', {
                id,
                messagesCount: messages.length + 1,
                bodyModel: body?.model
            });

            // Call API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    messages: [...messages, userMessage],
                    ...body,
                }),
                signal: abortControllerRef.current.signal,
            });

            console.log('[useStreamChat] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[useStreamChat] API Error:', errorData);
                throw new Error(errorData.details || errorData.error || 'Failed to send message');
            }

            if (!response.body) {
                throw new Error('Response body is empty');
            }

            // Add empty assistant message
            setMessages(prev => [...prev, assistantMessage]);
            setStatus('streaming');

            // Read stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';

            console.log('[useStreamChat] Starting stream reading...');

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    console.log('[useStreamChat] Stream complete. Final length:', assistantContent.length);
                    break;
                }

                // Decode chunk
                const chunk = decoder.decode(value, { stream: true });
                console.log('[useStreamChat] Received chunk:', chunk);

                // Parse text stream (simple text chunks)
                // SDK v6 streams plain text chunks
                assistantContent += chunk;

                // Update assistant message
                setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId
                        ? { ...msg, content: assistantContent }
                        : msg
                ));
            }

            // Finalize
            const finalMessage: Message = {
                ...assistantMessage,
                content: assistantContent,
            };

            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId ? finalMessage : msg
            ));

            setStatus('idle');
            onFinish?.(finalMessage);

        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');

            // Don't treat abort as error
            if (error.name === 'AbortError') {
                setStatus('idle');
                return;
            }

            console.error('[useStreamChat] Message send failed:', error);
            setError(error);
            setStatus('error');
            onError?.(error);

            // Remove incomplete assistant message
            setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
        } finally {
            abortControllerRef.current = null;
        }
    }, [messages, id, body, onFinish, onError]);

    return {
        messages,
        status,
        sendMessage,
        setMessages,
        error,
    };
}
