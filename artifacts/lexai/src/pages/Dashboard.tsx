import { Link } from "wouter";
import { 
  useGetDashboardStats, 
  useGetMySubscription, 
  useListDocuments 
} from "@workspace/api-client-react";
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
  FileSignature
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetDashboardStats();
  const { data: subscription, isLoading: isSubLoading } = useGetMySubscription();
  const { data: recentDocs, isLoading: isDocsLoading } = useListDocuments(); 

  const docsToDisplay = recentDocs?.slice(0, 5) || [];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            Dashboard
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Live</Badge>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Welcome back! Here is an overview of your legal activity.</p>
        </div>
        <Link to="/documents/new">
          <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all bg-indigo-600 hover:bg-indigo-700 relative overflow-hidden group">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400/0 via-white/20 to-indigo-400/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Plus className="w-5 h-5" />
            Generate Document
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400 }}>
          <Card className="border-slate-200 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileSignature className="w-16 h-16 text-indigo-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" /> Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  {stats?.totalDocuments || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400 }}>
          <Card className="border-slate-200 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16 text-emerald-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" /> Plan Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className="text-4xl font-black text-slate-900 tracking-tighter">
                      {stats?.planLimits?.used || 0}
                      <span className="text-lg font-medium text-slate-400 ml-1">
                        / {stats?.planLimits?.limit ? stats.planLimits.limit : '∞'}
                      </span>
                    </div>
                  </div>
                  {stats?.planLimits?.limit && (
                    <Progress 
                      value={Math.min(100, ((stats?.planLimits?.used || 0) / stats.planLimits.limit) * 100)} 
                      className="h-2 bg-slate-100"
                      indicatorClassName="bg-emerald-500"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400 }}>
          <Card className="border-slate-200 shadow-sm overflow-hidden relative bg-gradient-to-br from-slate-900 to-slate-800 text-white group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-white">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSubLoading ? (
                <Skeleton className="h-10 w-32 bg-slate-700" />
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-4xl font-black tracking-tighter capitalize bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                    {subscription?.plan || 'Free'}
                  </div>
                  <div className="text-sm text-slate-300 flex items-center gap-1.5 font-medium">
                    {subscription?.status === 'active' ? (
                      <><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active</>
                    ) : (
                      <><AlertCircle className="w-4 h-4 text-amber-400" /> {subscription?.status || 'Unknown'}</>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm flex flex-col h-full">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Documents</CardTitle>
                  <CardDescription>Your latest generated legal documents.</CardDescription>
                </div>
                <Link to="/documents">
                  <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {isDocsLoading ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : docsToDisplay.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No documents yet</h3>
                  <p className="text-slate-500 mb-6 max-w-sm">Generate your first legal agreement to get started with LexAI.</p>
                  <Link to="/documents/new">
                    <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50 text-indigo-700">Create Document</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {docsToDisplay.map((doc: any, index: number) => (
                    <motion.div 
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={`/documents/${doc.id}`}>
                        <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 transition-all shadow-sm">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-base">{doc.title}</div>
                              <div className="text-sm text-slate-500 capitalize">{doc.type.replace(/_/g, ' ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-sm text-slate-400 flex items-center gap-1.5 hidden sm:flex">
                              <Clock className="w-4 h-4" />
                              {doc.createdAt ? format(new Date(doc.createdAt), 'MMM d, yyyy') : ''}
                            </div>
                            <div className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm ${
                              doc.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                              {doc.status}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <CardHeader>
              <CardTitle className="text-indigo-950">Quick Actions</CardTitle>
              <CardDescription className="text-indigo-900/60">Generate commonly used documents instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <Link to="/ask">
                <Button className="w-full justify-start text-indigo-900 bg-white hover:bg-indigo-100 border border-indigo-200 shadow-sm hover:shadow transition-all group">
                  <MessageSquareText className="w-4 h-4 mr-3 text-indigo-500 group-hover:scale-110 transition-transform" /> Ask LexAI
                </Button>
              </Link>
              <Link to="/documents/new?type=nda">
                <Button className="w-full justify-start text-indigo-900 bg-white hover:bg-indigo-100 border border-indigo-200 shadow-sm hover:shadow transition-all group">
                  <FileText className="w-4 h-4 mr-3 text-indigo-500 group-hover:scale-110 transition-transform" /> Non-Disclosure Agreement
                </Button>
              </Link>
              <Link to="/documents/new?type=service_agreement">
                <Button className="w-full justify-start text-indigo-900 bg-white hover:bg-indigo-100 border border-indigo-200 shadow-sm hover:shadow transition-all group">
                  <FileText className="w-4 h-4 mr-3 text-indigo-500 group-hover:scale-110 transition-transform" /> Service Agreement
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Chart Section */}
          <Card className="border-slate-200 shadow-sm flex-1">
            <CardHeader>
              <CardTitle>Documents by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                {isStatsLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (stats?.documentsByType && stats.documentsByType.length > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.documentsByType}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(value) => value.replace(/_/g, ' ')} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} allowDecimals={false} width={30} />
                      <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">
                    No data to display.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
    </motion.div>
  );
}
