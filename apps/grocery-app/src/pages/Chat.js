import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSend, FiX } from 'react-icons/fi';
import './Chat.css';

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchOrCreateChat();
  }, []);

  useEffect(() => {
    if (chat) {
      scrollToBottom();
      const interval = setInterval(() => {
        fetchChat();
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [chat?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOrCreateChat = async () => {
    try {
      const res = await axios.get('/api/chat/open');
      setChat(res.data);
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChat = async () => {
    if (!chat?._id) return;
    try {
      const res = await axios.get(`/api/chat/${chat._id}`);
      setChat(res.data);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !chat?._id) return;

    setSending(true);
    try {
      await axios.post(`/api/chat/${chat._id}/message`, { message });
      setMessage('');
      await fetchChat();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const closeChat = async () => {
    if (!chat?._id) return;
    try {
      await axios.put(`/api/chat/${chat._id}/close`);
      setChat({ ...chat, status: 'closed' });
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading chat...</div>;
  }

  if (!chat) {
    return <div className="error">Failed to load chat</div>;
  }

  return (
    <div className="chat-page container">
      <div className="chat-header">
        <div>
          <h1>💬 Support Chat</h1>
          <p className="chat-status">
            Status: <span className={`status-badge ${chat.status}`}>{chat.status}</span>
            {chat.supportAgentId && (
              <span className="agent-info"> • Agent: {chat.supportAgentId.name || 'Assigned'}</span>
            )}
          </p>
        </div>
        {chat.status !== 'closed' && (
          <button onClick={closeChat} className="btn-close-chat">
            <FiX /> Close Chat
          </button>
        )}
      </div>

      <div className="chat-messages">
        {chat.messages && chat.messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chat.messages?.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.senderId === chat.userId ? 'user-message' : 'agent-message'}`}
            >
              <div className="message-header">
                <span className="sender-name">{msg.senderName}</span>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {chat.status === 'closed' ? (
        <div className="chat-closed">
          <p>This chat has been closed. Start a new chat to continue.</p>
        </div>
      ) : (
        <form onSubmit={sendMessage} className="chat-input-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={sending}
          />
          <button type="submit" className="btn-send" disabled={sending || !message.trim()}>
            <FiSend />
          </button>
        </form>
      )}
    </div>
  );
};

export default Chat;

