import React, { useEffect, useRef, useState } from 'react';

const App = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [points, setPoints] = useState([]);
    const [lastPoint, setLastPoint] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctxRef.current = ctx;

        const fetchMouseData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/data');
                const data = await response.json();
                const { ax: x, ay: y } = data;

                // Log the axis data to the console
                console.log(`Axis data - X: ${x}, Y: ${y}`);

                // Add the current point to the points array
                const newPoints = [...points, { x, y }];
                setPoints(newPoints);

                if (lastPoint) {
                    // Draw a line between the last point and the current point
                    ctx.beginPath();
                    ctx.moveTo(lastPoint.x, lastPoint.y);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }

                // Update the last point with the current point
                setLastPoint({ x, y });

                // Clear the canvas to prevent overlapping
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Redraw the entire path up to the current point
                newPoints.forEach((pos, index) => {
                    if (index > 0) {
                        ctx.beginPath();
                        ctx.moveTo(newPoints[index - 1].x, newPoints[index - 1].y);
                        ctx.lineTo(pos.x, pos.y);
                        ctx.stroke();
                    }
                });

                // Draw the pointer at the current location
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        const intervalId = setInterval(fetchMouseData, 50); // Reduce the interval for smoother drawing

        return () => {
            clearInterval(intervalId); // Cleanup the interval on component unmount
        };
    }, [lastPoint, points]);

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h1>Smart Pen</h1>
            <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                style={{ border: '1px solid black' }}
            ></canvas>
        </div>
    );
};

export default App;
