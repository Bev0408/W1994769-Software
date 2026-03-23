/**
 * PieChart Component (FR8)
 * Displays portfolio asset allocation as a doughnut chart
 * Uses Chart.js via react-chartjs-2
 */

import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

// Register the Chart.js components we need
ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ asset_allocation, profileColor }) {
    // Build the chart data from the portfolio's asset allocation object
    const labels = Object.keys(asset_allocation).map(
        (key) => key.charAt(0).toUpperCase() + key.slice(1)
    );
    const values = Object.values(asset_allocation);

    const data = {
        labels: labels,
        datasets: [
            {
                data: values,
                backgroundColor: [
                    profileColor,
                    '#a8d8ea',
                    '#ffd700',
                    '#ff8c69'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 16,
                    font: { size: 13 }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => ` ${context.label}: ${context.parsed}%`
                }
            }
        }
    };

    return (
        <div className="piechart-wrapper">
            <Doughnut data={data} options={options} />
        </div>
    );
}

export default PieChart;
