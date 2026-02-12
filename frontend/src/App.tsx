
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AgentDevice from './pages/AgentDevice';
import { ShieldCheck } from 'lucide-react';

function Landing() {
  return (
    <div className="h-screen w-full bg-black flex items-center justify-center flex-col gap-8 text-white font-mono">
       <div className="text-center space-y-4">
         <ShieldCheck className="text-tactical-green w-24 h-24 mx-auto animate-pulse"/>
         <h1 className="text-4xl font-bold text-tactical-green">ARCHITECTUS AEGIS</h1>
         <p className="text-tactical-muted text-lg">SECURE SYSTEMS ACCESS POINT</p>
       </div>
       <div className="flex flex-col sm:flex-row gap-4">
         <Link to="/dashboard" className="px-6 py-3 border border-tactical-green text-tactical-green hover:bg-tactical-green hover:text-black transition-all text-center">
            MISSION CONTROL
         </Link>
         <Link to="/agent" className="px-6 py-3 border border-tactical-red text-tactical-red hover:bg-tactical-red hover:text-black transition-all text-center">
            FIELD AGENT (WEB SIMULATION)
         </Link>
       </div>
       <div className="mt-8 text-xs text-tactical-muted/70 text-center max-w-sm">
         Note: The "Field Agent" link provides a browser-based simulation. For a real native Android app, refer to the `android-agent/` directory for conceptual architecture and integration points.
       </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agent" element={<AgentDevice />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
