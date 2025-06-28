import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'

function Whiteboard() {
    const { id: canvasID } = useParams()
    const canvasRef = useRef(null)
    const contextRef = useRef(null);
    const lastPoint = useRef(null);
    const wsRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState([]);
    const strokesRef = useRef(strokes);

    const [penSize, setPenSize] = useState(2);
    const [penColor, setPenColor] = useState('#fff'); // white or red

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
        strokesRef.current.forEach(drawStroke)
        console.log('setupCanvas')
    }, []);

    // Initialize canvas context
    useEffect(() => {
        setupCanvas()
        window.addEventListener('resize', setupCanvas)
        return () => window.removeEventListener('resize', setupCanvas)
    }, [setupCanvas]);

    // WebSocket connection and message handling
    useEffect(() => {
        wsRef.current = new WebSocket(`ws://localhost:8080/ws/${canvasID}`);

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
                </div>
            </div>
        </div>
    )
}

export default Whiteboard