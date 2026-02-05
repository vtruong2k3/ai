'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Bot, Chrome } from 'lucide-react';

export default function LoginPage() {
    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: '/?login=success' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    {/* Logo & Title */}
                    <div className="flex flex-col items-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                        >
                            <Bot className="w-10 h-10 text-white" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                        >
                            VuTruong Chat
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-600 dark:text-gray-300 text-center"
                        >
                            Đăng nhập để bắt đầu trò chuyện với AI
                        </motion.p>
                    </div>

                    {/* Google Sign In Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button
                            onClick={handleGoogleSignIn}
                            className="w-full h-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Chrome className="w-5 h-5 mr-3" />
                            <span className="font-semibold">Đăng nhập với Google</span>
                        </Button>
                    </motion.div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                Hoặc
                            </span>
                        </div>
                    </div>

                    {/* Guest Mode */}
                    <Button
                        variant="outline"
                        className="w-full h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => {
                            // Set guest mode cookie (expires in 1 day)
                            document.cookie = "guest-mode=true; path=/; max-age=86400";
                            window.location.href = '/';
                        }}
                    >
                        <span className="text-gray-700 dark:text-gray-300">
                            Tiếp tục không đăng nhập (Giới hạn 10 câu)
                        </span>
                    </Button>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Bằng việc đăng nhập, bạn đồng ý với{' '}
                            <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">
                                Điều khoản dịch vụ
                            </a>{' '}
                            và{' '}
                            <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">
                                Chính sách bảo mật
                            </a>
                        </p>
                    </motion.div>
                </Card>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 grid grid-cols-3 gap-4 text-center"
                >
                    <div className="text-gray-600 dark:text-gray-300">
                        <div className="text-2xl mb-1">🔒</div>
                        <p className="text-xs">Bảo mật</p>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                        <div className="text-2xl mb-1">⚡</div>
                        <p className="text-xs">Nhanh chóng</p>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                        <div className="text-2xl mb-1">🌐</div>
                        <p className="text-xs">Sync đa thiết bị</p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
