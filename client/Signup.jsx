import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      alert('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }

    try {
      const response = await axios.post('https://ecommercedashboard-rshy.onrender.com/auth/signup', { username, email, password });
      
      setUsername('');
      setEmail('');
      setPassword('');

      alert(response.data.message);
      navigate('/login');
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message);
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className='sign-up-container'>
      <h2>Signup</h2>
      <form className='sign-up-form' onSubmit={handleSubmit}>
        <label htmlFor='username'>Username</label>
        <input 
          id='username'
          type='text' 
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />

        <label htmlFor="email">Email:</label>
        <input 
          id='email'
          type='email' 
          placeholder='Email'
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required 
        />

        <label htmlFor='password'>Password</label>
        <input 
          id='password'
          type='password' 
          placeholder='**********' 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        <button type='submit'>Sign Up</button>
        <p>Have an Account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Signup;




