import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './components/Dashboard/Dashboard'
import Missions from './components/Missions/Missions'
import Astronauts from './components/Astronauts/Astronauts'
import LaunchVehicles from './components/LaunchVehicles/LaunchVehicles'
import Launches from './components/Launches/Launches'
import Settings from './components/Settings/Settings'
import Navbar from './components/Layout/Navbar'
import AeroBot from './components/AeroBot/AeroBot'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [userDetails, setUserDetails] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    const storedSessionId = localStorage.getItem('controlUserSessionId')
    if (storedSessionId) {
      setSessionId(storedSessionId)
      setIsAuthenticated(true)
      // Fetch user details
      fetchUserDetails(storedSessionId)
    }
  }, [])

  const fetchUserDetails = async (sessionId) => {
    try {
      const response = await fetch('http://127.0.0.1:3200/v1/admin/controluser/details', {
        headers: {
          'controlUserSessionId': sessionId
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserDetails(data)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  const handleLogin = (sessionId) => {
    setSessionId(sessionId)
    setIsAuthenticated(true)
    localStorage.setItem('controlUserSessionId', sessionId)
    fetchUserDetails(sessionId)
  }

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('controlUserSessionId')
      if (sessionId) {
        await fetch('http://127.0.0.1:3200/v1/admin/auth/logout', {
          method: 'POST',
          headers: {
            'controlUserSessionId': sessionId
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('controlUserSessionId')
    setSessionId(null)
    setIsAuthenticated(false)
    setUserDetails(null)
  }

  return (
    <Router>
      <div className="app">
        <div className="grid-background"></div>
        {isAuthenticated && (
          <>
            <Navbar 
              userDetails={userDetails} 
              onLogout={handleLogout}
            />
            <AeroBot sessionId={sessionId} />
          </>
        )}
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard sessionId={sessionId} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/missions" 
            element={
              isAuthenticated ? (
                <Missions sessionId={sessionId} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/astronauts" 
            element={
              isAuthenticated ? (
                <Astronauts sessionId={sessionId} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/launch-vehicles" 
            element={
              isAuthenticated ? (
                <LaunchVehicles sessionId={sessionId} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/launches" 
            element={
              isAuthenticated ? (
                <Launches sessionId={sessionId} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? (
                <Settings sessionId={sessionId} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App

