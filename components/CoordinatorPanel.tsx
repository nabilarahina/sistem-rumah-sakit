import React, { useState, useRef, useEffect } from 'react';
import { Network, ArrowRight, BrainCircuit, CheckCircle2, AlertCircle } from 'lucide-react';
import { AgentType, RouterResponse, AgentResponse } from '../types';
import { AGENTS, getIcon } from '../constants';
import { coordinateRequest, processAgentResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface CoordinatorPanelProps {
  onAgentActivate: (agentId: AgentType | null) => void;
}

const CoordinatorPanel: React.FC<CoordinatorPanelProps> = ({ onAgentActivate }) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<'IDLE' | 'ROUTING' | 'EXECUTING' | 'DONE'>('IDLE');
  
  const [routerResult, setRouterResult] = useState<RouterResponse | null>(null);
  const [agentResult, setAgentResult] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleProcess = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setStage('ROUTING');
    setError(null);
    setRouterResult(null);
    setAgentResult(null);
    onAgentActivate(AgentType.COORDINATOR);

    try {
      // 1. Coordinate (Routing)
      const route = await coordinateRequest(query);
      setRouterResult(route);
      
      if (route.targetAgent === AgentType.UNKNOWN) {
        setStage('DONE');
        setIsProcessing(false);
        onAgentActivate(null);
        return;
      }

      // 2. Execute (Agent Processing)
      setStage('EXECUTING');
      onAgentActivate(route.targetAgent);
      
      // Simulate a small network delay for UX visualization of the "handoff"
      await new Promise(resolve => setTimeout(resolve, 800));

      const response = await processAgentResponse(route.targetAgent, query, route.extractedContext);
      setAgentResult(response);
      setStage('DONE');

    } catch (err) {
      console.error(err);
      setError("An unexpected system error occurred.");
      setStage('DONE');
    } finally {
      setIsProcessing(false);
      // Keep agent active for a moment visually, then clear if needed or keep it
      // onAgentActivate(null); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleProcess();
    }
  };

  // Suggestion chips
  const suggestions = [
    "What is Deep Vein Thrombosis?",
    "Schedule a consultation with Dr. Strange for tomorrow.",
    "Check admission status for patient #8821.",
    "Generate monthly financial report for ICU."
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-white border-b px-8 py-6 shadow-sm z-10">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <BrainCircuit size={28} />
          </div>
          System Coordinator
        </h1>
        <p className="text-slate-500 mt-1 ml-14">
          Describe your request. The AI Coordinator will route it to the appropriate specialized agent.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-shadow focus-within:shadow-md focus-within:border-emerald-300">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Coordinator Command Input
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: 'I need information about diabetes symptoms' or 'Check doctor availability'"
                className="w-full h-32 p-4 text-lg bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none transition-all"
                disabled={isProcessing}
              />
              <button
                onClick={handleProcess}
                disabled={isProcessing || !query.trim()}
                className={`absolute bottom-4 right-4 px-6 py-2 rounded-md font-medium flex items-center gap-2 transition-all
                  ${isProcessing || !query.trim() 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-emerald-200'}
                `}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    Initialize Request <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
            
            {/* Suggestions */}
            {!isProcessing && !routerResult && (
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => setQuery(s)}
                    className="text-xs px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-full border border-slate-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Routing Visualization */}
          {routerResult && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-4">
                 <div className="h-px bg-slate-300 flex-1"></div>
                 <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Routing Decision</span>
                 <div className="h-px bg-slate-300 flex-1"></div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Network size={18} />
                    <span className="font-semibold text-sm">Coordinator Logic Log</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${routerResult.confidence > 0.8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    Confidence: {(routerResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Selected Agent</h4>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className={`p-2 rounded text-white ${AGENTS[routerResult.targetAgent]?.color || 'bg-gray-500'}`}>
                        {AGENTS[routerResult.targetAgent]?.icon && 
                           getIcon(AGENTS[routerResult.targetAgent].icon, 20)
                        }
                      </div>
                      <span className="font-bold text-emerald-900">
                        {AGENTS[routerResult.targetAgent]?.name || routerResult.targetAgent}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Reasoning</h4>
                    <p className="text-sm text-slate-700 italic">
                      "{routerResult.reasoning}"
                    </p>
                    <div className="mt-2 text-xs text-slate-500">
                      <strong>Context Extracted: </strong> {routerResult.extractedContext}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Agent Response */}
          {agentResult && routerResult?.targetAgent !== AgentType.UNKNOWN && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
               <div className="flex items-center gap-4 mb-4 mt-8">
                 <div className="h-px bg-emerald-200 flex-1"></div>
                 <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Agent Response</span>
                 <div className="h-px bg-emerald-200 flex-1"></div>
              </div>

              <div className={`rounded-xl border-l-4 overflow-hidden shadow-md bg-white
                ${routerResult.targetAgent === AgentType.MEDICAL_INFO ? 'border-l-rose-500' : 
                  routerResult.targetAgent === AgentType.REPORTING ? 'border-l-amber-500' : 'border-l-emerald-500'}
              `}>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        {routerResult.targetAgent === AgentType.MEDICAL_INFO && <CheckCircle2 className="text-rose-500" size={20} />}
                        Output from {AGENTS[routerResult.targetAgent]?.name}
                      </h3>
                      <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
                        <ReactMarkdown>{agentResult.text}</ReactMarkdown>
                      </div>
                      
                      {agentResult.sources && (
                         <div className="mt-6 pt-4 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase">Sources & Protocols</span>
                            <div className="flex gap-2 mt-2">
                              {agentResult.sources.map((src, idx) => (
                                <span key={idx} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
                                  {src}
                                </span>
                              ))}
                            </div>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
             <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle size={20} />
                <span>{error}</span>
             </div>
          )}

          {/* Unhandled State */}
          {routerResult?.targetAgent === AgentType.UNKNOWN && !isProcessing && (
             <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg flex flex-col items-center gap-2 text-gray-600 text-center">
                <AlertCircle size={24} />
                <span className="font-semibold">Intent Unclear</span>
                <p className="text-sm">The Coordinator could not match your request to a specific agent. Please try refining your query (e.g., add "schedule", "medical info", or "report").</p>
             </div>
          )}
          
          {/* Bottom spacer */}
          <div className="h-20"></div>

        </div>
      </div>
    </div>
  );
};

export default CoordinatorPanel;