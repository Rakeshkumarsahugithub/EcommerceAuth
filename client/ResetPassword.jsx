
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';


const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const {token} = useParams()
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
        const response = await axios.post('http://localhost:5001/auth/reset-password/'+token, { password });
        setPassword('');
       
        navigate('/login');
        console.log(response.data)
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
        <h2>Reset Password</h2>
        <form className='sign-up-form' onSubmit={handleSubmit}>
        
          <label htmlFor="password">New Password:</label>
          <input 
            id='password'
            type='password' 
            placeholder='********'
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
  
          <button type='submit'>Send</button>
        </form>
      </div>
    );
}

export default ResetPassword