import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getGetMySubscriptionQueryOptions,
  getGetSubscriptionPlansQueryOptions,
  useUpgradeSubscription,
  useCancelSubscription,
  useGetDashboardStats
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Subscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: subscription, isLoading: isSubLoading } = useQuery(getGetMySubscriptionQueryOptions());
  const { data: plans, isLoading: isPlansLoading } = useQuery(getGetSubscriptionPlansQueryOptions());
  const { data: stats, isLoading: isStatsLoading } = useGetDashboardStats();
  
  const upgradeMutation = useUpgradeSubscription();
  const cancelMutation = useCancelSubscription();

  const handleUpgrade = async (planId: any) => {
    try {
      await upgradeMutation.mutateAsync({
        data: { plan: planId }
      });
      
      queryClient.invalidateQueries({ queryKey: getGetMySubscriptionQueryOptions().queryKey });
      
      toast({
        title: "Subscription Updated",
        description: `You have successfully changed to the ${planId} plan.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: getGetMySubscriptionQueryOptions().queryKey });
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will end at the current billing period.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription.",
        variant: "destructive"
      });
    }
  };

  const currentPlanId = subscription?.plan || 'free';
  const usagePercentage = stats?.planLimits?.limit 
    ? Math.min(100, ((stats.planLimits.used || 0) / stats.planLimits.limit) * 100) 
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Subscription</h1>
        <p className="text-slate-500 mt-1">Manage your billing plan and document limits.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Current Plan Overview */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle>Current Plan Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isSubLoading || isStatsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-bold text-slate-900 capitalize">{currentPlanId} Plan</h2>
                      <div className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 ${
                        subscription?.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {subscription?.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span className="capitalize">{subscription?.status || 'Active'}</span>
                      </div>
                    </div>
                    {subscription?.currentPeriodEnd && (
                      <p className="text-sm text-slate-500">
                        {subscription?.cancelAtPeriodEnd 
                          ? `Cancels on ${format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}`
                          : `Renews on ${format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}`
                        }
                      </p>
                    )}
                  </div>
                  
                  {currentPlanId !== 'free' && (
                    <Button 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200"
                      onClick={handleCancel}
                      disabled={subscription?.cancelAtPeriodEnd || cancelMutation.isPending}
                    >
                      {subscription?.cancelAtPeriodEnd ? "Cancellation Pending" : "Cancel Plan"}
                    </Button>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">Monthly Usage</h3>
                    <span className="text-sm font-medium text-slate-700">
                      {stats?.planLimits?.used || 0} / {stats?.planLimits?.limit ? stats.planLimits.limit : 'Unlimited'} documents
                    </span>
                  </div>
                  <Progress 
                    value={usagePercentage} 
                    className={`h-2.5 ${usagePercentage > 90 ? 'bg-red-100 [&>div]:bg-red-500' : ''}`}
                  />
                  {usagePercentage > 90 && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      You are approaching your monthly document limit. Upgrade to generate more.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method - Mock */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {currentPlanId === 'free' ? (
              <div className="flex flex-col items-center justify-center text-center py-6 h-full">
                <CreditCard className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No payment method on file. Add one when you upgrade to a paid plan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-white">
                  <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                    VISA
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">•••• •••• •••• 4242</p>
                    <p className="text-xs text-slate-500">Expires 12/2025</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-sm">Update Payment Method</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Available Plans</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {isPlansLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)
          ) : plans?.map((plan) => {
            const isCurrentPlan = currentPlanId === plan.id;
            // Assuming free -> pro -> enterprise hierarchy
            const isDowngrade = (currentPlanId === 'enterprise' && plan.id !== 'enterprise') || (currentPlanId === 'pro' && plan.id === 'free');
            
            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col border ${
                  isCurrentPlan ? 'border-slate-400 shadow-md ring-1 ring-slate-400/20' : 'border-slate-200 shadow-sm'
                } ${plan.id === 'pro' && !isCurrentPlan ? 'border-blue-200' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase">
                    Current Plan
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl capitalize">{plan.name}</CardTitle>
                  <CardDescription>{plan.documentsPerMonth ? `${plan.documentsPerMonth} docs/month` : 'Unlimited documents'}</CardDescription>
                  <div className="mt-4 flex items-baseline text-4xl font-bold text-slate-900">
                    ${plan.price}
                    <span className="ml-1 text-sm font-medium text-slate-500">/{plan.interval}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    {plan.features?.map((feature: string, i: number) => (
                      <li key={i} className="flex gap-2 text-slate-600">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.id === 'pro' ? 'text-blue-500' : 'text-slate-900'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full gap-2" 
                    variant={isCurrentPlan ? "outline" : plan.id === 'pro' ? "default" : "secondary"}
                    disabled={isCurrentPlan || upgradeMutation.isPending}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isCurrentPlan ? "Current Plan" : 
                     isDowngrade ? "Downgrade" : 
                     <>Upgrade to {plan.name} <Zap className="w-4 h-4" /></>}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}