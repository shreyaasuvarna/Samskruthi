import axios from 'axios';

const ENV_BASE = (process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE.replace(/\/$/, ''));
const API_ROOT = ENV_BASE ? ENV_BASE : 'http://localhost:5000';
const BASE = `${API_ROOT}/api`;

// ---- safeFetch ----
async function safeFetch(url, options = {}) {
  try {
    console.log('📡 Request:', { url, options });
    
    const method = (options.method || 'GET').toLowerCase();
    const headers = { ...(options.headers || {}) };
    const token = localStorage.getItem('token');
    if (token && !headers.Authorization) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Using token:', token.substring(0, 15) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }

    const rawData = options.body !== undefined ? options.body : options.data;
    const shouldStringify = headers['Content-Type'] === 'application/json' && typeof rawData === 'object';
    const data = shouldStringify ? JSON.stringify(rawData) : rawData;

    console.log('📤 Sending request:', { 
      method, 
      url, 
      headers: {...headers, Authorization: headers.Authorization ? 'Bearer [TOKEN]' : 'No Token'},
      fullUrl: url
    });
    const res = await axios({ url, method, headers, data });
    console.log('📥 Response:', { 
      status: res.status, 
      statusText: res.statusText,
      data: res.data,
      headers: res.headers
    });
    return res.data;
  } catch (err) {
    if (err.response) {
      // Log detailed error information for debugging
      console.error('HTTP error response:', {
        status: err.response.status,
        data: err.response.data,
        url,
        config: err.config
      });
      throw new Error(`HTTP ${err.response.status}`);
    }
    console.error('Network or other error:', err);
    throw err;
  }
}

// ---- Doubts ----
export async function fetchDoubts() {
  try {
    return await safeFetch(`${BASE}/doubts`);
  } catch {
    return [];
  }
}

export async function postDoubt(payload) {
  try {
    return await safeFetch(`${BASE}/doubts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
  } catch {
    return { ...payload, id: `d_${Date.now()}`, createdAt: new Date().toISOString(), status: 'pending' };
  }
}

// ✅ Alias for consistency
export const createDoubt = postDoubt;

export async function getUnassignedDoubts() {
  try {
    return await safeFetch(`${BASE}/doubts/unassigned`);
  } catch {
    return [];
  }
}

export async function acceptDoubt(doubtId) {
  try {
    return await safeFetch(`${BASE}/doubts/${doubtId}/accept`, {
      method: 'PUT',
    });
  } catch (err) {
    console.error('Error accepting doubt:', err);
    throw err;
  }
}

// ---- Chats ----
export async function getChats() {
  console.log('🔄 Fetching chats...', { url: `${BASE}/chats/getchats` });
  try {
    console.log('🔑 Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    console.log('📍 API Base:', BASE);
    const result = await safeFetch(`${BASE}/chats/getchats`);
    console.log('📥 Raw API Response:', result);
    if (!Array.isArray(result)) {
      console.warn('⚠️ Chats response is not an array:', result);
      return [];
    }
    return result;
  } catch (err) {
    console.error('❌ Error fetching chats:', err);
    if (err.response) {
      console.error('Backend error details:', err.response.data);
    }
    return [];
  }
}

export async function createChat(payload) {
  try {
    const pl = { ...payload };
    if (Array.isArray(pl.teachers) && typeof pl.teachers[0] === 'string' && pl.teachers[0].includes('@')) {
      const users = await Promise.all(pl.teachers.map(email => fetchUserByEmail(email)));
      pl.teachers = users.map(u => (u.data && u.data._id) || u._id || u.id).filter(Boolean);
    }

    const result = await safeFetch(`${BASE}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: pl,
    });
    console.log('Chat created:', result);
    return result;
  } catch (err) {
    console.error('Error creating chat:', err);
    return {
      _id: `local_${Date.now()}`,
      chatName: payload.chatName || '',
      teachers: payload.teachers || [],
      isGroup: !!payload.isGroup,
      createdAt: new Date().toISOString(),
    };
  }
}

// ---- Messages ----
export async function sendMessage(chatId, payload) {
  console.log('💬 Sending message:', { chatId, payload });
  
  // Validate chat ID format
  if (!/^[0-9a-fA-F]{24}$/.test(String(chatId))) {
    console.warn('⚠️ Invalid chat ID format, using local message:', chatId);
    return {
      _id: `m_${Date.now()}`,
      chat: chatId,
      sender: payload.sender || null,
      content: payload.content || payload || '',
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const message = await safeFetch(`${BASE}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    console.log('✅ Message sent successfully:', message);
    return message;
  } catch (err) {
    console.error('❌ Failed to send message:', err);
    if (err.response?.data) {
      console.error('Backend error details:', err.response.data);
    }
    throw err;
  }
}

export async function getChatMessages(chatId) {
  if (!chatId) return [];
  try {
    const res = await safeFetch(`${BASE}/chats/${chatId}/messages`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export async function getChatById(chatId) {
  if (!chatId) return null;
  try {
    const res = await safeFetch(`${BASE}/chats/${chatId}`);
    return res;
  } catch {
    return null;
  }
}

// ---- Users ----
export async function fetchUserByEmail(email) {
  try {
    console.log('fetchUserByEmail - email:', email);
    // auth routes are mounted at /user on the backend (see backend/index.js)
    const url = `${API_ROOT}/user?email=${encodeURIComponent(email)}`;
    const response = await safeFetch(url);
    console.log('fetchUserByEmail response:', response);
    return response;
  } catch (err) {
    console.warn('fetchUserByEmail error:', err);
    // Return a fallback user-like object so callers can continue (but we should not send this to backend)
    return { id: `u_${Date.now()}`, email, name: email.split('@')[0] };
  }
}

export async function updateProfile(payload) {
  return await safeFetch(`${BASE}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });
}

// ---- Chatbot ----
export async function sendToBot({ message, history = [] } = {}) {
  try {
    // send to backend chatbot endpoint
    const url = `${BASE}/chatbot/message`;
    const body = { message, history };
    const res = await safeFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    // res expected: { success: true, data: { reply: '...' } }
    if (res && res.data && res.data.reply) {
      return res.data.reply;
    }
    if (res && res.reply) return res.reply;
    return '';
  } catch (err) {
    console.error('sendToBot error', err);
    return 'Sorry, the chatbot is unavailable right now.';
  }
}

export async function ensureBotSession(ownerId) {
  // optional stub — if you later want server-side sessions
  return { sessionId: `session_${ownerId || 'anon'}` };
}


// ✅ Clean, named export object
const api = {
  fetchDoubts,
  postDoubt,
  getChats,
  createChat,
  createDoubt,
  sendMessage,
  fetchUserByEmail,
  updateProfile,
  getChatMessages,
  getChatById,
  getUnassignedDoubts,
  acceptDoubt,
  sendToBot,
  ensureBotSession,
};

export default api;
