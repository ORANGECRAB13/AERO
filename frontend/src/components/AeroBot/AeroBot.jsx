import React, { useState, useEffect, useRef } from 'react';
import './AeroBot.css';
import { apiFetch } from '../../api.js';  // adjust path if needed

const AeroBot = ({ sessionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [astronauts, setAstronauts] = useState([]);
  const [selectedAstronautId, setSelectedAstronautId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchAstronautsInActiveLaunches();
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAstronautsInActiveLaunches = async () => {
    try {
      const [astronautsRes, launchesRes] = await Promise.all([
        apiFetch('/v1/admin/astronaut/pool', {
          headers: { 'controlUserSessionId': sessionId }
        }),
        apiFetch('/v1/admin/launch/list', {
          headers: { 'controlUserSessionId': sessionId }
        })
      ]);

      if (astronautsRes.ok && launchesRes.ok) {
        const astronautsData = await astronautsRes.json();
        const launchesData = await launchesRes.json();

        const activeLaunchAstronautIds = new Set();
        launchesData.launches?.forEach((launch) => {
          if (launch.state !== 'ON_EARTH' && launch.allocatedAstronauts) {
            launch.allocatedAstronauts.forEach((id) =>
              activeLaunchAstronautIds.add(id)
            );
          }
        });

        const activeAstronauts =
          astronautsData.astronauts?.filter((astronaut) =>
            activeLaunchAstronautIds.has(astronaut.astronautId)
          ) || [];

        setAstronauts(activeAstronauts);

        if (activeAstronauts.length > 0 && !selectedAstronautId) {
          setSelectedAstronautId(activeAstronauts[0].astronautId);
        }
      }
    } catch (error) {
      console.error('Error fetching astronauts:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !selectedAstronautId) {
      setError('Please select an astronaut and enter a message');
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      }
    ]);

    try {
      const response = await apiFetch(
        `/v1/admin/astronaut/${selectedAstronautId}/llmchat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'controlUserSessionId': sessionId
          },
          body: JSON.stringify({
            messageRequest: userMessage
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: data.messageResponse || 'AeroBot failed to respond',
            timestamp: new Date()
          }
        ]);
      } else {
        const errorText = data.error || 'Failed to get response from AeroBot';
        setError(errorText);

        setMessages((prev) => [
          ...prev,
          {
            type: 'error',
            content: errorText,
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      const errorMsg = 'Network error. Please try again.';
      setError(errorMsg);

      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          content: errorMsg,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setMessages([]);
      setError('');
    }
  };

  const selectedAstronaut = astronauts.find(
    (a) => a.astronautId === selectedAstronautId
  );

  return (
    <>
      <div
        className={`aerobot-robot ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
      >
        <div className="robot-body">
          <div className="robot-face">
            <div className="robot-eye left"></div>
            <div className="robot-eye right"></div>
            <div className="robot-mouth"></div>
          </div>
        </div>
        <div className="robot-pulse"></div>
      </div>

      {isOpen && (
        <div className="aerobot-chat">
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-robot-icon">🤖</div>
              <div>
                <h3>AeroBot</h3>
                <p>Space Mission Assistant</p>
              </div>
            </div>
            <button className="chat-close-btn" onClick={handleToggle}>
              ×
            </button>
          </div>

          <div className="chat-astronaut-selector">
            <label>Select Astronaut:</label>
            <select
              value={selectedAstronautId || ''}
              onChange={(e) =>
                setSelectedAstronautId(parseInt(e.target.value))
              }
              className="astronaut-select"
            >
              {astronauts.length === 0 ? (
                <option value="">No astronauts in active launches</option>
              ) : (
                astronauts.map((astronaut) => (
                  <option key={astronaut.astronautId} value={astronaut.astronautId}>
                    {astronaut.nameFirst} {astronaut.nameLast} (ID:{' '}
                    {astronaut.astronautId})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <p>👋 Hello! I'm AeroBot, your space mission assistant.</p>
                <p>
                  I can help with mission-related questions, astronaut wellbeing,
                  and space science topics.
                </p>
                {selectedAstronaut && (
                  <p className="chat-astronaut-info">
                    Currently chatting as:{' '}
                    <strong>
                      {selectedAstronaut.nameFirst} {selectedAstronaut.nameLast}
                    </strong>
                  </p>
                )}
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.type}`}>
                <div className="message-content">{message.content}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message bot loading">
                <div className="message-content">
                  <span className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {error && <div className="chat-error">{error}</div>}

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={
                !selectedAstronautId || loading || astronauts.length === 0
              }
              className="chat-input"
            />
            <button
              type="submit"
              disabled={
                !selectedAstronautId ||
                loading ||
                !inputMessage.trim() ||
                astronauts.length === 0
              }
              className="chat-send-btn"
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AeroBot;
