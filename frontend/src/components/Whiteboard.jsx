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
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2

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
            color: '#000000',
            width: 2
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
        <div style={{ position: 'relative', height: '100vh', width: '100vw'}}>
            <canvas
                ref={canvasRef}
                style={{ 
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    touchAction: 'none',
                    backgroundColor: '#fff'
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    userSelect: 'text',
                    pointerEvents: 'auto',
                }}
            >
                Room Code: {canvasID}
            </div>
        </div>
    )
}

export default Whiteboard