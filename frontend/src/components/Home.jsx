import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

function Home() {
    const [joinID, setJoinID] = useState('');
    const navigate = useNavigate();

    const createCanvas = async () => {
        const res = await fetch('/api/canvas', { method: 'POST' });
        const data = await res.json();
        navigate(`/canvas/${data.canvasID}`)
    }

    const joinCanvas = () => {
        if (joinID.trim() !== '') {
            navigate(`/canvas/${joinID.trim()}`)
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#2C2C2C',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            position: 'relative'
        }}>
            <a
                href="https://github.com/NKyhl/whitebored"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 10,
                    opacity: 0.85,
                    transition: 'opacity 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = 1}
                onMouseOut={e => e.currentTarget.style.opacity = 0.85}
                aria-label="View on GitHub"
            >
                <svg height="32" width="32" viewBox="0 0 16 16" fill="#fff" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                        0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
                        -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2
                        -3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82
                        .64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08
                        2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
                        1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
            </a>
            <h1 style={{ fontWeight: 600, marginBottom: 32, letterSpacing: 1 }}>Whitebored</h1>
            <button
                onClick={createCanvas}
                style={{
                    background: 'none',
                    border: '1px solid #fff',
                    color: '#fff',
                    padding: '12px 32px',
                    borderRadius: 6,
                    fontSize: 18,
                    cursor: 'pointer',
                    marginBottom: 32,
                    transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#222'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
                Create New Canvas
            </button>
            <div style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center'
            }}>
                <input 
                    type="text"
                    placeholder="Enter canvas code"
                    value={joinID}
                    onChange={e => setJoinID(e.target.value)}
                    style={{
                        background: 'none',
                        border: '1px solid #fff',
                        color: '#fff',
                        padding: '10px 16px',
                        borderRadius: 6,
                        fontSize: 16,
                        outline: 'none',
                        width: 180,
                        transition: 'border 0.2s'
                    }}
                />
                <button
                    onClick={joinCanvas}
                    style={{
                        background: 'none',
                        border: '1px solid #fff',
                        color: '#fff',
                        padding: '10px 24px',
                        borderRadius: 6,
                        fontSize: 16,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#222'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                    Join Canvas
                </button>
            </div>
        </div>
    )
}

export default Home