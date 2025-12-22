import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

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
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await messageAPI.getConversation(userId);
      setMessages(response.data);
      setSelectedConversation(conversations.find(c => c.user._id === userId));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await messageAPI.sendMessage({
        recipient: selectedConversation.user._id,
        content: newMessage
      });

      setMessages(prev => [...prev, response.data]);
      socket.emit('message:send', {
        recipientId: selectedConversation.user._id,
        message: response.data
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <h2 className="text-xl font-bold text-white">Nachrichten</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.user._id}
              onClick={() => loadMessages(conv.user._id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.user._id === conv.user._id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={conv.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user.name)}`}
                  alt={conv.user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-semibold text-gray-800 truncate">{conv.user.name}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>Keine Nachrichten</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b flex items-center gap-3">
              <img
                src={selectedConversation.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.user.name)}`}
                alt={selectedConversation.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-800">{selectedConversation.user.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedConversation.user.online ? '🟢 Online' : '⚫ Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      msg.sender === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === user?.id ? 'text-blue-200' : 'text-gray-500'
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
            <form onSubmit={sendMessage} className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Senden
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Wähle eine Unterhaltung</p>
          </div>
        )}
      </div>
    </div>
  );
}
