import React from 'react';
import { Target, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityIcon = ({ type }) => {
  const icons = {
    milestone: <Target className="w-5 h-5 text-blue-500" />,
    supplier: <Users className="w-5 h-5 text-emerald-500" />,
    investor: <TrendingUp className="w-5 h-5 text-violet-500" />,
    deal: <CheckCircle className="w-5 h-5 text-amber-500" />
  };
  return icons[type] || null;
};

const ActivityItem = ({ activity, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors group"
  >
    <motion.div 
      whileHover={{ scale: 1.1, rotate: 360 }}
      transition={{ duration: 0.5 }}
      className="p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm group-hover:shadow"
    >
      <ActivityIcon type={activity.type} />
    </motion.div>
    <div className="flex-1 min-w-0">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2 }}
        className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors"
      >
        {activity.message}
      </motion.p>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
        className="text-xs text-gray-500 mt-1"
      >
        {activity.time}
      </motion.p>
    </div>
  </motion.div>
);

export default function ActivityFeed({ activities }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
    >
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <p className="text-sm text-gray-500 mt-1">Track your latest actions and updates</p>
      </div>
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}