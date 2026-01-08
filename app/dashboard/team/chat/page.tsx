'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCollection, createDocument, updateDocument } from '@/lib/hooks/useFirestore';
import { Timestamp, orderBy } from 'firebase/firestore';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'team';
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, loading } = useCollection<Message>('messages', [
    orderBy('createdAt', 'asc'),
  ]);

    // Mark all unread messages as read when chat opens
    useEffect(() => {
      if (!user || !messages) return;

      const unreadMessages = messages.filter(msg => !msg.isRead && msg.senderId !== user.uid);
      unreadMessages.forEach(async (msg) => {
        try {
          await updateDocument('messages', msg.id, { isRead: true });
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });
    }, [messages, user]);

  const formatTime = (createdAt: Timestamp) => {
    const date = createdAt?.toDate ? createdAt.toDate() : (createdAt as unknown as Date);
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    setSending(true);
    try {
      await createDocument<Message>('messages', {
        senderId: user.uid,
        senderName: user.email?.split('@')[0] || 'Team Member',
        senderRole: user.role || 'team',
        message: message.trim(),
        isRead: false,
      });

      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="team">
      <DashboardLayout>
        <div className="w-full h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] overflow-hidden bg-[#0b141a]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-950"
          >
            {/* Header */}
            <div className="bg-[#202c33] border-b border-[#1f2a30] px-4 py-3 md:mb-0 mb-0 sticky top-0 z-10 flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base text-white font-semibold">Owner Chat</p>
                <p className="text-[11px] md:text-sm text-gray-300">Direct communication with the project owner</p>
              </div>
              <div className="text-[11px] md:text-xs text-gray-300">Owner</div>
            </div>

            {/* Messages Area - WhatsApp Style */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 min-h-0 bg-gradient-to-b from-[#0b141a] via-[#0d1b22] to-[#111b21]">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-sm ${
                          msg.senderId === user?.uid
                            ? 'bg-[#005c4b] text-white rounded-br-none'
                            : 'bg-[#202c33] text-white rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] md:text-[10px] font-semibold opacity-80">
                            {msg.senderId === user?.uid ? 'You' : msg.senderRole === 'owner' ? 'Owner' : (msg.senderName || 'Team Member')}
                          </span>
                        </div>
                        <p className="text-sm md:text-base whitespace-pre-wrap break-words">{msg.message}</p>
                        <span suppressHydrationWarning
                          className={`text-[9px] md:text-[10px] block mt-1 ${
                            msg.senderId === user?.uid ? 'text-emerald-100' : 'text-gray-400'
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

            {/* Input Area - WhatsApp Style */}
            <div className="bg-[#202c33] border-t border-[#1f2a30] p-2.5 md:p-4">
              <form onSubmit={handleSend} className="flex gap-2 md:gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border border-[#2f3b43] rounded-full bg-[#111b21] text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#0cc14e] placeholder:text-gray-500"
                    disabled={sending}
                  />
                  <Button 
                    type="submit" 
                    isLoading={sending} 
                    disabled={!message.trim()}
                    className="rounded-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-[#005c4b] hover:bg-[#0a6f5b] text-white"
                  >
                    {sending ? '⏳' : '📤'}
                  </Button>
                </form>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
