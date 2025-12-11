import { GoogleGenAI, Type } from "@google/genai";
import { AgentType, RouterResponse, AgentResponse } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is assumed to be available as per instructions.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * 1. COORDINATOR AGENT
 * Analyzes the user input and routes it to the correct sub-agent.
 */
export const coordinateRequest = async (userQuery: string): Promise<RouterResponse> => {
  if (!apiKey) {
    // Fallback simulation if no key is present
    return simulateRouting(userQuery);
  }

  const modelId = "gemini-2.5-flash";
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      targetAgent: {
        type: Type.STRING,
        enum: [
          AgentType.PATIENT_MGMT,
          AgentType.APPOINTMENT,
          AgentType.MEDICAL_INFO,
          AgentType.REPORTING,
          AgentType.UNKNOWN
        ],
        description: "The ID of the agent best suited to handle the request."
      },
      reasoning: {
        type: Type.STRING,
        description: "A brief explanation of why this agent was chosen."
      },
      confidence: {
        type: Type.NUMBER,
        description: "Confidence score between 0 and 1."
      },
      extractedContext: {
        type: Type.STRING,
        description: "Key details extracted from the query to pass to the sub-agent."
      }
    },
    required: ["targetAgent", "reasoning", "confidence", "extractedContext"]
  };

  const systemInstruction = `
    You are the "Hospital System Coordinator". Your goal is to route user queries to the correct specialist agent.
    
    Agents available:
    1. PATIENT_MGMT: Registration, transfer, patient status, discharge, ward info.
    2. APPOINTMENT: Doctor schedules, booking surgeries, checking clinic hours.
    3. MEDICAL_INFO: Explaining diseases (like DVT), treatments, medications, medical terminology.
    4. REPORTING: Financial reports, operational metrics, bed occupancy rates, SIMRS data.
    
    If the query is unclear, select UNKNOWN.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userQuery,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1 // Low temperature for deterministic routing
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as RouterResponse;

  } catch (error) {
    console.error("Gemini Coordination Error:", error);
    return {
      targetAgent: AgentType.UNKNOWN,
      reasoning: "Error connecting to AI Coordinator. Fallback initiated.",
      confidence: 0,
      extractedContext: ""
    };
  }
};

/**
 * 2. SUB-AGENT PROCESSOR
 * Generates the actual response based on the selected agent persona.
 */
export const processAgentResponse = async (
  agentType: AgentType, 
  userQuery: string, 
  context: string
): Promise<AgentResponse> => {
  if (!apiKey) {
    return simulateAgentResponse(agentType);
  }

  const modelId = "gemini-2.5-flash";
  let systemInstruction = "";

  // Define personas
  switch (agentType) {
    case AgentType.MEDICAL_INFO:
      systemInstruction = `You are an expert Medical Information Agent. 
      Your goal: Provide accurate, easy-to-understand medical explanations. Avoid overly technical jargon unless defined.
      Tone: Professional, empathetic, and trustworthy.
      Structure: Use bullet points for clarity. 
      Disclaimer: Always end with a brief standard medical disclaimer.`;
      break;
    case AgentType.APPOINTMENT:
      systemInstruction = `You are the Appointment Scheduler Agent.
      Your goal: Assist with booking and checking doctor schedules.
      Tone: Efficient and polite.
      Context: Assume you have access to the hospital calendar (simulated). if a date isn't specified, ask for it.`;
      break;
    case AgentType.PATIENT_MGMT:
      systemInstruction = `You are the Patient Management Agent.
      Your goal: Handle admission, discharge, and transfer logic.
      Tone: Administrative and precise.`;
      break;
    case AgentType.REPORTING:
      systemInstruction = `You are the Hospital Report Generator Agent (SIMRS).
      Your goal: Summarize financial and operational data.
      Tone: Formal, analytical, data-driven.`;
      break;
    default:
      systemInstruction = "You are a helpful assistant.";
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `User Query: ${userQuery}\nContext provided by Coordinator: ${context}`,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    return {
      text: response.text || "No response generated.",
      sources: ["Internal Hospital Protocols", "Google Knowledge Graph (Simulated)"]
    };

  } catch (error) {
    console.error("Gemini Agent Error:", error);
    return { text: "Error processing request with the sub-agent." };
  }
};


// --- Fallback Simulation (If no API Key provided) ---

const simulateRouting = (query: string): RouterResponse => {
  const lower = query.toLowerCase();
  if (lower.includes('kondisi') || lower.includes('dvt') || lower.includes('sakit') || lower.includes('penyakit')) {
    return { targetAgent: AgentType.MEDICAL_INFO, reasoning: "Detected medical terms.", confidence: 0.9, extractedContext: "Medical Info Request" };
  } else if (lower.includes('jadwal') || lower.includes('janji') || lower.includes('dokter')) {
    return { targetAgent: AgentType.APPOINTMENT, reasoning: "Detected scheduling terms.", confidence: 0.9, extractedContext: "Schedule Request" };
  } else if (lower.includes('laporan') || lower.includes('keuangan')) {
    return { targetAgent: AgentType.REPORTING, reasoning: "Detected reporting terms.", confidence: 0.9, extractedContext: "Report Request" };
  } else if (lower.includes('daftar') || lower.includes('pasien')) {
    return { targetAgent: AgentType.PATIENT_MGMT, reasoning: "Detected patient mgmt terms.", confidence: 0.9, extractedContext: "Patient Request" };
  }
  return { targetAgent: AgentType.UNKNOWN, reasoning: "Unclear intent.", confidence: 0.5, extractedContext: "" };
};

const simulateAgentResponse = (agent: AgentType): AgentResponse => {
  const responses: Record<string, string> = {
    [AgentType.MEDICAL_INFO]: "Simulated Response: Based on your query, here is the medical information regarding DVT. It is a serious condition involving blood clots...",
    [AgentType.APPOINTMENT]: "Simulated Response: Checking schedules... Dr. Smith is available tomorrow at 10 AM.",
    [AgentType.PATIENT_MGMT]: "Simulated Response: Patient ID verified. Status: Stable in Ward 402.",
    [AgentType.REPORTING]: "Simulated Response: Generating Operational Report... Bed Occupancy Rate: 85%.",
    [AgentType.UNKNOWN]: "I could not determine the correct agent to handle your request."
  };
  return { text: responses[agent] || responses[AgentType.UNKNOWN] };
};