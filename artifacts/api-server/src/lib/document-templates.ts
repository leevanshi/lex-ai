export const DOCUMENT_TYPES = [
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    description: "Protect confidential information shared between parties",
    category: "Confidentiality",
    requiredPlan: "free" as const,
    questions: [
      { id: "disclosingParty", label: "Disclosing Party Name", type: "text" as const, required: true, placeholder: "e.g. Acme Corp" },
      { id: "receivingParty", label: "Receiving Party Name", type: "text" as const, required: true, placeholder: "e.g. John Smith" },
      { id: "purpose", label: "Purpose of Disclosure", type: "textarea" as const, required: true, placeholder: "e.g. Evaluating a potential business partnership" },
      { id: "duration", label: "Confidentiality Duration (years)", type: "select" as const, options: ["1", "2", "3", "5", "Indefinite"], required: true },
      { id: "state", label: "Governing State/Jurisdiction", type: "text" as const, required: true, placeholder: "e.g. Delaware" },
      { id: "effectiveDate", label: "Effective Date", type: "date" as const, required: true },
    ],
  },
  {
    id: "service-agreement",
    name: "Service Agreement",
    description: "Define terms for services provided between a company and client",
    category: "Contracts",
    requiredPlan: "pro" as const,
    questions: [
      { id: "serviceProvider", label: "Service Provider Name", type: "text" as const, required: true, placeholder: "e.g. Acme Dev Studio LLC" },
      { id: "client", label: "Client Name", type: "text" as const, required: true, placeholder: "e.g. Client Corp Inc." },
      { id: "serviceDescription", label: "Description of Services", type: "textarea" as const, required: true, placeholder: "Describe the services to be provided" },
      { id: "paymentAmount", label: "Total Payment Amount ($)", type: "text" as const, required: true, placeholder: "e.g. 5000" },
      { id: "paymentSchedule", label: "Payment Schedule", type: "select" as const, options: ["Upon completion", "50% upfront, 50% on completion", "Monthly", "Milestone-based"], required: true },
      { id: "startDate", label: "Start Date", type: "date" as const, required: true },
      { id: "endDate", label: "End Date", type: "date" as const, required: false },
      { id: "state", label: "Governing State/Jurisdiction", type: "text" as const, required: true, placeholder: "e.g. California" },
    ],
  },
  {
    id: "ip-assignment",
    name: "IP Assignment Agreement",
    description: "Transfer intellectual property rights from creator to company",
    category: "Intellectual Property",
    requiredPlan: "pro" as const,
    questions: [
      { id: "assignor", label: "Assignor Name (IP Creator)", type: "text" as const, required: true, placeholder: "e.g. Jane Doe" },
      { id: "assignee", label: "Assignee Name (Receiving Company)", type: "text" as const, required: true, placeholder: "e.g. Startup Inc." },
      { id: "ipDescription", label: "Description of Intellectual Property", type: "textarea" as const, required: true, placeholder: "Describe the IP being assigned" },
      { id: "consideration", label: "Consideration ($)", type: "text" as const, required: false, placeholder: "e.g. 1 (nominal) or actual amount" },
      { id: "effectiveDate", label: "Effective Date", type: "date" as const, required: true },
      { id: "state", label: "Governing State/Jurisdiction", type: "text" as const, required: true, placeholder: "e.g. Delaware" },
    ],
  },
  {
    id: "employment-contract",
    name: "Employment Contract",
    description: "Formal employment agreement outlining terms, compensation, and duties",
    category: "Employment",
    requiredPlan: "pro" as const,
    questions: [
      { id: "employerName", label: "Employer / Company Name", type: "text" as const, required: true, placeholder: "e.g. Startup Inc." },
      { id: "employeeName", label: "Employee Name", type: "text" as const, required: true, placeholder: "e.g. John Smith" },
      { id: "jobTitle", label: "Job Title", type: "text" as const, required: true, placeholder: "e.g. Senior Software Engineer" },
      { id: "salary", label: "Annual Salary ($)", type: "text" as const, required: true, placeholder: "e.g. 120000" },
      { id: "startDate", label: "Start Date", type: "date" as const, required: true },
      { id: "employmentType", label: "Employment Type", type: "select" as const, options: ["Full-time", "Part-time", "Contract"], required: true },
      { id: "state", label: "Governing State/Jurisdiction", type: "text" as const, required: true, placeholder: "e.g. New York" },
    ],
  },
  {
    id: "terms-of-service",
    name: "Terms of Service",
    description: "Website/app terms governing user access and acceptable use",
    category: "Compliance",
    requiredPlan: "enterprise" as const,
    questions: [
      { id: "companyName", label: "Company Name", type: "text" as const, required: true, placeholder: "e.g. Acme Corp" },
      { id: "productName", label: "Product / Service Name", type: "text" as const, required: true, placeholder: "e.g. Acme SaaS Platform" },
      { id: "websiteUrl", label: "Website URL", type: "text" as const, required: true, placeholder: "e.g. https://acmecorp.com" },
      { id: "contactEmail", label: "Contact Email", type: "text" as const, required: true, placeholder: "e.g. legal@acmecorp.com" },
      { id: "state", label: "Governing State/Jurisdiction", type: "text" as const, required: true, placeholder: "e.g. Delaware" },
      { id: "effectiveDate", label: "Effective Date", type: "date" as const, required: true },
    ],
  },
  {
    id: "privacy-policy",
    name: "Privacy Policy",
    description: "GDPR/CCPA-compliant privacy policy for your product",
    category: "Compliance",
    requiredPlan: "enterprise" as const,
    questions: [
      { id: "companyName", label: "Company Name", type: "text" as const, required: true, placeholder: "e.g. Acme Corp" },
      { id: "productName", label: "Product / Service Name", type: "text" as const, required: true, placeholder: "e.g. Acme SaaS Platform" },
      { id: "websiteUrl", label: "Website URL", type: "text" as const, required: true, placeholder: "e.g. https://acmecorp.com" },
      { id: "contactEmail", label: "Contact Email", type: "text" as const, required: true, placeholder: "e.g. privacy@acmecorp.com" },
      { id: "dataTypes", label: "Types of Data Collected", type: "textarea" as const, required: true, placeholder: "e.g. Email, name, usage data, payment info" },
      { id: "effectiveDate", label: "Effective Date", type: "date" as const, required: true },
    ],
  },
  {
    id: "founder-agreement",
    name: "Co-Founder Agreement",
    description: "Define equity splits, roles, and vesting between co-founders",
    category: "Corporate",
    requiredPlan: "enterprise" as const,
    questions: [
      { id: "companyName", label: "Company Name", type: "text" as const, required: true, placeholder: "e.g. Startup Inc." },
      { id: "founder1Name", label: "Co-Founder 1 Name", type: "text" as const, required: true, placeholder: "e.g. Jane Doe" },
      { id: "founder1Equity", label: "Co-Founder 1 Equity (%)", type: "text" as const, required: true, placeholder: "e.g. 60" },
      { id: "founder2Name", label: "Co-Founder 2 Name", type: "text" as const, required: true, placeholder: "e.g. John Smith" },
      { id: "founder2Equity", label: "Co-Founder 2 Equity (%)", type: "text" as const, required: true, placeholder: "e.g. 40" },
      { id: "vestingSchedule", label: "Vesting Schedule", type: "select" as const, options: ["4-year with 1-year cliff", "3-year with 6-month cliff", "No vesting"], required: true },
      { id: "state", label: "Governing State/Jurisdiction", type: "text" as const, required: true, placeholder: "e.g. Delaware" },
      { id: "effectiveDate", label: "Effective Date", type: "date" as const, required: true },
    ],
  },
];

export const PLAN_LIMITS: Record<string, { documentsPerMonth: number | null; documentTypes: string[] }> = {
  free: {
    documentsPerMonth: 3,
    documentTypes: ["nda"],
  },
  pro: {
    documentsPerMonth: 20,
    documentTypes: ["nda", "service-agreement", "ip-assignment", "employment-contract"],
  },
  enterprise: {
    documentsPerMonth: null,
    documentTypes: DOCUMENT_TYPES.map(d => d.id),
  },
};

export function generateDocumentContent(type: string, answers: Record<string, string>): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  switch (type) {
    case "nda":
      return `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of ${answers.effectiveDate || today} ("Effective Date") between:

Disclosing Party: ${answers.disclosingParty || "[Disclosing Party]"}
Receiving Party: ${answers.receivingParty || "[Receiving Party]"}

1. PURPOSE
The parties wish to explore a potential business relationship and in connection therewith, may need to disclose certain confidential and proprietary information for the following purpose: ${answers.purpose || "[Purpose]"}.

2. CONFIDENTIAL INFORMATION
"Confidential Information" means any data or information that is proprietary to the Disclosing Party and not generally known to the public, whether in tangible or intangible form.

3. OBLIGATIONS
The Receiving Party agrees to:
(a) Hold the Confidential Information in strict confidence;
(b) Not disclose the Confidential Information to any third parties without prior written consent;
(c) Use the Confidential Information only for the Purpose stated herein.

4. TERM
This Agreement shall remain in effect for ${answers.duration === "Indefinite" ? "an indefinite period" : `a period of ${answers.duration} year(s)`} from the Effective Date.

5. GOVERNING LAW
This Agreement shall be governed by the laws of the State of ${answers.state || "[State]"}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_______________________________          _______________________________
${answers.disclosingParty || "Disclosing Party"}                        ${answers.receivingParty || "Receiving Party"}

Date: ___________________________        Date: ___________________________`;

    case "service-agreement":
      return `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of ${answers.startDate || today} between:

Service Provider: ${answers.serviceProvider || "[Service Provider]"}
Client: ${answers.client || "[Client]"}

1. SERVICES
Service Provider agrees to perform the following services for Client:
${answers.serviceDescription || "[Description of Services]"}

2. COMPENSATION
Client agrees to pay Service Provider the total sum of $${answers.paymentAmount || "[Amount]"}.
Payment Schedule: ${answers.paymentSchedule || "[Payment Schedule]"}

3. TERM
This Agreement shall commence on ${answers.startDate || "[Start Date]"}${answers.endDate ? ` and shall terminate on ${answers.endDate}` : " and continue until completion of services"}.

4. INDEPENDENT CONTRACTOR
Service Provider is an independent contractor and is not an employee of Client.

5. INTELLECTUAL PROPERTY
All work product created under this Agreement shall be the property of Client upon full payment.

6. GOVERNING LAW
This Agreement shall be governed by the laws of the State of ${answers.state || "[State]"}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_______________________________          _______________________________
${answers.serviceProvider || "Service Provider"}                         ${answers.client || "Client"}

Date: ___________________________        Date: ___________________________`;

    case "ip-assignment":
      return `INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT

This IP Assignment Agreement ("Agreement") is entered into as of ${answers.effectiveDate || today} between:

Assignor: ${answers.assignor || "[Assignor]"} ("Creator")
Assignee: ${answers.assignee || "[Assignee]"} ("Company")

1. ASSIGNMENT
For good and valuable consideration${answers.consideration ? ` of $${answers.consideration}` : ""}, Assignor hereby irrevocably assigns to Assignee all right, title, and interest in and to the following intellectual property:

${answers.ipDescription || "[Description of Intellectual Property]"}

2. SCOPE OF ASSIGNMENT
The assignment includes all patents, copyrights, trademarks, trade secrets, and any other intellectual property rights related to the above.

3. REPRESENTATIONS
Assignor represents that they are the sole owner of the IP and have full authority to assign it.

4. FURTHER ASSURANCES
Assignor agrees to execute any additional documents reasonably necessary to effect this assignment.

5. GOVERNING LAW
This Agreement shall be governed by the laws of the State of ${answers.state || "[State]"}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_______________________________          _______________________________
${answers.assignor || "Assignor"}                                        ${answers.assignee || "Assignee"}

Date: ___________________________        Date: ___________________________`;

    case "employment-contract":
      return `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into as of ${answers.startDate || today} between:

Employer: ${answers.employerName || "[Employer]"}
Employee: ${answers.employeeName || "[Employee]"}

1. POSITION AND DUTIES
Employer hereby employs Employee as ${answers.jobTitle || "[Job Title]"}. Employee agrees to perform all duties reasonably assigned by Employer.

2. COMPENSATION
Employee shall receive an annual salary of $${answers.salary || "[Salary]"}, payable in accordance with Employer's standard payroll practices.

3. EMPLOYMENT TYPE
This is a ${answers.employmentType || "full-time"} position commencing on ${answers.startDate || "[Start Date]"}.

4. AT-WILL EMPLOYMENT
Unless otherwise specified in a separate written agreement, employment is at-will and may be terminated by either party at any time with or without cause.

5. CONFIDENTIALITY
Employee agrees to keep all proprietary and confidential information of Employer strictly confidential during and after employment.

6. INTELLECTUAL PROPERTY
All inventions, discoveries, and work product created during employment shall be the property of Employer.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of ${answers.state || "[State]"}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_______________________________          _______________________________
${answers.employerName || "Employer"}                                    ${answers.employeeName || "Employee"}

Date: ___________________________        Date: ___________________________`;

    case "terms-of-service":
      return `TERMS OF SERVICE

Effective Date: ${answers.effectiveDate || today}

Welcome to ${answers.productName || "[Product]"} ("Service"), operated by ${answers.companyName || "[Company]"} ("Company", "we", "us", or "our").

By accessing or using our Service at ${answers.websiteUrl || "[Website URL]"}, you agree to be bound by these Terms of Service.

1. USE OF SERVICE
You may use our Service only as permitted by these Terms and applicable law. You agree not to misuse our Service or interfere with its normal operation.

2. USER ACCOUNTS
You are responsible for maintaining the security of your account and password. You accept responsibility for all activities under your account.

3. INTELLECTUAL PROPERTY
The Service and its original content, features, and functionality are owned by ${answers.companyName || "[Company]"} and are protected by international copyright, trademark, and other laws.

4. LIMITATION OF LIABILITY
${answers.companyName || "[Company]"} shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.

5. TERMINATION
We may terminate or suspend your access to the Service at any time, without prior notice, for conduct that we believe violates these Terms.

6. GOVERNING LAW
These Terms shall be governed by the laws of the State of ${answers.state || "[State]"}.

7. CONTACT
For questions about these Terms, please contact us at ${answers.contactEmail || "[Contact Email]"}.`;

    case "privacy-policy":
      return `PRIVACY POLICY

Effective Date: ${answers.effectiveDate || today}

${answers.companyName || "[Company]"} ("we", "us", or "our") operates ${answers.productName || "[Product]"} at ${answers.websiteUrl || "[Website URL]"}.

This Privacy Policy explains how we collect, use, disclose, and safeguard your information.

1. INFORMATION WE COLLECT
We collect the following types of information:
${answers.dataTypes || "[Types of Data]"}

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Provide, operate, and improve our Service
- Process transactions and send related information
- Send technical notices and support messages
- Respond to your inquiries and requests

3. SHARING OF INFORMATION
We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist in our operations.

4. DATA RETENTION
We retain your personal information only as long as necessary to fulfill the purposes for which it was collected.

5. YOUR RIGHTS
Depending on your location, you may have rights to access, correct, or delete your personal data (GDPR, CCPA). Contact us to exercise these rights.

6. SECURITY
We implement industry-standard security measures to protect your information.

7. CONTACT
For privacy-related questions, contact us at ${answers.contactEmail || "[Contact Email]"}.`;

    case "founder-agreement":
      return `CO-FOUNDER AGREEMENT

This Co-Founder Agreement ("Agreement") is entered into as of ${answers.effectiveDate || today} for:

Company: ${answers.companyName || "[Company]"}

Co-Founders:
1. ${answers.founder1Name || "[Founder 1]"} — ${answers.founder1Equity || "[X]"}% equity interest
2. ${answers.founder2Name || "[Founder 2]"} — ${answers.founder2Equity || "[X]"}% equity interest

1. FORMATION AND OWNERSHIP
The parties agree to form and operate ${answers.companyName || "[Company]"} with equity ownership as set forth above.

2. VESTING
All founder equity shall be subject to the following vesting schedule: ${answers.vestingSchedule || "[Vesting Schedule]"}.

3. ROLES AND RESPONSIBILITIES
Each co-founder agrees to devote their full professional efforts to the Company and shall define specific roles by mutual written agreement.

4. DECISION MAKING
Major company decisions require unanimous consent of co-founders. Day-to-day operational decisions may be made by the co-founder responsible for the relevant function.

5. TRANSFER RESTRICTIONS
Founders may not transfer their equity interest without prior written consent of the other founder(s).

6. INTELLECTUAL PROPERTY
Each co-founder hereby assigns to the Company all IP created in connection with the Company's business.

7. CONFIDENTIALITY
Each co-founder agrees to keep all Company information strictly confidential.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the State of ${answers.state || "[State]"}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_______________________________          _______________________________
${answers.founder1Name || "Co-Founder 1"}                               ${answers.founder2Name || "Co-Founder 2"}

Date: ___________________________        Date: ___________________________`;

    default:
      return `LEGAL DOCUMENT\n\nType: ${type}\nGenerated: ${today}\n\nThis document has been generated based on the provided information.`;
  }
}
