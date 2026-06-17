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
  AlertCircle 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetDashboardStats();
  const { data: subscription, isLoading: isSubLoading } = useGetMySubscription();
  const { data: recentDocs, isLoading: isDocsLoading } = useListDocuments(); 

  const docsToDisplay = recentDocs?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your document generation activity.</p>
        </div>
        <Link to="/documents/new">
          <Button className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Generate Document
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <div className="text-4xl font-bold text-slate-900">{stats?.totalDocuments || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Plan Usage (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats?.planLimits?.used || 0}
                    <span className="text-sm font-normal text-slate-500 ml-1">
                      / {stats?.planLimits?.limit ? stats.planLimits.limit : '∞'} docs
                    </span>
                  </div>
                </div>
                {stats?.planLimits?.limit && (
                  <Progress 
                    value={Math.min(100, ((stats?.planLimits?.used || 0) / stats.planLimits.limit) * 100)} 
                    className="h-2"
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {isSubLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold text-slate-900 capitalize">
                  {subscription?.plan || 'Free'}
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-1">
                  {subscription?.status === 'active' ? (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Active</>
                  ) : (
                    <><AlertCircle className="w-4 h-4 text-amber-500" /> {subscription?.status || 'Unknown'}</>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>Your latest generated legal documents.</CardDescription>
              </div>
              <Link to="/documents">
                <Button variant="ghost" size="sm" className="gap-1 text-slate-600">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {isDocsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : docsToDisplay.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No documents yet</h3>
                <p className="text-slate-500 mb-4 max-w-sm">Generate your first legal agreement to get started.</p>
                <Link to="/documents/new">
                  <Button variant="outline">Create Document</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {docsToDisplay.map((doc: any) => (
                  <Link key={doc.id} to={`/documents/${doc.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{doc.title}</div>
                          <div className="text-xs text-slate-500 capitalize">{doc.type.replace(/_/g, ' ')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                          doc.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {doc.status}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 hidden sm:flex">
                          <Clock className="w-3 h-3" />
                          {doc.createdAt ? format(new Date(doc.createdAt), 'MMM d, yyyy') : ''}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">Generate commonly used documents instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/documents/new?type=nda">
              <Button variant="secondary" className="w-full justify-start text-slate-900 bg-white hover:bg-slate-100">
                <FileText className="w-4 h-4 mr-2" /> Non-Disclosure Agreement
              </Button>
            </Link>
            <Link to="/documents/new?type=service_agreement">
              <Button variant="secondary" className="w-full justify-start text-slate-900 bg-white hover:bg-slate-100">
                <FileText className="w-4 h-4 mr-2" /> Service Agreement
              </Button>
            </Link>
            <Link to="/documents/new?type=employment_contract">
              <Button variant="secondary" className="w-full justify-start text-slate-900 bg-white hover:bg-slate-100">
                <FileText className="w-4 h-4 mr-2" /> Employment Contract
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-400">
              Need a custom agreement? Check your plan limits to access more document types.
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Chart Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Documents by Type</CardTitle>
          <CardDescription>Breakdown of documents generated this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {isStatsLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (stats?.documentsByType && stats.documentsByType.length > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.documentsByType}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => value.replace(/_/g, ' ')} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                No data to display.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
