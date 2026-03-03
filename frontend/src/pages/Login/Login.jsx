import React from "react";
import './Login.scss';
import {Link, useNavigate} from 'react-router-dom';
import { loginUser } from "../../api/auth";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const Login = () => {
    const navigate = useNavigate()
    const [credentials , setCredentials] = useState({email : '', password : ''})
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false)
    
    const togglePasswordVisibility = () =>{
        setShowPassword(!showPassword)
    }
    const handleChange = (e) =>{
        setCredentials({...credentials , [e.target.name] : e.target.value});
    }

    const handleSubmit = async(e) =>{
        e.preventDefault();
        try{
            const {data} = await loginUser(credentials)
            console.log(`User logged in ${data}`)
            console.log(data)
            
            navigate('/dashboard')
        }
        catch(err){
            console.log('Login error:', err.response?.data || err.message || err)
            setError(err.response?.data?.error || err.response?.data?.message || 'Invalid email or password')
        }
    }

    return(
        <div className="auth-container">
            <h1>Welcome back</h1>
            <form onSubmit={handleSubmit}>  
                <div className="input-group">
                    <label>Email</label>
                    <input type="email" name="email" onChange={handleChange} required/>
                </div>
                <div className= "input-group">
                    <label>Password</label>
                        <div className="input-relative">
                        {/* 3. Type changes based on showPassword state */}
                            <input 
                                type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    onChange={handleChange} 
                                    required    />
                                        
                                    <span className="password-toggle" onClick={togglePasswordVisibility}>
                                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                                    </span>
                
                             </div>
                        </div>
                
                {error && <p className="error-msg">{error}</p>}

                <button type="submit" className="auth-btn">Submit</button>              
            </form>
            <p> New here <Link to = '/signup'>Create account</Link></p>
        </div>
    )

}

export default Login