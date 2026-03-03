import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

const LinearChart = ({ ticker, height = 400 }) => {
    const containerRef = useRef(null);
    const [data, setData] = useState([]);
    const [width, setWidth] = useState(0); // Real pixel width

    // 1. Handle Responsive Resizing
    useEffect(() => {
        if (!containerRef.current) return;
        
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // 2. Load Data
    useEffect(() => {
        async function loadData() {
            if (!ticker) return;
            try {
                const response = await fetch(`http://localhost:5000/api/stocks/watchlist/${ticker}`);
                const result = await response.json();
                if (!result.history || result.history.length === 0) return;

                const formattedData = result.history.map(item => ({
                    date: new Date(item.timestamp),
                    value: parseFloat(item.close_price)
                })).sort((a, b) => a.date - b.date);
                
                setData(formattedData);
            } catch (error) {
                console.error("Failed to fetch stock data:", error);
            }
        }
        loadData();
    }, [ticker]);

    // 3. D3 Math (The "Brain")
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = Math.max(0, width - margin.left - margin.right);
    const innerHeight = Math.max(0, height - margin.top - margin.bottom);

    const xScale = useMemo(() => {
        return d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, innerWidth]);
    }, [data, innerWidth]);

    const yScale = useMemo(() => {
        const maxPrice = d3.max(data, d => d.value) || 0;
        const minPrice = d3.min(data, d => d.value) || 0;
        return d3.scaleLinear()
            .domain([minPrice * 0.95, maxPrice * 1.05])
            .range([innerHeight, 0]);
    }, [data, innerHeight]);

    const linePath = useMemo(() => {
        const lineGenerator = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);
        return data.length > 0 ? lineGenerator(data) : null;
    }, [data, xScale, yScale]);

    // 4. React Render (The "Muscle")
    if (data.length === 0) return <div>Loading {ticker} data...</div>;

    return (
        <div ref={containerRef} style={{ width: '100%', minHeight: height }}>
            <svg width={width} height={height}>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    
                    {/* X-Axis */}
                    {xScale.ticks(width > 500 ? 10 : 5).map(tickValue => (
                        <g key={tickValue.getTime()} transform={`translate(${xScale(tickValue)}, ${innerHeight})`}>
                            <line y2="6" stroke="#ddd" />
                            <text y="25" textAnchor="middle" fontSize="10" fill="#999">
                                {d3.timeFormat("%b %d")(tickValue)}
                            </text>
                        </g>
                    ))}

                    {/* Y-Axis */}
                    {yScale.ticks(5).map(tickValue => (
                        <g key={tickValue} transform={`translate(0, ${yScale(tickValue)})`}>
                            <line x2={innerWidth} stroke="#f0f0f0" />
                            <text x="-10" dy="0.32em" textAnchor="end" fontSize="10" fill="#999">
                                ${tickValue.toFixed(0)}
                            </text>
                        </g>
                    ))}

                    <path
                        d={linePath}
                        fill="none"
                        stroke="#2196f3"
                        strokeWidth={2}
                    />
                </g>
            </svg>
        </div>
    );
};

export default LinearChart;