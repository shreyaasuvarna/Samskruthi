import React, { useState } from 'react';
import api from './api/api';
import { useNavigate } from 'react-router-dom';

const SUBJECT_OPTIONS = ['Mathematics','Physics','Chemistry','Biology','English','Computer Science','History','Geography'];

export default function TeacherSetup(){
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const toggle = (s)=>{
    setSelected(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();
    try{
      await api.updateProfile({ subjects: selected });
      navigate('/teacher-dashboard');
    }catch(err){
      alert(err.response?.data?.message || err.message || 'Failed to save subjects');
    }
  };

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'70vh',padding:24}}>
      <div style={{width:360,background:'#fff',padding:20,borderRadius:10,boxShadow:'0 6px 18px rgba(0,0,0,0.08)'}}>
        <h2>Tell us which subjects you teach</h2>
        <p style={{color:'#666'}}>Select one or more subjects so students can find you.</p>
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:12}}>
            {SUBJECT_OPTIONS.map(s=> (
              <label key={s} style={{display:'flex',alignItems:'center',gap:8}}>
                <input type='checkbox' checked={selected.includes(s)} onChange={()=>toggle(s)} />
                <span>{s}</span>
              </label>
            ))}
          </div>
          <button type='submit' style={{marginTop:16,padding:10,width:'100%',background:'#6366f1',color:'#fff',border:'none',borderRadius:8}}>Save subjects</button>
        </form>
      </div>
    </div>
  );
}
