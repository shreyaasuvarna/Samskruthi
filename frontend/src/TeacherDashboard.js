import React, { useEffect, useState } from 'react';
import './TeacherDashboard.css';
import Chat from './Chat';
import api from './api/api'; // Import the api module
import { AlignCenter } from 'lucide-react';
import ChatbotWidget from './ChatbotWidget';

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null);
  const [doubts, setDoubts] = useState([]);
  const [unassignedDoubts, setUnassignedDoubts] = useState([]); // New state for unassigned doubts
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [currentView, setCurrentView] = useState('doubts'); // 'doubts', 'generalChat', or 'unassignedDoubts'

  useEffect(() => {
    const token = localStorage.getItem('token');
    const load = async () => {
      try {
        const res = await fetch('http://localhost:5000/user/profile', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (res.ok) {
          const json = await res.json();
          setProfile(json.data);
        }
      } catch (err) {
        // ignore silently
      }
    };
    const fetchDoubts = async () => {
      try {
        const data = await api.fetchDoubts(); // Use api.fetchDoubts
        console.log('Fetched doubts:', data); // Log fetched doubts
        setDoubts(data);
      } catch (err) {
        console.error('Failed to fetch doubts', err);
      }
    };

    const fetchUnassignedDoubts = async () => {
      try {
        console.log('Fetching unassigned doubts...');
        const data = await api.getUnassignedDoubts(); // Use api.getUnassignedDoubts
        console.log('Fetched unassigned doubts:', data); // Log fetched unassigned doubts
        setUnassignedDoubts(data);
      } catch (err) {
        console.error('Failed to fetch unassigned doubts', err);
      }
    };

    load();
    fetchDoubts();
    fetchUnassignedDoubts();
  }, []);

  const handleReplyClick = (chatId) => {
    setSelectedChatId(chatId);
    setCurrentView('doubts'); // Ensure we are in doubts view when opening a specific chat
  };

  const handleBackToDoubts = () => {
    setSelectedChatId(null);
  };

  const handleAcceptDoubt = async (doubtId) => {
    try {
      const acceptedDoubt = await api.acceptDoubt(doubtId);
      setDoubts((prevDoubts) => [...prevDoubts, acceptedDoubt]);
      setUnassignedDoubts((prevUnassigned) =>
        prevUnassigned.filter((doubt) => doubt._id !== doubtId)
      );
      setCurrentView('doubts'); // Switch to 'Your Doubts' view after accepting
      setSelectedChatId(acceptedDoubt.chat._id); // Open the chat for the accepted doubt
    } catch (err) {
      console.error('Failed to accept doubt', err);
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Teacher Dashboard</h1>
        </header>

        {profile && (
          <div className="teacher-profile">
            <div className="profile-main">
              <div>
                <strong className="profile-name">{profile.name}</strong>
                <div className="profile-email">{profile.email}</div>
              </div>
            </div>
            <div className="profile-subjects">
              Subjects:{' '}
              {(profile.subjects || []).length > 0
                ? profile.subjects.map((subject, index) => (
                    <span key={index}>{subject}</span>
                  ))
                : 'None'}
            </div>
          </div>
        )}

        <div className="dashboard-navigation">
          <button
            className={`nav-button ${currentView === 'doubts' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('doubts');
              setSelectedChatId(null); // Reset selected chat when switching to doubts view
            }}
          >
            Your Doubts
          </button>
          <button
            className={`nav-button ${currentView === 'unassignedDoubts' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('unassignedDoubts');
              setSelectedChatId(null); // Reset selected chat when switching to unassigned doubts view
            }}
          >
            Unassigned Doubts
          </button>
          <button
            className={`nav-button ${currentView === 'generalChat' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('generalChat');
              setSelectedChatId(null); // Reset selected chat when switching to general chat view
            }}
          >
            General Chats
          </button>
        </div>

        {currentView === 'doubts' && (
          selectedChatId ? (
            <div className="chat-view">
              <button onClick={handleBackToDoubts} className="back-button">
                &larr; Back to Doubts
              </button>
              <Chat chatId={selectedChatId} />
            </div>
          ) : (
            <div className="doubts-section">
              <h2>Your Doubts</h2>
              {doubts.length > 0 ? (
                doubts.map((doubt) => (
                  <div key={doubt._id} className="doubt-card">
                    <h3>{doubt.title}</h3>
                    <p>
                      <strong>Subject:</strong> {doubt.subject}
                    </p>
                    <p>
                      <strong>Student:</strong> {doubt.student?.name || 'N/A'}
                    </p>
                    <p>{doubt.description}</p>
                    {doubt.chat ? (
                      <button onClick={() => handleReplyClick(doubt.chat._id)}>
                        View/Reply
                      </button>
                    ) : (
                      <p><em>No chat available for this doubt.</em></p>
                    )}
                  </div>
                ))
              ) : (
                <p>You have no doubts assigned to you.</p>
              )}
            </div>
          )
        )}

        {currentView === 'unassignedDoubts' && (
          <div className="unassigned-doubts-section">
            <h2>Unassigned Doubts in Your Subjects</h2>
            {console.log('Rendering unassigned doubts:', unassignedDoubts)}
            {unassignedDoubts.length > 0 ? (
              unassignedDoubts.map((doubt) => (
                <div key={doubt._id} className="doubt-card">
                  <h3>{doubt.title}</h3>
                  <p>
                    <strong>Subject:</strong> {doubt.subject}
                  </p>
                  <p>
                    <strong>Student:</strong> {doubt.student?.name || 'N/A'}
                  </p>
                  <p>{doubt.description}</p>
                  <button onClick={() => handleAcceptDoubt(doubt._id)}>Accept Doubt</button>
                </div>
              ))
            ) : (
              <div className="no-doubts-wrapper">
  <p className="no-doubts-message">No unassigned doubts in your subjects.</p>
</div>


            )}
          </div>
        )}

        {currentView === 'generalChat' && (
          <div className="general-chat-section">
            <h2>Your General Chats</h2>
            <Chat /> {/* Render Chat component without chatId prop for general chat list */}
          </div>
        )}

        <ChatbotWidget />
      </div>
    </div>
  );
}
