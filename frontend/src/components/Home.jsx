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
            fontFamily: 'Inter, sans-serif'
        }}>
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