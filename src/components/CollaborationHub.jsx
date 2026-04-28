import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Send, MessageSquare, Users, Shield, Zap } from 'lucide-react';

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const CollaborationHub = ({ userDept = 'fire' }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState(`${userDept}-team`);

  useEffect(() => {
    socket.emit('joinRoom', room);

    socket.on('receiveMessage', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [room]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message) return;

    const data = {
      room,
      message,
      sender: userDept.toUpperCase()
    };

    socket.emit('sendMessage', data);
    setMessage('');
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col h-[500px] overflow-hidden">
      <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-500 rounded-lg">
              <MessageSquare size={20} />
           </div>
           <div>
              <h3 className="font-black uppercase tracking-widest text-sm">Collaboration Hub</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Active Room: {room}</p>
           </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black">
           <Zap size={10} className="fill-green-400" /> LIVE SYNC
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
             <Users size={48} className="mb-2" />
             <p className="font-bold text-sm">No activity in this channel yet.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.sender === userDept.toUpperCase() ? 'items-end' : 'items-start'}`}>
            <span className="text-[8px] font-black text-gray-400 uppercase mb-1">{msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <div className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-sm ${
              msg.sender === userDept.toUpperCase() ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type strategic update..."
          className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-bold text-sm"
        />
        <button type="submit" className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default CollaborationHub;
