import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { getStockHistory } from '../../api/auth';
import { calculateRSI } from '../CandleCharts/CandleChartsHelper';

const LineChart = ({ ticker }) => {

    const chartRef = useRef(null);
    const priceSeriesRef = useRef(null);
    const rsiSeriesRef = useRef(null);
    const cursorRef = useRef(null);
    const xAxisRef = useRef(null);
    const currentIndexRef = useRef(-1);

    const [chartData, setChartData] = useState([]);

    // ================================
    // 1️⃣ Fetch Data + Calculate RSI
    // ================================
    useEffect(() => {
        async function fetchData() {
            if (!ticker) return;

            try {
                const response = await getStockHistory(ticker);
                const result = response.data;

                if (!result.history || result.history.length === 0) return;

                const formattedData = result.history.map(item => ({
                    date: new Date(item.timestamp).getTime(),
                    close: parseFloat(item.close_price)
                })).sort((a, b) => a.date - b.date);

                // Prepare for RSI calculation
                const rsiInput = formattedData.map(d => ({
                    date: d.date,
                    value: d.close
                }));

                const rsiData = calculateRSI(rsiInput, 14);

                const mergedData = formattedData.map((item, index) => ({
                    date: item.date,
                    close: item.close,
                    rsi: rsiData[index]?.rsi
                }));

                setChartData(mergedData);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        }

        fetchData();
    }, [ticker]);


    // ================================
    // 2️⃣ Initialize Chart
    // ================================
    useLayoutEffect(() => {

        const root = am5.Root.new(chartRef.current);
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: true,
                panY: false,
                wheelX: "panX",
                wheelY: "zoomX",
                layout: root.verticalLayout
            })
        );

        // -------- X AXIS --------
        const xAxis = chart.xAxes.push(
            am5xy.DateAxis.new(root, {
                baseInterval: { timeUnit: "day", count: 1 },
                renderer: am5xy.AxisRendererX.new(root, {}),
                tooltip: am5.Tooltip.new(root, {})
            })
        );

        xAxisRef.current = xAxis;

        // -------- Y AXES --------
        const yAxisTop = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                height: am5.percent(70),
                renderer: am5xy.AxisRendererY.new(root, {})
            })
        );

        const yAxisBottom = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                height: am5.percent(30),
                marginTop: 20,
                renderer: am5xy.AxisRendererY.new(root, {})
            })
        );

        chart.leftAxesContainer.set("layout", root.verticalLayout);

        // -------- PRICE SERIES --------
        const priceSeries = chart.series.push(
            am5xy.LineSeries.new(root, {
                name: "Price",
                xAxis: xAxis,
                yAxis: yAxisTop,
                valueYField: "close",
                valueXField: "date",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "Price: {valueY}"
                })
            })
        );

        priceSeries.strokes.template.setAll({
            strokeWidth: 2
        });

        priceSeriesRef.current = priceSeries;

        // -------- RSI SERIES --------
        const rsiSeries = chart.series.push(
            am5xy.LineSeries.new(root, {
                name: "RSI",
                xAxis: xAxis,
                yAxis: yAxisBottom,
                valueYField: "rsi",
                valueXField: "date",
                stroke: am5.color(0x6794dc),
                fill: am5.color(0x6794dc)
            })
        );

        rsiSeries.fills.template.setAll({
            visible: true,
            fillOpacity: 0.4
        });

        rsiSeriesRef.current = rsiSeries;

        // -------- RSI LEVELS --------
        let upperRangeDataItem = yAxisBottom.makeDataItem({
            value: 70,
            endValue: 100
        });

        let lowerRangeDataItem = yAxisBottom.makeDataItem({
            value: 0,
            endValue: 30
        });

        let upperRange = rsiSeries.createAxisRange(upperRangeDataItem);
        upperRange.fills.template.setAll({
            fill: am5.color(0x4CAF50),
            fillOpacity: 0.3,
            visible: true
        });

        let lowerRange = rsiSeries.createAxisRange(lowerRangeDataItem);
        lowerRange.fills.template.setAll({
            fill: am5.color(0xF44336),
            fillOpacity: 0.3,
            visible: true
        });

        // -------- CURSOR --------
        const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
            xAxis: xAxis,
            behavior: "none"
        }));

        cursor.lineY.set("visible", false);
        cursorRef.current = cursor;

        cursor.events.on("cursormoved", () => {
            let dataItem = priceSeries.get("tooltipDataItem");
            if (dataItem) {
                let index = priceSeries.dataItems.indexOf(dataItem);
                if (index !== -1) {
                    currentIndexRef.current = index;
                }
            }
        });

        return () => {
            root.dispose();
        };

    }, [ticker]);


    // ================================
    // 3️⃣ Sync Data
    // ================================
    useLayoutEffect(() => {
        if (priceSeriesRef.current && rsiSeriesRef.current && chartData.length > 0) {
            priceSeriesRef.current.data.setAll(chartData);
            rsiSeriesRef.current.data.setAll(chartData);
            currentIndexRef.current = chartData.length - 1;
        }
    }, [chartData]);


    // ================================
    // 4️⃣ Arrow Key Navigation
    // ================================
    const handleKeyDown = (event) => {

        if (!xAxisRef.current || !cursorRef.current || chartData.length === 0) return;

        let newIndex = currentIndexRef.current;

        if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
        } else {
            return;
        }

        if (event.key === "ArrowLeft") {
            newIndex = Math.max(0, newIndex - 1);
        } else {
            newIndex = Math.min(chartData.length - 1, newIndex + 1);
        }

        currentIndexRef.current = newIndex;

        const targetDate = chartData[newIndex].date;
        const xAxis = xAxisRef.current;
        const cursor = cursorRef.current;

        const position = xAxis.valueToPosition(targetDate);

        let start = xAxis.get("start") || 0;
        let end = xAxis.get("end") || 1;

        const visiblePosition = (position - start) / (end - start);

        cursor.set("positionX", visiblePosition);

        if (priceSeriesRef.current.dataItems[newIndex]) {
            priceSeriesRef.current.set(
                "tooltipDataItem",
                priceSeriesRef.current.dataItems[newIndex]
            );
        }
    };


    return (
        <div
            tabIndex="0"
            onKeyDown={handleKeyDown}
            style={{
                background: "#fff",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                outline: "none"
            }}
        >
            <div ref={chartRef} style={{ width: "100%", height: "550px" }} />
            <p style={{ fontSize: "12px", color: "#888", textAlign: "center" }}>
                Click the chart to use Arrow Keys to Pan/Zoom
            </p>
        </div>
    );
};

export default LineChart;