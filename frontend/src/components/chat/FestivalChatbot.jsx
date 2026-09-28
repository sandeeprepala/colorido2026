import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, Minimize2, Maximize2, Trash2, ArrowRight } from 'lucide-react';
import { chatAPI } from '../../services/api';

const SUGGESTIONS = [
  '🏆 Which events offer cash prizes?',
  '💻 What are the technical hackathons?',
  '⚽ Tell me about sports events & teams',
  '🎟️ How do gate QR passes work?',
];

export default function FestivalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to COLORIDO '26! I am your AI Festival Assistant powered by Gemini and PGVector. Ask me anything about events, schedules, rules, prize money, venues, or gate passes.",
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, messages]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = { role: 'user', content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Build history for backend
      const history = newMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatAPI.sendMessage(query, history);
      if (res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.reply,
            sources: res.data.sources || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "I'm having trouble retrieving details right now. Please explore our Events tab or ask at the registration desk!",
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I couldn't reach the festival knowledge base right now. Please try asking again in a moment!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! What else would you like to know about COLORIDO '26?",
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button at Bottom Right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 group flex items-center gap-2.5 bg-[#121217] hover:bg-[#8E44FF] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full border-2 border-[#121217] fest-shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open Festival AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-[#FFD43B] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E91E63] rounded-full ring-2 ring-[#121217] animate-pulse"></span>
          </div>
          <span className="hidden sm:inline font-display font-black text-xs uppercase tracking-wider text-white">
            Ask Fest AI
          </span>
          <Sparkles className="hidden sm:inline w-3.5 h-3.5 text-[#19CFE8]" />
        </button>
      )}

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2.5rem)] sm:w-[390px] bg-white border-3 border-[#121217] rounded-3xl fest-shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[540px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#121217] text-white px-4 py-3.5 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E91E63] to-[#FFD43B] flex items-center justify-center border border-white/20">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-black text-xs tracking-wide text-white">
                    COLORIDO '26 AI
                  </h3>
                  <span className="bg-[#8E44FF] text-[9px] font-black uppercase px-1.5 py-0.2 rounded text-white">
                    RAG
                  </span>
                </div>
                <p className="text-[10px] text-stone-300 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Gemini 2.5 Flash · PGVector
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              {!isMinimized && messages.length > 2 && (
                <button
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (When not minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF8F5]/80 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 border-2 leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-[#121217] text-white border-[#121217] rounded-tr-xs'
                          : 'bg-white text-[#121217] border-stone-200 fest-shadow-xs rounded-tl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-medium">
                        {m.content}
                      </div>

                      {/* Source Badges */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex flex-wrap gap-1">
                          <span className="text-[10px] font-bold text-stone-500 block w-full">
                            Relevant Sources:
                          </span>
                          {m.sources.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-bold bg-[#FAF8F5] text-stone-700 px-2 py-0.5 rounded border border-stone-300"
                            >
                              ✦ {s.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading typing indicator */}
                {loading && (
                  <div className="flex items-center gap-1.5 bg-white border-2 border-stone-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 w-fit fest-shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#E91E63] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-[#19CFE8] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    <span className="text-[11px] font-bold text-stone-500 ml-1">Searching PGVector...</span>
                  </div>
                )}

                {/* Quick suggestions when history is short */}
                {messages.length <= 2 && !loading && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                      Popular Questions:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {SUGGESTIONS.map((s, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(s)}
                          className="text-left text-[11px] font-bold bg-white hover:bg-stone-50 text-[#121217] p-2 rounded-xl border border-stone-300 transition-all flex items-center justify-between group"
                        >
                          <span>{s}</span>
                          <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-[#8E44FF] group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t-2 border-stone-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about events, venues, rules..."
                    disabled={loading}
                    className="flex-1 bg-stone-50 border-2 border-stone-200 focus:border-[#121217] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#121217] placeholder:text-stone-400 focus:outline-hidden transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2.5 rounded-xl bg-[#121217] hover:bg-[#8E44FF] text-white disabled:opacity-40 disabled:hover:bg-[#121217] border border-[#121217] transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Send"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
