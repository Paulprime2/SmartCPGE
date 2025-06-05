import React from 'react';
import { parseISO, format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WorkloadDay } from '../../types';
import { motion } from 'framer-motion';

interface WorkloadChartProps {
  workloadData: WorkloadDay[];
}

const WorkloadChart: React.FC<WorkloadChartProps> = ({ workloadData }) => {
  // Only show the next 7 days
  const today = new Date();
  const relevantData = workloadData
    .filter(day => {
      const date = parseISO(day.date);
      return differenceInDays(date, today) >= 0 && differenceInDays(date, today) < 7;
    })
    .slice(0, 7);
  
  const getDateLabel = (dateStr: string): string => {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return "Auj.";
    } else if (isTomorrow(date)) {
      return "Dem.";
    } else {
      return format(date, 'EEE', { locale: fr });
    }
  };
  
  const getWorkloadColor = (load: number): string => {
    if (load < 30) return 'bg-green-500';
    if (load < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-2">
        {relevantData.map((day, index) => (
          <div key={index} className="flex flex-col items-center w-8">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${day.load}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`w-4 rounded-t-sm ${getWorkloadColor(day.load)}`}
              style={{ 
                maxHeight: '120px',
                minHeight: '4px'
              }}
            />
            <div className="text-xs mt-2 text-gray-500">
              {getDateLabel(day.date)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-2" />
            <span className="text-xs text-gray-600">Légère</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-2" />
            <span className="text-xs text-gray-600">Moyenne</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-2" />
            <span className="text-xs text-gray-600">Intense</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadChart;