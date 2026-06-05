import React, { useState } from "react";
import "./login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate=useNavigate()
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
  try {
      const response = await axios.post('http://localhost:5000/user/login', form, { headers: { 'Content-Type': 'application/json' } });
      if (response && response.data && response.data.success) {
        const data = response.data.data;
        // store token
        if (data.token) localStorage.setItem('token', data.token);
        // If teacher and has no subjects, route to setup
        if (data.typeOfUser === 'Teacher' && (!data.subjects || data.subjects.length === 0)) {
          navigate('/teacher-setup');
          return;
        }
        if (data.typeOfUser === 'Teacher') navigate('/teacher-dashboard');
        else navigate('/student-dashboard');
      } else {
        alert(response?.data?.message || 'Login failed');
      }
      console.log('Login details:', form);
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Login failed';
    alert(msg);
  }

  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome </h2>
        <p className="subtitle">Please log in to continue</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label>Password</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {/* {showPassword ? "🙈" : "👁️"} */}
            </span>
          </div>

          <button type="submit" className="login-button">
            Log In
          </button>

          <p className="signup-text">
            Don’t have an account? <a href="/signup">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;