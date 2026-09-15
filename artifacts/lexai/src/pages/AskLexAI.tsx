import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldAlert, BookOpenText, ExternalLink } from "lucide-react";

const formatModeLabel = (mode: string) => (mode === "lawyer" ? "Lawyer mode" : "Citizen mode");

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
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question, mode }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to answer your question right now.");
      }

      const payload = await res.json();
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ask LexAI</h1>
        <p className="text-slate-500">Get plain-language legal guidance with source-backed context and a clear legal information disclaimer.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Legal question
          </CardTitle>
          <CardDescription>Describe the issue and choose the level of analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-2 flex-wrap">
              {(["citizen", "lawyer"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={mode === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode(option)}
                >
                  {formatModeLabel(option)}
                </Button>
              ))}
            </div>

            <Textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: My landlord has refused to return my security deposit."
              className="min-h-[128px] border-slate-200"
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !question.trim()} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {loading ? "Analyzing..." : "Ask LexAI"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-700">{error}</CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenText className="w-5 h-5" />
                {formatModeLabel(result.mode)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">What this means</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{result.answer}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">Relevant law</h3>
                <div className="space-y-2">
                  {result.relevantLaw?.map((source: any) => (
                    <div key={`${source.title}-${source.section}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{source.documentType}</Badge>
                        <span className="font-medium text-slate-900">{source.title}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{source.section}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">What you can consider doing</h3>
                <ul className="list-disc pl-5 text-slate-700 space-y-2">
                  {(result.clarifyingQuestions || []).map((item: string, index: number) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">Sources</h3>
                <div className="space-y-2">
                  {result.sources?.map((source: any) => (
                    <a
                      key={`${source.documentId}-${source.section}`}
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>{source.title}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex gap-3">
                <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
                <p>{result.disclaimer}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
