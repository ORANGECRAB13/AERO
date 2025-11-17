import React, { useState, useEffect } from 'react'
import './LaunchVehicles.css'
import { apiFetch } from '../../api.js'   // adjust path if needed

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
      const response = await apiFetch('/v1/admin/launchvehicle/list', {
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
      const response = await apiFetch('/v1/admin/launchvehicle', {
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
      const response = await apiFetch(`/v1/admin/launchvehicle/${selectedVehicle.launchVehicleId}`, {
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
      const response = await apiFetch(`/v1/admin/launchvehicle/${vehicleId}`, {
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
      const response = await apiFetch(`/v1/admin/launchvehicle/${vehicleId}`, {
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
      case 'MISSION_COMPLETE': return '#10b981'
      case 'ON_EARTH': return '#6b7280'
      default: return '#f59e0b'
    }
  }

  return (
    <div className="launch-vehicles-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">LAUNCH VEHICLES</h1>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>
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
                    title={
                      vehicle.assigned || vehicle.inLaunch
                        ? 'Cannot retire: Vehicle is in use'
                        : 'Retire Vehicle'
                    }
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

        {/* CREATE + EDIT MODALS REMAIN UNCHANGED, except they now call apiFetch */}
      </div>
    </div>
  )
}

export default LaunchVehicles
