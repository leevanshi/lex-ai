export type LegalSafetyAssessment = {
  risks: string[];
  requiresLegalCounsel: boolean;
  clarityQuestions: string[];
  disclaimer: string;
};

const RISK_KEYWORDS: Record<string, string> = {
  criminal: "criminal matter",
  bail: "bail or arrest",
  domestic: "domestic violence",
  sexual: "sexual offence",
  child: "child-related matter",
  immigration: "immigration issue",
  litigation: "active litigation",
  deadline: "court deadline",
  finance: "major financial dispute",
};

export function evaluateLegalSafety(question: string): LegalSafetyAssessment {
  const normalizedQuestion = question.toLowerCase();
  const risks = Object.entries(RISK_KEYWORDS)
    .filter(([key]) => normalizedQuestion.includes(key) || normalizedQuestion.includes(RISK_KEYWORDS[key]))
    .map(([, value]) => value);

  const requiresLegalCounsel =
    risks.length > 0 ||
    /arrest|bail|domestic violence|sexual offence|child|immigration|court|litigation|deadline|cheque|criminal/i.test(
      normalizedQuestion,
    );

  const clarityQuestions = [
    "Which state or jurisdiction does this issue concern?",
    "When did the event happen, and what are the key facts?",
    "Have you already sent any legal notices or received any communication?",
  ];

  return {
    risks,
    requiresLegalCounsel,
    clarityQuestions: clarityQuestions.slice(0, requiresLegalCounsel ? 3 : 2),
    disclaimer:
      "LexAI provides general legal information for guidance only and is not a lawyer. This answer is not legal advice, and high-risk matters should be reviewed by a qualified lawyer or relevant authority.",
  };
}

export function buildLegalSafetyNote(question: string): string {
  const assessment = evaluateLegalSafety(question);
  if (assessment.requiresLegalCounsel) {
    return `${assessment.disclaimer} This issue may involve significant legal risk, so it is prudent to consult a lawyer or a relevant legal professional before taking action.`;
  }

  return assessment.disclaimer;
}
