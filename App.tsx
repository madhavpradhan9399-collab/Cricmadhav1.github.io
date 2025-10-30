import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import TournamentDashboard from './pages/TournamentDashboard';
import TeamPanel from './pages/TeamPanel';
import ScoreboardOverlay from './pages/ScoreboardOverlay';
import FixturePanel from './pages/FixturePanel';
import OverlayControlPanel from './pages/OverlayControlPanel';
import { useAppContext } from './contexts/AppContext';
import LoginPage from './pages/LoginPage';

const ProtectedRoutes = () => (
  <Routes>
    <Route path="/" element={<TournamentDashboard />} />
    <Route path="/tournament/:tournamentId/teams" element={<TeamPanel />} />
    <Route path="/tournament/:tournamentId/fixtures" element={<FixturePanel />} />
    <Route path="/match/:matchId/admin" element={<OverlayControlPanel />} />
    {/* Fallback to dashboard for any other authenticated route */}
    <Route path="*" element={<TournamentDashboard />} /> 
  </Routes>
);


function App() {
  const { loginId, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-primary">
        <div className="text-2xl text-white font-bold animate-pulse">Initializing Scorebook...</div>
      </div>
    );
  }
  
  return (
    <HashRouter>
      <Routes>
        {/* Public overlay route, does not require login */}
        <Route path="/public/:scorebookId/match/:matchId/overlay" element={<ScoreboardOverlay />} />
        
        {/* All other routes are handled here, checking for a valid loginId */}
        <Route path="/*" element={loginId ? <ProtectedRoutes /> : <LoginPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;