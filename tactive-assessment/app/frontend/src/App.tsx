import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Dashboard from './components/Dashboard';

const SOCKET_URL = 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleLogin = async () => {
    const username = prompt('Username (Hint: operator)');
    const password = prompt('Password (Hint: admin123)');
    if (username && password) {
      try {
        const res = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          alert('Logged in as Operator');
        } else {
          alert('Invalid credentials');
        }
      } catch (e) {
        alert('Login failed');
      }
    }
  };

  return (
    <>
      <header className="top-header">
        <div className="logo">
          <span style={{color: 'var(--primary-color)'}}>⚡</span> EVChargeFlow
        </div>
        <div>
          {token ? (
            <span className="welcome-pill">Operator Active</span>
          ) : (
            <button onClick={handleLogin} className="book-btn-sm" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
              Operator Login
            </button>
          )}
        </div>
      </header>
      
      <main>
        {socket ? <Dashboard socket={socket} token={token} /> : <p style={{textAlign: 'center'}}>Connecting...</p>}
      </main>
    </>
  );
}

export default App;
