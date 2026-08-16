import React from 'react';
import { QueueItem } from '../types';

interface QueueListProps {
  queue: QueueItem[];
}

export default function QueueList({ queue }: QueueListProps) {
  return (
    <div className="sheet-card">
      <h2 className="section-title" style={{marginBottom: 20}}>
        🚗 Pending Queue ({queue.length})
      </h2>
      
      {queue.length === 0 ? (
        <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: 20}}>
          No vehicles in queue.
        </div>
      ) : (
        <div className="turf-list">
          {queue.map((item, index) => (
            <div key={item.id} className="turf-list-card">
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 20, background: 'var(--bg-color)', color: 'var(--text-secondary)', fontWeight: 'bold'}}>
                #{index + 1}
              </div>
              <div className="turf-list-info" style={{marginLeft: 15}}>
                <h4>{item.vehicleId}</h4>
                <p style={{fontSize: 12, color: 'var(--text-secondary)'}}>Requested Type: {item.requestedType}</p>
                <p style={{fontSize: 10, color: 'var(--text-secondary)'}}>Waiting since: {new Date(item.createdAt).toLocaleTimeString()}</p>
              </div>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span className="bk-status partial">QUEUED</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
