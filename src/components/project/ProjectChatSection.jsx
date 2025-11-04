import React, { useState, useEffect, useRef } from 'react';
import projectChatService from '../../services/api/chatService';

const ProjectChatSection = ({ projectId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [limit, setLimit] = useState(10);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  // Fetch messages when projectId or limit changes
  useEffect(() => {
    if (projectId) fetchMessages();
  }, [projectId, limit]);

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      const res = await projectChatService.getMessages(projectId, limit);
      // Sort messages by time ascending to display correctly
      const sorted = res.sort((a, b) => new Date(a.time) - new Date(b.time));
      setMessages(sorted);
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);

    try {
      const msg = await projectChatService.sendMessage(projectId, newMessage);

      const newMsg = {
        senderName: 'You', // temporary display until backend echoes back
        content: newMessage,
        time: new Date().toISOString(),
        senderId: currentUserId,
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Handle "Read More" button click
  const handleReadMore = () => {
    setLimit(prev => prev + 10);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white text-center py-2">
        <strong>Project Chat</strong>
      </div>

      <div
        className="card-body p-3"
        ref={chatBodyRef}
        style={{
          height: '300px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 ? (
          <div className="text-muted text-center flex-grow-1 d-flex align-items-center justify-content-center">
            No messages yet
          </div>
        ) : (
          <div className="flex-grow-1">
            <div className="text-center mb-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleReadMore}
              >
                Read More
              </button>
            </div>

            {messages.map((m, i) => (
              <div
                key={i}
                className={`d-flex mb-2 ${
                  m.senderId === currentUserId
                    ? 'justify-content-end'
                    : 'justify-content-start'
                }`}
              >
                <div
                  className={`p-2 rounded-3 ${
                    m.senderId === currentUserId
                      ? 'bg-primary text-white'
                      : 'bg-light'
                  }`}
                  style={{ maxWidth: '75%' }}
                >
                  <small className="d-block fw-bold">
                    {m.senderName ?? 'Unknown'}
                  </small>
                  <div>{m.content}</div>
                  <small
                    className="text-muted d-block text-end"
                    style={{ fontSize: '0.7em' }}
                  >
                    {m.time
                      ? new Date(m.time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </small>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="card-footer p-2">
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={isSending}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={sendMessage}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectChatSection;
