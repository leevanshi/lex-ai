import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useUploadContract } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const PROCESSING_STEPS = [
  "Uploading document securely...",
  "Extracting text via AI pipeline...",
  "Chunking clauses for semantic search...",
  "Generating vector embeddings...",
  "Indexing into legal database...",
  "Finalizing analysis..."
];

export default function ContractUpload() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  
  const uploadContract = useUploadContract();
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const [uploadedId, setUploadedId] = useState<number | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    if (!f.type.includes('pdf') && !f.type.includes('word') && !f.type.includes('document')) {
      toast({ title: "Unsupported file", description: "Please upload a PDF or Word document.", variant: "destructive" });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !user?.id) return;
    
    setUploadState('processing');
    
    // Simulate processing steps visually
    const stepInterval = setInterval(() => {
      setStepIdx(prev => Math.min(prev + 1, PROCESSING_STEPS.length - 1));
    }, 1200);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      formData.append('title', file.name);

      const response = await fetch('/api/contracts/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      
      clearInterval(stepInterval);
      setStepIdx(PROCESSING_STEPS.length - 1);
      
      setTimeout(() => {
        setUploadState('done');
        setUploadedId(data.contractId);
      }, 1000);
      
    } catch (error) {
      clearInterval(stepInterval);
      setUploadState('idle');
      toast({ title: "Upload failed", description: "Could not process your contract.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Review Contract</h1>
        <p className="text-slate-500">Upload your legal agreement to automatically detect risks and analyze clauses.</p>
      </div>

      <Card className="border-slate-200 shadow-sm relative overflow-hidden">
        <AnimatePresence mode="wait">
          {uploadState === 'idle' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Supported formats: PDF, DOCX (Max 10MB)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-indigo-600" : "text-slate-400"}`} />
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Drag & drop your file here</h3>
                  <p className="text-sm text-slate-500 mb-6">or click to browse from your computer</p>
                  
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                    onChange={handleFileChange}
                  />
                  <Button asChild variant="outline" className="bg-white">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Browse Files
                    </label>
                  </Button>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded shadow-sm text-indigo-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button onClick={handleUpload} className="bg-indigo-600 hover:bg-indigo-700">
                      Analyze Document <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}

          {uploadState === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="p-16 flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8" />
              
              <div className="h-8 relative w-full overflow-hidden mb-6">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={stepIdx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="absolute inset-0 text-xl font-semibold text-slate-900"
                  >
                    {PROCESSING_STEPS[stepIdx]}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="w-full max-w-sm">
                <Progress value={((stepIdx + 1) / PROCESSING_STEPS.length) * 100} className="h-2 mb-2" />
                <p className="text-sm text-slate-500">Step {stepIdx + 1} of {PROCESSING_STEPS.length}</p>
              </div>
            </motion.div>
          )}

          {uploadState === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Complete</h2>
              <p className="text-slate-500 mb-8 max-w-sm">Your contract has been successfully processed, indexed, and analyzed for risks.</p>
              
              <Link to={`/contracts/${uploadedId}`}>
                <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 gap-2">
                  View Analysis Results <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
