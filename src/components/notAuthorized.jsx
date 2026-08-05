import { motion } from 'framer-motion';
import Head from 'next/head';

export default function NotAuthorizedPage() {
    return (
        <>
            <Head>
                <title>Access Denied - Not Authorized</title>
                <meta name="description" content="You don't have permission to access this page" />
            </Head>

            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
                                <div className="relative w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4"
                        >
                            Access Denied
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-base text-gray-600 text-center mb-8"
                        >
                            You don't have permission to view this page. Please contact your administrator or sign in with different credentials.
                        </motion.p>
                    </div>

                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center text-gray-500"
                >
                    <p>Error code: 403 Forbidden</p>
                </motion.div>
            </div>
        </>
    );
}