import React from 'react'

const Signup = () => {
  return (
    <div className="login-container">
        <h1>Sign Up</h1>
        <form>
            <input type="text" placeholder='Enter Full Name'/>
            <input type="email" placeholder='Enter Email'/>
            <input type="password" placeholder='Enter Password'/>
            <button>Sign Up</button>
        </form>
        <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  )
}

export default Signup