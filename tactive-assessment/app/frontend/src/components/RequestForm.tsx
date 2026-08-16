import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

interface RequestFormProps {
  socket: Socket;
}

export default function RequestForm({ socket }: RequestFormProps) {
  const [vehicleId, setVehicleId] = useState('');
  const [requestedType, setRequestedType] = useState('CCS');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId.trim()) return;

    setIsLoading(true);
    setError('');

    socket.emit('requestCharger', { vehicleId, requestedType }, (response: any) => {
      setIsLoading(false);
      if (response.success) {
        setVehicleId('');
      } else {
        setError(response.error || 'Failed to request charger');
      }
    });
  };

  return (
    <div className="sheet-card">
      <h2 className="section-title" style={{marginBottom: 20}}>
        ➕ New Charging Request
      </h2>
      
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 15}}>
        {error && (
          <div style={{background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 10, borderRadius: 8, fontSize: 14}}>
            {error}
          </div>
        )}
        
        <div>
          <label style={{display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5}}>Vehicle Registration / ID</label>
          <input
            type="text"
            className="input-field"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            placeholder="e.g. EV-01"
            style={{marginBottom: 0}}
            required
          />
        </div>

        <div>
          <label style={{display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5}}>Connector Type</label>
          <select
            className="input-field"
            value={requestedType}
            onChange={(e) => setRequestedType(e.target.value)}
            style={{marginBottom: 0, appearance: 'auto'}}
          >
            <option value="CCS">CCS</option>
            <option value="Type 2">Type 2</option>
            <option value="CHAdeMO">CHAdeMO</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !vehicleId.trim()}
          className="fbb-btn"
          style={{position: 'static', width: '100%', marginTop: 10}}
        >
          {isLoading ? 'Processing...' : 'Request Charger'}
        </button>
      </form>
    </div>
  );
}
