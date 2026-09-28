import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.tsx';
import { HomePage } from './pages/Home/HomePage.tsx';
import { DashboardPage } from './pages/Dashboard/DashboardPage.tsx';
import { CropDoctorPage } from './pages/CropDoctor/CropDoctorPage.tsx';
import { VoiceCopilotPage } from './pages/VoiceCopilot/VoiceCopilotPage.tsx';
import { WeatherPage } from './pages/Weather/WeatherPage.tsx';
import { SoilPage } from './pages/Soil/SoilPage.tsx';
import { BricsNetworkPage } from './pages/BRICS/BricsNetworkPage.tsx';
import { ArchitecturePage } from './pages/Architecture/ArchitecturePage.tsx';
import { ProfilePage } from './pages/Profile/ProfilePage.tsx';
import { NotFoundPage } from './pages/NotFound/NotFoundPage.tsx';

export default function App() {
  return (
    <Routes>
      {/* Standalone Flagship Cinematic Homepage */}
      <Route index element={<HomePage />} />

      {/* Internal Application Workspaces wrapped in AppShell */}
      <Route element={<AppShell />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="diagnose" element={<CropDoctorPage />} />
        <Route path="ask" element={<VoiceCopilotPage />} />
        <Route path="weather" element={<WeatherPage />} />
        <Route path="soil" element={<SoilPage />} />
        <Route path="network" element={<BricsNetworkPage />} />
        <Route path="architecture" element={<ArchitecturePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
