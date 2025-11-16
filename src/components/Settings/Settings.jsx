import React, { useState } from 'react'
import './Settings.css'

const Settings = ({ sessionId }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return
    }

    if (!window.confirm('This will delete ALL missions, astronauts, launch vehicles, and launches. Are you absolutely sure?')) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('http://127.0.0.1:3200/clear', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(data.error || 'Failed to clear data')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">SETTINGS</h1>
        </div>

        <div className="settings-content">
          <div className="settings-card danger-zone">
            <h2 className="settings-section-title">DANGER ZONE</h2>
            <p className="settings-description">
              Clear all data from the system. This will permanently delete all missions, astronauts, launch vehicles, and launches.
            </p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                Data cleared successfully! Refreshing...
              </div>
            )}

            <button
              className="clear-btn"
              onClick={handleClear}
              disabled={loading}
            >
              {loading ? 'CLEARING...' : 'CLEAR ALL DATA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

