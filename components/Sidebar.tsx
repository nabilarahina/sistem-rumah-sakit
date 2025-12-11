import React from 'react';
import { AGENTS, getIcon } from '../constants';
import { AgentType } from '../types';

interface SidebarProps {
  activeAgent: AgentType | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeAgent }) => {
  // Filter out Coordinator and Unknown for the "Sub-Agents" list
  const subAgents = Object.values(AGENTS).filter(
    a => a.id !== AgentType.COORDINATOR && a.id !== AgentType.UNKNOWN
  );

  return (
    <div className="w-full md:w-80 bg-emerald-900 text-emerald-50 flex flex-col h-full border-r border-emerald-700 shadow-xl z-20">
      <div className="p-6 border-b border-emerald-800 bg-emerald-950">
        <h2 className="text-lg font-bold flex items-center gap-2">
          {getIcon('Network', 24)}
          <span>SAAPS Infrastructure</span>
        </h2>
        <p className="text-xs text-emerald-400 mt-1">Smart Agent Architecture</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-2">
          Active Sub-Agents
        </h3>
        <ul className="space-y-2">
          {subAgents.map((agent) => {
            const isActive = activeAgent === agent.id;
            return (
              <li 
                key={agent.id}
                className={`
                  p-3 rounded-lg border transition-all duration-300
                  ${isActive 
                    ? 'bg-emerald-800 border-emerald-400 shadow-lg scale-105' 
                    : 'bg-emerald-900/50 border-emerald-800 hover:bg-emerald-800 hover:border-emerald-600'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-md ${agent.color} text-white shrink-0`}>
                    {getIcon(agent.icon, 18)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{agent.name}</h4>
                    <p className="text-xs text-emerald-300 mt-1 leading-relaxed">
                      {agent.description}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-emerald-200 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Processing Request...
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 bg-emerald-950 text-xs text-center text-emerald-500 border-t border-emerald-800">
        Connected to Hospital Information System (HIS) v2.4
      </div>
    </div>
  );
};

export default Sidebar;