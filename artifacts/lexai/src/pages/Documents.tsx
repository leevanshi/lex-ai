import { useState } from "react";
import { Link } from "wouter";
import { useListDocuments } from "@workspace/api-client-react";
import { format } from "date-fns";
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Fetch documents using the generated hook
  const { data: documents, isLoading } = useListDocuments({
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  const filteredDocs = documents?.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Documents</h1>
          <p className="text-slate-500 mt-1">Manage and view your generated legal agreements.</p>
        </div>
        <Link to="/documents/new">
          <Button className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            New Document
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search documents..." 
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 sm:w-auto w-full">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-slate-50">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] bg-slate-50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="nda">NDA</SelectItem>
              <SelectItem value="service_agreement">Service Agreement</SelectItem>
              <SelectItem value="employment_contract">Employment Contract</SelectItem>
              <SelectItem value="ip_assignment">IP Assignment</SelectItem>
              <SelectItem value="privacy_policy">Privacy Policy</SelectItem>
              <SelectItem value="terms_of_service">Terms of Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : filteredDocs?.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No documents found</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? "We couldn't find any documents matching your current filters. Try adjusting them."
                : "You haven't generated any documents yet. Create your first legal agreement now."}
            </p>
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link to="/documents/new">
                <Button>Create Document</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDocs?.map(doc => (
              <Link key={doc.id} to={`/documents/${doc.id}`}>
                <div className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                        {doc.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-sm text-slate-500 capitalize flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          {doc.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {doc.createdAt ? format(new Date(doc.createdAt), 'MMM d, yyyy') : 'Unknown date'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:ml-auto ml-14">
                    <div className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 ${
                      doc.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {doc.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span className="capitalize">{doc.status}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}