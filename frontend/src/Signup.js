import React, { useState } from "react";
import "./Signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SUBJECT_OPTIONS = ['Mathematics','Physics','Chemistry','Biology','English','Computer Science','History','Geography'];

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate=useNavigate()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "", 
    typeOfUser: "Student",
    subjects: [],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (subject) => {
    setForm((prevForm) => {
      const subjects = prevForm.subjects.includes(subject)
        ? prevForm.subjects.filter((s) => s !== subject)
        : [...prevForm.subjects, subject];
      return { ...prevForm, subjects };
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (form.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    // Build payload that matches backend UserSchema
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      typeOfUser: form.typeOfUser,
      ...(form.gender ? { gender: form.gender } : {}),
      ...(form.typeOfUser === 'Teacher' ? { subjects: form.subjects } : {})
    };

    try {
      const response = await axios.post('http://localhost:5000/user/signup', payload, { headers: { 'Content-Type': 'application/json' } });
      if (response && response.data && response.data.success) {
        // Optionally store token in localStorage for later requests
        if (response.data.data && response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        const data = response.data.data || {};
        if (data.typeOfUser === 'Teacher') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        const msg = response?.data?.message || 'Signup failed';
        alert(msg);
      }
    } catch (err) {
      // Show backend validation or error message
      const msg = err.response?.data?.message || err.message || 'Signup failed';
      alert(msg);
      return;
    }
    
    console.log("Signup details:", form);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label>Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Prefer not to say</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>Account type</label>
          <select
            name="typeOfUser"
            value={form.typeOfUser}
            onChange={handleChange}
            required
          >
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
          </select>

          {form.typeOfUser === 'Teacher' && (
            <div>
              <label>Subjects</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:12}}>
                {SUBJECT_OPTIONS.map(s=> (
                  <label key={s} style={{display:'flex',alignItems:'center',gap:8}}>
                    <input type='checkbox' checked={form.subjects.includes(s)} onChange={()=>handleSubjectChange(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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

          <label>Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <button type="submit" className="signup-button">
            Sign Up
          </button>

          <p className="login-text">
            Already have an account? <a href="/">Log In</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
