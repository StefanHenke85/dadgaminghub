import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';
import io from 'socket.io-client';

// Initialize socket with production URL
const getSocketURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.includes('dad-games.henke-net.com')) {
    return 'https://dad-games.henke-net.com';
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketURL();
console.log('🔌 Connecting to Socket.IO:', SOCKET_URL);
const socket = io(SOCKET_URL);

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    socket.emit('user:join', user?.id);

    socket.on('message:received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('message:received');
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      // Add General channel as first item
      const generalChannel = {
        user: {
          _id: 'general',
          id: 'general',
          name: 'Allgemeiner Chat',
          username: 'everyone',
          avatar: null
        },
        lastMessage: 'Öffentlicher Chat für alle',
        unreadCount: 0
      };
      setConversations([generalChannel, ...response.data]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (userId) => {
    try {
      if (userId === 'general') {
        // Load general channel messages (all messages marked as type='general')
        const response = await messageAPI.getGeneralMessages();
        setMessages(response.data || []);
        setSelectedConversation({
          user: {
            _id: 'general',
            id: 'general',
            name: 'Allgemeiner Chat',
            username: 'everyone',
            avatar: null
          }
        });
      } else {
        const response = await messageAPI.getConversation(userId);
        setMessages(response.data);
        setSelectedConversation(conversations.find(c => c.user._id === userId || c.user.id === userId));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      if (selectedConversation.user._id === 'general' || selectedConversation.user.id === 'general') {
        // Send to general channel
        const response = await messageAPI.sendGeneralMessage({
          content: newMessage
        });

        setMessages(prev => [...prev, response.data]);
        socket.emit('message:general', {
          message: response.data
        });
      } else {
        // Send direct message
        const response = await messageAPI.sendMessage({
          recipient: selectedConversation.user._id || selectedConversation.user.id,
          content: newMessage
        });

        setMessages(prev => [...prev, response.data]);
        socket.emit('message:send', {
          recipientId: selectedConversation.user._id || selectedConversation.user.id,
          message: response.data
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white pt-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-40 h-40 bg-contain bg-no-repeat opacity-30" style={{backgroundImage: "url('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=200&fit=crop')"}}></div>
          <div className="absolute bottom-40 right-40 w-36 h-36 bg-contain bg-no-repeat opacity-40" style={{backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop')"}}></div>
        </div>
        <div className="absolute top-0 left-1/3 w-125 h-125 bg-indigo-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/3 w-125 h-125 bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 h-[calc(100vh-6rem)] max-w-7xl mx-auto px-4 flex gap-6">
        {/* Conversations List */}
        <div className="w-80 bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            <h2 className="text-2xl font-black uppercase italic tracking-tight">💬 NACHRICHTEN</h2>
            <p className="text-xs text-white/80 font-bold uppercase tracking-wider mt-1">Squad Chat</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <div
                key={conv.user._id}
                onClick={() => loadMessages(conv.user._id)}
                className={`p-4 border-b border-slate-800/50 cursor-pointer transition-all hover:bg-slate-800/50 ${
                  selectedConversation?.user._id === conv.user._id ? 'bg-indigo-500/20 border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={conv.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.user.username}`}
                      alt={conv.user.name}
                      className="w-12 h-12 rounded-2xl border-2 border-slate-700"
                    />
                    {conv.user.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-black text-white truncate uppercase text-sm">{conv.user.name}</p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3 opacity-30">💬</div>
                <p className="text-slate-500 font-bold">Keine Nachrichten</p>
                <p className="text-slate-600 text-xs mt-1">Starte einen Chat im Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-6 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedConversation.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.user.username}`}
                    alt={selectedConversation.user.name}
                    className="w-14 h-14 rounded-2xl border-2 border-slate-700"
                  />
                  {selectedConversation.user.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <p className="font-black text-white text-lg uppercase italic">{selectedConversation.user.name}</p>
                  <p className="text-sm font-bold uppercase tracking-wider">
                    {selectedConversation.user.online ? (
                      <span className="text-green-400">🟢 Online</span>
                    ) : (
                      <span className="text-slate-500">⚫ Offline</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl ${
                        msg.sender === user?.id
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'bg-slate-800/80 border border-slate-700/50 text-slate-200'
                      }`}
                    >
                      <p className="font-medium">{msg.content}</p>
                      <p className={`text-xs mt-1.5 font-bold ${
                        msg.sender === user?.id ? 'text-indigo-200' : 'text-slate-500'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-6 bg-slate-800/50 border-t border-slate-700/50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nachricht schreiben..."
                    className="flex-1 px-6 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:border-indigo-500/50 outline-none transition-all text-white placeholder-slate-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                  >
                    Senden
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <div className="text-6xl mb-4 opacity-20">💬</div>
              <p className="text-xl font-black uppercase">Wähle eine Unterhaltung</p>
              <p className="text-sm text-slate-600 mt-2">Starte einen Chat mit deinem Squad</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
