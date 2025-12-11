import React from 'react';
import { AgentDef, AgentType } from './types';
import { 
  Activity, 
  CalendarCheck, 
  FileBarChart, 
  Users, 
  Network 
} from 'lucide-react';

export const AGENTS: Record<AgentType, AgentDef> = {
  [AgentType.COORDINATOR]: {
    id: AgentType.COORDINATOR,
    name: "System Coordinator",
    description: "Central Routing Intelligence",
    icon: "Network",
    color: "bg-emerald-800"
  },
  [AgentType.PATIENT_MGMT]: {
    id: AgentType.PATIENT_MGMT,
    name: "Patient Mgmt Agent",
    description: "Registration, transfers, and patient status tracking.",
    icon: "Users",
    color: "bg-blue-600"
  },
  [AgentType.APPOINTMENT]: {
    id: AgentType.APPOINTMENT,
    name: "Appointment Scheduler",
    description: "Doctor schedules, surgery bookings, and clinic hours.",
    icon: "CalendarCheck",
    color: "bg-purple-600"
  },
  [AgentType.MEDICAL_INFO]: {
    id: AgentType.MEDICAL_INFO,
    name: "Medical Info Agent",
    description: "Validated medical information and condition explanations.",
    icon: "Activity",
    color: "bg-rose-600"
  },
  [AgentType.REPORTING]: {
    id: AgentType.REPORTING,
    name: "Report Generator",
    description: "Financial, operational, and SIMRS data reporting.",
    icon: "FileBarChart",
    color: "bg-amber-600"
  },
  [AgentType.UNKNOWN]: {
    id: AgentType.UNKNOWN,
    name: "Unknown",
    description: "Unclassified Request",
    icon: "HelpCircle",
    color: "bg-gray-500"
  }
};

export const getIcon = (iconName: string, size = 20) => {
  switch (iconName) {
    case 'Network': return <Network size={size} />;
    case 'Users': return <Users size={size} />;
    case 'CalendarCheck': return <CalendarCheck size={size} />;
    case 'Activity': return <Activity size={size} />;
    case 'FileBarChart': return <FileBarChart size={size} />;
    default: return <Network size={size} />;
  }
};