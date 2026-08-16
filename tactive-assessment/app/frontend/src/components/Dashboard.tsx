import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import ChargerList from './ChargerList';
import QueueList from './QueueList';
import RequestForm from './RequestForm';
import { Charger, QueueItem } from '../types';

interface DashboardProps {
  socket: Socket;
  token: string | null;
}

export default function Dashboard({ socket, token }: DashboardProps) {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    socket.emit('getInitialState');
    
    socket.on('initialState', (state: { chargers: Charger[], queue: QueueItem[] }) => {
      setChargers(state.chargers);
      setQueue(state.queue);
    });

    socket.on('chargerUpdated', (charger: Charger) => {
      setChargers(prev => prev.map(c => c.id === charger.id ? charger : c));
    });

    socket.on('queueUpdated', (newQueue: QueueItem[]) => {
      setQueue(newQueue);
    });

    return () => {
      socket.off('initialState');
      socket.off('chargerUpdated');
      socket.off('queueUpdated');
    };
  }, [socket]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '0 20px' }}>
      <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <ChargerList chargers={chargers} socket={socket} token={token} />
        <QueueList queue={queue} />
      </div>
      <div style={{ flex: '1 1 300px' }}>
        <RequestForm socket={socket} />
      </div>
    </div>
  );
}
