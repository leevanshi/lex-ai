import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Subscription", href: "/subscription", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
            <Scale className="w-6 h-6 text-slate-900" />
            LexAI
          </Link>
        </div>
        
        <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto">
          <Link to="/documents/new" className="w-full mb-6">
            <Button className="w-full justify-start gap-2 shadow-sm" variant="default">
              <Plus className="w-4 h-4" />
              New Document
            </Button>
          </Link>
          
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu</div>
          {navigation.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.name} 
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {user?.firstName?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium text-slate-900 truncate">
                {user?.fullName || "User"}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
          <Scale className="w-6 h-6 text-slate-900" />
          LexAI
        </Link>
        <Link to="/documents/new">
          <Button size="sm" variant="default" className="gap-2">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile Navigation */}
        <nav className="md:hidden flex overflow-x-auto bg-white border-b border-slate-200 px-2 py-2 gap-2 hide-scrollbar">
          {navigation.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.name} 
                to={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive 
                    ? "bg-slate-900 text-white" 
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}