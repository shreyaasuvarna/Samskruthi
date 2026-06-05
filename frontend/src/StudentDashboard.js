import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import { MessageCircle, HelpCircle, Clock, User } from "lucide-react";
import api from "./api/api";
import { useUser } from "./contexts/UserContext";
import Chat from "./Chat";
import ChatbotWidget from './ChatbotWidget'; // adjust path as needed

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Geography",
  "Economics",
  "Other",
];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("doubts");
  const [doubts, setDoubts] = useState([]);
  const [showCreateDoubtForm, setShowCreateDoubtForm] = useState(false);
  const [newDoubtSubject, setNewDoubtSubject] = useState("");
  const [newDoubtTitle, setNewDoubtTitle] = useState("");
  const [newDoubtDescription, setNewDoubtDescription] = useState("");
  const [newDoubtTeacherEmail, setNewDoubtTeacherEmail] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const mountedRef = useRef(true);

  const navigate = useNavigate();
  const { user } = useUser();

  const handleLogout = () => {
    navigate("/login");
  };

  // ===== Doubts =====
  const handleCreateDoubt = async () => {
    const subject = newDoubtSubject.trim();
    const title = newDoubtTitle.trim();
    const description = newDoubtDescription.trim();
    if (!subject || !title || !description) return;

    let teacherIds = [];
    if (newDoubtTeacherEmail.trim()) {
      try {
        const user = await api.fetchUserByEmail(newDoubtTeacherEmail.trim());
        const teacherId = (user.data && user.data._id) || user._id || user.id || user.email || newDoubtTeacherEmail.trim();
        teacherIds = [teacherId];
      } catch (err) {
        console.warn('fetchUserByEmail failed for doubt:', err);
        teacherIds = [newDoubtTeacherEmail.trim()];
      }
    }

    const payload = {
      subject,
      title,
      description,
      status: "pending",
      student: "me",
      teachers: teacherIds,
      isGroup: teacherIds.length > 1,
    };

    try {
      const saved = await api.postDoubt(payload);
      console.log('📄 Saved doubt object:', saved);
      if (!mountedRef.current) return;
      setDoubts((prev) => [saved, ...prev]);
      setShowCreateDoubtForm(false);
      setNewDoubtSubject("");
      setNewDoubtTitle("");
      setNewDoubtDescription("");
      setNewDoubtTeacherEmail("");
    } catch {
      const fallback = {
        id: `d_${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      setDoubts((prev) => [fallback, ...prev]);
    }
  };

  // ===== Study Plan =====
  const handleGenerateStudyPlan = async () => {
    setIsLoadingPlan(true);
    const doubtSummary = summarizeDoubtPatterns(doubts);

    const demoPlan = {
      recommendations: [
        ...Object.keys(doubtSummary).map((subject) => ({
          subject,
          suggestion: `Spend extra 30 mins on ${subject} due to frequent doubts`,
        })),
        {
          subject: "All",
          suggestion: "Revise error-prone topics from past doubts this weekend",
        },
      ],
    };

    setTimeout(() => {
      setStudyPlan(demoPlan);
      setIsLoadingPlan(false);
    }, 1000);
  };

  function summarizeDoubtPatterns(doubts) {
    const out = {};
    doubts.forEach((d) => {
      if (d.subject) out[d.subject] = (out[d.subject] || 0) + 1;
    });
    return Object.fromEntries(
      Object.entries(out).filter(([_, count]) => count >= 3)
    );
  }

  // ===== Data Loading =====
  useEffect(() => {
    console.log('StudentDashboard useEffect is running.'); // Added console.log
    mountedRef.current = true;
    const fetchUserData = async () => {
      try {
        const student = user;
      

        const fetchedDoubts = await api.fetchDoubts();
        console.log('Student fetched doubts:', fetchedDoubts); // Log fetched doubts for student
        if (mountedRef.current && Array.isArray(fetchedDoubts)) {
          setDoubts(fetchedDoubts.reverse());
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
    return () => {
      mountedRef.current = false;
    };
  }, [user]);


  
  // ===== Render =====

  return (
    <div className="student-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1>My Dashboard</h1>
            <p>Ask doubts and chat with teachers</p>
          </div>
          <div className="profile-section">
            <User
              className="profile-icon"
              onClick={() => setShowProfile(!showProfile)}
            />
            {showProfile && (
              <div className="profile-dropdown">
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Tabs */}
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === "doubts" ? "active" : ""}`}
            onClick={() => setActiveTab("doubts")}
          >
            <HelpCircle className="icon" /> Doubts
          </button>
          <button
            className={`tab-btn ${activeTab === "chats" ? "active" : ""}`}
            onClick={() => setActiveTab("chats")}
          >
            <MessageCircle className="icon" /> Chats
          </button>
          <button
            className={`tab-btn ${activeTab === "studyplan" ? "active" : ""}`}
            onClick={() => setActiveTab("studyplan")}
          >
            <Clock className="icon" /> Study Plan
          </button>
        </div>

        {/* Doubts Section */}
        {activeTab === "doubts" && (
          <section className="doubts-section">
            <div className="doubts-header">
              <h2>Your Doubts</h2>
              <button
                className="create-doubt-btn"
                onClick={() => setShowCreateDoubtForm((prev) => !prev)}
              >
                + Create Doubt
              </button>
            </div>

            {showCreateDoubtForm && (
              <div className="create-doubt-form">
                <select
                  id="doubt-subject"
                  value={newDoubtSubject}
                  onChange={(e) => setNewDoubtSubject(e.target.value)}
                >
                  <option value="">Select subject</option>
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Title (short summary)"
                  value={newDoubtTitle}
                  onChange={(e) => setNewDoubtTitle(e.target.value)}
                />
                <textarea
                  placeholder="Describe your doubt in detail..."
                  value={newDoubtDescription}
                  onChange={(e) => setNewDoubtDescription(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Assign teacher (email) — optional"
                  value={newDoubtTeacherEmail}
                  onChange={(e) => setNewDoubtTeacherEmail(e.target.value)}
                />
                <div className="create-doubt-actions">
                  <button onClick={handleCreateDoubt}>Create</button>
                  <button onClick={() => setShowCreateDoubtForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {doubts.length === 0 ? (
              <p className="no-doubts">No doubts yet. Click “Ask a Question” to add one!</p>
            ) : (
              doubts.map((doubt) => (
                <div className="doubt-card" key={doubt.id || doubt._id}>
                  <div className="doubt-info">
                    <div className="doubt-top">
                      <span className="subject">{doubt.subject}</span>
                      <span className="text-sm ml-2">
                        {doubt.status || "pending"}
                      </span>
                    </div>
                    <h3 className="doubt-title">{doubt.title}</h3>
                    <p className="doubt-desc">{doubt.description}</p>
                    {doubt.aiReply && (
                      <div className="ai-reply">
                        <h4>AI Reply:</h4>
                        <p>{doubt.aiReply}</p>
                      </div>
                    )}
                    <p className="timestamp">
                      <Clock className="icon-small" />{" "}
                      {doubt.createdAt || doubt.updatedAt || ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* Chats Section */}
        {activeTab === "chats" && (
          <Chat />
        )}

        {/* Study Plan */}
        {activeTab === "studyplan" && (
          <section className="study-plan-section">
            <h2>Your Personalized Study Plan</h2>
            <button onClick={handleGenerateStudyPlan} disabled={isLoadingPlan}>
              {isLoadingPlan ? "Generating..." : "Generate Study Plan"}
            </button>
            {studyPlan && !studyPlan.error && (
              <ul className="study-plan-list">
                {studyPlan.recommendations.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.subject}:</strong> {item.suggestion}
                  </li>
                ))}
              </ul>
            )}
            {studyPlan?.error && <p className="error">{studyPlan.error}</p>}
          </section>
        )}

        <ChatbotWidget />
      </div>
    </div>
  );
};

export default StudentDashboard;