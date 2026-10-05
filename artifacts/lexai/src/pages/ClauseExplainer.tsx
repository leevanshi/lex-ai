import { useState } from "react";
import { Link } from "wouter";
import { useExplainClause } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpenText,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function ClauseExplainer() {
  const explainClause = useExplainClause();
  const [clause, setClause] = useState("");
  const [explanation, setExplanation] = useState("");

  const handleExplain = async () => {
    if (!clause.trim()) return;
    setExplanation("");
    try {
      const res = await explainClause.mutateAsync({
        data: { clause }
      });
      setExplanation(res.explanation);
    } catch (err) {
      console.error(err);
      setExplanation("Failed to generate explanation. Please try again later.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Clause Explainer</h1>
          <p className="text-slate-500">Paste complex legal text and get simple, plain-English explanations.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="w-5 h-5 text-indigo-600" />
              Original Text
            </CardTitle>
            <CardDescription>Paste the legal clause you want to understand.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col">
            <Textarea
              value={clause}
              onChange={(e) => setClause(e.target.value)}
              placeholder="e.g., Party A shall indemnify and hold harmless Party B..."
              className="flex-1 min-h-[300px] resize-none text-base border-slate-200 focus-visible:ring-indigo-500"
            />
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleExplain} 
                disabled={!clause.trim() || explainClause.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
              >
                {explainClause.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Explain in Plain English</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Plain English Explanation
            </CardTitle>
            <CardDescription>AI-generated simplified summary.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1 bg-slate-50/30">
            <AnimatePresence mode="wait">
              {explainClause.isPending ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4"
                >
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                  <p>Translating legalese to human...</p>
                </motion.div>
              ) : explanation ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-slate max-w-none prose-p:leading-relaxed text-[15px]"
                >
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    {explanation.split("\n").map((para, i) => (
                      <p key={i} className="mb-4 last:mb-0 text-slate-800">{para}</p>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                    <p>This explanation is AI-generated for educational purposes and does not constitute legal advice. Always consult a lawyer for critical matters.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-6"
                >
                  <BookOpenText className="w-12 h-12 mb-4 opacity-20" />
                  <p>Your plain-English explanation will appear here.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
