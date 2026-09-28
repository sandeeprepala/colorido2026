import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Trash2, Shield, User, Sparkles, AlertCircle } from 'lucide-react';
import { discussionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../hooks/useRealtime';

export default function DiscussionPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await discussionAPI.getDiscussion();
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Discussion fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime SSE updates
  useRealtime({
    DISCUSSION_MESSAGE_ADDED: (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    },
    DISCUSSION_MESSAGE_DELETED: ({ id }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    },
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      const res = await discussionAPI.postMessage({ message: inputText.trim() });
      setInputText('');
      // Optimistic update
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data.data.id)) return prev;
        return [...prev, res.data.data];
      });
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this message as moderator?')) return;
    try {
      await discussionAPI.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-[#8E44FF] bg-purple-100 px-3 py-1 rounded-full inline-block border border-purple-200">
          STUDENT COMMUNITY
        </span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-[#121217] tracking-tight">
          FESTIVAL DISCUSSION
        </h1>
        <p className="text-stone-600 font-semibold text-xs sm:text-sm">
          Connect with contingents, ask event questions, arrange squad meetups, and share festival hype!
        </p>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white border-3 border-[#121217] rounded-3xl fest-shadow-lg overflow-hidden flex flex-col h-[560px]">
        
        {/* Chat Banner */}
        <div className="bg-[#FAF8F5] border-b-2 border-[#121217] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-display font-black text-sm text-[#121217]">
              #general-festival-hall
            </span>
          </div>
          <span className="text-xs font-bold text-stone-500">
            {messages.length} messages
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50">
          {loading ? (
            <div className="text-center py-20 text-stone-400 text-xs font-bold">
              Loading community chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-stone-400 text-xs font-bold">
              No messages yet. Be the first to start the festival chat!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = user?.id === msg.user_id;
              const isMsgAdmin = msg.user_role === 'admin';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-bold text-stone-500">
                    <span className="text-[#121217]">{msg.user_name}</span>
                    {isMsgAdmin ? (
                      <span className="bg-[#8E44FF] text-white text-[9px] px-1.5 py-0.2 rounded font-black uppercase flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : (
                      <span className="text-stone-400 font-normal">
                        ({msg.user_dept || 'Student'})
                      </span>
                    )}
                    <span>·</span>
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Admin delete moderation button */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        title="Delete message"
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed border-2 ${
                      isMe
                        ? 'bg-[#19CFE8]/20 border-[#121217] text-[#121217] rounded-tr-xs'
                        : isMsgAdmin
                        ? 'bg-purple-50 border-[#8E44FF] text-purple-950 rounded-tl-xs'
                        : 'bg-white border-stone-300 text-stone-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t-2 border-[#121217]">
          {isAuthenticated ? (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message to the festival community..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-3 bg-stone-50 border-2 border-[#121217] rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:bg-white"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="bg-[#121217] hover:bg-[#E91E63] text-white p-3 rounded-2xl border-2 border-[#121217] fest-shadow-sm transition-all disabled:opacity-40"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="text-center py-2 text-xs font-bold text-stone-600">
              Please <a href="/login" className="text-[#E91E63] underline">Log In</a> to participate in the festival discussion.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
