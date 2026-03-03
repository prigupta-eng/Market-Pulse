import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../../api/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './Signup.scss'


const Signup = () =>{
     const navigate = useNavigate()
    const [error , setError] = useState()
    const [credentials, setCredentials] = useState({name: '', email : '', password : ''})
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () =>{
        setShowPassword(!showPassword)
    }

    const handleChange= (e) =>{
        setCredentials({...credentials , [e.target.name] :e.target.value})
    }
    const handleFormSubmit = async(e)=>{
        e.preventDefault()
        try{
            const {data} = await signupUser(credentials)
            console.log(`User logged in ${data}`)
            console.log(data)
            // alert(`Welcome ${data.name || data.email || 'User'}`)
            navigate('/login')
        }
        catch(err){
            console.log(err);
            setError(err.response?.data.message || 'Internal server error')
        }
    }


    return(
        <div className="auth-container">
            <h2>Create Account</h2>

            <form onSubmit={handleFormSubmit}>
                <div className="input-group">
                    <label>Name</label>
                    <input type="text"  name="name" onChange={handleChange} required/>
                </div>

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
                            required 
                        />
                        
                        <span className="password-toggle" onClick={togglePasswordVisibility}>
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </span>

                    </div>
                </div>

                {error && <p className="error-msg">{error}</p>}
                <button type="submit" className="auth-btn">Submit</button>

            </form>
        </div>
    )
}

export default Signup