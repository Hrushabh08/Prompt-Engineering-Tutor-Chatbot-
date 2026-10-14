import { PromptTemplate } from '../types';

export const CURATED_PROMPTS: PromptTemplate[] = [
  // CODING
  {
    id: 'lib-code-1',
    title: 'Senior Code Review & Vulnerability Audit',
    category: 'Coding',
    difficulty: 'Advanced',
    tags: ['code-review', 'security', 'performance', 'typescript'],
    description: 'Perform a rigorous, security-first code audit checking for memory leaks, race conditions, edge cases, and performance bottlenecks.',
    prompt: `You are a Principal Software Engineer and Application Security Auditor.
Review the following code snippet enclosed in <code_to_review>.

<code_to_review>
[INSERT_CODE_HERE]
</code_to_review>

Perform your review across these four prioritized dimensions:
1. Security & Vulnerabilities (e.g., injection, unsanitized inputs, auth bypass, race conditions)
2. Performance & Algorithmic Complexity (time & memory allocations)
3. Edge Cases & Error Handling (null values, unhandled promise rejections, boundary checks)
4. Readability, Maintainability & Type Safety

Output Format:
- Summary Table: [Severity: High/Med/Low | Location/Line | Issue Description | Mitigation]
- Detailed Explanations & Refactored Snippets for each High or Medium severity finding.
- Conclude with a clean, fully refactored drop-in replacement snippet.`
  },
  {
    id: 'lib-code-2',
    title: 'Automated Unit Test Suite Generator (Jest / PyTest)',
    category: 'Coding',
    difficulty: 'Intermediate',
    tags: ['testing', 'unit-tests', 'tdd', 'jest'],
    description: 'Generate a comprehensive unit test suite covering happy paths, edge cases, exceptions, and boundary values.',
    prompt: `You are a Senior QA Automation Engineer.
Write a comprehensive suite of unit tests for the following implementation:

<implementation>
[INSERT_FUNCTION_OR_CLASS]
</implementation>

Test Framework: [Jest / PyTest / Vitest]
Language / Environment: [TypeScript / Python / Go]

Requirements:
1. Test Coverage:
   - Happy Path: Standard expected inputs and outputs.
   - Boundary Cases: Min, max, zero, empty collections, very large inputs.
   - Negative / Error Cases: Invalid data types, null/undefined, network timeouts, thrown custom errors.
2. Structure tests using AAA pattern (Arrange, Act, Assert).
3. Mock any external network, disk, or database dependencies cleanly.
4. Add clear test descriptions explaining the invariant being verified.`
  },
  {
    id: 'lib-code-3',
    title: 'SQL Query Optimizer & Indexing Advisor',
    category: 'Coding',
    difficulty: 'Intermediate',
    tags: ['sql', 'database', 'performance', 'optimization'],
    description: 'Diagnose slow SQL queries, explain execution plans, and recommend composite indexes.',
    prompt: `You are a Principal Database Administrator specializing in PostgreSQL / MySQL optimization.
Analyze the following query and table schema:

<table_schema>
[INSERT_CREATE_TABLE_OR_SCHEMA]
</table_schema>

<slow_query>
[INSERT_SQL_QUERY]
</slow_query>

Task:
1. Identify performance bottlenecks (e.g., full table scans, Cartesian joins, unindexed foreign keys, suboptimal WHERE clauses).
2. Rewrite the query for maximum efficiency.
3. Recommend exact DDL statements for required indexes (including composite or partial indexes if appropriate).
4. Provide estimated EXPLAIN ANALYZE comparison notes explaining why the refactored query runs faster.`
  },

  // LEARNING
  {
    id: 'lib-learn-1',
    title: 'Feynman Technique Deep Concept Explainer',
    category: 'Learning',
    difficulty: 'Beginner',
    tags: ['feynman-technique', 'education', 'mental-models'],
    description: 'Deconstruct complex scientific, mathematical, or technical concepts into plain language with real-world analogies.',
    prompt: `You are a master educator who uses the Feynman Technique to make complex ideas intuitively obvious.
Topic to explain: [INSERT_TOPIC, e.g. Quantum Entanglement, Zero-Knowledge Proofs, Attention Mechanism in Transformers]
Target Audience: [e.g. Curious high school student / Non-technical product manager]

Instructions:
1. Core Idea in One Sentence: State the fundamental intuition without jargon.
2. The Everyday Analogy: Compare the concept to a familiar physical or everyday phenomenon.
3. Step-by-Step Breakdown: Walk through how it works in 3 intuitive steps.
4. Why People Get Confused: Highlight the most common misconception and clarify it.
5. Interactive Check: Provide a 1-question scenario to test if the listener truly understood the core mechanic.`
  },
  {
    id: 'lib-learn-2',
    title: 'Socratic Tutor & Diagnostic Coach',
    category: 'Learning',
    difficulty: 'Intermediate',
    tags: ['socratic', 'tutoring', 'active-learning'],
    description: 'Guide the learner to discover the answer themselves through targeted Socratic questioning rather than giving away solutions.',
    prompt: `You are a patient Socratic Tutor specializing in [INSERT_SUBJECT, e.g., Calculus, Computer Systems, Microeconomics].
My current problem / question: [INSERT_PROBLEM_HERE]

Rules of Engagement:
1. Never give me the final answer directly.
2. Ask me ONE targeted question at a time to lead me toward discovering the next logical deduction.
3. If my answer is correct, validate my reasoning and pose the subsequent question.
4. If my answer contains a misconception, do not criticize; ask a gentle question highlighting the contradiction.
5. Wait for my response before proceeding.

Begin by asking me to define the first fundamental premise of the problem.`
  },

  // WRITING
  {
    id: 'lib-write-1',
    title: 'Executive Ghostwriter & Thought Leadership Post',
    category: 'Writing',
    difficulty: 'Intermediate',
    tags: ['linkedin', 'thought-leadership', 'copywriting'],
    description: 'Transform rough notes or project learnings into an engaging, authoritative LinkedIn thought leadership post.',
    prompt: `You are an elite ghostwriter for Fortune 500 technology executives and startup founders.
Transform the following rough project insights into an engaging LinkedIn thought leadership post:

<raw_notes>
[INSERT_YOUR_BULLET_POINTS_OR_CASE_STUDY]
</raw_notes>

Guidelines:
- Hook: Open with a bold, counter-intuitive insight that stops the scroll (no generic questions like "Did you know?").
- Narrative Arc: Context -> Tension / Conventional Mistake -> The Discovery -> 3 Concrete Lessons.
- Formatting: Short, punchy paragraphs with whitespace. No emojis overdose (max 2-3 intentional ones).
- Voice: Authoritative, pragmatic, humble, and practitioner-oriented.
- Call to Action: End with an open-ended question that sparks peer-to-peer discussion among senior professionals.`
  },
  {
    id: 'lib-write-2',
    title: 'Cold Outreach Email with High Conversion Rate',
    category: 'Writing',
    difficulty: 'Intermediate',
    tags: ['sales', 'b2b', 'outreach', 'email'],
    description: 'Draft hyper-personalized, value-first cold emails that respect the prospect’s time and avoid spam triggers.',
    prompt: `You are a B2B SaaS Sales Strategist specializing in hyper-targeted outbound emails.
Target Prospect Role: [e.g. VP of Engineering]
Company Profile: [e.g. Mid-market fintech undergoing rapid scaling]
Our Value Proposition: [INSERT_VALUE_PROP, e.g. We reduce CI/CD build times by 65%]
Trigger Event / Context: [e.g. They recently posted job openings for 15 backend engineers]

Constraints:
1. Maximum 110 words total.
2. Sentence 1 must cite the specific trigger event (proves research).
3. Sentence 2-3 articulates the acute problem without being insulting.
4. Sentence 4 provides one concrete social proof metric.
5. Call to Action: Low-friction ask (e.g., "Worth a 3-minute video?" rather than "Can we book 30 minutes on Tuesday?").
6. Zero generic marketing clichés (e.g., "I hope this email finds you well").`
  },

  // BUSINESS
  {
    id: 'lib-biz-1',
    title: 'Competitive Strategy & Moat Teardown',
    category: 'Business',
    difficulty: 'Advanced',
    tags: ['strategy', 'moats', 'market-analysis', 'swot'],
    description: 'Conduct a 7 Powers competitive moat teardown comparing your product against entrenched market leaders.',
    prompt: `You are a Senior Technology Strategy Consultant (McKinsey / BCG alumnus).
Analyze the competitive positioning of [YOUR_PRODUCT_NAME] against [KEY_COMPETITOR].

Product Overview:
[INSERT_BRIEF_PRODUCT_DESCRIPTION]

Perform a structured analysis using Hamilton Helmer's "7 Powers" Framework:
1. Scale Economies
2. Network Effects
3. Counter-Positioning
4. Switching Costs
5. Branding
6. Cornered Resource
7. Process Power

For each power:
- Evaluate whether [YOUR_PRODUCT] currently possesses or could realistically develop this power (Rating: None, Emerging, Defensible).
- Provide a concrete strategic initiative to expand this moat over the next 18 months.
- Conclude with the #1 existential vulnerability competitor [KEY_COMPETITOR] can exploit against you.`
  },
  {
    id: 'lib-biz-2',
    title: 'Product Requirements Document (PRD) Generator',
    category: 'Business',
    difficulty: 'Advanced',
    tags: ['product-management', 'prd', 'specifications', 'agile'],
    description: 'Generate an exhaustive, engineering-ready PRD with user stories, acceptance criteria, and edge cases.',
    prompt: `You are a Principal Product Manager at a high-velocity tech enterprise.
Write a comprehensive, engineering-ready Product Requirements Document (PRD) for the following feature:

Feature Concept: [INSERT_FEATURE_IDEA]
Target Users: [INSERT_PRIMARY_USER_PERSONA]
Business Goal: [INSERT_KEY_METRIC_OR_KPI]

PRD Sections to Generate:
1. Problem Statement & User Pain Points
2. Goals & Explicit Non-Goals (Out of Scope for v1)
3. User Personas & Core Workflows
4. Functional Requirements (Categorized as P0 Must-Have, P1 Should-Have, P2 Nice-to-Have)
5. User Stories with Gherkin Acceptance Criteria (Given... When... Then...)
6. Edge Cases, Failure States, and Offline Scenarios
7. Telemetry & Success Metrics (Leading and Lagging KPIs)`
  },

  // DATA ANALYSIS
  {
    id: 'lib-data-1',
    title: 'Exploratory Data Analysis (EDA) & Python Scripting',
    category: 'Data Analysis',
    difficulty: 'Intermediate',
    tags: ['python', 'pandas', 'eda', 'visualization'],
    description: 'Generate an end-to-end Python script using Pandas, Seaborn, and Scipy for automated data auditing.',
    prompt: `You are a Lead Data Scientist.
Write a Python exploratory data analysis script for the dataset described below:

<dataset_description>
[INSERT_COLUMNS_AND_SAMPLE_ROWS_OR_SCHEMA]
</dataset_description>

Script Requirements:
1. Missing Value & Anomaly Audit: Detect null percentages, duplicate records, and negative values in non-negative columns.
2. Distribution & Outlier Detection: Calculate IQR fences and Z-scores for numerical columns.
3. Correlation Analysis: Generate a correlation matrix heatmap highlighting multicollinearity (|r| > 0.8).
4. Automated Insights: Output the top 3 actionable business patterns identified from the data distributions.
5. Use modern Pandas 2.x and Seaborn syntax with clear inline comments.`
  },
  {
    id: 'lib-data-2',
    title: 'Customer Churn Root Cause Detective',
    category: 'Data Analysis',
    difficulty: 'Advanced',
    tags: ['churn', 'metrics', 'retention', 'cohort-analysis'],
    description: 'Investigate drop-offs in customer retention cohorts and formulate testable behavioral hypotheses.',
    prompt: `You are a Senior Product Analytics Specialist.
Review the monthly retention cohort metrics below:

<cohort_table>
[INSERT_COHORT_RETENTION_DATA]
</cohort_table>

Deliverables:
1. Anomaly Identification: Which specific cohorts exhibit statistically abnormal drop-offs at Month 2 vs Month 6?
2. 3 Hypotheses: Propose 3 distinct potential drivers (Product UX friction, pricing tier transition, marketing acquisition channel shift).
3. Diagnostic Telemetry Plan: What exact product event instrumentation (event triggers, user properties) should we query to prove or disprove each hypothesis?
4. Recommended Immediate Retention Experiment: Design a 14-day A/B test targeting the high-churn cohort segment.`
  },

  // RESEARCH
  {
    id: 'lib-res-1',
    title: 'Academic Literature Matrix & Gap Analysis',
    category: 'Research',
    difficulty: 'Advanced',
    tags: ['literature-review', 'academic', 'synthesis', 'research'],
    description: 'Synthesize multiple research papers into an evidence matrix and identify unexplored research gaps.',
    prompt: `You are an Academic Research Director in [FIELD, e.g. Natural Language Processing / Oncology].
Review the summaries or abstracts of the research studies below:

<studies>
[INSERT_ABSTRACTS_OR_SUMMARIES]
</studies>

Deliverables:
1. Synthesis Matrix Table: [Study (Author/Year) | Methodology | Sample Size / Dataset | Key Findings | Methodological Limitations]
2. Thematic Consensus: What findings are uniformly agreed upon across all papers?
3. Contradictions & Divergences: Where do the authors' empirical findings or conclusions conflict?
4. Unexplored Research Gap: Identify the single most promising, unanswered research question that none of these studies addressed.`
  },
  {
    id: 'lib-res-2',
    title: 'Strict Grounded Document Q&A (Anti-Hallucination)',
    category: 'Research',
    difficulty: 'Beginner',
    tags: ['grounding', 'anti-hallucination', 'rag', 'compliance'],
    description: 'Answer complex inquiries strictly using provided source documentation with zero external speculation.',
    prompt: `You are a Compliance and Factual Verification Auditor.
Answer the question below using STRICTLY and ONLY the provided source document.

<source_document>
[INSERT_SOURCE_TEXT_HERE]
</source_document>

Question: [INSERT_QUESTION_HERE]

Strict Execution Rules:
1. Base your answer exclusively on the facts stated in the source document.
2. For every factual claim you make, quote the exact verbatim sentence from the source document inside quotation marks as evidence.
3. If the source document does not contain sufficient information to answer the question, output EXACTLY: "INSUFFICIENT_INFORMATION_IN_SOURCE: The provided document does not mention [missing concept]."
4. Never speculate, infer, or pull from external world knowledge.`
  },

  // PRODUCTIVITY
  {
    id: 'lib-prod-1',
    title: 'Prioritization Matrix (Eisenhower & RICE Hybrid)',
    category: 'Productivity',
    difficulty: 'Beginner',
    tags: ['prioritization', 'productivity', 'eisenhower', 'rice'],
    description: 'Sort overwhelming task backlogs into high-leverage priorities using impact vs effort scoring.',
    prompt: `You are an Executive Productivity Coach.
Analyze the following unstructured list of tasks, deadlines, and project commitments:

<task_dump>
[INSERT_BRAIN_DUMP_OF_TASKS]
</task_dump>

Tasks:
1. Categorize each item into the Eisenhower Matrix:
   - Quadrant 1: Urgent & Important (Do first today)
   - Quadrant 2: Not Urgent but Highly Strategic / Important (Schedule dedicated deep work blocks)
   - Quadrant 3: Urgent but Low Strategic Value (Delegate or automate)
   - Quadrant 4: Neither Urgent nor Important (Eliminate)
2. For Quadrant 2 items, calculate a quick RICE score (Reach, Impact, Confidence, Effort).
3. Outline a realistic, time-blocked daily calendar schedule for tomorrow featuring 2 dedicated 90-minute deep work blocks.`
  },
  {
    id: 'lib-prod-2',
    title: 'Action-Oriented Meeting Minutes Extractor',
    category: 'Productivity',
    difficulty: 'Beginner',
    tags: ['meetings', 'action-items', 'summaries'],
    description: 'Convert messy audio transcripts into clean, decision-oriented meeting minutes with clear owners.',
    prompt: `You are a Chief of Staff.
Review the meeting transcript below and distill it into crisp, executive meeting minutes:

<transcript>
[INSERT_MEETING_TRANSCRIPT]
</transcript>

Output Format:
1. Meeting Objective: 1 sentence.
2. Key Decisions Made: Bullet list of finalized agreements (no debate recap).
3. Open Questions & Blockers: Unresolved topics needing follow-up.
4. Action Items Table:
   [Owner | Action Item | Target Due Date | Dependencies]
Do not include conversational banter, weather remarks, or introductory small talk.`
  },

  // IMAGE GENERATION
  {
    id: 'lib-img-1',
    title: 'Midjourney / DALL-E Photorealistic Prompt Architect',
    category: 'Image Generation',
    difficulty: 'Intermediate',
    tags: ['midjourney', 'dall-e', 'image-generation', 'cinematography'],
    description: 'Engineer high-detail visual prompts specifying lighting, lens, camera gear, and stylistic modifiers.',
    prompt: `You are a Master Visual Prompt Engineer and Commercial Cinematographer.
Transform the following rough image concept into 3 ultra-detailed prompts for Midjourney v6 and DALL-E 3:

Concept: [INSERT_IMAGE_IDEA, e.g. A cybernetic botanist examining glowing moss in an underground Tokyo laboratory]

For each variation, specify:
1. Subject & Attire: Precise physical descriptions, textures, and posture.
2. Environment & Depth: Foreground, midground, and background architectural elements.
3. Lighting & Palette: Lighting style (e.g., volumetric god rays, Rembrandt lighting, moody neon rim light, Kelvin color temperature).
4. Camera & Film Stock: Camera model (e.g. Hasselblad H6D-100c, ARRI Alexa Mini LF), lens focal length (e.g., 35mm f/1.4 anamorphic), depth of field, and film grain.
5. Exact ready-to-paste prompt with Midjourney parameters (e.g., --ar 16:9 --style raw --v 6.0).`
  }
];
