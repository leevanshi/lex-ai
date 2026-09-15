import { useUser } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { getGetMeQueryOptions } from "@workspace/api-client-react";
import { format } from "date-fns";
import { 
  User, 
  Mail, 
  Calendar as CalendarIcon, 
  ShieldCheck,
  Building,
  Key
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { user: clerkUser } = useUser();
  const { data: dbUser } = useQuery(getGetMeQueryOptions());

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and personal information.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Settings Nav (Visual only for this layout) */}
        <div className="flex flex-col gap-1 hidden md:flex">
          <Button variant="secondary" className="justify-start font-medium text-slate-900 bg-slate-100">
            <User className="w-4 h-4 mr-2" /> Profile
          </Button>
          <Button variant="ghost" className="justify-start font-medium text-slate-600 hover:text-slate-900">
            <Building className="w-4 h-4 mr-2" /> Company Details
          </Button>
          <Button variant="ghost" className="justify-start font-medium text-slate-600 hover:text-slate-900">
            <Key className="w-4 h-4 mr-2" /> Security
          </Button>
        </div>

        {/* Main Settings Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm ring-1 ring-slate-100">
                  {clerkUser?.firstName?.charAt(0) || clerkUser?.primaryEmailAddress?.emailAddress?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{clerkUser?.fullName || "User"}</h3>
                  <p className="text-sm text-slate-500">{dbUser?.plan || "Free"} Plan Member</p>
                  <Button variant="outline" size="sm" className="mt-2 h-8">Change Avatar</Button>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={clerkUser?.fullName || ""} className="max-w-md bg-white border-slate-200" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2 max-w-md">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input id="email" defaultValue={clerkUser?.primaryEmailAddress?.emailAddress || ""} disabled className="pl-9 bg-slate-50 text-slate-500 border-slate-200" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Email addresses are managed through your authentication provider.</p>
                </div>
              </div>

              <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="divide-y divide-slate-100">
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <User className="w-4 h-4" /> Account ID
                  </dt>
                  <dd className="text-sm text-slate-900 font-mono bg-slate-50 px-2 py-0.5 rounded">{dbUser?.id || "---"}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Role
                  </dt>
                  <dd className="text-sm text-slate-900">Owner</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> Member Since
                  </dt>
                  <dd className="text-sm text-slate-900">
                    {dbUser?.createdAt ? format(new Date(dbUser.createdAt), 'MMMM d, yyyy') : "---"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}