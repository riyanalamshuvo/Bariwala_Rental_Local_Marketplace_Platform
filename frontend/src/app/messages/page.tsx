'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { messagesApi } from '@/lib/api';

interface Conversation {
  partnerId: string;
  lastMessage: string;
  lastMessageAt: string;
  isRead: boolean;
  partner: { id: string; fullName: string; email: string; role: string };
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: { fullName: string };
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [thread, setThread] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    setLoadingConvos(true);
    try {
      const data = await messagesApi.conversations(token);
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvos(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  // Load conversations on mount
  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token, loadConversations]);

  // Handle query param for direct messaging from property/marketplace
  useEffect(() => {
    const toUser = searchParams.get('to');
    const toName = searchParams.get('name');
    if (toUser) {
      setPartnerId(toUser);
      setPartnerName(toName || 'User');
    }
  }, [searchParams]);

  // Load thread when partner changes
  useEffect(() => {
    if (partnerId && token) {
      setLoadingThread(true);
      messagesApi.thread(partnerId, token)
        .then(setThread)
        .catch(() => setThread([]))
        .finally(() => setLoadingThread(false));
    }
  }, [partnerId, token]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const selectConversation = useCallback((conv: Conversation) => {
    setPartnerId(conv.partnerId);
    setPartnerName(conv.partner?.fullName || 'User');
  }, []);

  const handleSend = useCallback(async () => {
    if (!newMsg.trim() || !token || !partnerId) return;
    try {
      await messagesApi.send({ receiverId: partnerId, content: newMsg }, token);
      setNewMsg('');
      // Refresh thread and conversations
      const msgs = await messagesApi.thread(partnerId, token);
      setThread(msgs);
      loadConversations();
    } catch {}
  }, [newMsg, token, partnerId, loadConversations]);

  const handleBack = useCallback(() => {
    setPartnerId(null);
    setThread([]);
    setPartnerName('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  }, [handleSend]);

  if (authLoading || !user) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">💬 Messages</h1>
      <p className="text-sm text-gray-500 mb-6">Stay connected with landlords, tenants, and sellers in real time.</p>

      <div className="soft-panel overflow-hidden flex" style={{ height: '600px' }}>
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white/80">
          <div className="px-4 py-3 bg-gray-50/90 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700 text-sm">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <p className="text-gray-400 text-center py-8 text-sm">Loading...</p>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-gray-400 text-sm">No conversations yet</p>
                <p className="text-gray-300 text-xs mt-1">Start one from a property or marketplace listing</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partnerId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                    partnerId === conv.partnerId ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {conv.partner?.fullName || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{conv.partner?.role}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <span className="text-xs text-gray-400">
                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                      </span>
                      {!conv.isRead && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white/60">
          {!partnerId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm mt-1">or start one from a property listing</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{partnerName}</span>
                </div>
                <button
                  onClick={handleBack}
                  className="text-sm hover:underline text-emerald-200"
                >
                  ← Back
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/70">
                {loadingThread ? (
                  <p className="text-gray-400 text-center">Loading messages...</p>
                ) : thread.length === 0 ? (
                  <p className="text-gray-400 text-center">No messages yet. Start the conversation!</p>
                ) : (
                  thread.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          m.senderId === user.id
                            ? 'bg-emerald-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        {m.senderId !== user.id && (
                          <p className="text-xs font-medium text-emerald-700 mb-1">
                            {m.sender?.fullName}
                          </p>
                        )}
                        <p>{m.content}</p>
                        <p className={`text-xs mt-1 ${m.senderId === user.id ? 'text-emerald-200' : 'text-gray-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="input-field flex-1"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMsg.trim()}
                  className="btn-primary px-6"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
