import { Link } from "wouter";
import { 
  useGetDashboardStats, 
  useGetMySubscription, 
  useListDocuments 
} from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { 
  FileText, 
  ArrowRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquareText,
  Activity,
  Zap,
  TrendingUp,
  FileSignature,
  Search,
  ShieldAlert,
  BookOpen,
  Scale
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { user } = useUser();
  const { data: stats, isLoading: isStatsLoading } = useGetDashboardStats();
  const { data: recentDocs, isLoading: isDocsLoading } = useListDocuments(); 

  const docsToDisplay = recentDocs?.slice(0, 5) || [];
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const userName = user?.firstName || "there";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            {greeting}, {userName}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Here is an overview of your legal activity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/documents/new">
            <Button className="gap-2 shadow-sm hover:shadow-md transition-all bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> New Document
            </Button>
          </Link>
          <Link to="/contracts/review">
            <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <Search className="w-4 h-4" /> Review Contract
            </Button>
          </Link>
          <Link to="/ask">
            <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <MessageSquareText className="w-4 h-4" /> Ask Lex
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { title: "Documents Generated", value: stats?.totalDocuments || 0, icon: FileSignature, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Contracts Reviewed", value: "0", icon: Search, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Risky Clauses Found", value: "0", icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
          { title: "RAG Documents", value: "11", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
            <Card className="border-slate-200 shadow-sm overflow-hidden group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  {isStatsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Actions */}
      <div>
        <motion.h2 variants={itemVariants} className="text-2xl font-bold text-slate-900 mb-6">Explore Features</motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "AI Document Generator", desc: "Create legally structured documents in seconds.", link: "/documents/new", icon: FileText, color: "from-indigo-500 to-blue-500" },
            { title: "Contract Review", desc: "Upload a contract and identify risky clauses.", link: "/contracts/review", icon: ShieldAlert, color: "from-emerald-500 to-teal-500" },
            { title: "Legal Assistant", desc: "Ask questions about Indian law and your documents.", link: "/ask", icon: MessageSquareText, color: "from-purple-500 to-pink-500" },
            { title: "Clause Explainer", desc: "Turn complex legal language into simple language.", link: "/clause-explainer", icon: BookOpen, color: "from-amber-500 to-orange-500" },
            { title: "Negotiation Assistant", desc: "Get AI-powered suggestions for negotiating contract terms.", link: "/negotiate", icon: Scale, color: "from-blue-500 to-cyan-500" }
          ].map((action, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to={action.link}>
                <Card className="h-full border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden relative group">
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${action.color} transition-opacity duration-300`} />
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center mb-4 shadow-sm group-hover:shadow transition-all`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{action.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{action.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Recent Documents</h2>
          <Link to="/documents">
            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isDocsLoading ? (
              <div className="divide-y divide-slate-100">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : docsToDisplay.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50">
                <FileText className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No documents yet</h3>
                <p className="text-slate-500 mb-6">Generate your first legal agreement to get started.</p>
                <Link to="/documents/new">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">Create Document</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <AnimatePresence>
                  {docsToDisplay.map((doc: any, index: number) => (
                    <motion.div 
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link to={`/documents/${doc.id}`}>
                        <div className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{doc.title}</div>
                              <div className="text-sm text-slate-500 capitalize mt-0.5">{doc.type.replace(/_/g, ' ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-sm text-slate-400 flex items-center gap-1.5 hidden sm:flex">
                              <Clock className="w-4 h-4" />
                              {doc.createdAt ? format(new Date(doc.createdAt), 'MMM d, yyyy') : ''}
                            </div>
                            <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              doc.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {doc.status}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
