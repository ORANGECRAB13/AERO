import React, { useState, useEffect } from 'react'
import './Astronauts.css'

const Astronauts = ({ sessionId }) => {
  const [astronauts, setAstronauts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAstronaut, setSelectedAstronaut] = useState(null)
  const [astronautHealth, setAstronautHealth] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [formData, setFormData] = useState({
    nameFirst: '',
    nameLast: '',
    rank: '',
    age: '',
    weight: '',
    height: ''
  })
  const [healthFormData, setHealthFormData] = useState({
    physicalHealth: {
      restingHeartRate: 'GREEN',
      bloodPressure: 'GREEN',
      boneDensity: 'GREEN',
      muscleMass: 'GREEN',
      reactionTime: 'GREEN',
      radiationLevel: 'GREEN',
      whiteBloodCellLevel: 'GREEN',
      sleepQuality: 'GREEN'
    },
    mentalHealth: {
      depressionLevel: 'GREEN',
      anxietyLevel: 'GREEN',
      stressLevel: 'GREEN',
      cognitivePerformance: 'GREEN',
      personalityTraits: 'GREEN',
      motivationLevel: 'GREEN'
    }
  })

  useEffect(() => {
    fetchAstronauts()
  }, [sessionId])

  const fetchAstronauts = async () => {
    setError('')
    try {
      const response = await fetch('http://127.0.0.1:3200/v1/admin/astronaut/pool', {
        headers: { 'controlUserSessionId': sessionId }
      })
      const data = await response.json()
      if (response.ok) {
        setAstronauts(data.astronauts || [])
      } else {
        setError(data.error || 'Failed to fetch astronauts')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error fetching astronauts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch('http://127.0.0.1:3200/v1/admin/astronaut', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'controlUserSessionId': sessionId
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height)
        })
      })
      const data = await response.json()
      if (response.ok) {
        setShowCreateModal(false)
        setFormData({ nameFirst: '', nameLast: '', rank: '', age: '', weight: '', height: '' })
        fetchAstronauts()
      } else {
        setError(data.error || 'Failed to create astronaut')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error creating astronaut:', error)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch(`http://127.0.0.1:3200/v1/admin/astronaut/${selectedAstronaut.astronautId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'controlUserSessionId': sessionId
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height)
        })
      })
      const data = await response.json()
      if (response.ok) {
        setShowEditModal(false)
        fetchAstronautDetails(selectedAstronaut.astronautId)
        fetchAstronauts()
      } else {
        setError(data.error || 'Failed to update astronaut')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error updating astronaut:', error)
    }
  }

  const handleDelete = async (astronautId) => {
    if (!window.confirm('Are you sure you want to remove this astronaut?')) return
    
    setError('')
    try {
      const response = await fetch(`http://127.0.0.1:3200/v1/admin/astronaut/${astronautId}`, {
        method: 'DELETE',
        headers: { 'controlUserSessionId': sessionId }
      })
      const data = await response.json()
      if (response.ok) {
        fetchAstronauts()
      } else {
        setError(data.error || 'Failed to delete astronaut')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error deleting astronaut:', error)
    }
  }

  const fetchAstronautDetails = async (astronautId) => {
    setError('')
    try {
      const response = await fetch(`http://127.0.0.1:3200/v1/admin/astronaut/${astronautId}`, {
        headers: { 'controlUserSessionId': sessionId }
      })
      const data = await response.json()
      if (response.ok) {
        setSelectedAstronaut(data)
        setFormData({
          nameFirst: data.designation?.split(' ').slice(1, -1).join(' ') || '',
          nameLast: data.designation?.split(' ').pop() || '',
          rank: data.designation?.split(' ')[0] || '',
          age: data.age?.toString() || '',
          weight: data.weight?.toString() || '',
          height: data.height?.toString() || ''
        })
      } else {
        setError(data.error || 'Failed to fetch astronaut details')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error fetching astronaut details:', error)
    }
  }

  const fetchAstronautHealth = async (astronautId) => {
    setError('')
    try {
      const response = await fetch(`http://127.0.0.1:3200/v1/admin/astronaut/${astronautId}/health`, {
        headers: { 'controlUserSessionId': sessionId }
      })
      const data = await response.json()
      if (response.ok) {
        setAstronautHealth(data)
        if (data.physicalHealth && data.mentalHealth) {
          setHealthFormData({
            physicalHealth: data.physicalHealth,
            mentalHealth: data.mentalHealth
          })
        }
      } else {
        setError(data.error || 'Failed to fetch astronaut health')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error fetching astronaut health:', error)
    }
  }

  const handleUpdateHealth = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch(`http://127.0.0.1:3200/v1/admin/astronaut/${selectedAstronaut.astronautId}/health`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'controlUserSessionId': sessionId
        },
        body: JSON.stringify(healthFormData)
      })
      const data = await response.json()
      if (response.ok) {
        fetchAstronautHealth(selectedAstronaut.astronautId)
        setShowHealthModal(false)
      } else {
        setError(data.error || 'Failed to update health')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error updating health:', error)
    }
  }

  const getHealthColor = (status) => {
    switch (status) {
      case 'GREEN':
        return '#10b981'
      case 'YELLOW':
        return '#f59e0b'
      case 'RED':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="astronauts-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">ASTRONAUTS</h1>
          <button 
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + ADD ASTRONAUT
          </button>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button className="error-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading astronauts...</div>
        ) : (
          <div className="astronauts-grid">
            {astronauts.map((astronaut) => (
              <div key={astronaut.astronautId} className="astronaut-card">
                <div className="astronaut-header">
                  <h3 className="astronaut-name">{astronaut.designation}</h3>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(astronaut.astronautId)}
                  >
                    ×
                  </button>
                </div>
                <div className="astronaut-status">
                  <span className={`status-badge ${astronaut.assigned ? 'assigned' : 'available'}`}>
                    {astronaut.assigned ? 'ASSIGNED' : 'AVAILABLE'}
                  </span>
                </div>
                <button 
                  className="view-details-btn"
                  onClick={() => fetchAstronautDetails(astronaut.astronautId)}
                >
                  VIEW DETAILS →
                </button>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Add New Astronaut</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>FIRST NAME</label>
                  <input
                    type="text"
                    value={formData.nameFirst}
                    onChange={(e) => setFormData({ ...formData, nameFirst: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>LAST NAME</label>
                  <input
                    type="text"
                    value={formData.nameLast}
                    onChange={(e) => setFormData({ ...formData, nameLast: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>RANK</label>
                  <input
                    type="text"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>AGE</label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>WEIGHT (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    max="100"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>HEIGHT (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="150"
                    max="200"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">CREATE</button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowCreateModal(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedAstronaut && (
          <div className="modal-overlay" onClick={() => {
            setSelectedAstronaut(null)
            setShowEditModal(false)
            setShowHealthModal(false)
            setAstronautHealth(null)
          }}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Astronaut Details: {selectedAstronaut.designation}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setSelectedAstronaut(null)
                    setShowEditModal(false)
                    setShowHealthModal(false)
                    setAstronautHealth(null)
                  }}
                >
                  ×
                </button>
              </div>

              {!showEditModal && !showHealthModal && (
                <>
                  <div className="astronaut-details">
                    <div className="detail-section">
                      <div className="detail-row">
                        <span className="detail-label">Designation:</span>
                        <span className="detail-value">{selectedAstronaut.designation}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Age:</span>
                        <span className="detail-value">{selectedAstronaut.age}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Weight:</span>
                        <span className="detail-value">{selectedAstronaut.weight} kg</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Height:</span>
                        <span className="detail-value">{selectedAstronaut.height} cm</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Added:</span>
                        <span className="detail-value">
                          {selectedAstronaut.timeAdded ? new Date(selectedAstronaut.timeAdded * 1000).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Last Edited:</span>
                        <span className="detail-value">
                          {selectedAstronaut.timeLastEdited ? new Date(selectedAstronaut.timeLastEdited * 1000).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      {selectedAstronaut.assignedMission && (
                        <div className="detail-row">
                          <span className="detail-label">Assigned Mission:</span>
                          <span className="detail-value">{selectedAstronaut.assignedMission.objective}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button 
                      className="action-btn"
                      onClick={() => setShowEditModal(true)}
                    >
                      EDIT ASTRONAUT
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => {
                        fetchAstronautHealth(selectedAstronaut.astronautId)
                        setShowHealthModal(true)
                      }}
                    >
                      VIEW HEALTH
                    </button>
                    <button 
                      className="close-btn"
                      onClick={() => {
                        setSelectedAstronaut(null)
                        setShowEditModal(false)
                        setShowHealthModal(false)
                        setAstronautHealth(null)
                      }}
                    >
                      CLOSE
                    </button>
                  </div>
                </>
              )}

              {showEditModal && (
                <div className="edit-section">
                  <h3>Edit Astronaut</h3>
                  <form onSubmit={handleEdit}>
                    <div className="form-group">
                      <label>FIRST NAME</label>
                      <input
                        type="text"
                        value={formData.nameFirst}
                        onChange={(e) => setFormData({ ...formData, nameFirst: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>LAST NAME</label>
                      <input
                        type="text"
                        value={formData.nameLast}
                        onChange={(e) => setFormData({ ...formData, nameLast: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>RANK</label>
                      <input
                        type="text"
                        value={formData.rank}
                        onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>AGE</label>
                      <input
                        type="number"
                        min="20"
                        max="60"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>WEIGHT (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        max="100"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>HEIGHT (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="150"
                        max="200"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        required
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="submit" className="submit-btn">SAVE</button>
                      <button 
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowEditModal(false)}
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {showHealthModal && (
                <div className="health-section">
                  <h3>Health Monitoring</h3>
                  {astronautHealth && (
                    <>
                      <div className="health-section-group">
                        <h4>Physical Health</h4>
                        <div className="health-indicators">
                          {Object.entries(astronautHealth.physicalHealth || {}).map(([key, value]) => (
                            <div key={key} className="health-indicator">
                              <span className="health-label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span 
                                className="health-value"
                                style={{ color: getHealthColor(value) }}
                              >
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="health-section-group">
                        <h4>Mental Health</h4>
                        <div className="health-indicators">
                          {Object.entries(astronautHealth.mentalHealth || {}).map(([key, value]) => (
                            <div key={key} className="health-indicator">
                              <span className="health-label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span 
                                className="health-value"
                                style={{ color: getHealthColor(value) }}
                              >
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {astronautHealth.timeLastEdited && (
                        <div className="detail-row">
                          <span className="detail-label">Last Updated:</span>
                          <span className="detail-value">
                            {new Date(astronautHealth.timeLastEdited * 1000).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <button 
                        className="action-btn"
                        onClick={() => {
                          // Show edit form for health
                          setShowHealthModal(false)
                          setShowHealthModal(true)
                        }}
                      >
                        UPDATE HEALTH
                      </button>
                    </>
                  )}
                  <form onSubmit={handleUpdateHealth} style={{ marginTop: '20px' }}>
                    <div className="health-edit-section">
                      <h4>Update Physical Health</h4>
                      {Object.keys(healthFormData.physicalHealth).map((key) => (
                        <div key={key} className="form-group">
                          <label>{key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</label>
                          <select
                            value={healthFormData.physicalHealth[key]}
                            onChange={(e) => setHealthFormData({
                              ...healthFormData,
                              physicalHealth: {
                                ...healthFormData.physicalHealth,
                                [key]: e.target.value
                              }
                            })}
                          >
                            <option value="GREEN">GREEN</option>
                            <option value="YELLOW">YELLOW</option>
                            <option value="RED">RED</option>
                          </select>
                        </div>
                      ))}
                      <h4>Update Mental Health</h4>
                      {Object.keys(healthFormData.mentalHealth).map((key) => (
                        <div key={key} className="form-group">
                          <label>{key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</label>
                          <select
                            value={healthFormData.mentalHealth[key]}
                            onChange={(e) => setHealthFormData({
                              ...healthFormData,
                              mentalHealth: {
                                ...healthFormData.mentalHealth,
                                [key]: e.target.value
                              }
                            })}
                          >
                            <option value="GREEN">GREEN</option>
                            <option value="YELLOW">YELLOW</option>
                            <option value="RED">RED</option>
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className="modal-actions">
                      <button type="submit" className="submit-btn">SAVE HEALTH</button>
                      <button 
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowHealthModal(false)}
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Astronauts
