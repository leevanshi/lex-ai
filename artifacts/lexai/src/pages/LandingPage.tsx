import { Link } from "wouter";
import { motion } from "framer-motion";
import { Scale, CheckCircle2, FileText, Lock, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
            <Scale className="w-6 h-6 text-slate-900" />
            LexAI
          </div>
          <div className="flex items-center gap-4">
            <Link to="/sign-in" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <Link to="/sign-up">
              <Button size="sm" className="font-medium">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-sm font-medium text-slate-800 mb-6">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  Your automated legal co-pilot
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                  Ironclad legal documents, <span className="text-slate-500">without the retainer.</span>
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                  LexAI gives founders precise, state-compliant legal agreements in minutes. From NDAs to employment contracts—generate exactly what you need with confidence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/sign-up">
                    <Button size="lg" className="w-full sm:w-auto text-base gap-2 px-8 h-14">
                      Start Generating Free <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14">
                    View Document Library
                  </Button>
                </div>
                <p className="mt-4 text-sm text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> No credit card required for free tier
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
              >
                <img 
                  src={`${basePath}/hero.png`} 
                  alt="LexAI professional office with legal documents" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Engineered for precision.</h2>
              <p className="text-lg text-slate-600">
                Stop downloading outdated templates. LexAI asks the right questions and generates tailored, airtight agreements instantly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-slate-900" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Dynamic Generation</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our wizard adapts to your answers. Every clause is deliberately included based on your specific business context.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-slate-900" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">State Compliant</h3>
                <p className="text-slate-600 leading-relaxed">
                  Documents are structured to comply with local jurisdictions. We handle the boilerplate so you can focus on building.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-slate-900" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Output</h3>
                <p className="text-slate-600 leading-relaxed">
                  Export to PDF or Word immediately. Store your completed documents securely in your encrypted dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Transparent Pricing</h2>
              <p className="text-lg text-slate-600">
                Scale your legal protection as your startup grows.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Free</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-slate-900">$0</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> 3 documents per month</li>
                  <li className="flex gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> Non-Disclosure Agreements</li>
                  <li className="flex gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> Standard email support</li>
                </ul>
                <Link to="/sign-up">
                  <Button className="w-full" variant="outline">Get Started</Button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col relative scale-105 z-10">
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <span className="bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-white shrink-0" /> 20 documents per month</li>
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-white shrink-0" /> Service Agreements</li>
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-white shrink-0" /> IP Assignments</li>
                  <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-white shrink-0" /> Employment Contracts</li>
                </ul>
                <Link to="/sign-up">
                  <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">Upgrade to Pro</Button>
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-slate-900">$99</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> Unlimited documents</li>
                  <li className="flex gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> All document types</li>
                  <li className="flex gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> Custom Terms of Service</li>
                  <li className="flex gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> Priority legal review</li>
                </ul>
                <Link to="/sign-up">
                  <Button className="w-full" variant="outline">Upgrade to Enterprise</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
              <Scale className="w-6 h-6 text-white" />
              LexAI
            </div>
            <p className="text-sm text-center md:text-left max-w-md">
              LexAI provides legal document generation software. We are not a law firm and do not provide legal advice.
            </p>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} LexAI Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}