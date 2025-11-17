import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = ({ userDetails, onLogout }) => {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/dashboard" className="navbar-brand">
            <span className="brand-glow">AERO</span>
          </Link>
          <div className="navbar-links">
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'nav-link active' : 'nav-link'}
            >
              DASHBOARD
            </Link>
            <Link 
              to="/missions" 
              className={location.pathname === '/missions' ? 'nav-link active' : 'nav-link'}
            >
              MISSIONS
            </Link>
            <Link 
              to="/astronauts" 
              className={location.pathname === '/astronauts' ? 'nav-link active' : 'nav-link'}
            >
              ASTRONAUTS
            </Link>
            <Link 
              to="/launch-vehicles" 
              className={location.pathname === '/launch-vehicles' ? 'nav-link active' : 'nav-link'}
            >
              LAUNCH VEHICLES
            </Link>
            <Link 
              to="/launches" 
              className={location.pathname === '/launches' ? 'nav-link active' : 'nav-link'}
            >
              LAUNCHES
            </Link>
            <Link 
              to="/settings" 
              className={location.pathname === '/settings' ? 'nav-link active' : 'nav-link'}
            >
              SETTINGS
            </Link>
          </div>
        </div>

        <div className="navbar-right">
          {userDetails && (
            <span className="user-name">
              {userDetails.nameFirst} {userDetails.nameLast}
            </span>
          )}
          <button onClick={onLogout} className="sign-out-btn">
            SIGN OUT
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
