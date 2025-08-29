import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import SeatingPlanPage from './pages/SeatingPlanPage';
import WheelOfNamesPage from './pages/WheelOfNamesPage';
import LearningWheelPage from './pages/LearningWheelPage';
import WordSearchCreatorPage from './pages/WordSearchCreatorPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId/students"
            element={
              <PrivateRoute>
                <StudentsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId/seating"
            element={
              <PrivateRoute>
                <SeatingPlanPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/class/:classId/wheel"
            element={
              <PrivateRoute>
                <WheelOfNamesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/learning-wheel/:wheelId"
            element={
              <PrivateRoute>
                <LearningWheelPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/word-search"
            element={
              <PrivateRoute>
                <WordSearchCreatorPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;