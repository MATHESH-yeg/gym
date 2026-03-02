// DataContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { DB } from "../utils/db";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user || null;

  // ✅ If your AuthContext has loading, use it. If not, fallback to false (works fine).
  const authLoading = typeof auth?.loading === "boolean" ? auth.loading : false;

  // ---------------- Core States ----------------
  const [programs, setPrograms] = useState([]);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [streaks, setStreaks] = useState({});
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [dietPlans, setDietPlans] = useState({});
  const [reminders, setReminders] = useState({});
  const [notes, setNotes] = useState({});
  const [progress, setProgress] = useState({});
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [chats, setChats] = useState({});
  const [todaysWorkout, setTodaysWorkout] = useState({});
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutRecords, setWorkoutRecords] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [master, setMaster] = useState(null);

  // ✅ one place to clear everything
  const clearAllData = useCallback(() => {
    setPrograms([]);
    setMembers([]);
    setAttendance({});
    setStreaks({});
    setPayments([]);
    setSettings({});
    setNotifications([]);
    setDietPlans({});
    setReminders({});
    setNotes({});
    setProgress({});
    setMessages([]);
    setAnnouncements([]);
    setChats({});
    setTodaysWorkout({});
    setWorkoutPlans([]);
    setActiveWorkout(null);
    setWorkoutRecords([]);
    setTrainers([]);
    setMembershipPlans([]);
    setMaster(null);
  }, []);

  // ✅ Safe refresh that won't flicker during auth hydration
  const refreshData = useCallback(() => {
    // Don’t do anything while auth is still determining user
    if (authLoading) return;

    // 🔐 GOLDEN RULE: NO USER / NO GYM ID => CLEAR
    if (!user || !user.gymId) {
      console.log("🔒 DataContext: No user/gymId. Clearing data.");
      clearAllData();
      return;
    }

    const gymId = user.gymId;
    console.log(`🔓 DataContext: Loading data for Gym ID: ${gymId}`);

    // Helpers
    const filterByGym = (data) =>
      Array.isArray(data) ? data.filter((item) => item.gymId === gymId) : [];

    const allUsers = DB.getUsers?.() || [];
    const gymUsers = allUsers.filter((u) => u.gymId === gymId);

    // Members
    const gymMembers = gymUsers.filter((u) => u.role === "MEMBER");
    setMembers(gymMembers);

    // Programs
    setPrograms(filterByGym(DB.getPrograms?.() || []));

    // Payments
    setPayments(filterByGym(DB.getPayments?.() || []));

    // Notifications
    const gymUserIds = gymUsers.map((u) => u.id);
    const allNotifs = DB.getNotifications?.() || [];
    const relevantTargets = [...gymUserIds, user.id];
    setNotifications(
      allNotifs.filter(
        (n) => relevantTargets.includes(n.targetId) || n.gymId === gymId
      )
    );

    // Workout Plans
    setWorkoutPlans(filterByGym(DB.getWorkoutPlans?.() || []));

    // Trainers
    setTrainers(filterByGym(DB.getTrainers?.() || []));

    // Master (Gym Owner)
    const currentMaster = gymUsers.find(u => u.role === 'MASTER');
    setMaster(currentMaster);

    // Announcements (with auto-cleanup for expired items)
    const rawAnns = DB.getAnnouncements?.() || [];
    const nowStr = new Date().toISOString();
    const liveAnns = rawAnns.filter(ann => !ann.expiryDate || ann.expiryDate > nowStr);

    // Persist cleanup if any expired items were removed
    if (liveAnns.length !== rawAnns.length) {
      DB.saveAnnouncements?.(liveAnns);
    }

    const gymAnns = filterByGym(liveAnns);
    let filteredAnns = gymAnns;
    if (user.role === 'MEMBER') {
      filteredAnns = gymAnns.filter(ann =>
        !ann.createdByRole || ann.createdByRole === 'MASTER' || ann.createdById === user.trainerId
      );
    } else if (user.role === 'TRAINER') {
      filteredAnns = gymAnns.filter(ann =>
        !ann.createdByRole || ann.createdByRole === 'MASTER' || ann.createdById === user.id
      );
    } else if (user.role === 'MASTER') {
      filteredAnns = gymAnns.filter(ann =>
        !ann.createdByRole || ann.createdByRole === 'MASTER'
      );
    }
    setAnnouncements(filteredAnns);

    // Records
    setWorkoutRecords(filterByGym(DB.getWorkoutRecords?.() || []));

    // Object-based (keyed by userId)
    const gymMemberIds = gymMembers.map((m) => m.id);

    const filterObjectByKeys = (obj) => {
      const safeObj = obj && typeof obj === "object" ? obj : {};
      const newObj = {};
      Object.keys(safeObj).forEach((key) => {
        if (gymMemberIds.includes(key) || key === user.id) {
          newObj[key] = safeObj[key];
        }
      });
      return newObj;
    };

    setAttendance(filterObjectByKeys(DB.getAttendance?.() || {}));
    setStreaks(filterObjectByKeys(DB.getStreaks?.() || {}));
    setDietPlans(filterObjectByKeys(DB.getDietPlans?.() || {}));
    setReminders(filterObjectByKeys(DB.getReminders?.() || {}));
    setNotes(filterObjectByKeys(DB.getNotes?.() || {}));
    setProgress(filterObjectByKeys(DB.getProgress?.() || {}));
    setChats(filterObjectByKeys(DB.getChats?.() || {}));

    // Active workout (user-specific)
    const active = DB.getActiveWorkout?.(user.id);
    if (active && active.gymId === gymId) setActiveWorkout(active);
    else setActiveWorkout(null);

    // ✅ Settings: your saveSettings stores settings inside user object
    // Prefer that. Fallback to DB.getSettings if you still use it.
    const currentUserFromDB =
      allUsers.find((u) => u.id === user.id) || user;
    setSettings(currentUserFromDB?.settings || (DB.getSettings?.() || {}));

    // Membership plans
    const allPlans = DB.getMembershipPlans?.() || [];
    const visiblePlans = allPlans.filter((p) => !p.gymId || p.gymId === gymId);
    setMembershipPlans(visiblePlans);

    // ✅ Today's Workout (Assigned by Trainer/Master)
    const assigned = currentUserFromDB?.assignedProgram;
    if (assigned) {
      setTodaysWorkout(assigned);
    } else {
      setTodaysWorkout({});
    }
  }, [authLoading, user?.id, user?.gymId, clearAllData]);

  // ✅ Trigger refresh only when auth ready + user identity/gym changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ---------------- Management Logic ----------------

  const addMember = (member) => {
    if (authLoading) return;
    if (!user || !user.gymId) return;

    const users = DB.getUsers?.() || [];

    let memberId = member?.id && member.id.trim() !== "" ? member.id : null;

    if (!memberId) {
      const rawName = user.gymName || user.name || "GYM";
      const words = rawName.split(/[^a-zA-Z0-9]/).filter(w => w.length > 0);
      let gymPrefix = (words[0] || "GYM").toLowerCase();

      // If name is plural like 'Diamonds', try to make it singular like 'Diamond'
      if (gymPrefix.endsWith('s') && gymPrefix.length > 3) {
        gymPrefix = gymPrefix.slice(0, -1);
      }

      // Sequential generation based on current gym members
      const gymMembers = users.filter(u => u.gymId === user.gymId && u.role === 'MEMBER');
      const ids = gymMembers.map(m => {
        const match = m.id && m.id.match(/\d+$/);
        return match ? parseInt(match[0]) : 0;
      });
      let nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;

      memberId = `${gymPrefix}-${nextNum.toString().padStart(3, '0')}`;

      while (users.some((u) => u.id === memberId)) {
        nextNum++;
        memberId = `${gymPrefix}${nextNum.toString().padStart(3, '0')}`;
      }
    } else {
      if (users.some((u) => u.id === memberId)) {
        alert("Member ID already exists! Auto-suffixing...");
        let counter = 1;
        const baseId = memberId;
        while (users.some((u) => u.id === memberId)) {
          memberId = `${baseId}${counter}`;
          counter++;
        }
      }
    }

    const newUsers = [
      ...users,
      {
        ...member,
        id: memberId,
        role: "MEMBER",
        status: "active",
        joinDate: new Date().toISOString(),
        gymId: user.gymId,
        trainerId: user.id,
      },
    ];
    DB.saveUsers?.(newUsers);
    refreshData();
  };

  const updateMember = (id, updates) => {
    const users = DB.getUsers?.() || [];
    const newUsers = users.map((u) =>
      (u.id && id && u.id.toLowerCase() === id.toLowerCase()) ? { ...u, ...updates } : u
    );
    DB.saveUsers?.(newUsers);
    refreshData();
  };

  const deleteMember = (id) => {
    const users = DB.getUsers?.() || [];
    DB.saveUsers?.(users.filter((u) => u.id !== id));
    refreshData();
  };

  const changeMemberId = (oldId, newId, memberData) => {
    const users = DB.getUsers?.() || [];
    if (users.find((u) => u.id === newId)) {
      alert("ID already exists");
      return false;
    }
    const newUsers = users.map((u) =>
      u.id === oldId ? { ...memberData, id: newId } : u
    );
    DB.saveUsers?.(newUsers);
    refreshData();
    return true;
  };

  const saveProgram = (program) => {
    if (authLoading) return;
    if (!user || !user.gymId) return;

    const current = DB.getPrograms?.() || [];
    const programToSave = { ...program, gymId: user.gymId };

    const newPrograms = current.find((p) => p.id === program?.id)
      ? current.map((p) => (p.id === program.id ? programToSave : p))
      : [...current, programToSave];

    DB.savePrograms?.(newPrograms);
    refreshData();
  };

  const deleteProgram = (id) => {
    const current = DB.getPrograms?.() || [];
    DB.savePrograms?.(current.filter((p) => p.id !== id));
    refreshData();
  };

  const assignWorkout = (memberId, program) => {
    const users = DB.getUsers?.() || [];
    const newUsers = users.map((u) =>
      u.id === memberId ? { ...u, assignedProgram: program } : u
    );
    DB.saveUsers?.(newUsers);
    refreshData();
  };

  const logAttendance = (memberId, date, status) => {
    const currentAttendance = DB.getAttendance?.() || {};
    if (!currentAttendance[memberId]) currentAttendance[memberId] = [];

    const filtered = currentAttendance[memberId].filter((a) => a.date !== date);
    currentAttendance[memberId] = [...filtered, { date, status }];

    DB.saveAttendance?.(currentAttendance);
    if (status === "present" || status === "rest") updateStreak(memberId, date, status);
    refreshData();
  };

  const updateStreak = (memberId, date, status) => {
    const currentStreaks = DB.getStreaks?.() || {};
    const streak = currentStreaks[memberId] || {
      current: 0,
      best: 0,
      lastDate: null,
    };

    const lastDate = streak.lastDate ? new Date(streak.lastDate) : null;
    const today = new Date(date);

    if (lastDate) {
      const diffTime = Math.abs(
        today.setHours(0, 0, 0, 0) - lastDate.setHours(0, 0, 0, 0)
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        if (status === "present") streak.current += 1;
        // else status is "rest", streak.current stays same
      } else if (diffDays > 1) {
        streak.current = status === "present" ? 1 : 0;
      }
    } else {
      streak.current = status === "present" ? 1 : 0;
    }

    if (streak.current > streak.best) streak.best = streak.current;
    streak.lastDate = date;

    currentStreaks[memberId] = streak;
    DB.saveStreaks?.(currentStreaks);
  };

  const saveAnnouncement = (title, message, expiryDate = null) => {
    if (authLoading) return;
    if (!user || !user.gymId) {
      console.warn("⚠️ DataContext: Cannot save announcement. Missing user or gymId.");
      return;
    }

    const current = DB.getAnnouncements?.() || [];
    const newAnn = {
      id: "ANN" + Date.now(),
      title,
      message,
      createdAt: new Date().toISOString(),
      expiryDate,
      gymId: user.gymId,
      createdByRole: user.role,
      createdById: user.id
    };

    console.log("📢 DataContext: Saving new announcement:", newAnn);
    DB.saveAnnouncements?.([newAnn, ...current]);
    refreshData();
  };

  const saveBodyGoal = (userId, goalData) => {
    const users = DB.getUsers?.() || [];
    const newUsers = users.map((u) =>
      u.id === userId ? { ...u, bodyGoal: goalData } : u
    );
    DB.saveUsers?.(newUsers);
    refreshData();
  };

  const saveChatMessage = (senderId, recipientId, text) => {
    const current = DB.getChats?.() || {};
    if (!current[senderId]) current[senderId] = {};
    if (!current[senderId][recipientId]) current[senderId][recipientId] = [];

    const newMsg = {
      id: "MSG" + Date.now(),
      senderId,
      text,
      timestamp: new Date().toISOString(),
      seen: false
    };
    current[senderId][recipientId].push(newMsg);

    if (!current[recipientId]) current[recipientId] = {};
    if (!current[recipientId][senderId]) current[recipientId][senderId] = [];
    current[recipientId][senderId].push(newMsg);

    DB.saveChats?.(current);
    refreshData();
  };

  const updateChatMessage = (senderId, recipientId, messageId, newText) => {
    const current = DB.getChats?.() || {};

    const updateInConversation = (p1, p2) => {
      if (current[p1] && current[p1][p2]) {
        current[p1][p2] = current[p1][p2].map((msg) =>
          msg.id === messageId ? { ...msg, text: newText } : msg
        );
      }
    };

    updateInConversation(senderId, recipientId);
    updateInConversation(recipientId, senderId);

    DB.saveChats?.(current);
    refreshData();
  };

  const deleteChatMessage = (senderId, recipientId, messageId) => {
    const current = DB.getChats?.() || {};

    const deleteInConversation = (p1, p2) => {
      if (current[p1] && current[p1][p2]) {
        current[p1][p2] = current[p1][p2].filter((msg) => msg.id !== messageId);
      }
    };

    deleteInConversation(senderId, recipientId);
    deleteInConversation(recipientId, senderId);

    DB.saveChats?.(current);
    refreshData();
  };

  const markMessagesAsSeen = (userId, otherId) => {
    const current = DB.getChats?.() || {};
    let changed = false;

    // Mark messages received by userId from otherId as seen
    if (current[userId] && current[userId][otherId]) {
      current[userId][otherId] = current[userId][otherId].map(msg => {
        if (msg.senderId === otherId && !msg.seen) {
          changed = true;
          return { ...msg, seen: true };
        }
        return msg;
      });
    }

    // Also mark them in the other person's copy (sender's outbox) 
    // so they see the "Seen" indicator
    if (current[otherId] && current[otherId][userId]) {
      current[otherId][userId] = current[otherId][userId].map(msg => {
        if (msg.senderId === otherId && !msg.seen) {
          changed = true;
          return { ...msg, seen: true }
        }
        return msg;
      });
    }

    if (changed) {
      DB.saveChats?.(current);
      refreshData();
    }
  };

  const deletePayment = (id) => {
    const current = DB.getPayments?.() || [];
    DB.savePayments?.(current.filter((p) => p.id !== id));
    refreshData();
  };

  const addPayment = (payment) => {
    if (authLoading) return;
    if (!user || !user.gymId) return;

    const current = DB.getPayments?.() || [];
    const newPayment = { ...payment, id: "PAY_" + Date.now(), gymId: user.gymId };
    DB.savePayments?.([...current, newPayment]);
    refreshData();
  };

  const updatePayment = (id, updates) => {
    const current = DB.getPayments?.() || [];
    const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
    DB.savePayments?.(updated);
    refreshData();
  };

  const processMembershipPayment = (memberId, plan) => {
    if (authLoading) return;
    if (!user || !user.gymId) return;

    const now = new Date();
    let expiryDate = new Date(now);

    if (plan?.name?.includes("1 Month")) expiryDate.setMonth(expiryDate.getMonth() + 1);
    else if (plan?.name?.includes("3 Months")) expiryDate.setMonth(expiryDate.getMonth() + 3);
    else if (plan?.name?.includes("6 Months")) expiryDate.setMonth(expiryDate.getMonth() + 6);
    else if (plan?.name?.includes("1 Year")) expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const users = DB.getUsers?.() || [];
    const updatedUsers = users.map((u) =>
      u.id === memberId
        ? { ...u, plan: plan.name, expiryDate: expiryDate.toISOString(), status: "active" }
        : u
    );
    DB.saveUsers?.(updatedUsers);

    const payment = {
      id: "PAY_" + Date.now(),
      memberId,
      planName: plan.name,
      amount: plan.price,
      paymentDate: now.toISOString(),
      validTill: expiryDate.toISOString(),
      status: "Completed",
      mode: "Online",
      date: now.toISOString(),
      gymId: user.gymId,
    };

    const currentPayments = DB.getPayments?.() || [];
    DB.savePayments?.([...currentPayments, payment]);

    refreshData();
  };

  const saveDietPlan = (memberId, plan) => {
    if (!user || !user.gymId) return;

    const mem = members.find((m) => m.id === memberId);
    if (!mem) return;

    const current = DB.getDietPlans?.() || {};
    if (!current[memberId]) current[memberId] = [];

    const newPlan = { ...plan, id: "DIET" + Date.now(), gymId: user.gymId, createdBy: plan.createdBy || user.role };
    current[memberId].push(newPlan);

    DB.saveDietPlans?.(current);
    refreshData();
  };

  const deleteDietPlan = (memberId, planId) => {
    const current = DB.getDietPlans?.() || {};
    if (current[memberId]) {
      current[memberId] = current[memberId].filter((p) => p.id !== planId);
      DB.saveDietPlans?.(current);
      refreshData();
    }
  };

  const saveSettings = (newSettings) => {
    if (!user || !user.gymId) return;

    const users = DB.getUsers?.() || [];
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, settings: newSettings } : u
    );

    DB.saveUsers?.(updatedUsers);
    setSettings(newSettings);
  };

  // 🟢 WORKOUT PLANS LOGIC
  const saveWorkoutPlan = (plan) => {
    if (!user || !user.gymId) return;

    const current = DB.getWorkoutPlans?.() || [];
    let newPlans;

    if (plan?.id && current.some((p) => p.id === plan.id)) {
      newPlans = current.map((p) =>
        p.id === plan.id ? { ...plan, updatedAt: Date.now() } : p
      );
    } else {
      newPlans = [
        ...current,
        {
          ...plan,
          id: "PLAN_" + Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          gymId: user.gymId,
        },
      ];
    }

    DB.saveWorkoutPlans?.(newPlans);
    setWorkoutPlans(newPlans);
  };

  const startWorkout = (plan) => {
    if (!user || !user.gymId) return;
    if (!plan) return;

    let exercisesToLoad = Array.isArray(plan.exercises) ? plan.exercises : [];
    let routineName = plan.name;

    // Handle multi-day schedule plans assigned by Master
    if (plan.schedule && plan.schedule.length > 0 && exercisesToLoad.length === 0) {
      const userAttendance = attendance[user.id] || [];
      const dayIndex = userAttendance.length % plan.schedule.length;
      const dayConfig = plan.schedule[dayIndex];
      exercisesToLoad = dayConfig.exercises || [];
      routineName = `${plan.name} - ${dayConfig.focus || `Day ${dayIndex + 1}`}`;
    }

    const newActive = {
      sessionId: "SESS_" + Date.now(),
      routineId: plan.id || plan.routineId,
      routineName: routineName,
      routineCode: plan.code || plan.routineCode,
      source: plan.source || 'PERSONAL',
      date: new Date().toISOString().split("T")[0],
      day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
      startTime: Date.now(),
      gymId: user.gymId,
      userId: user.id,
      exercises: exercisesToLoad.map((ex, exIdx) => {
        // Normalize sets: Master assigns sets as a number, but execution expects an array of set objects
        let setsArray = [];
        if (Array.isArray(ex.sets)) {
          setsArray = ex.sets;
        } else {
          const count = parseInt(ex.sets) || 1;
          setsArray = Array.from({ length: count }, () => ({ reps: ex.reps || 10, weight: ex.weight || 0 }));
        }

        return {
          ...ex,
          id: ex.id || `E_${Date.now()}_${exIdx}`,
          currentSetIndex: 0,
          sets: setsArray.map((s, idx) => ({
            ...s,
            id: s.id || `SET_${Date.now()}_${idx}`,
            completed: false,
            actualReps: s.reps || 0,
            actualWeight: s.weight || 0,
          })),
        };
      }),
    };

    DB.saveActiveWorkout?.(user.id, newActive);
    setActiveWorkout(newActive);
  };

  const updateActiveWorkout = (updates) => {
    if (!user) return;
    if (updates === null) {
      cancelActiveWorkout();
      return;
    }
    if (!activeWorkout) return;
    const updated = { ...activeWorkout, ...updates };
    setActiveWorkout(updated);
    DB.saveActiveWorkout?.(user.id, updated);
  };

  const cancelActiveWorkout = () => {
    if (!user) return;
    setActiveWorkout(null);
    DB.saveActiveWorkout?.(user.id, null);
  };

  const deleteWorkoutPlan = (id) => {
    const current = DB.getWorkoutPlans?.() || [];
    const newPlans = current.filter((p) => p.id !== id);
    DB.saveWorkoutPlans?.(newPlans);
    setWorkoutPlans(newPlans);
  };

  const finishWorkout = (finalSession, summaryData = {}) => {
    if (!user || !user.gymId) return;

    const endTime = Date.now();
    const durationMs = endTime - finalSession.startTime;
    const durationMins = Math.floor(durationMs / 1000 / 60);
    const durationSecs = Math.floor((durationMs / 1000) % 60);

    const record = {
      recordId: "REC_" + Date.now(),
      gymId: user.gymId,
      userId: user.id,
      routineId: finalSession.routineId,
      routineName: finalSession.routineName,
      routineCode: finalSession.routineCode,
      source: finalSession.source,
      date: finalSession.date,
      dayOfWeek: finalSession.day,
      startTime: new Date(finalSession.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      endTime: new Date(endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: `${durationMins}:${durationSecs.toString().padStart(2, "0")}`,
      durationSecs: Math.floor(durationMs / 1000),
      totalVolume: summaryData.totalVolume || 0,
      feelingRating: summaryData.feelingRating || 3,
      overallNotes: summaryData.overallNotes || "",
      personalRecords: summaryData.personalRecords || [],
      completedExercises: (finalSession.exercises || [])
        .map((ex) => ({
          exerciseName: ex.name,
          targetSets: (ex.sets || []).length,
          completedSets: (ex.sets || [])
            .filter((s) => s.completed)
            .map((s) => ({
              setNumber: (ex.sets || []).indexOf(s) + 1,
              reps: s.actualReps || s.reps,
              weight: s.actualWeight || s.weight,
              completed: true,
            })),
          notes: ex.notes || "",
        }))
        .filter((ex) => ex.completedSets.length > 0),
    };

    const currentRecords = DB.getWorkoutRecords?.() || [];
    const newRecords = [record, ...currentRecords];
    DB.saveWorkoutRecords?.(newRecords);
    setWorkoutRecords(newRecords);

    // Sync progress
    const currentProgress = DB.getProgress?.() || {};
    const userId = user.id;
    if (!currentProgress[userId]) currentProgress[userId] = [];

    record.completedExercises.forEach((ex) => {
      const maxWeight = Math.max(...ex.completedSets.map((s) => s.weight));
      const avgReps = Math.round(
        ex.completedSets.reduce((sum, s) => sum + s.reps, 0) /
        ex.completedSets.length
      );
      currentProgress[userId].push({
        exercise: ex.exerciseName,
        weight: maxWeight,
        reps: avgReps,
        sets: ex.completedSets.length,
        date: record.date,
      });
    });
    DB.saveProgress?.(currentProgress);

    // Clear Active
    DB.saveActiveWorkout?.(user.id, null);
    setActiveWorkout(null);

    // Track attendance
    logAttendance(userId, record.date, "present");
    refreshData();

    return record;
  };

  const addNotification = (targetId, message) => {
    if (!user || !user.gymId) return;

    const current = DB.getNotifications?.() || [];
    const newNotif = {
      id: "NTF" + Date.now(),
      targetId,
      message,
      date: new Date().toISOString(),
      read: false,
      gymId: user.gymId,
    };
    DB.saveNotifications?.([newNotif, ...current]);
    refreshData();
  };

  const connectToTrainer = (memberId, trainerCode) => {
    const gymTrainer = trainers.find((t) => t.code === trainerCode);

    if (gymTrainer) {
      const users = DB.getUsers?.() || [];
      const newUsers = users.map((u) =>
        u.id === memberId ? { ...u, trainerId: gymTrainer.id } : u
      );
      DB.saveUsers?.(newUsers);
      refreshData();
      return true;
    }
    return false;
  };

  const saveTrainer = (trainer) => {
    if (!user || !user.gymId) return;

    const current = DB.getTrainers?.() || [];
    let newTrainers;

    if (trainer?.id && current.find((t) => t.id === trainer.id)) {
      newTrainers = current.map((t) => (t.id === trainer.id ? trainer : t));
    } else {
      newTrainers = [
        ...current,
        { ...trainer, id: trainer?.id || "TR_" + Date.now(), gymId: user.gymId },
      ];
    }

    DB.saveTrainers?.(newTrainers);
    setTrainers(newTrainers);
  };

  const deleteTrainer = (id) => {
    const current = DB.getTrainers?.() || [];
    const newTrainers = current.filter((t) => t.id !== id);
    DB.saveTrainers?.(newTrainers);
    setTrainers(newTrainers);

    const users = DB.getUsers?.() || [];
    const newUsers = users.map((u) =>
      u.trainerId === id ? { ...u, trainerId: null } : u
    );
    DB.saveUsers?.(newUsers);
    refreshData();
  };

  const saveMembershipPlan = (plan) => {
    if (!user || !user.gymId) return;

    const current = DB.getMembershipPlans?.() || [];
    const planWithGym = { ...plan, gymId: user.gymId };

    const newPlans =
      plan?.id && current.some((p) => p.id === plan.id)
        ? current.map((p) => (p.id === plan.id ? planWithGym : p))
        : [...current, { ...planWithGym, id: "PLAN_" + Date.now() }];

    DB.saveMembershipPlans?.(newPlans);
    refreshData();
  };

  const deleteMembershipPlan = (id) => {
    if (!user || !user.gymId) return;

    const current = DB.getMembershipPlans?.() || [];
    const newPlans = current.filter((p) => p.id !== id);
    DB.saveMembershipPlans?.(newPlans);
    refreshData();
  };

  const updateWorkoutRecord = (updatedRecord) => {
    if (!user || !user.gymId) return;

    const current = DB.getWorkoutRecords?.() || [];
    const newRecords = current.map((r) =>
      r.recordId === updatedRecord.recordId ? updatedRecord : r
    );

    DB.saveWorkoutRecords?.(newRecords);
    setWorkoutRecords(newRecords.filter((r) => r.gymId === user.gymId));
  };

  const saveReminder = (userId, reminder) => {
    const current = DB.getReminders?.() || {};
    if (!current[userId]) current[userId] = [];

    if (reminder.id) {
      current[userId] = current[userId].map(r => r.id === reminder.id ? { ...reminder, updatedAt: Date.now() } : r);
    } else {
      current[userId].push({ ...reminder, id: 'REM_' + Date.now(), createdAt: Date.now() });
    }

    DB.saveReminders?.(current);
    refreshData();
  };

  const deleteReminder = (userId, reminderId) => {
    const current = DB.getReminders?.() || {};
    if (current[userId]) {
      current[userId] = current[userId].filter(r => r.id !== reminderId);
      DB.saveReminders?.(current);
      refreshData();
    }
  };

  const saveNote = (userId, note) => {
    const current = DB.getNotes?.() || {};
    if (!current[userId]) current[userId] = [];

    if (note.id) {
      current[userId] = current[userId].map(n => n.id === note.id ? { ...note, updatedAt: Date.now() } : n);
    } else {
      current[userId].push({ ...note, id: 'NOTE_' + Date.now(), createdAt: Date.now() });
    }

    DB.saveNotes?.(current);
    refreshData();
  };

  const deleteNote = (userId, noteId) => {
    const current = DB.getNotes?.() || {};
    if (current[userId]) {
      current[userId] = current[userId].filter(n => n.id !== noteId);
      DB.saveNotes?.(current);
      refreshData();
    }
  };

  // ✅ Memoize provider value to avoid extra renders
  const value = useMemo(
    () => ({
      programs,
      members,
      attendance,
      streaks,
      payments,
      settings,
      notifications,
      dietPlans,
      reminders,
      progress,
      messages,
      announcements,
      chats,
      todaysWorkout,
      workoutPlans,
      activeWorkout,
      workoutRecords,
      trainers,
      membershipPlans,
      notes,

      refreshData,
      addMember,
      updateMember,
      deleteMember,
      changeMemberId,
      logAttendance,

      saveProgram,
      deleteProgram,
      assignWorkout,

      saveChatMessage,
      updateChatMessage,
      deleteChatMessage,

      deletePayment,
      addPayment,
      updatePayment,
      processMembershipPayment,

      saveDietPlan,
      deleteDietPlan,

      saveWorkoutPlan,
      deleteWorkoutPlan,
      startWorkout,
      updateActiveWorkout,
      finishWorkout,
      cancelActiveWorkout,

      saveSettings,
      addNotification,
      saveAnnouncement,
      saveBodyGoal,
      connectToTrainer,

      saveTrainer,
      deleteTrainer,
      saveMembershipPlan,
      deleteMembershipPlan,
      updateWorkoutRecord,
      saveReminder,
      deleteReminder,
      saveNote,
      deleteNote,
      markMessagesAsSeen,
      master,
    }),
    [
      programs,
      members,
      attendance,
      streaks,
      payments,
      settings,
      notifications,
      dietPlans,
      reminders,
      progress,
      messages,
      announcements,
      chats,
      todaysWorkout,
      workoutPlans,
      activeWorkout,
      workoutRecords,
      trainers,
      membershipPlans,
      master,
      notes,
      refreshData,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
