import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Total Invested',
      data: [20000, 35000, 50000, 70000, 90000, 120000],
      backgroundColor: '#457B9D',
      borderRadius: 8,
      barThickness: 32,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Total Invested Per Month',
      font: { size: 16, weight: 'bold' },
      color: '#1D3557',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.07)' },
      ticks: {
        color: '#1D3557',
        font: { size: 13 },
        callback: function(value) {
          return '$' + value.toLocaleString();
        },
      },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#457B9D', font: { size: 13 } },
    },
  },
};

const InvestmentCharts = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="h-[300px]">
      <Bar data={data} options={options} />
    </div>
  </div>
);

export default InvestmentCharts; 