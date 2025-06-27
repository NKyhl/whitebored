import React, { useRef, useEffect, useState } from 'react'

function Whiteboard({ canvasID }) {
    const canvasRef = useRef(null)
    const contextRef = useRef(null);
    const lastPoint = useRef(null);
    const wsRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Initialize canvas context
    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d')
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round';
        contextRef.current = ctx;
    }, []);

    // WebSocket connection and message handling
    useEffect(() => {
        wsRef.current = new WebSocket(`ws://localhost:8080/ws/${canvasID}`);

        wsRef.current.onopen = () => {
            console.log('WebSocket connected');
        };

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'stroke') {
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

    // Start drawing
    function handlePointerDown(e) {
        setIsDrawing(true);
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        lastPoint.current = { x, y };
    }

    // Drawing
    function handlePointerMove(e) {
        if (!isDrawing) return;

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        const ctx = contextRef.current;
        const prev = lastPoint.current;

        if (ctx && prev) {
            drawStroke({
                from: prev,
                to: { x, y },
                color: '#000000',
                width: 2
            });
        }

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && prev) {
            const strokeMessage = {
                type: 'stroke',
                stroke: {
                    from: prev,
                    to: { x, y },
                    color: "#000000",
                    width: 2,
                }
            }
            wsRef.current.send(
                JSON.stringify(strokeMessage)
            );
        }

        lastPoint.current = { x, y }
    }

    // Stops drawing
    function handlePointerUp() {
        setIsDrawing(false);
        lastPoint.current = null;
    }

    return (
        <canvas
            ref={canvasRef}
            style={{ border: '1px solid black', touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        />
    )
}

export default Whiteboard