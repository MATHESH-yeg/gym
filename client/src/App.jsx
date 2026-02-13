import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Layout
import Shell from './components/layout/Shell';

// Pages
import Landing from './pages/Landing/Landing';
import RoleSelection from './pages/Landing/RoleSelection';
import RegisterMaster from './pages/Landing/RegisterMaster';
import LoginMaster from './pages/Landing/LoginMaster';
import LoginMember from './pages/Landing/LoginMember';
import LoginTrainer from './pages/Landing/LoginTrainer';

// Lazy load dashboards for performance
const MasterDashboard = lazy(() => import('./pages/Master/Dashboard/Dashboard'));

import Background3D from './components/three/Background3D';

const MasterSubscriptions = lazy(() => import('./pages/Master/Subscriptions/Subscriptions'));
const MasterMembers = lazy(() => import('./pages/Master/Members/Members'));
const ManageSubscription = lazy(() => import('./pages/Master/Members/ManageSubscription'));
const MasterMemberDetail = lazy(() => import('./pages/Master/Members/MemberDetail'));
const MasterPrograms = lazy(() => import('./pages/Master/Programs/Programs'));
const MasterPayments = lazy(() => import('./pages/Master/Payments/Payments'));
const MasterAttendance = lazy(() => import('./pages/Master/Attendance/Attendance'));
const MasterStreaks = lazy(() => import('./pages/Master/Streaks/Streaks'));
const MasterReports = lazy(() => import('./pages/Master/Reports/Reports'));
const MasterDiet = lazy(() => import('./pages/Master/Diet/MasterDiet'));
const MasterChats = lazy(() => import('./pages/Master/Chat/MasterChat'));
const MasterSettings = lazy(() => import('./pages/Master/Settings/Settings'));
const MasterSubscription = lazy(() => import('./pages/Master/Subscription/Subscription'));
const MasterTrainers = lazy(() => import('./pages/Master/Trainers/Trainers'));

const MemberDashboard = lazy(() => import('./pages/Member/Dashboard/Dashboard'));

const MemberTodayWorkout = lazy(() => import('./pages/Member/Workout/TodayWorkout'));
const MemberWorkoutPlans = lazy(() => import('./pages/Member/Workout/WorkoutPlans'));
const MemberCreatePlan = lazy(() => import('./pages/Member/Workout/CreatePlan'));
const MemberChat = lazy(() => import('./pages/Member/Chat/Chat'));
const MemberDietPlan = lazy(() => import('./pages/Member/Diet/DietPlan'));
const MemberAttendance = lazy(() => import('./pages/Member/Attendance/Attendance'));
const MemberStreaks = lazy(() => import('./pages/Member/Streaks/Streaks'));
const MemberRecords = lazy(() => import('./pages/Member/Progress/Progress')); // Renamed/Refactored
const MemberWorkoutRecords = lazy(() => import('./pages/Member/WorkoutRecords/WorkoutRecords'));
const AssignedWorkoutRunner = lazy(() => import('./pages/Member/Workout/AssignedWorkoutRunner'));
const PersonalWorkoutRunner = lazy(() => import('./pages/Member/Workout/PersonalWorkoutRunner'));
const MemberMembership = lazy(() => import('./pages/Member/Membership/Membership'));
const MemberSettings = lazy(() => import('./pages/Member/Settings/Settings'));

const TrainerDashboard = lazy(() => import('./pages/Trainer/Dashboard/Dashboard'));

const ProtectedRoute = ({ children, role, allowExpired = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Authenticating...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;

  // Check for expired trial for Master
  if (role === 'MASTER' && user.isTrialExpired && !allowExpired) {
    return <Navigate to="/master/subscription" />;
  }

  return <Shell>{children}</Shell>;
};

import NetflixIntro from './components/layout/NetflixIntro';

const App = () => {
  const [showIntro, setShowIntro] = React.useState(() => {
    return !sessionStorage.getItem('oliva_intro_seen');
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('oliva_intro_seen', 'true');
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <NetflixIntro onComplete={handleIntroComplete} />}
      <AuthProvider>
        <DataProvider>
          <Router>
            <Background3D />
            <Suspense fallback={<div className="loading-screen">Loading OLIVA...</div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/select-role" element={<RoleSelection />} />
                <Route path="/login" element={<Navigate to="/select-role" />} />
                <Route path="/register/master" element={<RegisterMaster />} />
                <Route path="/login/master" element={<LoginMaster />} />
                <Route path="/login/member" element={<LoginMember />} />
                <Route path="/login/trainer" element={<LoginTrainer />} />


                {/* Master Routes */}
                <Route path="/master" element={<ProtectedRoute role="MASTER"><MasterDashboard /></ProtectedRoute>} />
                <Route path="/master/subscription" element={<ProtectedRoute role="MASTER" allowExpired={true}><MasterSubscription /></ProtectedRoute>} />
                <Route path="/master/manage-subscriptions" element={<ProtectedRoute role="MASTER"><MasterSubscriptions /></ProtectedRoute>} />
                <Route path="/master/members" element={<ProtectedRoute role="MASTER"><MasterMembers /></ProtectedRoute>} />
                <Route path="/master/members/:id" element={<ProtectedRoute role="MASTER"><MasterMemberDetail /></ProtectedRoute>} />
                <Route path="/master/members/:id/subscription" element={<ProtectedRoute role="MASTER"><ManageSubscription /></ProtectedRoute>} />
                <Route path="/master/trainers" element={<ProtectedRoute role="MASTER"><MasterTrainers /></ProtectedRoute>} />
                <Route path="/master/programs" element={<ProtectedRoute role="MASTER"><MasterPrograms /></ProtectedRoute>} />
                <Route path="/master/attendance" element={<ProtectedRoute role="MASTER"><MasterAttendance /></ProtectedRoute>} />
                <Route path="/master/streaks" element={<ProtectedRoute role="MASTER"><MasterStreaks /></ProtectedRoute>} />
                <Route path="/master/payments" element={<ProtectedRoute role="MASTER"><MasterPayments /></ProtectedRoute>} />
                <Route path="/master/chats" element={<ProtectedRoute role="MASTER"><MasterChats /></ProtectedRoute>} />
                <Route path="/master/diet-plans" element={<ProtectedRoute role="MASTER"><MasterDiet /></ProtectedRoute>} />
                <Route path="/master/reports" element={<ProtectedRoute role="MASTER"><MasterReports /></ProtectedRoute>} />
                <Route path="/master/settings" element={<ProtectedRoute role="MASTER"><MasterSettings /></ProtectedRoute>} />

                {/* Member Routes */}
                <Route path="/member" element={<ProtectedRoute role="MEMBER"><MemberDashboard /></ProtectedRoute>} />

                <Route path="/member/workout" element={<ProtectedRoute role="MEMBER"><MemberTodayWorkout /></ProtectedRoute>} />
                <Route path="/today/start" element={<ProtectedRoute role="MEMBER"><AssignedWorkoutRunner /></ProtectedRoute>} />
                <Route path="/member/workout-plans" element={<ProtectedRoute role="MEMBER"><MemberWorkoutPlans /></ProtectedRoute>} />
                <Route path="/plans/:planId/start" element={<ProtectedRoute role="MEMBER"><PersonalWorkoutRunner /></ProtectedRoute>} />
                <Route path="/member/workout-plans/create" element={<ProtectedRoute role="MEMBER"><MemberCreatePlan /></ProtectedRoute>} />
                <Route path="/member/chat" element={<ProtectedRoute role="MEMBER"><MemberChat /></ProtectedRoute>} />
                <Route path="/member/diet-plan" element={<ProtectedRoute role="MEMBER"><MemberDietPlan /></ProtectedRoute>} />
                <Route path="/member/attendance" element={<ProtectedRoute role="MEMBER"><MemberAttendance /></ProtectedRoute>} />
                <Route path="/member/streaks" element={<ProtectedRoute role="MEMBER"><MemberStreaks /></ProtectedRoute>} />
                <Route path="/member/records" element={<ProtectedRoute role="MEMBER"><MemberRecords /></ProtectedRoute>} />
                <Route path="/member/workout-records" element={<ProtectedRoute role="MEMBER"><MemberWorkoutRecords /></ProtectedRoute>} />
                <Route path="/member/membership" element={<ProtectedRoute role="MEMBER"><MemberMembership /></ProtectedRoute>} />
                <Route path="/member/settings" element={<ProtectedRoute role="MEMBER"><MemberSettings /></ProtectedRoute>} />

                {/* Trainer Routes */}
                <Route path="/trainer" element={<ProtectedRoute role="TRAINER"><TrainerDashboard /></ProtectedRoute>} />

                {/* Shortcuts with granular Suspense */}
                <Route
                  path="/today"
                  element={
                    <ProtectedRoute role="MEMBER">
                      <Suspense fallback={<div>Loading...</div>}>
                        <MemberTodayWorkout />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute role="MASTER">
                      <Suspense fallback={<div>Loading...</div>}>
                        <MasterPayments />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Suspense>
          </Router>
        </DataProvider>
      </AuthProvider>
    </>
  );
};

export default App;
