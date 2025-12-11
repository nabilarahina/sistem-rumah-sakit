export enum AgentType {
  COORDINATOR = 'COORDINATOR',
  PATIENT_MGMT = 'PATIENT_MGMT',
  APPOINTMENT = 'APPOINTMENT',
  MEDICAL_INFO = 'MEDICAL_INFO',
  REPORTING = 'REPORTING',
  UNKNOWN = 'UNKNOWN'
}

export interface AgentDef {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface RouterResponse {
  targetAgent: AgentType;
  reasoning: string;
  confidence: number;
  extractedContext: string;
}

export interface AgentResponse {
  text: string;
  sources?: string[];
  suggestedActions?: string[];
}

export interface ConversationStep {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId?: AgentType;
  timestamp: number;
  meta?: any;
}