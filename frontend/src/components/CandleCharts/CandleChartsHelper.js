// Function to calculate 14-day RSI
export const calculateRSI = (data, period = 14) => {
    // We need at least 'period + 1' days to calculate the first RSI
    if (!data || data.length <= period) return data;

    // Create a copy so we don't mutate the original array directly
    const result = [...data];

    let gains = 0;
    let losses = 0;

    // Step 1: Calculate the initial Average Gain and Loss for the first 14 days
    for (let i = 1; i <= period; i++) {
        const change = result[i].value - result[i - 1].value;
        if (change >= 0) {
            gains += change;
        } else {
            losses -= change; // Subtracting a negative makes it positive
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate the very first RSI at day 14
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result[period].rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));

    // Step 2: Calculate the smoothed RSI for all remaining days
    for (let i = period + 1; i < result.length; i++) {
        const change = result[i].value - result[i - 1].value;
        let currentGain = 0;
        let currentLoss = 0;

        if (change >= 0) {
            currentGain = change;
        } else {
            currentLoss = Math.abs(change);
        }

        // Wilder's Smoothing Technique
        avgGain = ((avgGain * (period - 1)) + currentGain) / period;
        avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;

        if (avgLoss === 0) {
            result[i].rsi = 100;
        } else {
            rs = avgGain / avgLoss;
            result[i].rsi = 100 - (100 / (1 + rs));
        }
    }

    return result;
};