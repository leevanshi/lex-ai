import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldAlert, BookOpenText, ExternalLink, Loader2, Info } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

const formatModeLabel = (mode: string) => (mode === "lawyer" ? "Lawyer mode" : "Citizen mode");

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function AskLexAI() {
  const [question, setQuestion] = useState("My landlord has refused to return my security deposit.");
  const [mode, setMode] = useState<"citizen" | "lawyer">("citizen");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = await customFetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode }),
      });
      setResult(payload);
    } catch (err: any) {
      if (err.data && err.data.error) {
        setError(err.data.error);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDemoResponse = result?.answer?.includes("simulated AI response");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium w-fit mb-2">
          <Sparkles className="w-4 h-4" />
          AI Legal Assistant
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Ask LexAI</h1>
        <p className="text-lg text-slate-500 max-w-2xl">Get plain-language legal guidance with source-backed context and a clear legal information disclaimer.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-slate-200 shadow-md overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="w-5 h-5 text-indigo-600" />
              Legal Question
            </CardTitle>
            <CardDescription>Describe your legal issue and choose the level of analysis required.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-3 flex-wrap">
                {(["citizen", "lawyer"] as const).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={mode === option ? "default" : "outline"}
                    className={mode === option ? "bg-indigo-600 hover:bg-indigo-700 shadow-md" : "hover:bg-slate-100"}
                    onClick={() => setMode(option)}
                  >
                    {formatModeLabel(option)}
                  </Button>
                ))}
              </div>

              <div className="relative group">
                <Textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Example: My landlord has refused to return my security deposit. What are my rights under Indian law?"
                  className="min-h-[140px] text-base resize-y border-slate-200 focus-visible:ring-indigo-500 transition-all shadow-sm group-hover:border-indigo-300"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading || !question.trim()} 
                  size="lg"
                  className="gap-2 bg-slate-900 hover:bg-slate-800 transition-all shadow-md relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500/0 via-white/20 to-indigo-500/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Ask LexAI</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-red-200 bg-red-50/80 shadow-sm overflow-hidden">
              <CardContent className="p-4 flex items-start gap-3 text-red-800">
                <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="font-medium">{error}</div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </motion.div>
        )}

        {result && !loading && (
          <motion.div
            key="result"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {isDemoResponse && (
              <motion.div variants={itemVariants}>
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex gap-3 text-indigo-900 shadow-sm">
                  <Info className="w-6 h-6 text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-indigo-800">Demo Mode Active</h4>
                    <p className="text-sm mt-1 opacity-90">OpenAI API quota has been exceeded. LexAI is displaying simulated UI data so you can continue testing the dashboard layout.</p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Card className="border-slate-200 shadow-lg overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      LexAI Analysis
                    </CardTitle>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 text-xs px-2 py-1">
                      {formatModeLabel(result.mode)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">
                  
                  <div className="prose prose-slate max-w-none prose-p:leading-relaxed">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" /> What this means
                    </h3>
                    <div className="text-slate-800 text-lg whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                      {result.answer}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Relevant Law
                      </h3>
                      <div className="space-y-3">
                        {result.relevantLaw?.length > 0 ? result.relevantLaw.map((source: any, i: number) => (
                          <motion.div 
                            key={`${source.title}-${source.section}-${i}`}
                            whileHover={{ scale: 1.02 }}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-default relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                                {source.documentType || "Source"}
                              </Badge>
                              <span className="font-semibold text-slate-900">{source.title}</span>
                            </div>
                            <p className="text-sm text-slate-600">{source.section}</p>
                          </motion.div>
                        )) : (
                          <p className="text-sm text-slate-500 italic">No specific legal sources retrieved.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" /> Considerations
                        </h3>
                        <ul className="space-y-3">
                          {(result.clarifyingQuestions || ["Consult a legal professional to verify the specifics of your situation."]).map((item: string, index: number) => (
                            <li key={index} className="flex gap-3 text-slate-700 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {result.sources?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-300" /> External Links
                          </h3>
                          <div className="space-y-2">
                            {result.sources.map((source: any, i: number) => (
                              <a
                                key={`link-${source.documentId}-${i}`}
                                href={source.sourceUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                              >
                                <span className="truncate">{source.title}</span>
                                <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 p-5 text-sm text-amber-900 flex gap-4 items-start shadow-sm mt-4">
                    <ShieldAlert className="w-6 h-6 mt-0.5 shrink-0 text-amber-600" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-950">Legal Disclaimer</p>
                      <p className="leading-relaxed opacity-90">{result.disclaimer}</p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
