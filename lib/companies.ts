export interface InterviewRound {
  roundNumber: number;
  title: string;
  type: "HR" | "Technical" | "Coding" | "System Design" | "Product Management" | "FAANG Style (Strict)" | "Aptitude & Problem Solving";
  focus: string;
}

export interface CompanyConfig {
  id: string;
  name: string;
  category: "MAANG & Tech Giants" | "Indian Unicorns" | "Global IT & Service MNCs" | "FinTech & Banking" | "Custom / Other";
  badgeColor: string;
  tagline: string;
  focusAreas: string[];
  systemPromptInstruction: string;
  defaultInterviewType: "HR" | "Technical" | "Coding" | "System Design" | "Product Management" | "FAANG Style (Strict)" | "Aptitude & Problem Solving";
  interviewLoop: InterviewRound[];
}

export const TOP_COMPANIES: CompanyConfig[] = [
  // MAANG & Tech Giants
  {
    id: "google",
    name: "Google",
    category: "MAANG & Tech Giants",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
    tagline: "Focuses on Data Structures, System Scalability, Algorithmic Rigor, and Googlyness.",
    focusAreas: ["DSA & Complexity", "System Architecture & Scale", "Googlyness & Culture Fit", "Clean Abstractions"],
    defaultInterviewType: "Coding",
    interviewLoop: [
      { roundNumber: 1, title: "Online Assessment & DSA", type: "Coding", focus: "Data Structures & Time/Space Complexity" },
      { roundNumber: 2, title: "Technical Problem Solving", type: "Technical", focus: "Algorithmic Trade-offs & Edge Cases" },
      { roundNumber: 3, title: "Scalable System Design", type: "System Design", focus: "Global Scale & High Availability" },
      { roundNumber: 4, title: "Googlyness & Leadership", type: "HR", focus: "Collaboration, Ambiguity & Ethics" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Google
- QUESTION STYLE & FOCUS:
  1. Emphasize algorithmic efficiency, asymptotic analysis (Big-O time and space complexity), and edge cases.
  2. Ask open-ended technical questions that require trade-off analysis and scaling considerations.
  3. Include evaluation for "Googlyness": collaborative problem solving, intellectual humility, navigating ambiguity, and doing the right thing.
  4. Keep feedback focused on structural problem solving and clean code design.`
  },
  {
    id: "amazon",
    name: "Amazon",
    category: "MAANG & Tech Giants",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    tagline: "Evaluates candidates against Amazon's 16 Leadership Principles & STAR method.",
    focusAreas: ["Leadership Principles (Customer Obsession, Ownership)", "STAR Method", "System Design & LLD", "Scalability"],
    defaultInterviewType: "HR",
    interviewLoop: [
      { roundNumber: 1, title: "Online Coding Assessment", type: "Coding", focus: "Clean Code & Data Structures" },
      { roundNumber: 2, title: "Technical & Low-Level Design", type: "Technical", focus: "Object-Oriented Design & Trade-offs" },
      { roundNumber: 3, title: "Leadership Principles (STAR)", type: "HR", focus: "Customer Obsession, Ownership & Bias for Action" },
      { roundNumber: 4, title: "Bar Raiser Interview", type: "FAANG Style (Strict)", focus: "High Bar Deep-Dive & Cultural Standard" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Amazon
- QUESTION STYLE & FOCUS:
  1. Strongly anchor questions around Amazon's 16 Leadership Principles (especially Customer Obsession, Ownership, Bias for Action, Deliver Results, Dive Deep, Have Backbone; Disagree and Commit).
  2. Prompt the candidate to structure behavioral responses using the STAR method (Situation, Task, Action, Result).
  3. Probe deeply into technical trade-offs ("Why did you choose X over Y?", "What broke when traffic doubled?").`
  },
  {
    id: "microsoft",
    name: "Microsoft",
    category: "MAANG & Tech Giants",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    tagline: "Focuses on Growth Mindset, OOPs principles, System Architecture, and Collaboration.",
    focusAreas: ["Growth Mindset", "Object-Oriented Design", "Core CS & Algorithms", "System Architecture"],
    defaultInterviewType: "Technical",
    interviewLoop: [
      { roundNumber: 1, title: "Online Technical Assessment", type: "Coding", focus: "Algorithms & Logic" },
      { roundNumber: 2, title: "OOPs & Data Structures", type: "Technical", focus: "SOLID Principles & Clean Code" },
      { roundNumber: 3, title: "System Architecture", type: "System Design", focus: "Cloud & Scalable Components" },
      { roundNumber: 4, title: "As-If / Growth Mindset Round", type: "HR", focus: "Growth Mindset & Adaptation" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Microsoft
- QUESTION STYLE & FOCUS:
  1. Assess Growth Mindset: how the candidate learns from failures and adapts to new technologies.
  2. Test fundamental software engineering principles: Object-Oriented Programming (OOP), SOLID design, and data structures.
  3. Ask candidates to explain technical decisions clearly and handle feedback during problem-solving.`
  },
  {
    id: "meta",
    name: "Meta (Facebook)",
    category: "MAANG & Tech Giants",
    badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    tagline: "Emphasizes rapid problem-solving speed, clean execution, and large-scale systems.",
    focusAreas: ["Rapid Coding & Bug-free Execution", "Large-Scale Systems", "Product Architecture", "Move Fast Culture"],
    defaultInterviewType: "Coding",
    interviewLoop: [
      { roundNumber: 1, title: "Rapid Problem Solving", type: "Coding", focus: "Speed, Clean Execution & Edge Cases" },
      { roundNumber: 2, title: "Product System Architecture", type: "System Design", focus: "Billion User Scale & Low Latency" },
      { roundNumber: 3, title: "Behavioral & Cultural Alignment", type: "HR", focus: "Move Fast Culture & Impact" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Meta (Facebook)
- QUESTION STYLE & FOCUS:
  1. Prioritize speed, bug-free execution, and dry-running code thoroughly.
  2. Test candidate ability to break down complex problems into modular code fast.
  3. Evaluate system design for extreme scale (billions of users, low latency, distributed caching).`
  },
  {
    id: "apple",
    name: "Apple",
    category: "MAANG & Tech Giants",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    tagline: "Focuses on deep craftsmanship, low-level efficiency, attention to detail, and privacy.",
    focusAreas: ["Attention to Detail", "Performance & Memory Management", "User Privacy", "Deep Domain Knowledge"],
    defaultInterviewType: "Technical",
    interviewLoop: [
      { roundNumber: 1, title: "Core CS & Low-Level Efficiency", type: "Technical", focus: "Memory Management & Internals" },
      { roundNumber: 2, title: "Algorithms & Architecture", type: "Coding", focus: "Clean Abstractions & Optimization" },
      { roundNumber: 3, title: "Craftsmanship & Values Round", type: "HR", focus: "Attention to Detail & Privacy" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Apple
- QUESTION STYLE & FOCUS:
  1. Emphasize attention to detail, memory management, efficiency, and system internals.
  2. Test commitment to user privacy, high quality UI/UX craftsmanship, and robust software design.`
  },
  {
    id: "netflix",
    name: "Netflix",
    category: "MAANG & Tech Giants",
    badgeColor: "bg-red-600/10 text-red-600 border-red-600/20",
    tagline: "Focuses on Freedom & Responsibility, Senior-level System Design, and High Density Talent.",
    focusAreas: ["Freedom & Responsibility", "Distributed Systems", "Resilience & Chaos Engineering", "High Context"],
    defaultInterviewType: "System Design",
    interviewLoop: [
      { roundNumber: 1, title: "Senior System Architecture", type: "System Design", focus: "Microservices & Fault Tolerance" },
      { roundNumber: 2, title: "Resiliency & Chaos Engineering", type: "Technical", focus: "Caching & Latency Under Load" },
      { roundNumber: 3, title: "Culture Memo Deep-Dive", type: "HR", focus: "Freedom & Responsibility Memo" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Netflix
- QUESTION STYLE & FOCUS:
  1. Assess alignment with Netflix's Culture Memo: Freedom & Responsibility, High Performance, and Selflessness.
  2. Test deep knowledge of distributed microservices, fault tolerance, caching, and resiliency under heavy load.`
  },

  // Indian Tech & Unicorns
  {
    id: "flipkart",
    name: "Flipkart",
    category: "Indian Unicorns",
    badgeColor: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    tagline: "Focuses on Machine Coding, LLD (Low Level Design), and High Scale E-commerce.",
    focusAreas: ["Machine Coding Round", "Low-Level Design (LLD)", "Concurrency & Multi-threading", "E-commerce Scale"],
    defaultInterviewType: "Coding",
    interviewLoop: [
      { roundNumber: 1, title: "Machine Coding & LLD", type: "Coding", focus: "Design Patterns & Object Modeling" },
      { roundNumber: 2, title: "E-Commerce System Design", type: "System Design", focus: "Concurrency & Inventory Consistency" },
      { roundNumber: 3, title: "Engineering Manager Round", type: "HR", focus: "Problem Solving & Ownership" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Flipkart
- QUESTION STYLE & FOCUS:
  1. Emphasize Machine Coding & Low-Level Design (class design, design patterns like Factory, Singleton, Strategy).
  2. Ask practical scenarios about e-commerce operations, concurrency, locking, inventory management, and database consistency.`
  },
  {
    id: "swiggy",
    name: "Swiggy",
    category: "Indian Unicorns",
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    tagline: "Evaluates Hyper-local Logistics, Real-time Systems, and Practical Problem Solving.",
    focusAreas: ["Real-time Geo Systems", "Low-Level Design", "Data Structures", "Speed & Agility"],
    defaultInterviewType: "System Design",
    interviewLoop: [
      { roundNumber: 1, title: "Data Structures & LLD", type: "Coding", focus: "Clean OOPs & Data Structures" },
      { roundNumber: 2, title: "Real-time Hyper-local Systems", type: "System Design", focus: "Geospatial Indexing & Routing" },
      { roundNumber: 3, title: "Culture & Speed Discussion", type: "HR", focus: "Agility & Customer Focus" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Swiggy
- QUESTION STYLE & FOCUS:
  1. Focus on real-time routing, order dispatching algorithms, geospatial indexing, and dynamic surge pricing logic.
  2. Test LLD, OOPs, clean code principles, and handling high-concurrency peak orders.`
  },
  {
    id: "zomato",
    name: "Zomato",
    category: "Indian Unicorns",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    tagline: "Focuses on Product Sense, Scalable Microservices, and Customer Centricity.",
    focusAreas: ["Product & Tech Alignment", "System Design", "Problem Solving", "Customer First"],
    defaultInterviewType: "Product Management",
    interviewLoop: [
      { roundNumber: 1, title: "Product Intuition & Tech", type: "Product Management", focus: "User Experience & System Features" },
      { roundNumber: 2, title: "Microservices Architecture", type: "System Design", focus: "API Design & Push Notifications" },
      { roundNumber: 3, title: "Customer Centricity Discussion", type: "HR", focus: "Customer First Mindset" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Zomato
- QUESTION STYLE & FOCUS:
  1. Combine technical problem-solving with product intuition and user experience.
  2. Ask about API design, cache management, push notifications at scale, and resilience.`
  },
  {
    id: "razorpay",
    name: "Razorpay",
    category: "Indian Unicorns",
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    tagline: "Evaluates FinTech Reliability, Transaction Security, Idempotency, and Clean Code.",
    focusAreas: ["Transaction Idempotency", "System Reliability", "Security & Encryption", "Data Structures"],
    defaultInterviewType: "Coding",
    interviewLoop: [
      { roundNumber: 1, title: "Machine Coding & Idempotency", type: "Coding", focus: "Payment System Logic & Edge Cases" },
      { roundNumber: 2, title: "FinTech System Reliability", type: "System Design", focus: "ACID Properties & Webhook Security" },
      { roundNumber: 3, title: "Values & Culture Round", type: "HR", focus: "FinTech Ownership & Integrity" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Razorpay
- QUESTION STYLE & FOCUS:
  1. Emphasize payment system design, API idempotency, ACID properties, webhooks, and security.
  2. Test code quality, fault handling, and handling financial data integrity under network retries.`
  },
  {
    id: "uber",
    name: "Uber",
    category: "Global IT & Service MNCs",
    badgeColor: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
    tagline: "Focuses on Distributed Systems, Driver/Rider Matching Algorithms, and H3 Spatial Indexing.",
    focusAreas: ["Distributed Systems", "Geospatial Data Structures", "High Availability", "LLD / HLD"],
    defaultInterviewType: "System Design",
    interviewLoop: [
      { roundNumber: 1, title: "High Performance DSA", type: "Coding", focus: "Geospatial Data Structures" },
      { roundNumber: 2, title: "Distributed Matching Engine", type: "System Design", focus: "QuadTrees, H3 & Microsecond Latency" },
      { roundNumber: 3, title: "Engineering Leadership Round", type: "HR", focus: "Ownership & Technical Strategy" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Uber
- QUESTION STYLE & FOCUS:
  1. Focus heavily on distributed systems, QuadTrees/H3 spatial indexing, real-time tracking, and concurrency.
  2. Test candidate on designing fault-tolerant microservices with microsecond latency requirements.`
  },

  // Service & MNC IT Giants
  {
    id: "tcs",
    name: "TCS (Tata Consultancy Services)",
    category: "Global IT & Service MNCs",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    tagline: "Focuses on Core CS Fundamentals (OOPs, DBMS, SQL), Aptitude, and Adaptability.",
    focusAreas: ["Core CS Fundamentals", "OOPs & SQL Queries", "Software Engineering Concepts", "Client Readiness & Ethics"],
    defaultInterviewType: "Technical",
    interviewLoop: [
      { roundNumber: 1, title: "Core CS & SQL Fundamentals", type: "Technical", focus: "OOPs, DBMS & Joins" },
      { roundNumber: 2, title: "Programming & Debugging", type: "Coding", focus: "Logic & Code Correctness" },
      { roundNumber: 3, title: "HR & Client Readiness Discussion", type: "HR", focus: "Ethics, Adaptability & Communication" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: TCS (Tata Consultancy Services)
- QUESTION STYLE & FOCUS:
  1. Focus on core CS fundamentals: Object-Oriented Programming (Inheritance, Polymorphism), DBMS & SQL queries (Joins, Indexing), and Data Structures.
  2. Ask clear, structured technical questions and assess communication skills, willingness to learn new technologies, and professionalism.
  3. Include questions regarding software development life cycle (SDLC), Agile basics, and bug debugging.`
  },
  {
    id: "infosys",
    name: "Infosys",
    category: "Global IT & Service MNCs",
    badgeColor: "bg-blue-600/10 text-blue-600 border-blue-600/20",
    tagline: "Focuses on Logical Aptitude, Coding Basics, Data Structures, and Continuous Learning.",
    focusAreas: ["Logical Reasoning & Pseudocode", "Basic Data Structures", "Database Management", "Communication"],
    defaultInterviewType: "Technical",
    interviewLoop: [
      { roundNumber: 1, title: "Logical Pseudocode & Fundamentals", type: "Technical", focus: "Basic Data Structures & SQL" },
      { roundNumber: 2, title: "Coding & Exception Handling", type: "Coding", focus: "Array/String Manipulation" },
      { roundNumber: 3, title: "HR & Behavioral Discussion", type: "HR", focus: "Continuous Learning & Teamwork" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Infosys
- QUESTION STYLE & FOCUS:
  1. Focus on problem solving through clean logic, basic data structures (Arrays, Strings, HashMaps, Linked Lists), and SQL.
  2. Test understanding of core programming constructs, exception handling, and technical clarity.`
  },
  {
    id: "wipro",
    name: "Wipro",
    category: "Global IT & Service MNCs",
    badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    tagline: "Evaluates Problem Solving, Web Development Basics, Networking, and Behavioral Fit.",
    focusAreas: ["Web & Programming Basics", "Networking Fundamentals", "Communication Skills", "Teamwork"],
    defaultInterviewType: "Technical",
    interviewLoop: [
      { roundNumber: 1, title: "Web & Networking Fundamentals", type: "Technical", focus: "TCP/IP, HTTP & Web Concepts" },
      { roundNumber: 2, title: "Basic Programming & Logic", type: "Coding", focus: "Logic & Database Queries" },
      { roundNumber: 3, title: "HR Discussion", type: "HR", focus: "Communication & Flexibility" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Wipro
- QUESTION STYLE & FOCUS:
  1. Test core IT concepts, web technologies, networking principles (TCP/IP, HTTP), and SQL.
  2. Assess behavioral fit, adaptability to client domain requirements, and teamwork.`
  },
  {
    id: "accenture",
    name: "Accenture",
    category: "Global IT & Service MNCs",
    badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    tagline: "Focuses on Cloud Architecture, Agile Methodologies, Technical Communication, and Business Value.",
    focusAreas: ["Cloud & Technology Trends", "Agile & Project Execution", "Client Communication", "Problem Solving"],
    defaultInterviewType: "Technical",
    interviewLoop: [
      { roundNumber: 1, title: "Cloud & Tech Stacks", type: "Technical", focus: "DevOps & Microservices Basics" },
      { roundNumber: 2, title: "Agile Project Architecture", type: "System Design", focus: "Business Value & Architecture" },
      { roundNumber: 3, title: "Client Communication & HR", type: "HR", focus: "Structured Communication & Outcome Focus" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Accenture
- QUESTION STYLE & FOCUS:
  1. Evaluate candidate's ability to map technical solutions to business value and client outcomes.
  2. Test knowledge of modern tech stacks (Cloud, DevOps, Microservices) along with structured communication.`
  },

  // Finance & Banking
  {
    id: "goldman_sachs",
    name: "Goldman Sachs",
    category: "FinTech & Banking",
    badgeColor: "bg-sky-600/10 text-sky-600 border-sky-600/20",
    tagline: "Focuses on Rigorous Mathematics, Probability, Algorithms, and Low-Latency Financial Systems.",
    focusAreas: ["Complex Algorithms & Math", "Dynamic Programming", "Low-Latency Systems", "Analytical Thinking"],
    defaultInterviewType: "Coding",
    interviewLoop: [
      { roundNumber: 1, title: "Algorithms & Math Rigor", type: "Coding", focus: "Graphs & Dynamic Programming" },
      { roundNumber: 2, title: "Low-Latency Systems", type: "Technical", focus: "Memory Management & Performance" },
      { roundNumber: 3, title: "Analytical Culture Round", type: "HR", focus: "Numerical Rigor & Integrity" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: Goldman Sachs
- QUESTION STYLE & FOCUS:
  1. Present challenging mathematical, combinatorial, and algorithmic problems (Graphs, Dynamic Programming, Probability).
  2. Test analytical rigor, numerical precision, and understanding of efficient memory management.`
  },
  {
    id: "jp_morgan",
    name: "J.P. Morgan",
    category: "FinTech & Banking",
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    tagline: "Evaluates Enterprise Java/Python, Security, Data Integrity, and Code Quality.",
    focusAreas: ["Enterprise Architecture", "Security & Compliance", "Data Integrity & Concurrency", "Algorithms"],
    defaultInterviewType: "Technical",
    interviewLoop: [
      { roundNumber: 1, title: "Enterprise Core CS", type: "Technical", focus: "Multi-threading & Concurrency" },
      { roundNumber: 2, title: "Security & Architecture", type: "System Design", focus: "Secure Enterprise Architecture" },
      { roundNumber: 3, title: "Behavioral Discussion", type: "HR", focus: "Compliance & Structured Communication" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: J.P. Morgan
- QUESTION STYLE & FOCUS:
  1. Focus on robust enterprise backend architecture, multi-threading, memory leaks, and secure code practices.
  2. Evaluate structured problem solving, code readability, and resilience under scale.`
  }
];

export function getCompanyProfile(companyName?: string | null): CompanyConfig {
  if (!companyName || !companyName.trim()) {
    return {
      id: "generic",
      name: "General Tech Standard",
      category: "Custom / Other",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      tagline: "Standard technical and behavioral evaluation aligned with industry best practices.",
      focusAreas: ["Core Problem Solving", "System Design & Architecture", "Clean Code & Best Practices", "Behavioral Fit"],
      defaultInterviewType: "Technical",
      interviewLoop: [
        { roundNumber: 1, title: "Technical Fundamentals", type: "Technical", focus: "Core Problem Solving" },
        { roundNumber: 2, title: "Coding & Logic", type: "Coding", focus: "Clean Code & Algorithms" },
        { roundNumber: 3, title: "HR & Culture Fit", type: "HR", focus: "Behavioral Alignment" }
      ],
      systemPromptInstruction: `
- TARGET COMPANY: Standard Industry Practice
- QUESTION STYLE & FOCUS:
  1. Conduct a balanced evaluation assessing core technical competencies, problem-solving ability, and communication skills.
  2. Provide constructive feedback aligned with modern industry expectations.`
    };
  }

  const cleanName = companyName.trim();
  const matched = TOP_COMPANIES.find(
    c => c.name.toLowerCase() === cleanName.toLowerCase() || c.id === cleanName.toLowerCase()
  );

  if (matched) return matched;

  // Custom company specified by candidate
  return {
    id: cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    name: cleanName,
    category: "Custom / Other",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    tagline: `Tailored interview practice specifically aligned with ${cleanName}'s role requirements and expectations.`,
    focusAreas: ["Role Specific Concepts", "Custom Company Requirements", "Problem Solving", "Cultural Alignment"],
    defaultInterviewType: "Technical",
    interviewLoop: [
      { roundNumber: 1, title: `${cleanName} Technical Round`, type: "Technical", focus: "Role Specific Concepts" },
      { roundNumber: 2, title: `${cleanName} Coding Round`, type: "Coding", focus: "Practical Problem Solving" },
      { roundNumber: 3, title: `${cleanName} HR Discussion`, type: "HR", focus: "Cultural Alignment" }
    ],
    systemPromptInstruction: `
- TARGET COMPANY: ${cleanName}
- QUESTION STYLE & FOCUS:
  1. Adapt questions to mirror the core expectations, domain, and interview standards typical of ${cleanName}.
  2. Challenge the candidate on technical depth, domain knowledge, and behavioral alignment relevant to ${cleanName}.`
  };
}
