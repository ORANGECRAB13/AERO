import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'
import { apiFetch } from '../../api.js'   // adjust path if needed

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nameFirst: '',
    nameLast: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // ➤ REGISTER USER
      const response = await apiFetch('/v1/admin/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // ➤ AUTO-LOGIN
        const loginResponse = await apiFetch('/v1/admin/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        })

        const loginData = await loginResponse.json()

        if (loginResponse.ok) {
          onLogin(loginData.controlUserSessionId)
        } else {
          setError('Registration successful, but auto-login failed. Please login manually.')
        }

      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            <span className="brand-glow">AERO</span>
          </h1>
          <p className="auth-subtitle">Create Your Account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="nameFirst">FIRST NAME</label>
            <input
              type="text"
              id="nameFirst"
              name="nameFirst"
              value={formData.nameFirst}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nameLast">LAST NAME</label>
            <input
              type="text"
              id="nameLast"
              name="nameLast"
              value={formData.nameLast}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'REGISTERING...' : 'REGISTER →'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
