import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { size: 12, weight: 'bold' },
        padding: 15,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(30, 58, 138, 0.8)',
      padding: 12,
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      cornerRadius: 8
    }
  }
};

const MilestoneProgress = ({ data }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Milestone Completion Timeline',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        color: '#1e3a8a'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Completed Milestones', padding: 10 },
        ticks: { stepSize: 1 }
      },
      x: {
        title: { display: true, text: 'Time Period', padding: 10 },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Line
        data={{
          labels: data.labels,
          datasets: [{
            label: 'Completed',
            data: data.completed,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        }}
        options={options}
      />
    </div>
  );
};

const DealDistribution = ({ data }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Deal Distribution by Type',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        color: '#1e3a8a'
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Doughnut
        data={{
          labels: ['Investors', 'Suppliers', 'Partners'],
          datasets: [{
            data: [data.investors, data.suppliers, data.partners],
            backgroundColor: [
              'rgba(139, 92, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)'
            ]
          }]
        }}
        options={options}
      />
    </div>
  );
};

const MonthlyActivity = ({ data }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Monthly Business Activity',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        color: '#1e3a8a'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Activities', padding: 10 }
      },
      x: {
        title: { display: true, text: 'Activity Type', padding: 10 },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Bar
        data={{
          labels: ['Messages', 'Meetings', 'Documents', 'Milestones'],
          datasets: [{
            label: 'Completed Activities',
            data: [data.messages, data.meetings, data.documents, data.milestones],
            backgroundColor: 'rgba(59, 130, 246, 0.8)'
          }]
        }}
        options={options}
      />
    </div>
  );
};

export default function Analytics({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <MilestoneProgress data={data.milestoneProgress} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <DealDistribution data={data.dealDistribution} />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
      >
        <MonthlyActivity data={data.monthlyActivity} />
      </motion.div>
    </motion.div>
  );
}