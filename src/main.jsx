import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminLaunch from './AdminLaunch.jsx'
import LaunchPumpToken from './LaunchPumpToken.jsx'
import '@fontsource/orbitron/700.css';
import '@fontsource/rajdhani/500.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/adminlaunch" element={<AdminLaunch />} />
        <Route path="/launchtoken" element={<LaunchPumpToken />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
