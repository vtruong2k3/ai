'use client';

import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';
import { ModelSelector } from '@/components/model-selector';
import { FileUpload } from '@/components/file-upload';
import { useChatStore } from '@/store/chat.store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/notification.store';
import { useStreamChat } from '@/hooks/useStreamChat';

interface ChatInterfaceProps {
    sessionId: string | null;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
    const [selectedModel, setSelectedModel] = useState('deepseek-r1:8b');
    const [attachedFiles, setAttachedFiles] = useState<Array<{ file: File, base64?: string }>>([]);
    const [inputText, setInputText] = useState('');
    const { updateSession, getCurrentSession } = useChatStore();
    const { data: session } = useSession();
    const router = useRouter();

    // Custom streaming chat hook
    const { messages, status, sendMessage: sendStreamMessage, setMessages, error } = useStreamChat({
        id: sessionId || 'default',
        body: {
            model: selectedModel,
            files: attachedFiles.map((f) => ({
                name: f.file.name,
                type: f.file.type,
                data: f.base64 || '',
            })),
        },
        onFinish: () => {
            setAttachedFiles([]);
        },
        onError: (error) => {
            console.error('[ChatInterface] Error:', error);
            addNotification({
                type: 'error',
                message: error.message || 'Failed to send message',
                duration: 3000
            });
        },
    });

    const isLoading = status === 'loading' || status === 'streaming';
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load session messages when sessionId changes
    useEffect(() => {
        if (sessionId) {
            const sess = getCurrentSession();
            if (sess) {
                setMessages(sess.messages || []);
                if (sess.model) {
                    setSelectedModel(sess.model);
                }
            } else {
                setMessages([]);
            }
        } else {
            setMessages([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // Save messages to store whenever messages change
    useEffect(() => {
        if (sessionId && messages.length > 0) {
            const firstUserMsg = messages.find(m => m.role === 'user');
            const title = firstUserMsg?.content?.slice(0, 50) || 'New Chat';

            updateSession(sessionId, {
                messages,
                model: selectedModel,
                title,
                updatedAt: Date.now(),
            });
        }
    }, [messages, sessionId, selectedModel, updateSession]);

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const { addNotification } = useNotificationStore();

    const handleGuestLimit = () => {
        if (!session?.user) {
            const currentUsage = parseInt(localStorage.getItem('guest_usage') || '0');
            if (currentUsage >= 10) {
                addNotification({
                    type: 'warning',
                    message: "Bạn đã dùng hết 10 lượt miễn phí. Vui lòng đăng nhập để tiếp tục!",
                    duration: 5000
                });
                router.push('/login');
                return false;
            }
            localStorage.setItem('guest_usage', (currentUsage + 1).toString());
        }
        return true;
    };

    const handleSubmitMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || isLoading || !handleGuestLimit()) return;

        const userMessage = inputText;
        setInputText('');

        // Send message using custom hook
        await sendStreamMessage(userMessage);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitMessage();
        }
    };

    return (
        <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80"
            >
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                            <Bot className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                VuTruong Chat
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Powered by Groq AI
                            </p>
                        </div>
                    </div>
                    <ModelSelector
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                    />
                </div>
            </motion.header>

            {/* Messages Area */}
            <ScrollArea className="flex-1 min-h-0 px-4 py-6">
                <div className="container mx-auto max-w-4xl space-y-6">
                    <AnimatePresence mode="popLayout">
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                                    <Bot className="h-10 w-10 text-white" />
                                </div>
                                <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    Welcome to VuTruong Chat
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Start a conversation with Groq AI. Ask questions, get insights, or just chat!
                                </p>
                            </motion.div>
                        )}

                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                {message.role === 'assistant' && (
                                    <Avatar className="h-10 w-10 border-2 border-violet-500">
                                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600">
                                            <Bot className="h-5 w-5 text-white" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                <Card
                                    className={`max-w-[80%] p-4 ${message.role === 'user'
                                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                                        : 'bg-white dark:bg-slate-800'
                                        }`}
                                >
                                    <div
                                        className={`prose prose-sm max-w-none ${message.role === 'user'
                                            ? 'prose-invert'
                                            : 'dark:prose-invert'
                                            }`}
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </Card>

                                {message.role === 'user' && (
                                    <Avatar className="h-10 w-10 border-2 border-slate-300 dark:border-slate-600">
                                        <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700">
                                            <User className="h-5 w-5 text-white" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </motion.div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 justify-start"
                            >
                                <Avatar className="h-10 w-10 border-2 border-violet-500">
                                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600">
                                        <Bot className="h-5 w-5 text-white" />
                                    </AvatarFallback>
                                </Avatar>
                                <Card className="p-4 bg-white dark:bg-slate-800">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {status === 'loading' ? 'Đang gửi...' : 'Đang nhận phản hồi...'}
                                        </span>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80"
            >
                <div className="container mx-auto max-w-4xl p-4 space-y-3">
                    {/* File Upload */}
                    <FileUpload onFilesChange={setAttachedFiles} />

                    {/* Input Form */}
                    <form onSubmit={handleSubmitMessage} className="flex gap-3">
                        <Textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            className="min-h-[60px] max-h-[200px] resize-none rounded-xl border-slate-300 bg-white focus:border-violet-500 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !inputText.trim()}
                            className="h-[60px] w-[60px] shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </form>
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                        Press Enter to send • Shift+Enter for new line
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
