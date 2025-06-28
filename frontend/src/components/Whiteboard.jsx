import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function Whiteboard() {
    const { id: canvasID } = useParams()
    const navigate = useNavigate();

    const canvasRef = useRef(null)
    const contextRef = useRef(null);
    const lastPoint = useRef(null);
    const wsRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState([]);
    const strokesRef = useRef(strokes);

    const [penSize, setPenSize] = useState(2);
    const [penColor, setPenColor] = useState('#fff'); // white, red, or eraser

    const ERASER_COLOR = '#2C2C2C';

    useEffect(() => {
        strokesRef.current = strokes;
    }, [strokes])

    // Setup canvas size and proper scaling
    const setupCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1
        // CSS size
        canvas.style.width = `${window.innerWidth}px`
        canvas.style.height = `${window.innerHeight}px`
        // Actual pixel size
        canvas.width = window.innerWidth * dpr
        canvas.height = window.innerHeight * dpr

        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)
        contextRef.current = ctx;

        // Redraw all strokes on resized canvas
        strokesRef.current.forEach(drawStroke);
    }, []);

    // Initialize canvas context
    useEffect(() => {
        setupCanvas()
        window.addEventListener('resize', setupCanvas)
        return () => window.removeEventListener('resize', setupCanvas)
    }, [setupCanvas]);

    // WebSocket connection and message handling
    useEffect(() => {
        const wsUrl = process.env.FRONTEND_WS_URL || 'ws://localhost:8080/ws';
        wsRef.current = new WebSocket(`${wsUrl}/${canvasID}`);

        wsRef.current.onopen = () => {
            console.log('WebSocket connected');
        };

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'stroke') {
                setStrokes(prev => [...prev, message.stroke])
                drawStroke(message.stroke);
            }
        }

        wsRef.current.onclose = () => {
            console.log('WebSocket disconnected')
        }

        return () => {
            wsRef.current.close();
        };
    }, [canvasID]);

    // Draw a stroke from a message
    function drawStroke({ from, to, color, width }) {
        const ctx = contextRef.current;
        if (!ctx) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y)
        ctx.stroke();
    };

    // Get the pointer position relative to canvas (given CSS scaling)
    function getPointerPos(e) {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }

    // Start drawing
    function handlePointerDown(e) {
        setIsDrawing(true);
        lastPoint.current = getPointerPos(e);
    }

    // Drawing
    function handlePointerMove(e) {
        if (!isDrawing) return;

        const curr = getPointerPos(e);

        const ctx = contextRef.current;
        const prev = lastPoint.current;

        const newStroke = {
            from: prev,
            to: curr,
            color: penColor,
            width: penSize
        };

        if (ctx && prev) {
            drawStroke(newStroke);
            setStrokes(prev => [...prev, newStroke])
        }

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && prev) {
            const strokeMessage = {
                type: 'stroke',
                stroke: newStroke
            }
            wsRef.current.send(
                JSON.stringify(strokeMessage)
            );
        }

        lastPoint.current = curr
    }

    // Stops drawing
    function handlePointerUp() {
        setIsDrawing(false);
        lastPoint.current = null;
    }

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100vw', background: '#2C2C2C' }}>
            <canvas
                ref={canvasRef}
                style={{ 
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    touchAction: 'none',
                    backgroundColor: '#2C2C2C'
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            />
            {/* Home button */}
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '1.5px solid #444',
                    background: 'rgba(44,44,44,0.92)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 20,
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                    transition: 'background 0.18s, border 0.18s, box-shadow 0.18s, opacity 0.18s',
                    opacity: 0.92,
                    outline: 'none'
                }}
                onMouseOver={e => {
                    e.currentTarget.style.background = '#222';
                    e.currentTarget.style.border = '1.5px solid #fff';
                    e.currentTarget.style.opacity = 1;
                    e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(0,0,0,0.18)';
                }}
                onMouseOut={e => {
                    e.currentTarget.style.background = 'rgba(44,44,44,0.92)';
                    e.currentTarget.style.border = '1.5px solid #444';
                    e.currentTarget.style.opacity = 0.92;
                    e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(0,0,0,0.10)';
                }}
                aria-label="Back to Home"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            {/* Room Code */}
            <div
                style={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    backgroundColor: 'rgba(44,44,44,0.95)',
                    color: '#fff',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    userSelect: 'text',
                    pointerEvents: 'auto',
                    border: '1px solid #444',
                    letterSpacing: 1
                }}
            >
                Room Code: {canvasID}
            </div>
            {/* Bottom dock */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '16px 0',
                    background: 'rgba(44,44,44,0.92)',
                    borderTop: '1px solid #444',
                    gap: 32,
                    zIndex: 20,
                    userSelect: 'none'
                }}
            >
                {/* Pen size options */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {[2, 6, 12].map(size => (
                        <button
                            key={size}
                            onClick={() => setPenSize(size)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                border: penSize === size ? '2px solid #fff' : '1px solid #888',
                                background: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'border 0.2s'
                            }}
                            aria-label={`Pen size ${size}`}
                        >
                            <div style={{
                                width: size,
                                height: size,
                                borderRadius: '50%',
                                background: '#fff',
                                opacity: 0.9
                            }} />
                        </button>
                    ))}
                </div>
                {/* Pen color options */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* White */}
                    <button
                        onClick={() => setPenColor('#fff')}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: penColor === '#fff' ? '2px solid #fff' : '1px solid #888',
                            background: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'border 0.2s'
                        }}
                        aria-label="White pen"
                    >
                        <div style={{
                            width: 18,
                            height: 18,
                            minWidth: 18,
                            minHeight: 18,
                            maxWidth: 18,
                            maxHeight: 18,
                            borderRadius: '50%',
                            background: '#fff'
                        }} />
                    </button>
                    {/* Red */}
                    <button
                        onClick={() => setPenColor('#FF3B3B')}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: penColor === '#FF3B3B' ? '2px solid #fff' : '1px solid #888',
                            background: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'border 0.2s'
                        }}
                        aria-label="Red pen"
                    >
                        <div style={{
                            width: 18,
                            height: 18,
                            minWidth: 18,
                            minHeight: 18,
                            maxWidth: 18,
                            maxHeight: 18,
                            borderRadius: '50%',
                            background: '#FF3B3B'
                        }} />
                    </button>
                    {/* Eraser */}
                    <button
                        onClick={() => setPenColor(ERASER_COLOR)}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: penColor === ERASER_COLOR ? '2px solid #fff' : '1px solid #888',
                            background: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'border 0.2s'
                        }}
                        aria-label="Eraser"
                    >
                        <div style={{
                            width: 18,
                            height: 18,
                            minWidth: 18,
                            minHeight: 18,
                            maxWidth: 18,
                            maxHeight: 18,
                            borderRadius: '50%',
                            background: ERASER_COLOR,
                            border: '2px dashed #888',
                            boxSizing: 'border-box',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="12" height="12" viewBox="0 0 12 12">
                                <rect x="2" y="5" width="8" height="2" rx="1" fill="#888" />
                            </svg>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Whiteboard