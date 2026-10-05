import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  getGetContractQueryOptions,
  useQueryContract,
  useAnalyzeContract,
  useNegotiateClause
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  MessageSquareText, 
  Scale, 
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Lightbulb,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ContractDetail() {
  const params = useParams();
  const id = Number(params.id);
  
  const { data: contract, isLoading } = useQuery(getGetContractQueryOptions(id));
  const queryContract = useQueryContract();
  const analyzeContract = useAnalyzeContract();
  const negotiateClause = useNegotiateClause();
  
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Hello! I have analyzed this contract. You can ask me any questions about its clauses, obligations, or risks." }
  ]);
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [negotiatingClauseIdx, setNegotiatingClauseIdx] = useState<number | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<any>(null);
  const [negotiationPosition, setNegotiationPosition] = useState<'favorable' | 'unfavorable'>('unfavorable');

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    const userQ = question;
    setMessages(prev => [...prev, { role: 'user', content: userQ }]);
    setQuestion("");
    
    try {
      const res = await queryContract.mutateAsync({
        id,
        data: { question: userQ }
      });
      setMessages(prev => [...prev, { role: 'ai', content: res.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error analyzing the contract for that question." }]);
    }
  };

  const handleRunAnalysis = async () => {
    if (!id || isAnalyzing || analysis) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeContract.mutateAsync({ id });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNegotiate = async (clauseText: string, idx: number, position: 'favorable' | 'unfavorable') => {
    setNegotiatingClauseIdx(idx);
    setNegotiationPosition(position);
    setNegotiationResult(null);
    try {
      const result = await negotiateClause.mutateAsync({
        data: { clause: clauseText, position }
      });
      setNegotiationResult(result);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-6 h-[700px]">
          <Skeleton className="flex-1 rounded-xl" />
          <Skeleton className="w-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Contract not found</h2>
        <Link to="/dashboard"><Button className="mt-4">Back to Dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] max-w-[1600px] mx-auto flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
              {contract.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {contract.fileName}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Uploaded {format(new Date(contract.uploadedAt), 'MMM d, yyyy')}</span>
              <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                contract.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {contract.status === 'ready' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {contract.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <Card className="flex-1 border-slate-200 shadow-sm overflow-hidden bg-white flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Document Viewer Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="h-12 border-b border-slate-100 bg-slate-50/50 flex items-center px-4 font-semibold text-slate-700 text-sm gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Original Text
              </div>
              <ScrollArea className="flex-1 bg-white">
                <div className="p-8 md:p-12 text-slate-800 font-serif leading-relaxed whitespace-pre-wrap text-[15px]">
                  {contract.content || "No content extracted."}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Assistant & Risks Panel */}
          <ResizablePanel defaultSize={50} minSize={25}>
            <Tabs defaultValue="chat" className="h-full flex flex-col bg-slate-50">
              <div className="h-12 border-b border-slate-200 bg-white flex items-center px-2">
                <TabsList className="w-full justify-start bg-transparent">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700 gap-2">
                    <MessageSquareText className="w-4 h-4" /> Contract Assistant
                  </TabsTrigger>
                  <TabsTrigger value="risks" className="data-[state=active]:bg-slate-100 data-[state=active]:text-amber-700 gap-2" onClick={handleRunAnalysis}>
                    <ShieldAlert className="w-4 h-4" /> Risk Analysis & Negotiation
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="chat" className="flex-1 flex flex-col m-0 h-full overflow-hidden border-none outline-none">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 pb-4">
                    <AnimatePresence>
                      {messages.map((msg, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                            msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'
                          }`}>
                            {msg.role === 'user' ? <span className="font-medium text-xs">U</span> : <Scale className="w-4 h-4" />}
                          </div>
                          <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                              ? 'bg-slate-900 text-white rounded-tr-sm' 
                              : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                          }`}>
                            {msg.content}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {queryContract.isPending && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1 w-16 shadow-sm">
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 bg-white border-t border-slate-200">
                  <form onSubmit={handleAsk} className="flex gap-2">
                    <Input 
                      placeholder="Ask about this contract..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-indigo-600"
                      disabled={queryContract.isPending || contract.status !== 'ready'}
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-sm"
                      disabled={!question.trim() || queryContract.isPending || contract.status !== 'ready'}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                  {contract.status !== 'ready' && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Contract is still processing. Search is disabled.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="risks" className="flex-1 m-0 h-full overflow-hidden flex flex-col border-none outline-none">
                <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                  {!analysis && isAnalyzing && (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4 opacity-50">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
                      <p className="text-sm font-medium text-slate-500">Analyzing clauses for risks...</p>
                    </div>
                  )}

                  {analysis && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <Card className="p-4 border-slate-200 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            {analysis.riskLevel === 'high' ? <ShieldAlert className="text-red-500 w-5 h-5" /> : 
                             analysis.riskLevel === 'medium' ? <Shield className="text-amber-500 w-5 h-5" /> :
                             <ShieldCheck className="text-emerald-500 w-5 h-5" />
                            }
                            Overall Risk: <span className="capitalize">{analysis.riskLevel}</span>
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{analysis.summary}</p>
                      </Card>

                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Flagged Clauses</h4>
                        {analysis.riskyClauses?.map((clause: any, i: number) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                          >
                            <div className="border-b border-slate-100 p-3 bg-amber-50/30 flex items-center justify-between gap-2">
                              <Badge variant="outline" className={`
                                ${clause.risk === 'high' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}
                              `}>
                                {clause.risk?.toUpperCase() || 'MEDIUM'} RISK
                              </Badge>
                              
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs bg-white text-slate-600 hover:text-indigo-600"
                                  onClick={() => handleNegotiate(clause.text, i, 'favorable')}
                                  disabled={negotiateClause.isPending && negotiatingClauseIdx === i}
                                >
                                  <ThumbsUp className="w-3 h-3 mr-1" /> Make Favorable
                                </Button>
                              </div>
                            </div>
                            
                            <div className="p-4 space-y-4">
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clause Text</p>
                                <p className="text-sm text-slate-700 italic border-l-2 border-slate-200 pl-3 py-1">
                                  "{clause.text}"
                                </p>
                              </div>
                              <div className="flex gap-2 items-start bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                                <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-indigo-900/60 uppercase tracking-wider">Issue</p>
                                  <p className="text-sm text-indigo-900">{clause.suggestion}</p>
                                </div>
                              </div>
                              
                              {/* Negotiation Result */}
                              <AnimatePresence>
                                {negotiatingClauseIdx === i && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="pt-4 border-t border-slate-100"
                                  >
                                    <h5 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <MessageCircle className="w-4 h-4 text-indigo-500" />
                                      AI Negotiation Assistant
                                    </h5>
                                    
                                    {negotiateClause.isPending ? (
                                      <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Generating counter-proposals...
                                      </div>
                                    ) : negotiationResult?.suggestions?.map((sug: any, j: number) => (
                                      <div key={j} className="mb-4 last:mb-0 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                        <p className="text-sm text-slate-800 font-medium mb-1">Proposed Revision:</p>
                                        <p className="text-sm text-slate-600 bg-white p-2 border border-slate-100 rounded mb-2">"{sug.suggestedText}"</p>
                                        <p className="text-xs text-slate-500"><span className="font-semibold">Reasoning:</span> {sug.reasoning}</p>
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </div>
  );
}
