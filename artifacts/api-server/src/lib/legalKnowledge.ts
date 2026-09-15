export type LegalSource = {
  id: string;
  title: string;
  documentType: "act" | "rule" | "guideline" | "judgment";
  jurisdiction: string;
  section: string;
  sourceUrl: string;
  effectiveFrom: string;
  version: string;
  language: string;
  summary: string;
  text: string;
  keywords: string[];
};

export type LegalRetrievalOptions = {
  limit?: number;
  minScore?: number;
};

export type RankedLegalSource = {
  source: LegalSource;
  score: number;
  reasons: string[];
};

const STOP_WORDS = new Set([
  "a",
  "about",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "can",
  "case",
  "country",
  "court",
  "data",
  "debt",
  "do",
  "does",
  "example",
  "facts",
  "fictional",
  "for",
  "from",
  "guidance",
  "i",
  "in",
  "issue",
  "it",
  "know",
  "land",
  "law",
  "laws",
  "legal",
  "made",
  "matter",
  "more",
  "my",
  "need",
  "of",
  "on",
  "or",
  "person",
  "question",
  "scenario",
  "should",
  "situation",
  "the",
  "their",
  "them",
  "there",
  "this",
  "to",
  "want",
  "what",
  "when",
  "why",
  "with",
  "without",
  "you",
  "your",
]);

const SOURCE_HINTS: Record<string, string[]> = {
  "security-deposit-rental": [
    "security deposit",
    "landlord",
    "tenant",
    "lease",
    "rent",
    "rental",
    "deposit",
    "deposit return",
    "refuse to return the deposit",
  ],
  "negotiable-instruments-act": [
    "bounced cheque",
    "cheque bounce",
    "dishonour of cheque",
    "promissory note",
    "negotiable instrument",
    "cheque",
    "dishonour",
    "payment instrument",
  ],
  "specific-relief-act": [
    "injunction",
    "specific performance",
    "court order",
    "restrain",
    "stop using",
    "injunctive relief",
    "breach of contract",
  ],
  "companies-act": [
    "company",
    "director",
    "shareholder",
    "corporate governance",
    "board",
    "client list",
    "trade secret",
    "confidential information",
  ],
  "posh-act": [
    "sexual harassment",
    "workplace harassment",
    "POSH",
    "internal committee",
    "retaliation",
    "harassment at work",
  ],
  "information-technology-act": [
    "data privacy",
    "online fraud",
    "digital signature",
    "cyber",
    "privacy",
    "data misuse",
    "electronic records",
    "website",
  ],
  "constitution-india": [
    "fundamental rights",
    "liberty",
    "equality",
    "speech",
    "constitution",
    "due process",
    "right to life",
    "article 21",
  ],
  "indian-contract-act": [
    "contract",
    "agreement",
    "consideration",
    "breach",
    "damages",
    "liability",
    "performance",
    "specific relief",
  ],
};

export const LEGAL_KNOWLEDGE_CORPUS: LegalSource[] = [
  {
    id: "constitution-india",
    title: "Constitution of India",
    documentType: "act",
    jurisdiction: "India",
    section: "Part III, Articles 19, 21, 32",
    sourceUrl: "https://www.india.gov.in/sites/upload_files/npi/files/coi_part_full.pdf",
    effectiveFrom: "1950-01-26",
    version: "1950",
    language: "en",
    summary: "Fundamental rights, equality, liberty, and due process principles.",
    text: "The Constitution guarantees equality before law, freedom of speech and expression, personal liberty, and access to remedies. Citizens and persons in India may rely on constitutional protections when rights are infringed.",
    keywords: ["constitution", "fundamental rights", "equality", "liberty", "freedom", "speech", "article 21", "article 19", "due process", "constitutional"],
  },
  {
    id: "indian-contract-act",
    title: "Indian Contract Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Sections 10, 73, 74, 182, 186",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/21969",
    effectiveFrom: "1872-04-01",
    version: "1872",
    language: "en",
    summary: "Core rules for contracts, performance, breach, and consideration.",
    text: "A valid contract requires lawful consideration and object, free consent, and competency of parties. Remedies may include damages, specific performance, and restitution depending on the facts and the contract.",
    keywords: ["contract", "agreement", "breach", "consideration", "damages", "liability", "performance", "specific performance", "indemnity", "enforceability"],
  },
  {
    id: "consumer-protection-act",
    title: "Consumer Protection Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Consumer rights and grievance redressal provisions",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2000",
    effectiveFrom: "2019-07-24",
    version: "2019",
    language: "en",
    summary: "Consumer disputes, unfair trade practice, and complaint remedies.",
    text: "Consumers can seek remedies for defective goods, deficient services, unfair trade practices, and unfair contracts. Consumer forums provide a forum for claims and redressal.",
    keywords: ["consumer", "defective goods", "service deficiency", "refund", "complaint", "consumer forum", "unfair trade", "complaints"],
  },
  {
    id: "information-technology-act",
    title: "Information Technology Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Cyber offences, privacy, and electronic records",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1311",
    effectiveFrom: "2000-10-17",
    version: "2000",
    language: "en",
    summary: "Digital records, cybersecurity, privacy, and online offences.",
    text: "The Information Technology Act covers electronic records, digital signatures, cyber offences, and data protection-related responsibilities. It is often relevant in online disputes, data misuse, and digital contracts.",
    keywords: ["IT act", "digital signature", "cyber", "online fraud", "privacy", "data", "electronic records", "website", "cybercrime"],
  },
  {
    id: "specific-relief-act",
    title: "Specific Relief Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Specific performance and injunction provisions",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/20847",
    effectiveFrom: "1963-01-01",
    version: "1963",
    language: "en",
    summary: "Specific performance, injunctions, and equitable remedies.",
    text: "Courts may grant specific performance or injunction relief in certain contracts where money damages are inadequate. The statutory framework depends on the nature of the contract and the facts.",
    keywords: ["specific performance", "injunction", "contract enforcement", "equitable relief", "specific relief", "damages"],
  },
  {
    id: "rti-act",
    title: "Right to Information Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Information access and disclosure rules",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2127",
    effectiveFrom: "2005-10-12",
    version: "2005",
    language: "en",
    summary: "Citizen access to information from public authorities.",
    text: "Public authorities are obliged to provide information to citizens under the RTI framework, subject to specific exemptions and procedural rules. Transparency and accountability are core principles.",
    keywords: ["RTI", "information request", "public authority", "transparency", "records", "government information", "access to information"],
  },
  {
    id: "companies-act",
    title: "Companies Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Corporate governance and shareholder rights",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2007",
    effectiveFrom: "2013-08-30",
    version: "2013",
    language: "en",
    summary: "Corporate governance, directors, shareholder rights, and compliance.",
    text: "Company law addresses incorporation, shareholder rights, director duties, governance, and statutory compliance. Commercial and governance disputes may require analysis under current company law.",
    keywords: ["company", "shareholder", "director", "board", "corporate governance", "corporate", "company law"],
  },
  {
    id: "posh-act",
    title: "POSH Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Prevention of Sexual Harassment at Workplace Act",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1759",
    effectiveFrom: "2013-12-09",
    version: "2013",
    language: "en",
    summary: "Workplace safety, complaint handling, and anti-harassment provisions.",
    text: "The POSH Act creates a framework for preventing and redressing workplace sexual harassment. It includes obligations on employers, internal complaints mechanisms, and protection against retaliation.",
    keywords: ["sexual harassment", "workplace", "POSH", "harassment", "complaint", "retaliation", "internal committee"],
  },
  {
    id: "pocso-act",
    title: "POCSO Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Protection of children from sexual offences",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2068",
    effectiveFrom: "2012-11-14",
    version: "2012",
    language: "en",
    summary: "Child protection and sexual offence safeguards.",
    text: "The POCSO Act provides a comprehensive legal framework to protect children from sexual offences and to establish procedures for reporting and prosecution. Child-sensitive procedures and confidentiality are important.",
    keywords: ["POCSO", "child abuse", "sexual offence", "minor", "child protection", "abuse"],
  },
  {
    id: "motor-vehicles-act",
    title: "Motor Vehicles Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Road safety, insurance, and compensation rules",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1225",
    effectiveFrom: "1988-07-01",
    version: "1988",
    language: "en",
    summary: "Motor vehicle compliance, accident compensation, and licensing frameworks.",
    text: "The Motor Vehicles Act addresses licensing, vehicle regulation, insurance, and compensation-related rights in transport and accident contexts. Driver, owner, and insurer obligations may all be relevant.",
    keywords: ["motor vehicle", "accident", "insurance", "traffic", "driver", "compensation", "vehicle"],
  },
  {
    id: "negotiable-instruments-act",
    title: "Negotiable Instruments Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Promissory notes, cheques, and dishonour rules",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/1887",
    effectiveFrom: "1881-03-01",
    version: "1881",
    language: "en",
    summary: "Cheques, bills, promissory notes, and dishonour procedures.",
    text: "Negotiable instruments law governs payment instruments and remedies for dishonour, including rights and liabilities tied to cheques and promissory notes.",
    keywords: ["cheque", "dishonour", "promissory note", "payment instrument", "bounced cheque", "negotiable instruments"],
  },
  {
    id: "transfer-of-property-act",
    title: "Transfer of Property Act",
    documentType: "act",
    jurisdiction: "India",
    section: "Property transfer, sale, lease, and mortgage",
    sourceUrl: "https://www.indiacode.nic.in/handle/123456789/2058",
    effectiveFrom: "1882-04-01",
    version: "1882",
    language: "en",
    summary: "Property transactions, mortgages, leases, and transfer rules.",
    text: "The Transfer of Property Act governs transfers of property and related rights, including sale, lease, mortgage, and other conveyance arrangements. The legal consequences depend on the transaction structure and relevant parties.",
    keywords: ["property", "sale deed", "lease", "mortgage", "transfer", "eviction", "rent", "tenancy"],
  },
  {
    id: "bns",
    title: "Bharatiya Nyaya Sanhita",
    documentType: "act",
    jurisdiction: "India",
    section: "Criminal offences and penalties",
    sourceUrl: "https://www.indiacode.nic.in/",
    effectiveFrom: "2023-07-01",
    version: "2023",
    language: "en",
    summary: "Criminal law framework replacing the Indian Penal Code.",
    text: "The Bharatiya Nyaya Sanhita governs offences, criminal liability, and sentencing principles under Indian criminal law. It should be read together with procedural provisions and facts before drawing conclusions.",
    keywords: ["criminal law", "offence", "punishment", "theft", "assault", "bns", "crime", "penalty", "criminal"],
  },
  {
    id: "bnss",
    title: "Bharatiya Nagarik Suraksha Sanhita",
    documentType: "act",
    jurisdiction: "India",
    section: "Criminal procedure and investigation",
    sourceUrl: "https://www.indiacode.nic.in/",
    effectiveFrom: "2023-07-01",
    version: "2023",
    language: "en",
    summary: "Procedural steps in criminal investigation and trial.",
    text: "The Bharatiya Nagarik Suraksha Sanhita sets out procedural safeguards, investigation steps, bail principles, and court procedure. Procedure and facts matter significantly in criminal disputes.",
    keywords: ["criminal procedure", "bail", "investigation", "court", "procedure", "trial", "BNSS", "arrest"],
  },
  {
    id: "bsa",
    title: "Bharatiya Sakshya Adhiniyam",
    documentType: "act",
    jurisdiction: "India",
    section: "Evidence rules and proof standards",
    sourceUrl: "https://www.indiacode.nic.in/",
    effectiveFrom: "2023-07-01",
    version: "2023",
    language: "en",
    summary: "Rules relating to evidence and admissibility.",
    text: "The Bharatiya Sakshya Adhiniyam governs evidence, admissibility, and proof in legal proceedings. Evidence is assessed with care and context, and not every fact is conclusive without supporting proof.",
    keywords: ["evidence", "admissibility", "proof", "witness", "document", "record", "court evidence"],
  },
  {
    id: "security-deposit-rental",
    title: "Security deposit and tenancy context",
    documentType: "guideline",
    jurisdiction: "India",
    section: "Tenant-landlord and contract practices",
    sourceUrl: "https://www.indiacode.nic.in/",
    effectiveFrom: "general-practice",
    version: "general",
    language: "en",
    summary: "General practical guidance for rental deposits and landlord-tenant disputes.",
    text: "In rental and tenancy disputes, security deposits are typically governed by the contract, local tenancy law, and applicable consumer or property principles. A landlord's refusal to return a deposit should be assessed in light of the lease terms, notices served, and any legal deadlines.",
    keywords: ["security deposit", "landlord", "tenant", "rent", "lease", "deposit", "rental", "refuse to return deposit"],
  },
];

function normalizeLegalText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input: string): string[] {
  return Array.from(
    new Set(
      normalizeLegalText(input)
        .split(" ")
        .filter((token) => Boolean(token) && token.length > 2 && !STOP_WORDS.has(token)),
    ),
  );
}

function dedupeLegalSources(sources: RankedLegalSource[]): RankedLegalSource[] {
  const seen = new Set<string>();
  return sources.filter((entry) => {
    if (seen.has(entry.source.id)) {
      return false;
    }
    seen.add(entry.source.id);
    return true;
  });
}

function computeLegalSourceScore(question: string, source: LegalSource): { score: number; reasons: string[] } {
  const normalizedQuestion = normalizeLegalText(question);
  const sourceText = [
    source.title,
    source.section,
    source.summary,
    source.text,
    ...source.keywords,
  ].join(" ");
  const sourceTokens = tokenize(sourceText);
  const questionTokens = tokenize(normalizedQuestion);
  const sourceHints = SOURCE_HINTS[source.id] ?? [];

  let score = 0;
  const reasons: string[] = [];

  const directMatchPhrases = [
    ...source.keywords,
    ...sourceHints,
    source.title,
    source.section,
  ].map((phrase) => normalizeLegalText(phrase));

  let strongPhraseMatches = 0;
  for (const phrase of directMatchPhrases) {
    if (!phrase) continue;
    if (normalizedQuestion.includes(phrase)) {
      const phraseWeight = phrase.split(" ").length > 2 ? 0.9 : 0.7;
      score += phraseWeight;
      strongPhraseMatches += 1;
      reasons.push(`matched phrase: ${phrase}`);
    }
  }

  const legalQuestionTokens = questionTokens.filter((token) => !STOP_WORDS.has(token));
  const sourceTokenMatches = legalQuestionTokens.filter((token) => sourceTokens.includes(token));
  score += sourceTokenMatches.length * 0.12;

  if (sourceTokenMatches.length === 0 && strongPhraseMatches === 0) {
    return {
      score: 0,
      reasons: ["no meaningful legal token overlap"],
    };
  }

  if (strongPhraseMatches === 0 && sourceTokenMatches.length > 0 && sourceTokenMatches.length <= 2) {
    score *= 0.55;
  }

  if (questionTokens.some((token) => token.includes("court") || token.includes("order") || token.includes("injunction")) && source.keywords.some((keyword) => /injunction|court order|specific performance|relief/.test(keyword.toLowerCase()))) {
    score += 0.7;
    reasons.push("court-remedy terminology matches injunctive relief sources");
  }

  if (questionTokens.some((token) => token.includes("deposit") || token.includes("landlord") || token.includes("tenant") || token.includes("rent")) && source.id === "security-deposit-rental") {
    score += 0.8;
    reasons.push("tenant-landlord deposit terms match tenancy guidance");
  }

  if (questionTokens.some((token) => token.includes("cheque") || token.includes("bounced") || token.includes("dishonour")) && source.id === "negotiable-instruments-act") {
    score += 0.9;
    reasons.push("payment instrument terminology matches negotiable instruments law");
  }

  if (questionTokens.some((token) => token.includes("harassment") || token.includes("posh") || token.includes("retaliation")) && source.id === "posh-act") {
    score += 0.9;
    reasons.push("workplace-harassment terminology matches POSH law");
  }

  if (questionTokens.some((token) => token.includes("privacy") || token.includes("data") || token.includes("fraud") || token.includes("cyber")) && source.id === "information-technology-act") {
    score += 0.85;
    reasons.push("digital privacy and cyber terms match IT law");
  }

  if (questionTokens.some((token) => token.includes("contract") || token.includes("breach") || token.includes("partner")) && source.id === "specific-relief-act") {
    score += 0.5;
    reasons.push("contract-breach and injunction terms align with specific relief law");
  }

  if (questionTokens.some((token) => token.includes("company") || token.includes("employee") || token.includes("director")) && source.id === "companies-act") {
    score += 0.5;
    reasons.push("employment and corporate governance terminology matches company law");
  }

  return {
    score: Number(Math.min(1.5, Math.max(0, score)).toFixed(4)),
    reasons,
  };
}

export function rankLegalSources(question: string, options: LegalRetrievalOptions = {}): RankedLegalSource[] {
  const { limit = 5, minScore = 0.18 } = options;
  const ranked = dedupeLegalSources(
    LEGAL_KNOWLEDGE_CORPUS.map((source) => {
      const { score, reasons } = computeLegalSourceScore(question, source);
      return { source, score, reasons };
    })
      .filter((entry) => entry.score >= minScore)
      .sort((left, right) => right.score - left.score)
      .slice(0, limit),
  );

  return ranked;
}

export function retrieveRelevantLegalSources(question: string, limit = 5, options: LegalRetrievalOptions = {}): LegalSource[] {
  const { minScore = 0.18 } = options;
  return rankLegalSources(question, { limit, minScore }).map(({ source }) => source);
}

export function getDefaultLegalPromptContext(question: string, limit = 5, options: LegalRetrievalOptions = {}): string {
  const sources = retrieveRelevantLegalSources(question, limit, options);

  if (sources.length === 0) {
    return "Available legal sources: none were sufficiently relevant to this question under the current retrieval threshold.";
  }

  return sources
    .map((source) => {
      return `Source: ${source.title}\nSection: ${source.section}\nJurisdiction: ${source.jurisdiction}\nSummary: ${source.summary}\nText: ${source.text}\nURL: ${source.sourceUrl}`;
    })
    .join("\n\n");
}
