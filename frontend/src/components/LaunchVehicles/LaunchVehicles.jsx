import React, { useState, useEffect } from 'react'
import './LaunchVehicles.css'

const LaunchVehicles = ({ sessionId }) => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxCrewWeight: '',
    maxPayloadWeight: '',
    launchVehicleWeight: '',
    thrustCapacity: '',
    maneuveringFuel: ''
  })

  useEffect(() => {
    fetchVehicles()
  }, [sessionId])

  const fetchVehicles = async () => {
    setError('')
    try {
      const response = await fetch('http://127.0.0.1:3200/v1/admin/launchvehicle/list', {
        headers: { 'controlUserSessionId': sessionId }
      })
      const data = await response.json()
      if (response.ok) {
        setVehicles(data.launchVehicles || [])
      } else {
        setError(data.error || 'Failed to fetch launch vehicles')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error fetching launch vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch('http://127.0.0.1:3200/v1/admin/launchvehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'controlUserSessionId': sessionId
        },
        body: JSON.stringify({
          ...formData,
          maxCrewWeight: parseInt(formData.maxCrewWeight),
          maxPayloadWeight: parseInt(formData.maxPayloadWeight),
          launchVehicleWeight: parseInt(formData.launchVehicleWeight),
          thrustCapacity: parseInt(formData.thrustCapacity),
          maneuveringFuel: parseInt(formData.maneuveringFuel)
        })
      })
      const data = await response.json()
      if (response.ok) {
        setShowCreateModal(false)
        setFormData({
          name: '',
          description: '',
          maxCrewWeight: '',
          maxPayloadWeight: '',
          launchVehicleWeight: '',
          thrustCapacity: '',
          maneuveringFuel: ''
        })
        fetchVehicles()
      } else {
        setError(data.error || 'Failed to create launch vehicle')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error creating launch vehicle:', error)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch(`http://127.0.0.1:3200/v1/admin/launchvehicle/${selectedVehicle.launchVehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'controlUserSessionId': sessionId
        },
        body: JSON.stringify({
          ...formData,
          maxCrewWeight: parseInt(formData.maxCrewWeight),
          maxPayloadWeight: parseInt(formData.maxPayloadWeight),
          launchVehicleWeight: parseInt(formData.launchVehicleWeight),
          thrustCapacity: parseInt(formData.thrustCapacity),
          maneuveringFuel: parseInt(formData.maneuveringFuel)
        })
      })
      const data = await response.json()
      if (response.ok) {
        setShowEditModal(false)
        fetchVehicleDetails(selectedVehicle.launchVehicleId)
        fetchVehicles()
      } else {
        setError(data.error || 'Failed to update launch vehicle')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error updating launch vehicle:', error)
    }
  }

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to retire this launch vehicle?')) return
    
    setError('')
    try {
      const response = await fetch(`http://127.0.0.1:3200/v1/admin/launchvehicle/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'controlUserSessionId': sessionId }
      })
      const data = await response.json()
      if (response.ok) {
        fetchVehicles()
      } else {
        setError(data.error || 'Failed to retire launch vehicle')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error retiring launch vehicle:', error)
    }
  }

  const fetchVehicleDetails = async (vehicleId) => {
    setError('')
    try {
      const response = await fetch(`http://127.0.0.1:3200/v1/admin/launchvehicle/${vehicleId}`, {
        headers: { 'controlUserSessionId': sessionId }
      })
      const data = await response.json()
      if (response.ok) {
        setSelectedVehicle(data)
        setFormData({
          name: data.name || '',
          description: data.description || '',
          maxCrewWeight: data.maxCrewWeight?.toString() || '',
          maxPayloadWeight: data.maxPayloadWeight?.toString() || '',
          launchVehicleWeight: data.launchVehicleWeight?.toString() || '',
          thrustCapacity: data.thrustCapacity?.toString() || '',
          maneuveringFuel: data.startingManeuveringFuel?.toString() || ''
        })
      } else {
        setError(data.error || 'Failed to fetch vehicle details')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error fetching vehicle details:', error)
    }
  }

  const getStateColor = (state) => {
    switch (state?.toUpperCase()) {
      case 'MISSION_COMPLETE':
        return '#10b981'
      case 'ON_EARTH':
        return '#6b7280'
      default:
        return '#f59e0b'
    }
  }

  return (
    <div className="launch-vehicles-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">LAUNCH VEHICLES</h1>
          <button 
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + REGISTER VEHICLE
          </button>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button className="error-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading launch vehicles...</div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map((vehicle) => (
              <div key={vehicle.launchVehicleId} className="vehicle-card">
                <div className="vehicle-header">
                  <h3 className="vehicle-name">{vehicle.name}</h3>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(vehicle.launchVehicleId)}
                    disabled={vehicle.assigned || vehicle.inLaunch}
                    title={vehicle.assigned || vehicle.inLaunch ? 'Cannot retire: Vehicle is in use' : 'Retire Vehicle'}
                  >
                    ×
                  </button>
                </div>
                <div className="vehicle-status">
                  <span className={`status-badge ${vehicle.assigned || vehicle.inLaunch ? 'in-use' : 'available'}`}>
                    {vehicle.assigned || vehicle.inLaunch ? 'IN USE' : 'AVAILABLE'}
                  </span>
                </div>
                <button 
                  className="view-details-btn"
                  onClick={() => fetchVehicleDetails(vehicle.launchVehicleId)}
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
              <h2>Register New Launch Vehicle</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>NAME</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>DESCRIPTION</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>MAX CREW WEIGHT (kg)</label>
                  <input
                    type="number"
                    min="100"
                    max="1000"
                    value={formData.maxCrewWeight}
                    onChange={(e) => setFormData({ ...formData, maxCrewWeight: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>MAX PAYLOAD WEIGHT (kg)</label>
                  <input
                    type="number"
                    min="100"
                    max="1000"
                    value={formData.maxPayloadWeight}
                    onChange={(e) => setFormData({ ...formData, maxPayloadWeight: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>LAUNCH VEHICLE WEIGHT (kg)</label>
                  <input
                    type="number"
                    min="1000"
                    max="100000"
                    value={formData.launchVehicleWeight}
                    onChange={(e) => setFormData({ ...formData, launchVehicleWeight: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>THRUST CAPACITY (N)</label>
                  <input
                    type="number"
                    min="100000"
                    max="10000000"
                    value={formData.thrustCapacity}
                    onChange={(e) => setFormData({ ...formData, thrustCapacity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>MANEUVERING FUEL (units)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={formData.maneuveringFuel}
                    onChange={(e) => setFormData({ ...formData, maneuveringFuel: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">REGISTER</button>
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

        {selectedVehicle && (
          <div className="modal-overlay" onClick={() => {
            setSelectedVehicle(null)
            setShowEditModal(false)
          }}>
            <div className="modal-content xlarge" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Launch Vehicle Details: {selectedVehicle.name}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setSelectedVehicle(null)
                    setShowEditModal(false)
                  }}
                >
                  ×
                </button>
              </div>

              {!showEditModal && (
                <>
                  <div className="vehicle-details">
                    <div className="detail-section">
                      <h3>Vehicle Information</h3>
                      <div className="detail-row">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{selectedVehicle.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Description:</span>
                        <span className="detail-value">{selectedVehicle.description || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Max Crew Weight:</span>
                        <span className="detail-value">{selectedVehicle.maxCrewWeight} kg</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Max Payload Weight:</span>
                        <span className="detail-value">{selectedVehicle.maxPayloadWeight} kg</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Vehicle Weight:</span>
                        <span className="detail-value">{selectedVehicle.launchVehicleWeight} kg</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Thrust Capacity:</span>
                        <span className="detail-value">{selectedVehicle.thrustCapacity} N</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Starting Maneuvering Fuel:</span>
                        <span className="detail-value">{selectedVehicle.startingManeuveringFuel} units</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Retired:</span>
                        <span className="detail-value">{selectedVehicle.retired ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Added:</span>
                        <span className="detail-value">
                          {selectedVehicle.timeAdded ? new Date(selectedVehicle.timeAdded * 1000).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Last Edited:</span>
                        <span className="detail-value">
                          {selectedVehicle.timeLastEdited ? new Date(selectedVehicle.timeLastEdited * 1000).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {selectedVehicle.launches && selectedVehicle.launches.length > 0 && (
                      <div className="detail-section">
                        <h3>Launch History</h3>
                        <div className="launches-list">
                          {selectedVehicle.launches.map((launch, index) => (
                            <div key={index} className="launch-history-item">
                              <div className="launch-info">
                                <span className="launch-summary">{launch.launch}</span>
                                <span 
                                  className="launch-state"
                                  style={{ color: getStateColor(launch.state) }}
                                >
                                  {launch.state}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    {!selectedVehicle.retired && !selectedVehicle.assigned && !selectedVehicle.inLaunch && (
                      <button 
                        className="action-btn"
                        onClick={() => setShowEditModal(true)}
                      >
                        EDIT VEHICLE
                      </button>
                    )}
                    <button 
                      className="close-btn"
                      onClick={() => {
                        setSelectedVehicle(null)
                        setShowEditModal(false)
                      }}
                    >
                      CLOSE
                    </button>
                  </div>
                </>
              )}

              {showEditModal && (
                <div className="edit-section">
                  <h3>Edit Launch Vehicle</h3>
                  <form onSubmit={handleEdit}>
                    <div className="form-group">
                      <label>NAME</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>DESCRIPTION</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows="3"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>MAX CREW WEIGHT (kg)</label>
                      <input
                        type="number"
                        min="100"
                        max="1000"
                        value={formData.maxCrewWeight}
                        onChange={(e) => setFormData({ ...formData, maxCrewWeight: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>MAX PAYLOAD WEIGHT (kg)</label>
                      <input
                        type="number"
                        min="100"
                        max="1000"
                        value={formData.maxPayloadWeight}
                        onChange={(e) => setFormData({ ...formData, maxPayloadWeight: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>LAUNCH VEHICLE WEIGHT (kg)</label>
                      <input
                        type="number"
                        min="1000"
                        max="100000"
                        value={formData.launchVehicleWeight}
                        onChange={(e) => setFormData({ ...formData, launchVehicleWeight: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>THRUST CAPACITY (N)</label>
                      <input
                        type="number"
                        min="100000"
                        max="10000000"
                        value={formData.thrustCapacity}
                        onChange={(e) => setFormData({ ...formData, thrustCapacity: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>MANEUVERING FUEL (units)</label>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={formData.maneuveringFuel}
                        onChange={(e) => setFormData({ ...formData, maneuveringFuel: e.target.value })}
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LaunchVehicles
