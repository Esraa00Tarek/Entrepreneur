import React from 'react';
import { Line, Bar, Pie, Doughnut, Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
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
  RadialLinearScale,
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
        text: 'Weekly Milestone Completion Progress',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        color: '#1e3a8a'
      },
      tooltip: {
        callbacks: {
          label: (context) => `Completed Milestones: ${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { 
          display: true, 
          text: 'Number of Completed Milestones',
          font: { weight: 'bold' },
          padding: 10 
        },
        ticks: { stepSize: 4 }
      },
      x: {
        title: { 
          display: true, 
          text: 'Project Timeline (Weeks)',
          font: { weight: 'bold' },
          padding: 10 
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Bar
        data={{
          labels: data.labels,
          datasets: [{
            label: 'Completed Milestones',
            data: data.completed,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 8,
            barThickness: 20,
            hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
            hoverBorderColor: '#2563eb'
          }]
        }}
        options={options}
      />
    </div>
  );
};

const DealStatus = ({ data }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Deal Status Breakdown',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        color: '#1e3a8a'
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Pie
        data={{
          labels: ['Confirmed', 'Pending', 'Rejected'],
          datasets: [{
            data: [data.confirmed, data.pending, data.rejected],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(234, 179, 8, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ]
          }]
        }}
        options={options}
      />
    </div>
  );
};

const SupplierEngagement = ({ data }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Supplier Types Engaged',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        color: '#1e3a8a'
      }
    },
    cutout: '60%'
  };

  return (
    <div className="h-[300px]">
      <Doughnut
        data={{
          labels: ['Product Suppliers', 'Service Providers'],
          datasets: [{
            data: [data.productSuppliers, data.serviceProviders],
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)',
              'rgba(236, 72, 153, 0.8)'
            ]
          }]
        }}
        options={options}
      />
    </div>
  );
};

const ActivityTrends = ({ data }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Monthly Business Activity Trends',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        color: '#1e3a8a'
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y} activities`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { 
          display: true, 
          text: 'Total Number of Activities',
          font: { weight: 'bold' },
          padding: 10 
        },
        ticks: { stepSize: 10 }
      },
      x: {
        title: { 
          display: true, 
          text: 'Monthly Progress',
          font: { weight: 'bold' },
          padding: 10 
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Line
        data={{
          labels: data.labels,
          datasets: [
            {
              label: 'Messages',
              data: data.messages,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 2
            },
            {
              label: 'Offers',
              data: data.offers,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 2
            },
            {
              label: 'Edits',
              data: data.edits,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 2
            }
          ]
        }}
        options={options}
      />
    </div>
  );
};

const ProjectReadiness = ({ data }) => {
  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Project Readiness Status (% Complete)',
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 },
        color: '#1e3a8a'
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}% complete`
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { 
          stepSize: 20,
          callback: (value) => `${value}%`
        },
        pointLabels: {
          font: { size: 12, weight: 'bold' },
          callback: (label) => `${label} Status`
        },
        angleLines: {
          display: true,
          color: 'rgba(0,0,0,0.1)'
        },
        grid: {
          circular: true
        }
      }
    }
  };

  return (
    <div className="h-[400px]">
      <Radar
        data={{
          labels: ['Legal', 'Suppliers', 'Investors', 'Marketing', 'Operations'],
          datasets: [{
            label: 'Current Status',
            data: [data.legal, data.suppliers, data.investors, data.marketing, data.operations],
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: '#6366f1',
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#6366f1'
          }]
        }}
        options={options}
      />
    </div>
  );
};

export default function BusinessAnalytics({ data }) {
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
          <DealStatus data={data.dealStatus} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <SupplierEngagement data={data.supplierEngagement} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <ActivityTrends data={data.activityTrends} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
      >
        <ProjectReadiness data={data.projectReadiness} />
      </motion.div>
    </motion.div>
  );
}