import React, { useLayoutEffect, useEffect, useState, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { calculateRSI } from './CandleChartsHelper.js';
import { getStockHistory } from '../../api/auth.js';

const AmChartsCandlestick = ({ ticker }) => {
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const mountainSeriesRf = useRef(null);
    const xAxisRef = useRef(null);
    const scrollbarSeriesRef = useRef(null);
    const [stockData, setStockData] = useState([]);


    const cursorRef = useRef(null);
    const currentIndexRef = useRef(-1);

    // 1. Fetch Real Data
    useEffect(() => {
        async function loadData() {
            if (!ticker) return;
            try {
                const response = await getStockHistory(ticker);
                const result = response.data;
                
                if (!result.history || result.history.length === 0) return;

                const formattedData = result.history.map(item => ({
                    date: new Date(item.timestamp).getTime(), 
                    open: parseFloat(item.open_price),
                    high: parseFloat(item.high_price),
                    low: parseFloat(item.low_price),
                    value: parseFloat(item.close_price)
                })).sort((a, b) => a.date - b.date);

                const dataWithRSI = calculateRSI(formattedData, 14);

                setStockData(dataWithRSI);
            } catch (error) {
                console.error("Failed to fetch stock data:", error);
            }
        }
        loadData();
    }, [ticker]);

    // 2. Initialize Chart
    useLayoutEffect(() => {
        let root = am5.Root.new(chartRef.current);
        root.setThemes([am5themes_Animated.new(root)]);

        let chart = root.container.children.push(
            am5xy.XYChart.new(root, { 
                panX: true, 
                panY: false, 
                wheelX: "panX", 
                wheelY: "zoomX", 
                layout: root.verticalLayout 
            })
        );

        // --- AXES ---
        let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
            groupData: true,
            baseInterval: { timeUnit: "day", count: 1 },
            renderer: am5xy.AxisRendererX.new(root, { pan: "zoom" }),
            tooltip: am5.Tooltip.new(root, {}) // Tooltip for the X-axis date
        }));
        xAxisRef.current = xAxis;

        let yAxisTop = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            height: am5.percent(70),
            renderer: am5xy.AxisRendererY.new(root, { pan: "zoom" })
        }));

        let yAxisBottom = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            height: am5.percent(30),
            marginTop:20,
            renderer: am5xy.AxisRendererY.new(root, { pan: "zoom" })
        }));

        // This forces the Y-axes to stack on top of each other instead of overlapping
        chart.leftAxesContainer.set("layout", root.verticalLayout);

        // --- CANDLESTICK SERIES ---
        let series = chart.series.push(am5xy.CandlestickSeries.new(root, {
            name: ticker,
            xAxis: xAxis,
            yAxis: yAxisTop,
            valueYField: "value",
            openValueYField: "open",
            lowValueYField: "low",
            highValueYField: "high",
            valueXField: "date",
            // HOVER CONFIGURATION
            tooltip: am5.Tooltip.new(root, {
                pointerOrientation: "horizontal",
                labelText: "Open: [bold]{openValueY}[/]\nHigh: [bold]{highValueY}[/]\nLow: [bold]{lowValueY}[/]\nClose: [bold]{valueY}[/]"
            })
        }));

        let mountainSeries =  chart.series.push(am5xy.LineSeries.new(root, {
            name : "RSI /Indicator",
            xAxis: xAxis,
            yAxis : yAxisBottom,
            valueYField: "rsi",
            valueXField: "date",
            fill: am5.color(0x6794dc),
            stroke: am5.color(0x6794dc)
        }))
        //mountain effect gradient
        mountainSeries.fills.template.setAll({
            fillOpacity: 0.5,
            visible: true
        });
        seriesRef.current = series;
        mountainSeriesRf.current = mountainSeries;


        let upperRangeDataItem = yAxisBottom.makeDataItem({
            value:70,
            endValue:100
        })
        let lowerRangeDataItem = yAxisBottom.makeDataItem({
            value:0,
            endValue:30
        })
        let lowerRange = mountainSeries.createAxisRange(lowerRangeDataItem);
        let upperRange = mountainSeries.createAxisRange(upperRangeDataItem);
        upperRange.strokes.template.setAll({
            stroke: am5.color(0x4CAF50), 
            strokeWidth: 2
        });
        // Color the mountain fill green
        upperRange.fills.template.setAll({
            fill: am5.color(0x4CAF50),
            fillOpacity: 0.5,
            visible: true
        });
        lowerRange.strokes.template.setAll({
            stroke: am5.color(0xF44336), 
            strokeWidth: 2
        });
        // Color the mountain fill green
        lowerRange.fills.template.setAll({
            fill: am5.color(0xF44336),
            fillOpacity: 0.5,
            visible: true
        });

        // --- CURSOR (CRITICAL FOR HOVER) ---
        let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
            xAxis: xAxis,
            behavior: "none"
        }));
        cursor.lineY.set("visible", false); // Only vertical line for cleaner look
        cursorRef.current = cursor;

        // NEW: Sync the current index when the user hovers with the mouse
        cursor.events.on("cursormoved", () => {
            let dataItem = series.get("tooltipDataItem");
            if (dataItem) {
                let index = series.dataItems.indexOf(dataItem);
                if (index !== -1) {
                    currentIndexRef.current = index;
                }
            }
        });
        cursor.events.on("cursormoved", () => {
            // Only trigger the reset if the keyboard currently has control
            // This prevents the mouse from fighting with itself on every single pixel moved
            if (cursor.get("positionX") !== undefined) {
                // 1. Release the cursor position lock
                cursor.set("positionX", undefined); 
                
                // 2. Release the tooltip lock (THIS IS THE MISSING PIECE)
                series.set("tooltipDataItem", undefined);
            }
        });
        // --- LEGEND ---
        let legend = chart.children.push(am5.Legend.new(root, {
            centerX: am5.percent(50),
            x: am5.percent(50)
        }));
        legend.data.setAll(chart.series.values);

        // --- SCROLLBAR ---
        let scrollbar = am5xy.XYChartScrollbar.new(root, { orientation: "horizontal", height: 50 });
        chart.set("scrollbarX", scrollbar);
        let sbxAxis = scrollbar.chart.xAxes.push(am5xy.DateAxis.new(root, { baseInterval: { timeUnit: "day", count: 1 }, renderer: am5xy.AxisRendererX.new(root, {}) }));
        let sbyAxis = scrollbar.chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}) }));
        let sbseries = scrollbar.chart.series.push(am5xy.LineSeries.new(root, { xAxis: sbxAxis, yAxis: sbyAxis, valueYField: "value", valueXField: "date" }));
        scrollbarSeriesRef.current = sbseries;

        return () => root.dispose();
    }, [ticker]); 


    // 3. Sync Data
    useLayoutEffect(() => {
        if (seriesRef.current && scrollbarSeriesRef.current && stockData.length > 0) {
            seriesRef.current.data.setAll(stockData);
            scrollbarSeriesRef.current.data.setAll(stockData);
            mountainSeriesRf.current.data.setAll(stockData);

            currentIndexRef.current = stockData.length - 1; // Start at the most recent data point
        }
    }, [stockData]);


    const handleKeyDown = (event) => {
        if (!xAxisRef.current || !cursorRef.current || stockData.length === 0) return;

        let newIndex = currentIndexRef.current;

        // Prevent default scrolling when using arrows
        if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault(); 
        } else {
            return; // Ignore other keys
        }

        // 1. Update Index
        if (event.key === 'ArrowLeft') {
            newIndex = Math.max(0, newIndex - 1);
        } else if (event.key === 'ArrowRight') {
            newIndex = Math.min(stockData.length - 1, newIndex + 1);
        }

        currentIndexRef.current = newIndex;
        const targetDate = stockData[newIndex].date; // This is a timestamp
        const xAxis = xAxisRef.current;
        const cursor = cursorRef.current;
        const series = seriesRef.current;

        // 2. Get the absolute position of the date on the entire axis (0 to 1)
        const position = xAxis.valueToPosition(targetDate);

        // 3. Get the current zoom window
        let start = xAxis.get("start") || 0;
        let end = xAxis.get("end") || 1;
        const viewSpan = end - start;

        // 4. Auto-Pan logic if the cursor goes out of the visible area
        if (position < start) {
            start = position;
            end = position + viewSpan;
            xAxis.zoom(start, end);
        } else if (position > end) {
            start = position - viewSpan;
            end = position;
            xAxis.zoom(start, end);
        }

        // 5. THE FIX: Calculate the relative position on the screen
        // This perfectly maps the absolute data position to the visible plot area
        const visiblePosition = (position - start) / (end - start);

        // 6. Move the cursor
        cursor.set("positionX", visiblePosition);

        // 7. Explicitly bind the tooltip to the active data item
        if (series && series.dataItems && series.dataItems[newIndex]) {
            series.set("tooltipDataItem", series.dataItems[newIndex]);
        }
    };
    return (
        <div 
            tabIndex= "0"
            onKeyDown={handleKeyDown}
            style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <div ref={chartRef} style={{ width: "100%", height: "600px" }} />
            <p style={{ fontSize: '12px', color: '#888' }}>
                Click the chart to use Arrow Keys to Pan/Zoom
            </p>
        </div>
    );
};

export default AmChartsCandlestick;