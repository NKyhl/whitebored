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
        <div style={{ padding: 20 }}>
            <h1>Welcome to Whitebored</h1>
            <button onClick={createCanvas}>Create New Canvas</button>
            <div style={{ marginTop: 20 }}>
                <input 
                    type="text"
                    placeholder="Enter canvas code"
                    value={joinID}
                    onChange={e => setJoinID(e.target.value)}
                />
                <button onClick={joinCanvas}>Join Canvas</button>
            </div>
        </div>
    )
}

export default Home