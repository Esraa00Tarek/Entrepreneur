import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    paused: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status] || statusStyles.pending}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  );
};

export default function ProjectSummaryCard({ project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
    >
      <motion.div 
        className="p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h2 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          Current Project
        </motion.h2>
        
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
            <div className="mt-2">
              <StatusBadge status={project.status} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center text-gray-600"
          >
            <Calendar className="w-5 h-5 mr-2" />
            <span>Started {project.startDate}</span>
          </motion.div>

          {project.description && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 text-sm"
            >
              {project.description}
            </motion.p>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-4"
          >
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={project.onViewDetails}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              View Full Project
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {project.suggestions && project.suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 border-t border-blue-100"
        >
          <h4 className="text-sm font-semibold text-blue-900 mb-3">Suggestions</h4>
          <ul className="space-y-2">
            {project.suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-sm text-blue-800 flex items-start gap-2"
              >
                <span className="block w-1 h-1 rounded-full bg-blue-400 mt-2" />
                {suggestion}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}