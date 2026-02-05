import { create } from 'zustand';
import type { ChatSession, ChatStore } from '@/types/chat.types';

export const useChatStore = create<ChatStore>()((set, get) => ({
    sessions: [],
    currentSessionId: null,

    addSession: async (session: ChatSession) => {
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Ensure cookies are sent
                body: JSON.stringify({
                    title: session.title,
                    model: session.model,
                }),
            });

            if (!response.ok) throw new Error('Failed to create session');

            const { session: newSession } = await response.json();

            set((state) => ({
                sessions: [newSession, ...state.sessions],
                currentSessionId: newSession.id,
            }));

            return newSession; // Return the created session with DB-generated ID
        } catch (error) {
            console.error('Add session error:', error);
            return null;
        }
    },

    updateSession: async (id: string, updates: Partial<ChatSession>) => {
        try {
            const response = await fetch(`/api/sessions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Ensure cookies are sent
                body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error('Failed to update session');

            const { session: updatedSession } = await response.json();

            set((state) => ({
                sessions: state.sessions.map((session) =>
                    session.id === id ? updatedSession : session
                ),
            }));
        } catch (error) {
            console.error('Update session error:', error);
        }
    },

    deleteSession: async (id: string) => {
        try {
            const response = await fetch(`/api/sessions/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete session');

            set((state) => {
                const newSessions = state.sessions.filter((s) => s.id !== id);
                const newCurrentId =
                    state.currentSessionId === id
                        ? newSessions[0]?.id || null
                        : state.currentSessionId;

                return {
                    sessions: newSessions,
                    currentSessionId: newCurrentId,
                };
            });
        } catch (error) {
            console.error('Delete session error:', error);
        }
    },

    setCurrentSession: (id: string) => {
        set({ currentSessionId: id });
    },

    getCurrentSession: () => {
        const state = get();
        return (
            state.sessions.find((s) => s.id === state.currentSessionId) || null
        );
    },

    clearAllSessions: () => {
        set({ sessions: [], currentSessionId: null });
    },

    // New method to load sessions from API
    loadSessions: async () => {
        try {
            const response = await fetch('/api/sessions');
            if (!response.ok) throw new Error('Failed to load sessions');

            const { sessions } = await response.json();
            set({ sessions });
        } catch (error) {
            console.error('Load sessions error:', error);
        }
    },
}));
