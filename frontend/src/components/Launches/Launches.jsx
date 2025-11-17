import React, { useState, useEffect } from 'react'
import './Launches.css'
import { apiFetch } from '../../api.js'

const Launches = ({ sessionId }) => {
  const [launches, setLaunches] = useState({ activeLaunches: [], completedLaunches: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLaunch, setSelectedLaunch] = useState(null)
  const [selectedMissionId, setSelectedMissionId] = useState(null)
  const [availableAstronauts, setAvailableAstronauts] = useState([])
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState('')

  useEffect(() => {
    fetchLaunches()
  }, [sessionId])

  const fetchLaunches = async () => {
    setError('')
    try {
      const response = await apiFetch('/v1/admin/launch/list', {
        headers: { 'controlUserSessionId': sessionId }
      })

      const data = await response.json()

      if (response.ok) {
        setLaunches({
          activeLaunches: data.activeLaunches || [],
          completedLaunches: data.completedLaunches || []
        })
      } else {
        setError(data.error || 'Failed to fetch launches')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error fetching launches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLaunchDetails = async (missionId, launchId) => {
    setError('')
    try {
      const response = await apiFetch(
        `/v1/admin/mission/${missionId}/launch/${launchId}`,
        {
          headers: { 'controlUserSessionId': sessionId }
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSelectedLaunch(data)
        setSelectedMissionId(missionId)
        fetchAvailableAstronauts(missionId)
      } else {
        setError(data.error || 'Failed to fetch launch details')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error fetching launch details:', error)
    }
  }

  const fetchAvailableAstronauts = async (missionId) => {
    try {
      const response = await apiFetch(`/v1/admin/mission/${missionId}`, {
        headers: { 'controlUserSessionId': sessionId }
      })
      const data = await response.json()

      if (response.ok && data.assignedAstronauts) {
        setAvailableAstronauts(data.assignedAstronauts || [])
      }
    } catch (error) {
      console.error('Error fetching available astronauts:', error)
    }
  }

  const handleStatusUpdate = async (action) => {
    setError('')

    try {
      const response = await apiFetch(
        `/v1/admin/mission/${selectedMissionId}/launch/${selectedLaunch.launchId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'controlUserSessionId': sessionId
          },
          body: JSON.stringify({ action })
        }
      )

      const data = await response.json()

      if (response.ok) {
        fetchLaunchDetails(selectedMissionId, selectedLaunch.launchId)
        fetchLaunches()
        setShowStatusModal(false)
        setStatusAction('')
      } else {
        setError(data.error || 'Failed to update launch status')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error updating launch status:', error)
    }
  }

  const handleAllocateAstronaut = async (astronautId) => {
    setError('')

    try {
      const response = await apiFetch(
        `/v1/admin/mission/${selectedMissionId}/launch/${selectedLaunch.launchId}/allocate/${astronautId}`,
        {
          method: 'POST',
          headers: { 'controlUserSessionId': sessionId }
        }
      )

      const data = await response.json()

      if (response.ok) {
        fetchLaunchDetails(selectedMissionId, selectedLaunch.launchId)
      } else {
        setError(data.error || 'Failed to allocate astronaut')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error allocating astronaut:', error)
    }
  }

  const handleDeallocateAstronaut = async (astronautId) => {
    setError('')

    try {
      const response = await apiFetch(
        `/v1/admin/mission/${selectedMissionId}/launch/${selectedLaunch.launchId}/allocate/${astronautId}`,
        {
          method: 'DELETE',
          headers: { 'controlUserSessionId': sessionId }
        }
      )

      const data = await response.json()

      if (response.ok) {
        fetchLaunchDetails(selectedMissionId, selectedLaunch.launchId)
      } else {
        setError(data.error || 'Failed to deallocate astronaut')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error deallocating astronaut:', error)
    }
  }

  const getStatusColor = (state) => {
    switch (state?.toUpperCase()) {
      case 'READY_TO_LAUNCH': return '#3b82f6'
      case 'LAUNCHING': return '#f59e0b'
      case 'MANEUVERING': return '#8b5cf6'
      case 'RE-ENTRY': return '#ef4444'
      case 'COASTING': return '#10b981'
      case 'MISSION_COMPLETE': return '#059669'
      case 'ON_EARTH': return '#6b7280'
      default: return 'var(--text-secondary)'
    }
  }

  const getAvailableActions = (state) => {
    const s = state?.toUpperCase()
    const actions = []

    if (s === 'READY_TO_LAUNCH') actions.push('LIFTOFF')
    if (s === 'LAUNCHING') actions.push('SKIP_WAITING', 'FIRE_THRUSTERS')
    if (s === 'MANEUVERING') actions.push('CORRECTION', 'DEPLOY_PAYLOAD')
    if (s === 'COASTING' || s === 'RE-ENTRY') actions.push('GO_HOME', 'RETURN')
    if (s !== 'ON_EARTH' && s !== 'MISSION_COMPLETE') actions.push('FAULT')

    return actions
  }

  const unallocatedAstronauts = availableAstronauts.filter(
    ast => !selectedLaunch?.allocatedAstronauts?.some(
      allocated => allocated.astronautId === ast.astronautId
    )
  )

  return (
    <div className="launches-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">LAUNCHES</h1>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button className="error-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading launches...</div>
        ) : (
          <>
            {/* ACTIVE LAUNCHES */}
            <div className="launches-section">
              <h2 className="section-title">ACTIVE LAUNCHES</h2>
              <div className="launches-grid">
                {launches.activeLaunches.length > 0 ? (
                  launches.activeLaunches.map((launchId) => (
                    <div key={launchId} className="launch-card">
                      <div className="launch-header">
                        <h3 className="launch-id">Launch #{launchId}</h3>

                        <button
                          className="view-details-btn"
                          onClick={async () => {
                            const missionsRes = await apiFetch('/v1/admin/mission/list', {
                              headers: { 'controlUserSessionId': sessionId }
                            })
                            if (missionsRes.ok) {
                              const missionsData = await missionsRes.json()
                              for (const mission of missionsData.missions || []) {
                                try {
                                  const launchRes = await apiFetch(
                                    `/v1/admin/mission/${mission.missionId}/launch/${launchId}`,
                                    { headers: { 'controlUserSessionId': sessionId } }
                                  )
                                  if (launchRes.ok) {
                                    fetchLaunchDetails(mission.missionId, launchId)
                                    break
                                  }
                                } catch (_) {}
                              }
                            }
                          }}
                        >
                          VIEW DETAILS →
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state"><p>No active launches</p></div>
                )}
              </div>
            </div>

            {/* COMPLETED LAUNCHES */}
            <div className="launches-section">
              <h2 className="section-title">COMPLETED LAUNCHES</h2>
              <div className="launches-grid">
                {launches.completedLaunches.length > 0 ? (
                  launches.completedLaunches.map((launchId) => (
                    <div key={launchId} className="launch-card completed">
                      <div className="launch-header">
                        <h3 className="launch-id">Launch #{launchId}</h3>

                        <button
                          className="view-details-btn"
                          onClick={async () => {
                            const missionsRes = await apiFetch('/v1/admin/mission/list', {
                              headers: { 'controlUserSessionId': sessionId }
                            })
                            if (missionsRes.ok) {
                              const missionsData = await missionsRes.json()
                              for (const mission of missionsData.missions || []) {
                                try {
                                  const launchRes = await apiFetch(
                                    `/v1/admin/mission/${mission.missionId}/launch/${launchId}`,
                                    { headers: { 'controlUserSessionId': sessionId } }
                                  )
                                  if (launchRes.ok) {
                                    fetchLaunchDetails(mission.missionId, launchId)
                                    break
                                  }
                                } catch (_) {}
                              }
                            }
                          }}
                        >
                          VIEW DETAILS →
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state"><p>No completed launches</p></div>
                )}
              </div>
            </div>
          </>
        )}

        {/* LAUNCH DETAILS MODAL */}
        {selectedLaunch && (
          <div className="modal-overlay" onClick={() => {
            setSelectedLaunch(null)
            setShowStatusModal(false)
          }}>
            <div className="modal-content xlarge" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Launch Details: #{selectedLaunch.launchId}</h2>
                <button
                  className="close-btn"
                  onClick={() => {
                    setSelectedLaunch(null)
                    setShowStatusModal(false)
                  }}
                >
                  ×
                </button>
              </div>

              {/* DETAILS HERE — unchanged */}
              {/* STATUS SECTION */}
              {!showStatusModal ? (
                <>
                  {/* ... all existing launch detail JSX unchanged ... */}

                  <div className="modal-actions">
                    {getAvailableActions(selectedLaunch.state).length > 0 && (
                      <button
                        className="action-btn"
                        onClick={() => setShowStatusModal(true)}
                      >
                        UPDATE STATUS
                      </button>
                    )}
                    <button
                      className="close-btn"
                      onClick={() => {
                        setSelectedLaunch(null)
                        setShowStatusModal(false)
                      }}
                    >
                      CLOSE
                    </button>
                  </div>
                </>
              ) : (
                <div className="status-update-section">
                  <h3>Update Launch Status</h3>
                  <p>Current State: <strong>{selectedLaunch.state}</strong></p>

                  <div className="actions-list">
                    {getAvailableActions(selectedLaunch.state).map((action) => (
                      <button
                        key={action}
                        className={`status-action-btn ${statusAction === action ? 'selected' : ''}`}
                        onClick={() => setStatusAction(action)}
                      >
                        {action.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="modal-actions">
                    <button
                      className="submit-btn"
                      onClick={() => statusAction && handleStatusUpdate(statusAction)}
                      disabled={!statusAction}
                    >
                      EXECUTE ACTION
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setShowStatusModal(false)
                        setStatusAction('')
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Launches
