import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CoordinatorPanel from './components/CoordinatorPanel';
import { AgentType } from './types';

const App: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);

  const handleAgentActivation = (agentId: AgentType | null) => {
    setActiveAgent(agentId);
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-900 font-sans">
      {/* Sidebar for Agents Status */}
      <Sidebar activeAgent={activeAgent} />
      
      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col relative">
        <CoordinatorPanel onAgentActivate={handleAgentActivation} />
        
        {/* Environment check warning (UI helper) */}
        {!process.env.API_KEY && (
           <div className="absolute top-0 right-0 m-4 p-2 bg-yellow-100 text-yellow-800 text-xs rounded border border-yellow-300 shadow-sm z-50 pointer-events-none opacity-70">
             Demo Mode (Simulated AI)
           </div>
        )}
      </main>
    </div>
  );
};

export default App;