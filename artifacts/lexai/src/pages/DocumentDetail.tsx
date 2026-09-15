import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getGetDocumentQueryOptions, 
  useUpdateDocument,
  downloadDocument
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Share2, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function DocumentDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: document, isLoading } = useQuery(getGetDocumentQueryOptions(id));
  const updateDocument = useUpdateDocument();

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  
  // Guard for initializing editor content
  const initializedRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (document && document.content && initializedRef.current !== document.id) {
      setContent(document.content);
      initializedRef.current = document.id;
    }
  }, [document]);

  const handleSave = async () => {
    try {
      await updateDocument.mutateAsync({
        id,
        data: { content, status: 'completed' }
      });
      
      // Update cache
      queryClient.setQueryData(getGetDocumentQueryOptions(id).queryKey, (old: any) => 
        old ? { ...old, content, status: 'completed' } : old
      );
      
      setIsEditing(false);
      toast({
        title: "Document saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save document.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async () => {
    try {
      toast({ title: "Preparing download...", description: "Your document is being prepared." });
      const result = await downloadDocument(id);
      const blob = new Blob([result.content], { type: "text/plain" });
      const blobUrl = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = `${result.title || document?.title || "document"}.txt`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      toast({ title: "Download ready", description: "Your document has been downloaded." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download document.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Document not found</h2>
        <Link to="/documents"><Button className="mt-4">Back to Documents</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link to="/documents">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-900 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </Button>
        </Link>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isEditing ? (
            <Button onClick={handleSave} className="gap-2 w-full sm:w-auto" disabled={updateDocument.isPending}>
              <Save className="w-4 h-4" />
              {updateDocument.isPending ? "Saving..." : "Save Changes"}
            </Button>
          ) : (
            <>
              <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={() => setIsEditing(true)}>
                <FileText className="w-4 h-4" />
                Edit
              </Button>
              <Button onClick={handleDownload} className="gap-2 flex-1 sm:flex-none">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Document Info Card */}
      <Card className="p-6 border-slate-200 shadow-sm bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{document.title}</h1>
              <div className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 ${
                document.status === 'completed' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {document.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                <span className="capitalize">{document.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="capitalize flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {document.type.replace(/_/g, ' ')}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Generated on {document.createdAt ? format(new Date(document.createdAt), 'MMMM d, yyyy') : 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500" title="Print">
              <Printer className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500" title="Share">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Document Viewer/Editor */}
      <Card className="border-slate-200 shadow-sm bg-white min-h-[600px] flex flex-col overflow-hidden">
        {isEditing ? (
          <div className="p-0 flex-1 flex flex-col h-[800px]">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              Edit Mode Active
            </div>
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none p-8 font-mono text-sm leading-relaxed"
              placeholder="Document content goes here..."
            />
          </div>
        ) : (
          <div className="p-8 md:p-12 prose max-w-none prose-slate prose-headings:font-bold prose-h1:text-center prose-h1:mb-12">
            {document.content ? (
              <div dangerouslySetInnerHTML={{ __html: document.content.replace(/\n/g, '<br/>') }} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-10 h-10 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Content pending</h3>
                <p className="text-slate-500 max-w-md">This document is still being generated or is empty. Click edit to manually add content.</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}