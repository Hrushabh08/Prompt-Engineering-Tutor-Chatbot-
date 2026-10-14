import { LessonModule } from '../types';

export const LESSON_MODULES: LessonModule[] = [
  {
    id: 'mod-1',
    moduleNumber: 1,
    title: 'Introduction to Prompt Engineering',
    category: 'Foundations',
    estimatedTime: '8 min',
    description: 'Understand how Large Language Models process text, what prompt engineering actually is, and why deterministic framing yields better outputs.',
    objectives: [
      'Understand the token-based prediction nature of autoregressive LLMs.',
      'Learn the difference between instruction following and associative completion.',
      'Recognize why vague prompts cause hallucination and generic answers.'
    ],
    content: `### What is Prompt Engineering?

Prompt engineering is the practice of structuring, refining, and designing inputs so that Large Language Models (LLMs) produce accurate, relevant, and robust outputs.

At their core, modern LLMs (like GPT-4o, Claude 3.5, and Gemini 1.5) are probabilistic next-token predictors. When you provide a prompt, the model calculates the most probable continuation based on billions of parameters trained on vast corpora.

#### The Fundamental Rule: Specificity Guides Probability
If your prompt is broad or ambiguous:
> *"Write about marketing."*

The model's probability distribution is flat: it could produce a university textbook overview, an Instagram influencer caption, or a B2B SaaS pitch.

However, when you specify **role**, **context**, **constraints**, and **format**:
> *"You are a B2B SaaS Growth Lead. Draft a 3-paragraph strategy memo for reducing churn among enterprise accounts during onboarding. Focus on in-app telemetry and account management cadence."*

The probability space contracts sharply toward high-value, professional recommendations.

#### Common Misconceptions
1. **"Prompt engineering is just finding magic words."** False. It is software engineering with natural language: defining clear inputs, constraints, deterministic structures, and error boundaries.
2. **"Models can read your mind."** If you don't explicitly declare constraints (e.g., tone, length, format, exclusions), the model defaults to standard conversational averages.`,
    examples: [
      {
        title: 'Explaining a Technical Topic',
        weak: 'Explain microservices.',
        improved: 'Act as a Senior Systems Architect. Explain microservices architecture to a junior frontend developer who has only worked with monolithic Ruby on Rails applications. Use an analogy comparing a monolithic department store to specialized boutique shops, highlight 2 major trade-offs (operational complexity and network latency), and keep your response under 250 words.',
        explanation: 'The improved version establishes a precise persona, defines the target audience and their existing background, dictates an intuitive analogy, demands specific technical trade-offs, and enforces an exact length boundary.'
      }
    ],
    quiz: {
      question: 'Why does an open-ended, vague prompt frequently lead to generic or low-quality LLM responses?',
      options: [
        'Because the model runs out of computing tokens and aborts early.',
        'Because the probability distribution over possible completions remains wide and unconstrained.',
        'Because the model intentionally penalizes short inputs.',
        'Because LLMs only know how to execute Python code.'
      ],
      answerIndex: 1,
      explanation: 'Vague prompts fail to narrow the model’s probability distribution. By providing role, context, and explicit constraints, you steer the model toward a specific, high-density cluster of relevant tokens.'
    }
  },
  {
    id: 'mod-2',
    moduleNumber: 2,
    title: 'Anatomy of an Effective Prompt',
    category: 'Foundations',
    estimatedTime: '10 min',
    description: 'Master the 5 essential building blocks of production prompts: Role, Context, Task, Constraints, and Output Format (RCTCO).',
    objectives: [
      'Deconstruct prompts into the RCTCO framework.',
      'Isolate tasks from background context to prevent instruction dilution.',
      'Implement explicit boundary constraints to prevent common failure modes.'
    ],
    content: `### The RCTCO Framework

High-performing prompts are not essays; they are structured specifications. The most dependable architecture is the **RCTCO Framework**:

1. **Role (Who):** Calibrates tone, domain vocabulary, and baseline assumptions (e.g., *"Senior Security Auditor"*, *"Patient Math Tutor"*).
2. **Context (Why & Where):** Provides background information, environment, audience profile, and problem motivation.
3. **Task (What):** The explicit, unambiguous action verb directive (e.g., *"Audit the attached authentication snippet for race conditions"*).
4. **Constraints (How & Boundaries):** Negative constraints, length limits, forbidden techniques, assumptions to avoid.
5. **Output Format (Structure):** JSON schema, markdown table, step-by-step checklist, or executive summary.

#### Visualizing Prompt Hierarchy
\`\`\`text
[ROLE]: You are a Staff DevOps Engineer.
[CONTEXT]: We are migrating our stateless Node.js APIs from AWS EC2 to AWS ECS Fargate.
[TASK]: Create a pre-migration checklist covering secret management and blue-green deployments.
[CONSTRAINTS]: Do not recommend third-party SaaS vendors. Focus only on native AWS services. Avoid prose preamble.
[OUTPUT FORMAT]: Group into a Markdown table with columns: 'Category', 'Checklist Item', 'AWS Service', 'Risk Level'.
\`\`\`

When you align prompts to this hierarchy, you eliminate 90% of model ambiguity.`,
    examples: [
      {
        title: 'Customer Escalation Analysis',
        weak: 'Analyze this customer complaint and tell me what to do.',
        improved: 'You are a Customer Experience Director for an e-commerce platform. Review the customer complaint below. Perform a root-cause breakdown identifying: (1) Process failure, (2) Communication breakdown, and (3) Immediate mitigation steps. Format your answer as a concise executive briefing with 3 bulleted action items. Ensure the tone is objective and blameless.',
        explanation: 'Breaks down the analysis into 3 distinct diagnostic dimensions, sets executive expectations, and defines an objective tone.'
      }
    ],
    quiz: {
      question: 'Which component of the RCTCO framework is primarily responsible for preventing conversational fluff and enforcing structured layouts?',
      options: [
        'Context',
        'Role',
        'Output Format & Constraints',
        'Temperature'
      ],
      answerIndex: 2,
      explanation: 'Output Format explicitly mandates the target structure (e.g. JSON, table, list), while Constraints establish negative boundaries (e.g. "no preamble", "under 200 words") that eliminate fluff.'
    }
  },
  {
    id: 'mod-3',
    moduleNumber: 3,
    title: 'Role, Context, and Task Instructions',
    category: 'Techniques',
    estimatedTime: '9 min',
    description: 'Learn how persona calibration and unambiguous action verbs guide the model’s reasoning style and depth.',
    objectives: [
      'Distinguish between superficial roleplay and deep persona calibration.',
      'Use imperative action verbs to prevent weak instruction following.',
      'Separate static context from dynamic user variables using delimiters.'
    ],
    content: `### Persona Calibration vs. Gimmicky Roleplay

Telling a model *"You are an expert"* is often not enough. Effective role framing calibrates:
- **Depth of expertise:** Is it a 10-year veteran or a peer reviewer?
- **Bias / Perspective:** Is the persona risk-averse (like a compliance officer) or velocity-focused (like an early-stage startup founder)?
- **Communication style:** Socratic, direct, dry, or pedagogical?

### Delimiters: Protecting Context Integrity
When passing raw data or user text to an LLM, always encapsulate it using delimiters such as triple backticks (\`\`\`), XML tags (\`<document>...</document>\`), or triple quotes (\`"""\`).

Why delimiters matter:
- They prevent **Prompt Injection** where untrusted input overrides your system instructions.
- They clearly demarcate where your instructions end and the raw data begins.

\`\`\`markdown
You are a Legal Analyst. Summarize the key indemnity obligations in the contract excerpt below.

<contract_text>
[Insert text here]
</contract_text>

Respond only with the obligations that apply to Party B.
\`\`\``,
    examples: [
      {
        title: 'Code Review Calibration',
        weak: 'Look at my Python code and tell me if it is good.',
        improved: 'Act as a Principal Python Engineer specializing in high-throughput backend services. Review the Python function delimited in <code_snippet>. Focus exclusively on time complexity, memory allocations, and edge cases with None values. Do not rewrite stylistic PEP8 conventions unless they affect performance. Provide your review as numbered findings ranked by severity (High, Medium, Low).',
        explanation: 'Specifies the review criteria to performance and memory, rules out bike-shedding on minor style conventions, and orders findings by severity.'
      }
    ],
    quiz: {
      question: 'Why should you wrap external user inputs in delimiters like <data>...</data> or triple backticks?',
      options: [
        'It speeds up GPU processing on server farms.',
        'It clearly separates metadata and instructions from untrusted data, reducing ambiguity and prompt injection.',
        'It automatically translates code into HTML.',
        'It is required by the JavaScript JSON parser.'
      ],
      answerIndex: 1,
      explanation: 'Delimiters provide structural demarcation between your system directives and external or untrusted data.'
    }
  },
  {
    id: 'mod-4',
    moduleNumber: 4,
    title: 'Constraints and Output Formatting',
    category: 'Techniques',
    estimatedTime: '10 min',
    description: 'Harness positive and negative constraints, eliminate conversational filler, and demand exact structural formats like JSON and Markdown.',
    objectives: [
      'Write effective negative constraints that models actually obey.',
      'Enforce JSON, YAML, and Markdown table output specifications.',
      'Eliminate conversational pleasantries and preamble tokens.'
    ],
    content: `### Positive vs. Negative Constraints

Models generally adhere better to **positive constraints** (what *to do*) than purely negative constraints (what *not to do*).

- **Weak Negative Constraint:** *"Don't write a long answer and don't be overly technical."*
- **Strong Positive Alternative:** *"Provide a 2-sentence summary using 8th-grade vocabulary."*

When you must use negative constraints, couple them with an alternative behavior:
> *"Do not include introductory pleasantries (e.g., 'Sure, I would be happy to help!'). Begin immediately with the first item on the list."*

### Demanding Structured Output
If your application downstream parses LLM responses, freeform prose will break your code. Specify exact schema keys and data types.

\`\`\`markdown
Extract the invoice details from the text below.
Return ONLY valid JSON matching this schema:
{
  "vendorName": string,
  "invoiceDate": string (YYYY-MM-DD),
  "totalAmount": number,
  "lineItems": [
    { "description": string, "quantity": integer, "unitPrice": number }
  ]
}
Do not wrap in markdown or add explanations.
\`\`\``,
    examples: [
      {
        title: 'Meeting Notes Action Item Extractor',
        weak: 'Find the action items from this meeting.',
        improved: 'Extract all action items from the meeting transcript below. Format the output as a Markdown table with columns: [Owner | Action Item | Due Date | Dependencies]. If a due date is not mentioned, write "Not specified". Do not include conversational commentary or intro text. Begin your response with the table header.',
        explanation: 'Enforces a strict tabular structure, specifies handling for missing values ("Not specified"), and removes preamble tokens.'
      }
    ],
    quiz: {
      question: 'Why is "Do not include pleasantries; start directly with the markdown list" superior to just "Be concise"?',
      options: [
        'Because "Be concise" is subjective, while the first instruction gives a deterministic boundary and start condition.',
        'Because LLMs do not recognize the word "concise".',
        'Because pleasantries consume too much RAM on the user computer.',
        'Because markdown is only rendered when pleasantries are stripped.'
      ],
      answerIndex: 0,
      explanation: '"Concise" is relative and interpreted differently by models. Explicitly forbidding intro phrases and specifying the starting token is concrete and measurable.'
    }
  },
  {
    id: 'mod-5',
    moduleNumber: 5,
    title: 'Zero-Shot and Few-Shot Prompting',
    category: 'Advanced Patterns',
    estimatedTime: '12 min',
    description: 'Learn in-context learning mechanics: when zero-shot is sufficient and how few-shot exemplars teach complex formatting and reasoning styles.',
    objectives: [
      'Identify when zero-shot prompting fails due to subjective classification.',
      'Construct high-fidelity few-shot input/output demonstration pairs.',
      'Avoid common few-shot traps like label skew and positional bias.'
    ],
    content: `### The Power of In-Context Learning

- **Zero-Shot:** Asking the model to perform a task with zero examples, relying purely on its pre-trained weights.
- **Few-Shot:** Providing 1 to 5 input-output demonstration pairs within your prompt before presenting the new query.

Few-shot prompting is the single most reliable technique to align an LLM with **idiosyncratic output formats**, **domain-specific categorization**, or **nuanced reasoning patterns**.

#### Few-Shot Prompt Architecture
\`\`\`markdown
Classify the sentiment of financial headlines into: Bullish, Bearish, or Neutral.

Headline: "Company reports record Q3 revenue, topping analyst estimates by 14%."
Sentiment: Bullish

Headline: "Federal Reserve signals potential rate hikes amid persistent inflation metrics."
Sentiment: Bearish

Headline: "CEO announces scheduled retirement date after 12 years of tenure."
Sentiment: Neutral

Headline: "Supply chain disruptions delay flagship smartphone deliveries into early Q1."
Sentiment:
\`\`\`

#### Best Practices for Exemplars
1. **Balance your labels:** Include equal examples of each class to prevent bias.
2. **Cover edge cases:** Show how ambiguous or tricky inputs should be categorized.
3. **Keep format uniform:** Use the exact same delimiters and casing across all examples.`,
    examples: [
      {
        title: 'Customer Feedback Classification',
        weak: 'Classify this review: "The screen is gorgeous but battery dies in 3 hours."',
        improved: 'Classify consumer product reviews into primary sentiment and key product dimension. Follow the pattern:\n\nReview: "Sound quality is unmatched, but the earcups pinch after an hour."\nClassification: Mixed | Primary: Audio Quality | Secondary: Ergonomics\n\nReview: "Arrived two days late and package was crushed."\nClassification: Negative | Primary: Shipping & Fulfillment\n\nReview: "The screen is gorgeous but battery dies in 3 hours."\nClassification:',
        explanation: 'Few-shot exemplars demonstrate the exact pipe-delimited format, multi-label structure, and nuanced categorization without lengthy rules.'
      }
    ],
    quiz: {
      question: 'What is a common failure mode when providing few-shot examples for classification?',
      options: [
        'Label skew: Providing 4 positive examples and only 1 negative example, causing the model to favor the positive label.',
        'Using english letters instead of binary numbers.',
        'Including more than 2 sentences in the prompt.',
        'Capitalizing the word "Headline".'
      ],
      answerIndex: 0,
      explanation: 'LLMs are sensitive to label distribution in demonstrations. Skewing examples toward one category biases the model’s prior probability toward that category.'
    }
  },
  {
    id: 'mod-6',
    moduleNumber: 6,
    title: 'Chain-of-Thought & Iterative Refinement',
    category: 'Advanced Patterns',
    estimatedTime: '11 min',
    description: 'Harness step-by-step reasoning to solve multi-step logic, math, architecture, and complex planning problems without cognitive collapse.',
    objectives: [
      'Understand why direct-answer prompting fails for multi-step reasoning.',
      'Implement Zero-Shot and Few-Shot Chain-of-Thought (CoT).',
      'Use task decomposition to break complex workflows into verifiable milestones.'
    ],
    content: `### Why Direct Prompting Fails on Logic

Because LLMs generate tokens sequentially, if you ask a model to produce the final answer immediately:
> *"Did Roger Federer win more Grand Slams before turning 28 than Rafael Nadal did before turning 28? Answer in one word."*

The model must predict the single token ("Yes" or "No") before it has generated the intermediate facts! This often forces the model into early mistakes.

### Chain-of-Thought (CoT)
Chain-of-Thought forces the model to generate intermediate reasoning tokens *before* reaching the conclusion.
The classic zero-shot trigger is:
> *"Think step-by-step before providing your final answer."*

Or more specifically:
\`\`\`markdown
Approach this calculation in three distinct phases:
1. Break down all incoming and outgoing cash flows.
2. Calculate the net balance for each calendar quarter.
3. State the final projected runway in months.
Show your calculations for each phase clearly.
\`\`\`

### Iterative Prompt Refinement
Prompt engineering is an iterative discipline:
1. **Draft Initial Prompt** -> RCTCO baseline.
2. **Execute & Test on Edge Cases** -> Find where the model hallucinates or deviates.
3. **Diagnose Failure Mode** -> Was context missing? Was a constraint ambiguous?
4. **Patch Prompt** -> Add a negative constraint or few-shot exemplar.
5. **Regression Test** -> Ensure previous inputs still work.`,
    examples: [
      {
        title: 'Multi-Step Capacity Planning',
        weak: 'How many servers do I need for 10 million daily active users?',
        improved: 'You are a Principal Cloud Infrastructure Architect. Estimate server capacity for a social video app with 10M daily active users. Think step-by-step through: (1) Peak requests-per-second (RPS) assuming an 80/20 daily traffic distribution, (2) Expected CPU and memory footprint per request, (3) Redundancy and failover buffer (N+1). Show intermediate arithmetic before concluding with the recommended cluster size.',
        explanation: 'Decomposes an impossible single-shot question into peak traffic estimation, resource profiling, and high-availability sizing.'
      }
    ],
    quiz: {
      question: 'Why does Chain-of-Thought prompting improve accuracy on complex mathematical and logical queries?',
      options: [
        'It causes the LLM to access an external Wolfram Alpha calculator.',
        'It gives the autoregressive model token space to compute and condition upon intermediate logic before arriving at the conclusion.',
        'It automatically doubles the model context window.',
        'It turns the model into a deterministic compiler.'
      ],
      answerIndex: 1,
      explanation: 'LLMs calculate probabilities conditioned on prior tokens. Generating the intermediate steps first populates the context window with the facts needed to produce an accurate conclusion.'
    }
  },
  {
    id: 'mod-7',
    moduleNumber: 7,
    title: 'Prompting for Coding and Debugging',
    category: 'Domain-Specific',
    estimatedTime: '12 min',
    description: 'Write prompts that generate robust, production-ready code with complete types, error handling, unit tests, and minimal hallucinated dependencies.',
    objectives: [
      'Craft spec-driven programming prompts.',
      'Debug cryptic runtime exceptions with context grounding.',
      'Prevent hallucinations of non-existent libraries or deprecated API methods.'
    ],
    content: `### The Golden Rules of Coding Prompts

Modern LLMs write remarkable code, but without constraints, they tend to write toy snippets with missing error handling, invented libraries, or incomplete logic (e.g., \`// TODO: implement\`).

#### 1. Declare the Exact Environment Stack
Always specify:
- Language & version (e.g., Python 3.11, Node.js 20, TypeScript 5.4).
- Frameworks & libraries with versions (e.g., FastAPI, React 19, Pydantic v2).
- Prohibited packages (e.g., *"Do not install third-party libraries; use Node standard library \`node:crypto\`"*).

#### 2. Mandate Production Quality
Explicitly request:
- Comprehensive type annotations.
- Explicit error handling with custom exceptions.
- Unit tests covering happy path and edge cases (nulls, empty lists, network timeouts).

\`\`\`markdown
You are a Staff TypeScript Engineer. Implement a resilient exponential backoff retry utility function in TypeScript.

Requirements:
- Pure TypeScript, zero external dependencies.
- Accept an async callback, maxRetries, initialDelayMs, and a backoffFactor.
- Add comprehensive JSDoc comments.
- Include 3 Jest unit tests mocking timer advancement.
- Never use 'any'; provide generic typing <T>.
\`\`\``,
    examples: [
      {
        title: 'API Endpoint Implementation',
        weak: 'Write an endpoint to upload a profile picture.',
        improved: 'You are a Senior Backend Engineer. Write a production FastAPI endpoint in Python 3.11 to handle user avatar uploads. Requirements:\n1. Validate file extension (.png, .jpg, .webp) and max file size (5MB) before processing.\n2. Stream bytes asynchronously to prevent memory spikes.\n3. Return a standardized JSON response: { status: "success", avatarUrl: str, uploadTimestamp: int }.\n4. Handle and return appropriate HTTP 400 and 413 error responses.\n5. Write type hints for all parameters and return types.',
        explanation: 'Enforces file validation, security constraints (size checks), streaming performance, explicit error codes, and strict typing.'
      }
    ],
    quiz: {
      question: 'When prompting an LLM to generate code for an unfamiliar API, what is the best way to prevent hallucinated function names?',
      options: [
        'Ask the model to write code in C++ first and then translate it.',
        'Paste the relevant API signature / documentation excerpt directly into the prompt context and instruct the model to use only those methods.',
        'Increase the temperature to 1.5.',
        'Tell the model that hallucinating is illegal.'
      ],
      answerIndex: 1,
      explanation: 'Grounding the model with the exact API documentation excerpt provides the tokens in-context, preventing it from inventing plausible-sounding but non-existent methods.'
    }
  },
  {
    id: 'mod-8',
    moduleNumber: 8,
    title: 'Prompting for Research and Data Analysis',
    category: 'Domain-Specific',
    estimatedTime: '10 min',
    description: 'Extract insights from messy datasets, perform grounded document synthesis, and enforce strict citation rules to eliminate hallucinations.',
    objectives: [
      'Design anti-hallucination prompts with strict grounding directives.',
      'Instruct models to generate comparative matrices and synthesis tables.',
      'Direct data transformations (CSV to JSON, outlier identification).'
    ],
    content: `### The Grounding Doctrine: "Say I Don't Know"

The greatest risk in research prompting is **fluent hallucination**: when a model convincingly fabricates a statistic, author, or paper title.

To prevent this, enforce the **Closed-World Assumption**:
> *"Answer the question using ONLY the facts provided in the text below. If the text does not contain the answer, reply exactly with: 'Information not provided in source.' Do not extrapolate or incorporate outside knowledge."*

### Analytical Synthesis Patterns
When comparing multiple viewpoints or documents, instruct the model to construct a **Synthesis Matrix**:

\`\`\`markdown
Review the three analyst reports enclosed in <reports>.
Synthesize their perspectives into a comparison table:
Columns: [Firm | 2025 EPS Projection | Bull Thesis | Bear Risk | Target Price]
Below the table, write a 2-paragraph synthesis summarizing the single largest point of divergence among the analysts.
\`\`\``,
    examples: [
      {
        title: 'Financial Filing Summarization',
        weak: 'Summarize Apple quarterly report.',
        improved: 'You are a Wall Street Equity Research Analyst. Review the 10-Q excerpt in <filing>. Extract: (1) Services vs Products revenue breakdown with year-over-year percentage change, (2) Top 2 risk factors highlighted in Management Discussion, and (3) Capital expenditure trends. Base your analysis STRICTLY on the text provided. If a metric is omitted from the excerpt, state "Not disclosed in excerpt". Avoid speculation.',
        explanation: 'Restricts the scope to specific financial metrics, establishes a strict grounding guardrail, and provides a clear fallback for missing information.'
      }
    ],
    quiz: {
      question: 'What is the most effective instruction for preventing an LLM from fabricating answers during document review?',
      options: [
        'Tell the model to think twice before answering.',
        'Explicitly instruct the model to use only the provided context and specify a fallback phrase like "Information not present in source" if missing.',
        'Make the font bold in the prompt.',
        'Ask the model to provide a 5-star rating for each paragraph.'
      ],
      answerIndex: 1,
      explanation: 'Enforcing a closed-world prompt with an explicit fallback gives the model permission to admit missing information instead of generating hallucinated tokens.'
    }
  },
  {
    id: 'mod-9',
    moduleNumber: 9,
    title: 'Structured Outputs and Tool Use',
    category: 'Advanced Patterns',
    estimatedTime: '11 min',
    description: 'Bridge LLMs with real-world applications using JSON schemas, function calling signatures, and deterministic tool orchestration.',
    objectives: [
      'Understand how JSON mode and function calling operate under the hood.',
      'Author robust JSON schema definitions with enum constraints.',
      'Write prompts that act as dependable orchestrators for tool execution.'
    ],
    content: `### Transitioning from Text to APIs

In modern software development, LLMs do not just answer human questions; they power automated backends, agentic workflows, and integrations.

To make an LLM function like a software component, you must ensure its output conforms to strict schemas:
- **Enum values:** Restrict choices to a fixed set (e.g. \`status: "PENDING" | "APPROVED" | "REJECTED"\`).
- **Null handling:** Specify how empty states should be expressed.
- **Escape safety:** Ensure string quotes inside answers do not corrupt JSON validity.

#### Example: Tool Orchestration Prompt
\`\`\`markdown
You are an intelligent support dispatch agent. Analyze the customer inquiry.
Determine whether to trigger an automated action.

Available Tools:
1. 'refund_order': params: { orderId: string, amount: number, reason: string }
2. 'track_shipment': params: { trackingNumber: string }
3. 'escalate_to_human': params: { priority: "low" | "medium" | "urgent", summary: string }

Respond ONLY with a JSON object:
{
  "selectedTool": string or null,
  "parameters": object,
  "rationale": string
}
\`\`\``,
    examples: [
      {
        title: 'Customer Intent Router',
        weak: 'Read this email and tell me what department it should go to.',
        improved: 'Analyze the incoming support email below and route it to the appropriate department. Return your decision as a valid JSON object following this schema:\n{\n  "ticketId": "auto",\n  "department": "BILLING" | "TECHNICAL_SUPPORT" | "SALES" | "LEGAL",\n  "urgency": "LOW" | "NORMAL" | "HIGH",\n  "actionRequired": string,\n  "customerSentiment": "POSITIVE" | "NEUTRAL" | "ANGRY"\n}\nDo not include any prose commentary or markdown fences.',
        explanation: 'Defines strict enum values for department, urgency, and sentiment, making the LLM output directly consumable by an API router or message queue.'
      }
    ],
    quiz: {
      question: 'When designing a prompt for automated downstream JSON parsing, why should you specify enum constraints (e.g., "STATUS": "OPEN" | "CLOSED")?',
      options: [
        'To reduce disk space in the database.',
        'To constrain the model output to a known, validated finite set of tokens that your application logic expects.',
        'Because LLMs crash if they encounter unknown strings.',
        'To encrypt the JSON response.'
      ],
      answerIndex: 1,
      explanation: 'Without enum constraints, models might output "Done", "Resolved", "Finished", or "Completed" unpredictably, breaking downstream conditional logic.'
    }
  },
  {
    id: 'mod-10',
    moduleNumber: 10,
    title: 'Prompt Evaluation and Testing',
    category: 'Engineering & MLOps',
    estimatedTime: '13 min',
    description: 'Treat prompts like production code: build test suites, run red-teaming benchmarks, measure drift, and establish quantitative evaluation rubrics.',
    objectives: [
      'Apply the "Prompts as Code" paradigm with versioning and git tracking.',
      'Design test sets with diverse edge cases, adversarial inputs, and length variations.',
      'Implement LLM-as-a-Judge evaluation rubrics.'
    ],
    content: `### Prompts as Code (PaC)

In professional AI applications, prompts should never live as untracked strings scattered across backend code. They must be treated with the same engineering rigor as application software:
1. **Version Controlled:** Every prompt change is committed to Git with a descriptive PR.
2. **Automated Testing:** Run candidate prompts against a benchmark test suite of 50-100 inputs.
3. **Regression Detection:** Verify that fixing edge case A did not break baseline capability B.

#### The LLM-as-a-Judge Pattern
When evaluating generative tasks (like summarization, tone compliance, or reasoning), unit tests with simple substring assertions are insufficient. We use a secondary LLM with an explicit rubric:

\`\`\`markdown
You are an impartial evaluator assessing the accuracy of a generated technical summary.
Grade the candidate response against the reference facts on a 1-5 scale:
5: Completely accurate, zero hallucinations, captures all key facts.
4: Minor non-critical omissions, completely factually sound.
3: Contains ambiguous wording or minor unsupported claim.
2: Fails to capture core facts or contains noticeable hallucination.
1: Completely inaccurate or irrelevant.

Output your evaluation in JSON:
{ "score": integer, "rationale": string }
\`\`\``,
    examples: [
      {
        title: 'Prompt Regression Testing Rubric',
        weak: 'Check if this prompt is better than the old one.',
        improved: 'You are an AI Evaluation Engineer. Benchmark the candidate output against the baseline output for the given input prompt. Score both outputs on 3 criteria (1-10): (1) Instruction Fidelity, (2) Conciseness, (3) Tone Consistency. Conclude with a clear verdict: "CANDIDATE_BETTER", "BASELINE_BETTER", or "TIE", and provide a 2-sentence rationale highlighting the deciding factor.',
        explanation: 'Provides an objective multi-dimensional rubric with calibrated 1-10 scoring and a deterministic categorical verdict.'
      }
    ],
    quiz: {
      question: 'What is the primary advantage of maintaining an automated prompt evaluation test suite before deploying changes to production?',
      options: [
        'It allows you to bypass paying for API tokens.',
        'It detects prompt regression: ensuring that optimizing for a new edge case does not silently degrade performance on standard user inputs.',
        'It speeds up network latency by 50%.',
        'It converts Python prompts into C++ binaries.'
      ],
      answerIndex: 1,
      explanation: 'Just like unit tests in software engineering, a prompt test suite catches regressions where edits intended to fix one edge case inadvertently harm existing core behavior.'
    }
  }
];
