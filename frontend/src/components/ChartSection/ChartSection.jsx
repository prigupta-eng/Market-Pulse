// components/ChartSection/ChartSection.jsx
import React, { useState } from "react";
import AmChartsCandlestick from "../CandleCharts/CandleChart.jsx";
import LinearChart from "../LinearChart/LinearCharts.jsx";
import "./ChartSections.scss"
export const ChartSection = ({ ticker, onClose }) => {
    const [chartType, setChartType] = useState('OHLC');

    if (!ticker) return null;

    return (
        <div className="chart-section-card">
            <div className="chart-header">
                <div className="ticker-title">
                    <h2>{ticker}</h2>
                </div>
                <div className="chart-actions">
                    <select 
                        className="modernselect"
                        value={chartType} 
                        onChange={(e) => setChartType(e.target.value)}
                    >
                        <option value="OHLC">Candlestick (OHLC)</option>
                        <option value="Linear">Line Chart (Close)</option>
                    </select>

                    <button className="modern-back-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>

            <div className="chart-render-area">
                {chartType === 'Linear' ? (
                    <LinearChart ticker={ticker} />
                ) : (
                    <AmChartsCandlestick ticker={ticker} /> 
                )}
            </div>
        </div>
    );
};