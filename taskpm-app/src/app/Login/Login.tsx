import React from 'react'

const Login = () => {
  return (
    <div className="login-container">
        <h1>Login</h1>
        <form>
            <input type="email" placeholder='Enter Email'/>
            <input type="password" placeholder='Enter Password'/>
            <button>Login</button>
        </form>
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
    </div>
  )
}

export default Login