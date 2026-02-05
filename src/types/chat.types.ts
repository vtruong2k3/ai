export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt?: Date | string;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    model?: string;
    createdAt: number;
    updatedAt: number;
}

export interface ChatStore {
    sessions: ChatSession[];
    currentSessionId: string | null;
    addSession: (session: ChatSession) => Promise<ChatSession | null>;
    updateSession: (id: string, updates: Partial<ChatSession>) => void;
    deleteSession: (id: string) => void;
    setCurrentSession: (id: string) => void;
    getCurrentSession: () => ChatSession | null;
    clearAllSessions: () => void;
    loadSessions: () => Promise<void>;
}
