import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Event, 
  Assignment, 
  StudySession, 
  Subject, 
  Notification,
  UserPreferences,
  WorkloadDay
} from '../types';
import { addDays, subDays, addHours, parseISO, isAfter, isBefore, format } from 'date-fns';
import { generateStudySessions } from '../utils/studyPlanner';
import { calculateWorkload } from '../utils/workloadCalculator';

interface AppContextType {
  // Data
  subjects: Subject[];
  events: Event[];
  assignments: Assignment[];
  studySessions: StudySession[];
  notifications: Notification[];
  workloadData: WorkloadDay[];
  userPreferences: UserPreferences;
  
  // Actions - Subjects
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  
  // Actions - Events
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  
  // Actions - Assignments
  addAssignment: (assignment: Omit<Assignment, 'id' | 'relatedEvents'>) => void;
  updateAssignment: (assignment: Assignment) => void;
  deleteAssignment: (id: string) => void;
  
  // Actions - Study Sessions
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  updateStudySession: (session: StudySession) => void;
  deleteStudySession: (id: string) => void;
  generateStudyPlan: () => void;
  
  // Actions - Notifications
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Actions - Preferences
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
  studyPreferences: {
    preferredStudyHours: [9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21],
    studyDuration: 90, // 1.5 hours
    breakDuration: 15, // 15 minutes
    studySessionsPerDay: 3,
  },
  notificationSettings: {
    enableNotifications: true,
    remindBeforeDeadline: 24, // 24 hours
    remindBeforeEvent: 30, // 30 minutes
  },
  themePreference: 'light',
};

const defaultSubjects: Subject[] = [
  { id: uuidv4(), name: 'Mathématiques', color: '#4F46E5' },
  { id: uuidv4(), name: 'Physique', color: '#06B6D4' },
  { id: uuidv4(), name: 'Chimie', color: '#10B981' },
  { id: uuidv4(), name: 'Français', color: '#EC4899' },
  { id: uuidv4(), name: 'Philosophie', color: '#8B5CF6' },
  { id: uuidv4(), name: 'Langue Vivante', color: '#F59E0B' },
  { id: uuidv4(), name: 'SI', color: '#EF4444' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for all data
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('subjects');
    return saved ? JSON.parse(saved) : defaultSubjects;
  });
  
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('assignments');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('studySessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : defaultPreferences;
  });

  const [workloadData, setWorkloadData] = useState<WorkloadDay[]>([]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  }, [subjects]);
  
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);
  
  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);
  
  useEffect(() => {
    localStorage.setItem('studySessions', JSON.stringify(studySessions));
  }, [studySessions]);
  
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  // Recalculate workload whenever relevant data changes
  useEffect(() => {
    const start = subDays(new Date(), 7);
    const end = addDays(new Date(), 30);
    const workload = calculateWorkload(
      events, 
      assignments, 
      studySessions, 
      start, 
      end
    );
    setWorkloadData(workload);
  }, [events, assignments, studySessions]);

  // Check for upcoming deadlines and generate notifications
  useEffect(() => {
    if (!userPreferences.notificationSettings.enableNotifications) return;
    
    const now = new Date();
    const deadlineHours = userPreferences.notificationSettings.remindBeforeDeadline;
    const eventMinutes = userPreferences.notificationSettings.remindBeforeEvent;
    
    // Check assignments deadlines
    assignments.forEach(assignment => {
      if (assignment.status === 'completed') return;
      
      const dueDate = parseISO(assignment.dueDate);
      const notifyTime = subDays(dueDate, deadlineHours / 24);
      
      if (isAfter(now, notifyTime) && isBefore(now, dueDate)) {
        const existingNotification = notifications.find(
          n => n.relatedItemId === assignment.id && n.type === 'warning'
        );
        
        if (!existingNotification) {
          addNotification({
            title: 'Deadline Approaching',
            message: `"${assignment.title}" is due on ${format(dueDate, 'PPP')}`,
            type: 'warning',
            relatedItemId: assignment.id,
          });
        }
      }
    });
    
    // Check upcoming events
    events.forEach(event => {
      const startTime = parseISO(event.startTime);
      const notifyTime = subDays(startTime, eventMinutes / (24 * 60));
      
      if (isAfter(now, notifyTime) && isBefore(now, startTime)) {
        const existingNotification = notifications.find(
          n => n.relatedItemId === event.id && n.type === 'info'
        );
        
        if (!existingNotification) {
          addNotification({
            title: 'Upcoming Event',
            message: `"${event.title}" starts on ${format(startTime, 'PPp')}`,
            type: 'info',
            relatedItemId: event.id,
          });
        }
      }
    });
  }, [assignments, events, notifications, userPreferences.notificationSettings]);

  // Subjects CRUD
  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject = { ...subject, id: uuidv4() };
    setSubjects([...subjects, newSubject]);
  };
  
  const updateSubject = (subject: Subject) => {
    setSubjects(subjects.map(s => s.id === subject.id ? subject : s));
  };
  
  const deleteSubject = (id: string) => {
    // Should warn if subject is in use
    setSubjects(subjects.filter(s => s.id !== id));
  };
  
  // Events CRUD
  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: uuidv4() };
    setEvents([...events, newEvent]);
    
    if (event.type === 'ds' || event.type === 'kholle') {
      // Auto generate study sessions
      const generatedSessions = generateStudySessions(
        newEvent,
        subjects.find(s => s.id === event.subjectId)!,
        events,
        studySessions,
        userPreferences
      );
      
      if (generatedSessions.length > 0) {
        setStudySessions([...studySessions, ...generatedSessions]);
        
        addNotification({
          title: 'Étude planifiée',
          message: `${generatedSessions.length} sessions d'étude ont été ajoutées pour ${event.title}`,
          type: 'success',
        });
      }
    }
  };
  
  const updateEvent = (event: Event) => {
    setEvents(events.map(e => e.id === event.id ? event : e));
  };
  
  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    // Also delete any study sessions related to this event
    setStudySessions(studySessions.filter(s => s.relatedToId !== id));
  };
  
  // Assignments CRUD
  const addAssignment = (assignment: Omit<Assignment, 'id' | 'relatedEvents'>) => {
    const newAssignment = {
      ...assignment,
      id: uuidv4(),
      relatedEvents: []
    };

    let assignmentToStore = newAssignment;

    // Auto generate study sessions if it's a DM
    if (assignment.type === 'dm') {
      const generatedSessions = generateStudySessions(
        {
          ...newAssignment,
          startTime: assignment.dueDate,
          endTime: addHours(parseISO(assignment.dueDate), 1).toISOString(),
          type: 'dm'
        },
        subjects.find(s => s.id === assignment.subjectId)!,
        events,
        studySessions,
        userPreferences,
        assignment.estimatedHours
      );

      if (generatedSessions.length > 0) {
        setStudySessions([...studySessions, ...generatedSessions]);

        assignmentToStore = {
          ...newAssignment,
          relatedEvents: generatedSessions.map(s => s.id)
        };

        addNotification({
          title: 'Étude planifiée',
          message: `${generatedSessions.length} sessions d'étude ont été ajoutées pour ${assignment.title}`,
          type: 'success',
        });
      }
    }

    setAssignments([...assignments, assignmentToStore]);
  };
  
  const updateAssignment = (assignment: Assignment) => {
    setAssignments(assignments.map(a => a.id === assignment.id ? assignment : a));
  };
  
  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    // Also delete any study sessions related to this assignment
    setStudySessions(studySessions.filter(s => s.relatedToId !== id));
  };
  
  // Study Sessions CRUD
  const addStudySession = (session: Omit<StudySession, 'id'>) => {
    const newSession = { ...session, id: uuidv4() };
    setStudySessions([...studySessions, newSession]);
  };
  
  const updateStudySession = (session: StudySession) => {
    setStudySessions(studySessions.map(s => s.id === session.id ? session : s));
  };
  
  const deleteStudySession = (id: string) => {
    setStudySessions(studySessions.filter(s => s.id !== id));
    
    // If this study session is referenced by an assignment, update the assignment
    assignments.forEach(assignment => {
      if (assignment.relatedEvents?.includes(id)) {
        updateAssignment({
          ...assignment,
          relatedEvents: assignment.relatedEvents.filter(sid => sid !== id)
        });
      }
    });
  };
  
  // Generate a study plan for all upcoming events and assignments
  const generateStudyPlan = () => {
    // Clear auto-generated study sessions that are in the future
    const now = new Date();
    const filteredSessions = studySessions.filter(session => {
      if (!session.autoGenerated) return true;
      return isBefore(parseISO(session.startTime), now);
    });
    
    let newSessions: StudySession[] = [...filteredSessions];
    let sessionsAdded = 0;
    
    // Generate for DS and kholles
    events.forEach(event => {
      if ((event.type === 'ds' || event.type === 'kholle') && 
          isAfter(parseISO(event.startTime), now)) {
        const generatedSessions = generateStudySessions(
          event,
          subjects.find(s => s.id === event.subjectId)!,
          events,
          newSessions,
          userPreferences
        );
        
        if (generatedSessions.length > 0) {
          newSessions = [...newSessions, ...generatedSessions];
          sessionsAdded += generatedSessions.length;
        }
      }
    });
    
    // Generate for DMs
    assignments.forEach(assignment => {
      if (assignment.type === 'dm' && 
          assignment.status !== 'completed' && 
          isAfter(parseISO(assignment.dueDate), now)) {
        const generatedSessions = generateStudySessions(
          {
            id: assignment.id,
            title: assignment.title,
            subjectId: assignment.subjectId,
            startTime: assignment.dueDate,
            endTime: addHours(parseISO(assignment.dueDate), 1).toISOString(),
            type: 'dm'
          },
          subjects.find(s => s.id === assignment.subjectId)!,
          events,
          newSessions,
          userPreferences,
          assignment.estimatedHours
        );
        
        if (generatedSessions.length > 0) {
          newSessions = [...newSessions, ...generatedSessions];
          sessionsAdded += generatedSessions.length;
          
          // Update the assignment with related study sessions
          updateAssignment({
            ...assignment,
            relatedEvents: [...(assignment.relatedEvents || []), ...generatedSessions.map(s => s.id)]
          });
        }
      }
    });
    
    setStudySessions(newSessions);
    
    if (sessionsAdded > 0) {
      addNotification({
        title: 'Plan d\'étude généré',
        message: `${sessionsAdded} nouvelles sessions d'étude ont été planifiées`,
        type: 'success',
      });
    } else {
      addNotification({
        title: 'Plan d\'étude',
        message: 'Aucune nouvelle session d\'étude n\'a été planifiée',
        type: 'info',
      });
    }
  };
  
  // Notifications
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications([newNotification, ...notifications]);
  };
  
  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  // User Preferences
  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    setUserPreferences({ ...userPreferences, ...preferences });
  };
  
  const value = {
    // Data
    subjects,
    events,
    assignments,
    studySessions,
    notifications,
    workloadData,
    userPreferences,
    
    // Actions
    addSubject,
    updateSubject,
    deleteSubject,
    addEvent,
    updateEvent,
    deleteEvent,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    generateStudyPlan,
    markNotificationAsRead,
    clearAllNotifications,
    updateUserPreferences,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};