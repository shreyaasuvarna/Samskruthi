import React, { useState, useEffect } from 'react';
import { useUser } from './contexts/UserContext';
import './Chat.css';
import { getChats, sendMessage, getChatMessages, createChat, fetchUserByEmail, getChatById } from './api/api';

const Chat = ({ chatId }) => {
  const { user } = useUser();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [loading, setLoading] = useState(true);
  console.log("user ",useUser)
  useEffect(() => {
    const fetchChats = async () => {
      if (chatId) return;
      try {
        const response = await getChats();
        setChats(response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    };

    fetchChats();
  }, [user, chatId]);

  useEffect(() => {
    const fetchChatAndMessages = async () => {
      if (chatId) {
        try {
          const chat = await getChatById(chatId);
          setSelectedChat(chat);
          const response = await getChatMessages(chatId);
          setMessages(response);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching chat and messages:', error);
          setLoading(false);
        }
      }
    };
    fetchChatAndMessages();
  }, [chatId]);


  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat && !chatId) {
        try {
          const response = await getChatMessages(selectedChat._id);
          setMessages(response);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [selectedChat, chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const response = await sendMessage(selectedChat._id, { content: newMessage });
      setMessages([...messages, response]);
      console.log("message obj ",response)
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateChat = async () => {
    if (teacherEmail.trim() === '') return;

    try {
      const response = await fetchUserByEmail(teacherEmail);
      const teacher = response;
      if (!teacher) {
        alert('Teacher not found');
        return;
      }

      const newChat = await createChat({
        chatName: `Chat with ${teacher.name}`,
        teachers: [teacher._id],
      });
      setChats([...chats, newChat]);
      setSelectedChat(newChat);
      setTeacherEmail('');
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-container">
      {!chatId && (
        <div className="chat-list">
          <h2>Chats</h2>
          <div className="add-chat">
            <input
              type="email"
              placeholder="Enter teacher email"
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
            />
            <button onClick={handleCreateChat}>Start Chat</button>
          </div>
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`chat-item ${selectedChat?._id === chat._id ? 'selected' : ''}`}
              onClick={() => setSelectedChat(chat)}
            >
              {chat.chatName}
              <div className="teacher-email">
                {chat.teachers.map(teacher => teacher ? teacher.email : '').join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="chat-window">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <h3>{selectedChat.chatName}</h3>
            </div>
            <div className="message-list">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`message-item ${message.sender && user && message.sender._id === user._id ? 'sent' : 'received'}`}
                >
                  <div className="message-sender">{message.sender.name}</div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}
            </div>
            <form className="message-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            {chatId ? 'Loading chat...' : 'Select a chat to start messaging'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
