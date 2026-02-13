const STORAGE_KEYS = {
  USERS: 'oliva_users',
  PROGRAMS: 'oliva_programs',
  MEMBER_WORKOUTS: 'oliva_member_workouts',
  PERSONAL_ROUTINES: 'oliva_personal_routines',
  ATTENDANCE: 'oliva_attendance',
  STREAKS: 'oliva_streaks',
  PAYMENTS: 'oliva_payments',
  SETTINGS: 'oliva_settings',
  NOTIFICATIONS: 'oliva_notifications',
  DIET_PLANS: 'oliva_diet_plans',
  REMINDERS: 'oliva_reminders',
  PROGRESS: 'oliva_progress',
  MESSAGES: 'oliva_messages',
  TODAYS_WORKOUT: 'oliva_todays_workout',
  ANNOUNCEMENTS: 'oliva_announcements',
  CHATS: 'oliva_chats',
  ACTIVE_WORKOUT: 'oliva_active_workout',
  WORKOUT_PLANS: 'workoutPlans',
  WORKOUT_RECORDS: 'workoutRecords',
  TRAINERS: 'oliva_trainers',
  MEMBERSHIP_PLANS: 'oliva_membership_plans'
};

const getFromStorage = (key, defaultValue = []) => {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const DB = {
  // Users
  getUsers: () => getFromStorage(STORAGE_KEYS.USERS, [
    { id: 'MASTER01', name: 'Master Trainer', role: 'MASTER', status: 'active', trainerCode: 'OLIVA2026', gymId: 'GYM_DEMO' },
    { id: 'OLIVA-001', name: 'Demo Member', role: 'MEMBER', status: 'active', joinDate: '2024-01-01', gymId: 'GYM_DEMO' }
  ]),
  saveUsers: (users) => saveToStorage(STORAGE_KEYS.USERS, users),

  // Programs
  getPrograms: () => getFromStorage(STORAGE_KEYS.PROGRAMS, []),
  savePrograms: (programs) => saveToStorage(STORAGE_KEYS.PROGRAMS, programs),

  // Member Workouts (Master assigned)
  getMemberWorkouts: () => getFromStorage(STORAGE_KEYS.MEMBER_WORKOUTS, {}),
  saveMemberWorkouts: (data) => saveToStorage(STORAGE_KEYS.MEMBER_WORKOUTS, data),

  // Personal Routines (Member created)
  getPersonalRoutines: () => getFromStorage(STORAGE_KEYS.PERSONAL_ROUTINES, {}),
  savePersonalRoutines: (data) => saveToStorage(STORAGE_KEYS.PERSONAL_ROUTINES, data),

  // Attendance
  getAttendance: () => getFromStorage(STORAGE_KEYS.ATTENDANCE, {}),
  saveAttendance: (data) => saveToStorage(STORAGE_KEYS.ATTENDANCE, data),

  // Streaks
  getStreaks: () => getFromStorage(STORAGE_KEYS.STREAKS, {}),
  saveStreaks: (data) => saveToStorage(STORAGE_KEYS.STREAKS, data),

  // Payments
  getPayments: () => getFromStorage(STORAGE_KEYS.PAYMENTS, []),
  savePayments: (data) => saveToStorage(STORAGE_KEYS.PAYMENTS, data),

  // Settings
  getSettings: () => getFromStorage(STORAGE_KEYS.SETTINGS, {
    gymName: 'OLIVA GYM',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    defaultRestDays: ['Sun'],
    streakStrictness: 'daily'
  }),
  saveSettings: (settings) => saveToStorage(STORAGE_KEYS.SETTINGS, settings),

  // Notifications
  getNotifications: () => getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []),
  saveNotifications: (data) => saveToStorage(STORAGE_KEYS.NOTIFICATIONS, data),

  // Diet Plans
  getDietPlans: () => getFromStorage(STORAGE_KEYS.DIET_PLANS, {}),
  saveDietPlans: (data) => saveToStorage(STORAGE_KEYS.DIET_PLANS, data),

  // Reminders
  getReminders: () => getFromStorage(STORAGE_KEYS.REMINDERS, {}),
  saveReminders: (data) => saveToStorage(STORAGE_KEYS.REMINDERS, data),

  // Progress
  getProgress: () => getFromStorage(STORAGE_KEYS.PROGRESS, {}),
  saveProgress: (data) => saveToStorage(STORAGE_KEYS.PROGRESS, data),

  // Messages
  getMessages: () => getFromStorage(STORAGE_KEYS.MESSAGES, []),
  saveMessages: (data) => saveToStorage(STORAGE_KEYS.MESSAGES, data),

  // Todays Workout
  getTodaysWorkout: () => getFromStorage(STORAGE_KEYS.TODAYS_WORKOUT, {}),
  saveTodaysWorkout: (data) => saveToStorage(STORAGE_KEYS.TODAYS_WORKOUT, data),

  // Announcements
  getAnnouncements: () => getFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, []),
  saveAnnouncements: (data) => saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, data),

  // Chats
  getChats: () => getFromStorage(STORAGE_KEYS.CHATS, {}),
  saveChats: (data) => saveToStorage(STORAGE_KEYS.CHATS, data),

  // New Workout Architecture
  getWorkoutPlans: () => getFromStorage(STORAGE_KEYS.WORKOUT_PLANS, []),
  saveWorkoutPlans: (data) => saveToStorage(STORAGE_KEYS.WORKOUT_PLANS, data),

  getActiveWorkout: (userId) => {
    const all = getFromStorage(STORAGE_KEYS.ACTIVE_WORKOUT, {});
    return userId ? all[userId] : null;
  },
  saveActiveWorkout: (userId, data) => {
    const all = getFromStorage(STORAGE_KEYS.ACTIVE_WORKOUT, {});
    if (data === null) {
      delete all[userId];
    } else {
      all[userId] = data;
    }
    saveToStorage(STORAGE_KEYS.ACTIVE_WORKOUT, all);
  },

  getWorkoutRecords: () => getFromStorage(STORAGE_KEYS.WORKOUT_RECORDS, []),
  saveWorkoutRecords: (data) => saveToStorage(STORAGE_KEYS.WORKOUT_RECORDS, data),

  // Trainers
  getTrainers: () => getFromStorage(STORAGE_KEYS.TRAINERS, []),
  saveTrainers: (data) => saveToStorage(STORAGE_KEYS.TRAINERS, data),

  // Membership Plans
  getMembershipPlans: () => getFromStorage(STORAGE_KEYS.MEMBERSHIP_PLANS, [
    {
      id: 'PLAN1M', name: '1 Month', price: 1000, durationMonths: 1,
      features: ['Gym Access', 'Basic Equipment', 'Locker Facility', '1 Month Validity'],
      color: 'blue'
    },
    {
      id: 'PLAN3M', name: '3 Months', price: 2750, durationMonths: 3,
      features: ['All Monthly Features', 'Free Diet Chart', '1 PT Session', '3 Months Validity'],
      color: 'purple',
      isPopular: true
    },
    {
      id: 'PLAN6M', name: '6 Months', price: 4000, durationMonths: 6,
      features: ['All Quarterly Features', '2 PT Sessions/Month', 'Group Classes', '6 Months Validity'],
      color: 'pink'
    },
    {
      id: 'PLAN1Y', name: '1 Year', price: 8000, durationMonths: 12,
      features: ['All Features Included', 'Unlimited PT Sessions', 'Personal Trainer', '1 Year Validity', 'Free Supplements'],
      color: 'lime',
      isBestValue: true
    }
  ]),
  saveMembershipPlans: (data) => saveToStorage(STORAGE_KEYS.MEMBERSHIP_PLANS, data),
};

export const exportData = () => {
  const data = {};
  Object.values(STORAGE_KEYS).forEach(key => {
    data[key] = localStorage.getItem(key);
  });
  return JSON.stringify(data);
};

export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    Object.keys(data).forEach(key => {
      if (data[key]) localStorage.setItem(key, data[key]);
    });
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
};
