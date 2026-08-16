import React from 'react';
import { Charger } from '../types';
import { Socket } from 'socket.io-client';

interface ChargerListProps {
  chargers: Charger[];
  socket: Socket;
  token: string | null;
}

export default function ChargerList({ chargers, socket, token }: ChargerListProps) {
  const handleSimulateFault = (id: string) => {
    if (token) socket.emit('simulateFault', { chargerId: id, token }, (res: any) => {
      if (res.error) alert(res.error);
    });
  };

  const handleCompleteSession = (id: string) => {
    if (token) socket.emit('completeSession', { chargerId: id, token }, (res: any) => {
      if (res.error) alert(res.error);
    });
  };

  const getStatusClass = (status: string) => {
    if (status === 'AVAILABLE') return 'full';
    if (status === 'CHARGING') return 'partial';
    return 'cancelled';
  };

  return (
    <div className="sheet-card">
      <h2 className="section-title" style={{marginBottom: 20}}>
        ⚡ Charging Stations
      </h2>
      <div className="turf-list">
        {chargers.map(charger => (
          <div key={charger.id} className="turf-list-card">
            <div className="turf-list-info">
              <h4>{charger.name || `Charger - ${charger.type}`}</h4>
              <p style={{fontSize: 12, color: 'var(--text-secondary)'}}>Status: {charger.status}</p>
              {charger.vehicleId && (
                <p style={{fontSize: 12, color: 'var(--text-secondary)'}}>Vehicle: {charger.vehicleId}</p>
              )}
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, justifyContent: 'center'}}>
              <span className={`bk-status ${getStatusClass(charger.status)}`}>
                {charger.status}
              </span>
              
              {charger.status === 'CHARGING' && token && (
                <div style={{display: 'flex', gap: 5}}>
                  <button onClick={() => handleCompleteSession(charger.id)} className="book-btn-sm" style={{fontSize: 10, padding: '5px 10px'}}>Complete</button>
                  <button onClick={() => handleSimulateFault(charger.id)} className="book-btn-sm" style={{fontSize: 10, padding: '5px 10px', background: '#ef4444'}}>Fault</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {chargers.length === 0 && (
          <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: 20}}>
            No chargers available.
          </div>
        )}
      </div>
    </div>
  );
}
