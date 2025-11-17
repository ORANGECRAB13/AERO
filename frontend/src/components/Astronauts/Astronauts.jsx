import React, { useState, useEffect } from 'react';
import './Astronauts.css';
import { apiFetch } from '../../api.js';  // adjust path if needed

const Astronauts = ({ sessionId }) => {
  const [astronauts, setAstronauts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAstronaut, setSelectedAstronaut] = useState(null);
  const [astronautHealth, setAstronautHealth] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [formData, setFormData] = useState({
    nameFirst: '',
    nameLast: '',
    rank: '',
    age: '',
    weight: '',
    height: ''
  });

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
  });

  useEffect(() => {
    fetchAstronauts();
  }, [sessionId]);

  const fetchAstronauts = async () => {
    setError('');
    try {
      const response = await apiFetch('/v1/admin/astronaut/pool', {
        headers: { 'controlUserSessionId': sessionId }
      });
      const data = await response.json();

      if (response.ok) {
        setAstronauts(data.astronauts || []);
      } else {
        setError(data.error || 'Failed to fetch astronauts');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching astronauts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiFetch('/v1/admin/astronaut', {
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
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ nameFirst: '', nameLast: '', rank: '', age: '', weight: '', height: '' });
        fetchAstronauts();
      } else {
        setError(data.error || 'Failed to create astronaut');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error creating astronaut:', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiFetch(`/v1/admin/astronaut/${selectedAstronaut.astronautId}`, {
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
      });

      const data = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        fetchAstronautDetails(selectedAstronaut.astronautId);
        fetchAstronauts();
      } else {
        setError(data.error || 'Failed to update astronaut');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating astronaut:', error);
    }
  };

  const handleDelete = async (astronautId) => {
    if (!window.confirm('Are you sure you want to remove this astronaut?')) return;

    setError('');
    try {
      const response = await apiFetch(`/v1/admin/astronaut/${astronautId}`, {
        method: 'DELETE',
        headers: { 'controlUserSessionId': sessionId }
      });
      const data = await response.json();

      if (response.ok) {
        fetchAstronauts();
      } else {
        setError(data.error || 'Failed to delete astronaut');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error deleting astronaut:', error);
    }
  };

  const fetchAstronautDetails = async (astronautId) => {
    setError('');
    try {
      const response = await apiFetch(`/v1/admin/astronaut/${astronautId}`, {
        headers: { 'controlUserSessionId': sessionId }
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedAstronaut(data);
        setFormData({
          nameFirst: data.designation?.split(' ').slice(1, -1).join(' ') || '',
          nameLast: data.designation?.split(' ').pop() || '',
          rank: data.designation?.split(' ')[0] || '',
          age: data.age?.toString() || '',
          weight: data.weight?.toString() || '',
          height: data.height?.toString() || ''
        });
      } else {
        setError(data.error || 'Failed to fetch astronaut details');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching astronaut details:', error);
    }
  };

  const fetchAstronautHealth = async (astronautId) => {
    setError('');
    try {
      const response = await apiFetch(`/v1/admin/astronaut/${astronautId}/health`, {
        headers: { 'controlUserSessionId': sessionId }
      });

      const data = await response.json();

      if (response.ok) {
        setAstronautHealth(data);
        if (data.physicalHealth && data.mentalHealth) {
          setHealthFormData({
            physicalHealth: data.physicalHealth,
            mentalHealth: data.mentalHealth
          });
        }
      } else {
        setError(data.error || 'Failed to fetch astronaut health');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching astronaut health:', error);
    }
  };

  const handleUpdateHealth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiFetch(`/v1/admin/astronaut/${selectedAstronaut.astronautId}/health`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'controlUserSessionId': sessionId
        },
        body: JSON.stringify(healthFormData)
      });

      const data = await response.json();

      if (response.ok) {
        fetchAstronautHealth(selectedAstronaut.astronautId);
        setShowHealthModal(false);
      } else {
        setError(data.error || 'Failed to update health');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating health:', error);
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'GREEN': return '#10b981';
      case 'YELLOW': return '#f59e0b';
      case 'RED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="astronauts-page">
      {/* ... unchanged UI ... */}
    </div>
  );
};

export default Astronauts;
