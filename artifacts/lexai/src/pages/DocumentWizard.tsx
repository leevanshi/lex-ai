import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  getGetMySubscriptionQueryOptions, 
  useGetDocumentTypes, 
  useCreateDocument 
} from "@workspace/api-client-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentWizard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<any>(null);
  
  const { data: types, isLoading: isTypesLoading } = useGetDocumentTypes();
  const { data: subscription } = useQuery(getGetMySubscriptionQueryOptions());
  const createDocument = useCreateDocument();

  // Dynamic form setup based on selected type
  const formSchema = z.object({
    title: z.string().min(1, "Document title is required"),
    ...((selectedType?.questions || []).reduce((acc: any, q: any) => {
      let schema: any = z.string();
      if (q.required) {
        schema = schema.min(1, "This field is required");
      } else {
        schema = schema.optional();
      }
      acc[q.id] = schema;
      return acc;
    }, {}))
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      ...((selectedType?.questions || []).reduce((acc: any, q: any) => {
        acc[q.id] = "";
        return acc;
      }, {}))
    }
  });

  // Re-initialize form when type changes
  const handleTypeSelect = (type: any) => {
    setSelectedType(type);
    form.reset({
      title: `${type.name} - ${format(new Date(), 'MMM d, yyyy')}`,
      ...(type.questions || []).reduce((acc: any, q: any) => {
        acc[q.id] = "";
        return acc;
      }, {})
    });
    setStep(2);
  };

  const onSubmit = async (values: any) => {
    if (step === 2) {
      setStep(3);
      return;
    }
    
    if (step === 3) {
      try {
        const { title, ...answers } = values;
        const result = await createDocument.mutateAsync({
          data: {
            title,
            type: selectedType.id,
            answers
          }
        });
        
        toast({
          title: "Document generated",
          description: "Your document has been successfully created.",
        });
        
        setLocation(`/documents/${result.id}`);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate document. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const userPlan = subscription?.plan || 'free';
  
  const canAccessPlan = (requiredPlan: string) => {
    if (requiredPlan === 'free') return true;
    if (requiredPlan === 'pro' && (userPlan === 'pro' || userPlan === 'enterprise')) return true;
    if (requiredPlan === 'enterprise' && userPlan === 'enterprise') return true;
    return false;
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Wizard Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 mb-4 text-slate-500 hover:text-slate-900 -ml-2"
          onClick={() => step > 1 ? setStep(step - 1 as any) : setLocation("/documents")}
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? "Back" : "Cancel"}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {step === 1 && "Choose Document Type"}
          {step === 2 && "Fill Details"}
          {step === 3 && "Review & Generate"}
        </h1>
        <p className="text-slate-500 mt-2">
          {step === 1 && "Select the type of legal document you want to generate."}
          {step === 2 && `Answer a few questions to customize your ${selectedType?.name}.`}
          {step === 3 && "Review your details before generating the final document."}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
        <div 
          className="absolute left-0 top-1/2 h-0.5 bg-slate-900 -z-10 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors bg-white
              ${step === i ? 'border-slate-900 text-slate-900' : 
                step > i ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-400'}`}
          >
            {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
          </div>
        ))}
      </div>

      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isTypesLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
          ) : types?.map((type) => {
            const hasAccess = canAccessPlan(type.requiredPlan);
            
            return (
              <Card 
                key={type.id}
                className={cn(
                  "border-slate-200 shadow-sm transition-all duration-200 cursor-pointer overflow-hidden group",
                  hasAccess ? "hover:border-slate-400 hover:shadow-md" : "opacity-80 bg-slate-50 cursor-not-allowed"
                )}
                onClick={() => hasAccess && handleTypeSelect(type)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-600 mb-2 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    {!hasAccess && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                        <Lock className="w-3 h-3" />
                        Requires {type.requiredPlan}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-500 leading-relaxed min-h-[40px]">
                    {type.description}
                  </CardDescription>
                </CardContent>
                {hasAccess && (
                  <CardFooter className="pt-0 pb-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-sm font-medium text-slate-900 flex items-center gap-1">
                      Select <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Step 2 & 3: Form and Review */}
      {(step === 2 || step === 3) && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              {selectedType?.name}
            </CardTitle>
            <CardDescription>
              {step === 2 ? "Provide the necessary details to generate your customized document." : "Please review the details below before finalizing."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Title is always required */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className={step === 3 ? "opacity-70 pointer-events-none" : ""}>
                      <FormLabel className="text-slate-900 font-semibold">Document Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., NDA - Acme Corp" className="bg-slate-50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6 pt-4 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-lg">Document Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    {selectedType?.questions?.map((q: any) => (
                      <FormField
                        key={q.id}
                        control={form.control}
                        name={q.id}
                        render={({ field }) => (
                          <FormItem className={cn(
                            step === 3 && "opacity-70 pointer-events-none",
                            q.type === 'textarea' ? "md:col-span-2" : ""
                          )}>
                            <FormLabel className="text-slate-700 font-medium">
                              {q.label}
                              {q.required && <span className="text-red-500 ml-1">*</span>}
                            </FormLabel>
                            
                            <FormControl>
                              {q.type === 'text' ? (
                                <Input placeholder={q.placeholder} className="bg-white border-slate-200 focus-visible:ring-slate-900" {...field} />
                              ) : q.type === 'textarea' ? (
                                <Textarea placeholder={q.placeholder} className="resize-none min-h-[100px] bg-white border-slate-200 focus-visible:ring-slate-900" {...field} />
                              ) : q.type === 'select' ? (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger className="bg-white border-slate-200 focus:ring-slate-900">
                                    <SelectValue placeholder={q.placeholder || "Select an option"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {q.options?.map((opt: string) => (
                                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : q.type === 'date' ? (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal bg-white border-slate-200 hover:bg-slate-50",
                                          !field.value && "text-slate-500"
                                        )}
                                      >
                                        {field.value ? (
                                          format(new Date(field.value), "PPP")
                                        ) : (
                                          <span>{q.placeholder || "Pick a date"}</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value ? new Date(field.value) : undefined}
                                      onSelect={(date) => field.onChange(date?.toISOString())}
                                      disabled={(date) => date < new Date("1900-01-01")}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              ) : (
                                <Input {...field} />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(step - 1 as any)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="gap-2"
                    disabled={createDocument.isPending}
                  >
                    {step === 2 ? (
                      <>Continue to Review <ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <>
                        {createDocument.isPending ? "Generating..." : "Generate Document"} 
                        {!createDocument.isPending && <Sparkles className="w-4 h-4" />}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}