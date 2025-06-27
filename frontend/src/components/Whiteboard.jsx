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

        wsRef.current = new WebSocket(`ws://localhost:8080/ws/${canvasID}`);

        wsRef.current.onopen = () => {
            console.log('WebSocket connected');
        };

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'stroke') {
                drawStroke(message);
            }
        }

        wsRef.current.onclose = () => {
            console.log('WebSocket disconnected')
        }

        return () => {
            wsRef.current.close();
        };
    }, [canvasID]);

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
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(x, y);
            ctx.stroke();

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({
                type: 'stroke',
                from: prev, // ✅ now this is the correct previous point
                to: { x, y },
                color: "#000000",
                width: 2,
                })
            );
            }
        }

        lastPoint.current = { x, y }; // ✅ update AFTER sending
        }

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