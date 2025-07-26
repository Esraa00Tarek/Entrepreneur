import React from 'react';
import { Target, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, count, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05 }}
    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
  >
    <div className="flex items-center justify-between mb-4">
      <motion.div 
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg"
      >
        <Icon className="w-6 h-6 text-blue-600" />
      </motion.div>
      <motion.span 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring', stiffness: 100 }}
        className="text-3xl font-bold text-gray-800"
      >
        {count}
      </motion.span>
    </div>
    <motion.h3 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.3 }}
      className="text-sm font-medium text-gray-600"
    >
      {label}
    </motion.h3>
  </motion.div>
);

export default function QuickStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={Target}
        count={stats.totalMilestones}
        label="Total Milestones"
        delay={0}
      />
      <StatCard
        icon={CheckCircle}
        count={stats.confirmedDeals}
        label="Confirmed Deals"
        delay={0.2}
      />
      <StatCard
        icon={Users}
        count={stats.contactedSuppliers}
        label="Contacted Suppliers"
        delay={0.4}
      />
      <StatCard
        icon={TrendingUp}
        count={stats.contactedInvestors}
        label="Contacted Investors"
        delay={0.6}
      />
    </div>
  );
}