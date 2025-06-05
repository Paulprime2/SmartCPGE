import { Event, Assignment, StudySession, WorkloadDay } from '../types';
import { parseISO, format, eachDayOfInterval, isSameDay, addDays } from 'date-fns';

// Calculate workload for a given date range
export const calculateWorkload = (
  events: Event[],
  assignments: Assignment[],
  studySessions: StudySession[],
  startDate: Date,
  endDate: Date
): WorkloadDay[] => {
  // Generate array of days in the interval
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Initialize workload for each day
  const workloadMap = new Map<string, number>();
  days.forEach(day => {
    workloadMap.set(format(day, 'yyyy-MM-dd'), 0);
  });
  
  // Count events per day and add to workload
  events.forEach(event => {
    const eventDate = parseISO(event.startTime);
    
    // Only consider if event is in our date range
    if (eventDate >= startDate && eventDate <= endDate) {
      const dateKey = format(eventDate, 'yyyy-MM-dd');
      
      // Different event types have different workload impact
      let eventLoad = 0;
      switch (event.type) {
        case 'ds':
          eventLoad = 25; // High impact
          break;
        case 'kholle':
          eventLoad = 20; // Medium-high impact
          break;
        case 'dm':
          eventLoad = 15; // Medium impact
          break;
        case 'course':
          eventLoad = 5; // Low impact, just attending
          break;
        default:
          eventLoad = 10; // Default medium-low impact
      }
      
      workloadMap.set(dateKey, (workloadMap.get(dateKey) || 0) + eventLoad);
    }
  });
  
  // Add assignments to workload (increasing as deadline approaches)
  assignments.forEach(assignment => {
    if (assignment.status === 'completed') return;
    
    const dueDate = parseISO(assignment.dueDate);
    if (dueDate < startDate || dueDate > endDate) return;
    
    // Calculate increasing workload for days approaching the deadline
    // Max 7 days before deadline
    const startImpactDate = new Date(Math.max(
      startDate.getTime(),
      dueDate.getTime() - 7 * 24 * 60 * 60 * 1000
    ));
    
    // Days leading up to deadline
    const impactDays = eachDayOfInterval({ start: startImpactDate, end: dueDate });
    
    impactDays.forEach((day, index) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      
      // Increasing impact as deadline approaches
      const daysToDeadline = impactDays.length - index;
      let impactFactor;
      
      if (daysToDeadline <= 1) {
        impactFactor = 30; // Day of deadline
      } else if (daysToDeadline <= 2) {
        impactFactor = 25; // Day before deadline
      } else if (daysToDeadline <= 3) {
        impactFactor = 20; // Two days before
      } else {
        impactFactor = 10; // Earlier days
      }
      
      // Adjust impact based on priority
      const priorityMultiplier = 
        assignment.priority === 'high' ? 1.5 :
        assignment.priority === 'medium' ? 1.0 : 0.7;
      
      const assignmentImpact = impactFactor * priorityMultiplier;
      
      workloadMap.set(dateKey, (workloadMap.get(dateKey) || 0) + assignmentImpact);
    });
  });
  
  // Add study sessions to workload
  studySessions.forEach(session => {
    if (session.isCompleted) return;
    
    const sessionDate = parseISO(session.startTime);
    if (sessionDate < startDate || sessionDate > endDate) return;
    
    const dateKey = format(sessionDate, 'yyyy-MM-dd');
    
    // Different priority has different impact
    const sessionImpact = 
      session.priority === 'high' ? 15 :
      session.priority === 'medium' ? 10 : 5;
    
    workloadMap.set(dateKey, (workloadMap.get(dateKey) || 0) + sessionImpact);
  });
  
  // Normalize workload to 0-100 scale
  // Find maximum workload
  let maxWorkload = 0;
  workloadMap.forEach(load => {
    maxWorkload = Math.max(maxWorkload, load);
  });
  
  // If max workload is above 100, normalize
  const normalizer = maxWorkload > 100 ? 100 / maxWorkload : 1;
  
  // Convert map to array of WorkloadDay objects
  return days.map(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    let load = workloadMap.get(dateKey) || 0;
    
    // Normalize load
    load = Math.round(load * normalizer);
    
    // Cap at 100
    load = Math.min(load, 100);
    
    return {
      date: day.toISOString(),
      load
    };
  });
};