import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'
import { apiFetch } from '../../api.js'   // adjust path if needed

const Dashboard = ({ sessionId }) => {
  const [stats, setStats] = useState({
    missions: 0,
    astronauts: 0,
    launchVehicles: 0,
    activeLaunches: 0,
    completedLaunches: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [sessionId])

  const fetchDashboardData = async () => {
    try {
      const [missionsRes, astronautsRes, vehiclesRes, launchesRes] =
        await Promise.all([
          apiFetch('/v1/admin/mission/list', {
            headers: { 'controlUserSessionId': sessionId }
          }),
          apiFetch('/v1/admin/astronaut/pool', {
            headers: { 'controlUserSessionId': sessionId }
          }),
          apiFetch('/v1/admin/launchvehicle/list', {
            headers: { 'controlUserSessionId': sessionId }
          }),
          apiFetch('/v1/admin/launch/list', {
            headers: { 'controlUserSessionId': sessionId }
          })
        ])

      const missions = missionsRes.ok ? await missionsRes.json() : { missions: [] }
      const astronauts = astronautsRes.ok ? await astronautsRes.json() : { astronauts: [] }
      const vehicles = vehiclesRes.ok ? await vehiclesRes.json() : { launchVehicles: [] }
      const launches = launchesRes.ok ? await launchesRes.json() : { activeLaunches: [], completedLaunches: [] }

      setStats({
        missions: missions.missions?.length || 0,
        astronauts: astronauts.astronauts?.length || 0,
        launchVehicles: vehicles.launchVehicles?.length || 0,
        activeLaunches: launches.activeLaunches?.length || 0,
        completedLaunches: launches.completedLaunches?.length || 0
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Mission Control Dashboard</h1>
          <p className="dashboard-subtitle">Monitor and manage your space operations</p>
        </div>

        <div className="stats-grid">
          <Link to="/missions" className="stat-card glow-blue">
            <div className="stat-icon">🚀</div>
            <div className="stat-value">{loading ? '...' : stats.missions}</div>
            <div className="stat-label">ACTIVE MISSIONS</div>
          </Link>

          <Link to="/astronauts" className="stat-card glow-purple">
            <div className="stat-icon">👨‍🚀</div>
            <div className="stat-value">{loading ? '...' : stats.astronauts}</div>
            <div className="stat-label">ASTRONAUTS</div>
          </Link>

          <Link to="/launch-vehicles" className="stat-card glow-blue">
            <div className="stat-icon">🛰️</div>
            <div className="stat-value">{loading ? '...' : stats.launchVehicles}</div>
            <div className="stat-label">LAUNCH VEHICLES</div>
          </Link>

          <Link to="/launches" className="stat-card glow-purple">
            <div className="stat-icon">🌌</div>
            <div className="stat-value">{loading ? '...' : stats.activeLaunches}</div>
            <div className="stat-label">ACTIVE LAUNCHES</div>
          </Link>

          <Link to="/launches" className="stat-card glow-cyan">
            <div className="stat-icon">✓</div>
            <div className="stat-value">{loading ? '...' : stats.completedLaunches}</div>
            <div className="stat-label">COMPLETED LAUNCHES</div>
          </Link>
        </div>

        <div className="quick-actions">
          <h2 className="section-title">QUICK ACTIONS</h2>
          <div className="actions-grid">
            <Link to="/missions" className="action-card">
              <div className="action-icon">+</div>
              <div className="action-text">Create Mission</div>
            </Link>
            <Link to="/astronauts" className="action-card">
              <div className="action-icon">+</div>
              <div className="action-text">Add Astronaut</div>
            </Link>
            <Link to="/launch-vehicles" className="action-card">
              <div className="action-icon">+</div>
              <div className="action-text">Register Vehicle</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
