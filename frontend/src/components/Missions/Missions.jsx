import React, { useState, useEffect } from 'react'
import './Missions.css'
import { apiFetch } from '../../api'

const Missions = ({ sessionId }) => {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedMission, setSelectedMission] = useState(null)
  const [availableAstronauts, setAvailableAstronauts] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showLaunchModal, setShowLaunchModal] = useState(false)
  const [launchVehicles, setLaunchVehicles] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target: ''
  })

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    target: ''
  })

  const [launchFormData, setLaunchFormData] = useState({
    launchVehicleId: '',
    payload: { description: '', weight: '' },
    launchParameters: {
      targetDistance: '',
      fuelBurnRate: '',
      thrustFuel: '',
      activeGravityForce: '',
      maneuveringDelay: ''
    }
  })

  // ========================================
  // LOAD DATA
  // ========================================
  useEffect(() => {
    fetchMissions()
    fetchAstronauts()
    fetchLaunchVehicles()
  }, [sessionId])

  // ========================================
  // FETCH: Missions
  // ========================================
  const fetchMissions = async () => {
    setError('')
    try {
      const res = await apiFetch('/v1/admin/mission/list', {
        headers: { controlUserSessionId: sessionId }
      })
      const data = await res.json()
      if (res.ok) setMissions(data.missions || [])
      else setError(data.error || 'Failed to fetch missions')
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // FETCH: Astronaut Pool
  // ========================================
  const fetchAstronauts = async () => {
    try {
      const res = await apiFetch('/v1/admin/astronaut/pool', {
        headers: { controlUserSessionId: sessionId }
      })
      const data = await res.json()
      if (res.ok) setAvailableAstronauts(data.astronauts || [])
    } catch (err) {
      console.error(err)
    }
  }

  // ========================================
  // FETCH: Launch Vehicles
  // ========================================
  const fetchLaunchVehicles = async () => {
    try {
      const res = await apiFetch('/v1/admin/launchvehicle/list', {
        headers: { controlUserSessionId: sessionId }
      })
      const data = await res.json()
      if (res.ok) setLaunchVehicles(data.launchVehicles || [])
    } catch (err) {
      console.error(err)
    }
  }

  // ========================================
  // CREATE: Mission
  // ========================================
  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await apiFetch('/v1/admin/mission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          controlUserSessionId: sessionId
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', description: '', target: '' })
        fetchMissions()
      } else setError(data.error || 'Failed to create mission')
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    }
  }

  // ========================================
  // DELETE: Mission
  // ========================================
  const handleDelete = async (missionId) => {
    if (!window.confirm('Are you sure you want to delete this mission?')) return
    setError('')

    try {
      const res = await apiFetch(`/v1/admin/mission/${missionId}`, {
        method: 'DELETE',
        headers: { controlUserSessionId: sessionId }
      })
      const data = await res.json()

      if (res.ok) fetchMissions()
      else setError(data.error || 'Failed to delete mission')
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    }
  }

  // ========================================
  // GET: Mission Details
  // ========================================
  const fetchMissionDetails = async (missionId) => {
    setError('')
    try {
      const res = await apiFetch(`/v1/admin/mission/${missionId}`, {
        headers: { controlUserSessionId: sessionId }
      })
      const data = await res.json()

      if (res.ok) {
        setSelectedMission(data)
        setEditFormData({
          name: data.name,
          description: data.description,
          target: data.target
        })
      } else setError(data.error || 'Failed to fetch mission details')
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    }
  }

  // ========================================
  // EDIT: Name/Description/Target
  // ========================================
  const handleEdit = async (field, value) => {
    setError('')

    const endpoints = {
      name: `/v1/admin/mission/${selectedMission.missionId}/name`,
      description: `/v1/admin/mission/${selectedMission.missionId}/description`,
      target: `/v1/admin/mission/${selectedMission.missionId}/target`
    }

    try {
      const res = await apiFetch(endpoints[field], {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          controlUserSessionId: sessionId
        },
        body: JSON.stringify({ [field]: value })
      })

      const data = await res.json()

      if (res.ok) {
        fetchMissionDetails(selectedMission.missionId)
        fetchMissions()
      } else setError(data.error || `Failed to update ${field}`)
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    }
  }

  // ========================================
  // POST: Assign Astronaut
  // ========================================
  const handleAssignAstronaut = async (astronautId) => {
    try {
      const res = await apiFetch(
        `/v1/admin/mission/${selectedMission.missionId}/assign/${astronautId}`,
        {
          method: 'POST',
          headers: { controlUserSessionId: sessionId }
        }
      )
      const data = await res.json()

      if (res.ok) {
        fetchMissionDetails(selectedMission.missionId)
        fetchAstronauts()
      } else setError(data.error || 'Failed to assign astronaut')
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    }
  }

  // ========================================
  // DELETE: Unassign Astronaut
  // ========================================
  const handleUnassignAstronaut = async (astronautId) => {
    try {
      const res = await apiFetch(
        `/v1/admin/mission/${selectedMission.missionId}/assign/${astronautId}`,
        {
          method: 'DELETE',
          headers: { controlUserSessionId: sessionId }
        }
      )

      const data = await res.json()

      if (res.ok) {
        fetchMissionDetails(selectedMission.missionId)
        fetchAstronauts()
      } else setError(data.error || 'Failed to unassign astronaut')
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    }
  }

  // ========================================
  // POST: Create Launch
  // ========================================
  const handleCreateLaunch = async (e) => {
    e.preventDefault()
    setError('')

    const payload = {
      launchVehicleId: parseInt(launchFormData.launchVehicleId),
      payload: {
        description: launchFormData.payload.description,
        weight: parseFloat(launchFormData.payload.weight)
      },
      launchParameters: {
        targetDistance: parseFloat(launchFormData.launchParameters.targetDistance),
        fuelBurnRate: parseFloat(launchFormData.launchParameters.fuelBurnRate),
        thrustFuel: parseFloat(launchFormData.launchParameters.thrustFuel),
        activeGravityForce: parseFloat(launchFormData.launchParameters.activeGravityForce),
        maneuveringDelay: parseInt(launchFormData.launchParameters.maneuveringDelay)
      }
    }

    try {
      const res = await apiFetch(
        `/v1/admin/mission/${selectedMission.missionId}/launch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            controlUserSessionId: sessionId
          },
          body: JSON.stringify(payload)
        }
      )

      const data = await res.json()

      if (res.ok) {
        setShowLaunchModal(false)
        setLaunchFormData({
          launchVehicleId: '',
          payload: { description: '', weight: '' },
          launchParameters: {
            targetDistance: '',
            fuelBurnRate: '',
            thrustFuel: '',
            activeGravityForce: '',
            maneuveringDelay: ''
          }
        })
        alert(`Launch created successfully! Launch ID: ${data.launchId}`)
      } else {
        setError(data.error || 'Failed to create launch')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    }
  }

  // ========================================
  // FILTER: Unassigned Astronauts
  // ========================================
  const unassignedAstronauts = availableAstronauts.filter(
    ast =>
      !ast.assigned ||
      !selectedMission?.assignedAstronauts?.some(
        assigned => assigned.astronautId === ast.astronautId
      )
  )

  // ========================================
  // UI (UNCHANGED)
  // ========================================
// ========================================
// UI (UNCHANGED)
// ========================================
  return (
    <div className="missions-page">
      <div className="page-container">

        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">MISSIONS</h1>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>
            + CREATE MISSION
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            {error}
            <button className="error-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Mission Cards */}
        {loading ? (
          <div className="loading">Loading missions...</div>
        ) : (
          <div className="missions-grid">
            {missions.map((mission) => (
              <div key={mission.missionId} className="mission-card">
                <div className="mission-header">
                  <h3 className="mission-name">{mission.name}</h3>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(mission.missionId)}
                  >
                    ×
                  </button>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => fetchMissionDetails(mission.missionId)}
                >
                  VIEW DETAILS →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create Mission Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Mission</h2>
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
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>TARGET</label>
                  <input
                    type="text"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
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

        {/* Mission Details Modal */}
        {selectedMission && (
          <div
            className="modal-overlay"
            onClick={() => {
              setSelectedMission(null)
              setShowEditModal(false)
              setShowAssignModal(false)
              setShowLaunchModal(false)
            }}
          >
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Mission Details: {selectedMission.name}</h2>
                <button
                  className="close-btn"
                  onClick={() => {
                    setSelectedMission(null)
                    setShowEditModal(false)
                    setShowAssignModal(false)
                    setShowLaunchModal(false)
                  }}
                >
                  ×
                </button>
              </div>

              {/* Default View */}
              {!showEditModal && !showAssignModal && !showLaunchModal && (
                <>
                  <div className="mission-details">
                    {/* Mission Info */}
                    <div className="detail-section">
                      <div className="detail-row">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{selectedMission.name}</span>
                        <button
                          className="edit-icon-btn"
                          onClick={() => setShowEditModal(true)}
                        >
                          ✏️
                        </button>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Description:</span>
                        <span className="detail-value">{selectedMission.description || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Target:</span>
                        <span className="detail-value">{selectedMission.target || 'N/A'}</span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">
                          {selectedMission.timeCreated
                            ? new Date(selectedMission.timeCreated * 1000).toLocaleString()
                            : 'N/A'}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Last Edited:</span>
                        <span className="detail-value">
                          {selectedMission.timeLastEdited
                            ? new Date(selectedMission.timeLastEdited * 1000).toLocaleString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Astronauts */}
                    <div className="detail-section">
                      <div className="section-header">
                        <h3>
                          Assigned Astronauts (
                          {selectedMission.assignedAstronauts?.length || 0})
                        </h3>
                        <button
                          className="action-btn-small"
                          onClick={() => {
                            fetchAstronauts()
                            setShowAssignModal(true)
                          }}
                        >
                          + Assign Astronaut
                        </button>
                      </div>

                      {selectedMission.assignedAstronauts &&
                      selectedMission.assignedAstronauts.length > 0 ? (
                        <div className="astronauts-list">
                          {selectedMission.assignedAstronauts.map((astronaut) => (
                            <div key={astronaut.astronautId} className="astronaut-item">
                              <span>{astronaut.designation}</span>
                              <button
                                className="remove-btn-small"
                                onClick={() => handleUnassignAstronaut(astronaut.astronautId)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="empty-state-text">No astronauts assigned</p>
                      )}
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      className="action-btn"
                      onClick={() => {
                        fetchLaunchVehicles()
                        setShowLaunchModal(true)
                      }}
                    >
                      CREATE LAUNCH
                    </button>

                    <button
                      className="close-btn"
                      onClick={() => {
                        setSelectedMission(null)
                        setShowEditModal(false)
                        setShowAssignModal(false)
                        setShowLaunchModal(false)
                      }}
                    >
                      CLOSE
                    </button>
                  </div>
                </>
              )}

              {/* Edit Mission Modal */}
              {showEditModal && (
                <div className="edit-section">
                  <h3>Edit Mission</h3>

                  <div className="form-group">
                    <label>NAME</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, name: e.target.value })
                      }
                    />
                    <button
                      className="save-btn-small"
                      onClick={() => {
                        handleEdit('name', editFormData.name)
                        setShowEditModal(false)
                      }}
                    >
                      Save
                    </button>
                  </div>

                  <div className="form-group">
                    <label>DESCRIPTION</label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, description: e.target.value })
                      }
                      rows="3"
                    />
                    <button
                      className="save-btn-small"
                      onClick={() => {
                        handleEdit('description', editFormData.description)
                        setShowEditModal(false)
                      }}
                    >
                      Save
                    </button>
                  </div>

                  <div className="form-group">
                    <label>TARGET</label>
                    <input
                      type="text"
                      value={editFormData.target}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, target: e.target.value })
                      }
                    />
                    <button
                      className="save-btn-small"
                      onClick={() => {
                        handleEdit('target', editFormData.target)
                        setShowEditModal(false)
                      }}
                    >
                      Save
                    </button>
                  </div>

                  <button
                    className="cancel-btn"
                    onClick={() => setShowEditModal(false)}
                  >
                    Back
                  </button>
                </div>
              )}

              {/* Assign Astronaut Modal */}
              {showAssignModal && (
                <div className="assign-section">
                  <h3>Assign Astronaut to Mission</h3>

                  <div className="astronauts-list">
                    {unassignedAstronauts.length > 0 ? (
                      unassignedAstronauts.map((astronaut) => (
                        <div key={astronaut.astronautId} className="astronaut-item">
                          <span>{astronaut.designation}</span>
                          <button
                            className="assign-btn-small"
                            onClick={() => handleAssignAstronaut(astronaut.astronautId)}
                          >
                            Assign
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="empty-state-text">No available astronauts</p>
                    )}
                  </div>

                  <button
                    className="cancel-btn"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Back
                  </button>
                </div>
              )}

              {/* Create Launch Modal */}
              {showLaunchModal && (
                <div className="launch-section">
                  <h3>Create Launch</h3>
                  <form onSubmit={handleCreateLaunch}>
                    <div className="form-group">
                      <label>LAUNCH VEHICLE</label>
                      <select
                        value={launchFormData.launchVehicleId}
                        onChange={(e) =>
                          setLaunchFormData({
                            ...launchFormData,
                            launchVehicleId: e.target.value
                          })
                        }
                        required
                      >
                        <option value="">Select Launch Vehicle</option>
                        {launchVehicles
                          .filter((v) => !v.assigned && !v.inLaunch)
                          .map((vehicle) => (
                            <option
                              key={vehicle.launchVehicleId}
                              value={vehicle.launchVehicleId}
                            >
                              {vehicle.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>PAYLOAD DESCRIPTION</label>
                      <input
                        type="text"
                        value={launchFormData.payload.description}
                        onChange={(e) =>
                          setLaunchFormData({
                            ...launchFormData,
                            payload: {
                              ...launchFormData.payload,
                              description: e.target.value
                            }
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>PAYLOAD WEIGHT (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={launchFormData.payload.weight}
                        onChange={(e) =>
                          setLaunchFormData({
                            ...launchFormData,
                            payload: {
                              ...launchFormData.payload,
                              weight: e.target.value
                            }
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>TARGET DISTANCE (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={launchFormData.launchParameters.targetDistance}
                        onChange={(e) =>
                          setLaunchFormData({
                            ...launchFormData,
                            launchParameters: {
                              ...launchFormData.launchParameters,
                              targetDistance: e.target.value
                            }
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>FUEL BURN RATE (kg/s)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={launchFormData.launchParameters.fuelBurnRate}
                        onChange={(e) =>
                          setLaunchFormData({
                            ...launchFormData,
                            launchParameters: {
                              ...launchFormData.launchParameters,
                              fuelBurnRate: e.target.value
                            }
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>THRUST FUEL (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={launchFormData.launchParameters.thrustFuel}
                        onChange={(e) =>
                          setLaunchFormData({
                            ...launchFormData,
                            launchParameters: {
                              ...launchFormData.launchParameters,
                              thrustFuel: e.target.value
                            }
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>ACTIVE GRAVITY FORCE (m/s²)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={launchFormData.launchParameters.activeGravityForce}
                        onChange={(e) =>
                          setLaunchFormData({
                            ...launchFormData,
                            launchParameters: {
                              ...launchFormData.launchParameters,
                              activeGravityForce: e.target.value
                            }
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>MANEUVERING DELAY (seconds)</label>
                      <input
                        type="number"
                        value={launchFormData.launchParameters.maneuveringDelay}
                        onChange={(e) =>
                          setLaunchFormData({
                            ...launchFormData,
                            launchParameters: {
                              ...launchFormData.launchParameters,
                              maneuveringDelay: e.target.value
                            }
                          })
                        }
                        required
                      />
                    </div>

                    <div className="modal-actions">
                      <button type="submit" className="submit-btn">
                        CREATE LAUNCH
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowLaunchModal(false)}
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

export default Missions;


