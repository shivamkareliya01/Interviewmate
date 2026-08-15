export interface Branch {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
  category: "Engineering" | "Management & General";
}

export interface Domain {
  id: string;
  name: string;
  branchId: string;
  questionCount: number;
  description: string;
}

export interface SessionConfig {
  branchId: string;
  branchName: string;
  domainId: string;
  domainName: string;
  difficulty: "Easy" | "Moderate" | "Difficult";
  savedAt: string;
}

export const BRANCHES: Branch[] = [
  // Engineering Branches
  {
    id: "cse",
    code: "CSE",
    name: "Computer Science & Engineering",
    description: "DSA, OOPs, DBMS, OS, System Design, and software engineering",
    iconName: "Laptop",
    category: "Engineering",
  },
  {
    id: "it",
    code: "IT",
    name: "Information Technology",
    description: "Web dev, cloud, databases, networks, and software applications",
    iconName: "Globe",
    category: "Engineering",
  },
  {
    id: "ece",
    code: "ECE",
    name: "Electronics & Communication",
    description: "Digital circuits, microprocessors, signals, VLSI, & embedded systems",
    iconName: "Cpu",
    category: "Engineering",
  },
  {
    id: "eee",
    code: "EEE",
    name: "Electrical & Electronics",
    description: "Power grids, control systems, electric machines, & power electronics",
    iconName: "Zap",
    category: "Engineering",
  },
  {
    id: "me",
    code: "ME",
    name: "Mechanical Engineering",
    description: "Thermodynamics, fluid mechanics, CAD/CAM, & machine design",
    iconName: "Wrench",
    category: "Engineering",
  },
  {
    id: "ce",
    code: "CE",
    name: "Civil Engineering",
    description: "Structural analysis, geotechnical, surveying, & hydraulics",
    iconName: "Building2",
    category: "Engineering",
  },
  {
    id: "chemical",
    code: "Chemical",
    name: "Chemical Engineering",
    description: "Process engineering, mass transfer, reaction kinetics, & thermo",
    iconName: "FlaskConical",
    category: "Engineering",
  },
  {
    id: "aerospace",
    code: "Aerospace",
    name: "Aerospace Engineering",
    description: "Aerodynamics, propulsion, flight mechanics, & avionics",
    iconName: "Plane",
    category: "Engineering",
  },
  {
    id: "automobile",
    code: "Automobile",
    name: "Automobile Engineering",
    description: "IC engines, chassis design, EV powertrains, & vehicle dynamics",
    iconName: "Car",
    category: "Engineering",
  },
  {
    id: "instrumentation",
    code: "Instrumentation",
    name: "Instrumentation Engineering",
    description: "Sensory devices, industrial automation, PLC/SCADA, & control",
    iconName: "Gauge",
    category: "Engineering",
  },
  {
    id: "biotech",
    code: "Biotech",
    name: "Biotechnology",
    description: "Genetics, bioprocess engineering, bioinformatics, & microbiology",
    iconName: "Dna",
    category: "Engineering",
  },
  {
    id: "metallurgy",
    code: "Metallurgy",
    name: "Metallurgical Engineering",
    description: "Material science, extractive metallurgy, phase diagrams, & alloys",
    iconName: "Layers",
    category: "Engineering",
  },
  {
    id: "mining",
    code: "Mining",
    name: "Mining Engineering",
    description: "Rock mechanics, mine ventilation, mineral processing, & excavation",
    iconName: "Pickaxe",
    category: "Engineering",
  },
  {
    id: "agricultural",
    code: "Agri Engg",
    name: "Agricultural Engineering",
    description: "Farm machinery, soil-water engineering, & post-harvest tech",
    iconName: "Sprout",
    category: "Engineering",
  },

  // Non-Engineering & Management
  {
    id: "datascience",
    code: "Data Science",
    name: "Data Science (Standalone)",
    description: "Statistics, ML, Python for DS, data visualization, & SQL analytics",
    iconName: "BarChart3",
    category: "Management & General",
  },
  {
    id: "bca_mca",
    code: "BCA / MCA",
    name: "Computer Applications",
    description: "Programming, web development, database management, & software QA",
    iconName: "Code2",
    category: "Management & General",
  },
  {
    id: "mba",
    code: "MBA",
    name: "MBA / Management",
    description: "Marketing, finance, HR, business strategy, operations, & case studies",
    iconName: "Briefcase",
    category: "Management & General",
  },
  {
    id: "commerce",
    code: "Commerce",
    name: "Commerce & Finance",
    description: "Financial accounting, economics, taxation basics, & business law",
    iconName: "Coins",
    category: "Management & General",
  },
];

export const DOMAINS_BY_BRANCH: Record<string, Domain[]> = {
  cse: [
    { id: "dsa", name: "Data Structures & Algorithms (DSA)", branchId: "cse", questionCount: 42, description: "Arrays, trees, graphs, dynamic programming, and sorting" },
    { id: "oops", name: "Object-Oriented Programming (OOPs)", branchId: "cse", questionCount: 35, description: "Inheritance, polymorphism, encapsulation, and design patterns" },
    { id: "dbms", name: "Database Management Systems (DBMS)", branchId: "cse", questionCount: 30, description: "SQL queries, indexing, ACID transactions, and normalization" },
    { id: "os", name: "Operating Systems (OS)", branchId: "cse", questionCount: 28, description: "Process scheduling, deadlocks, virtual memory, and threads" },
    { id: "cn", name: "Computer Networks (CN)", branchId: "cse", questionCount: 25, description: "OSI model, TCP/IP, DNS, HTTP, and socket programming" },
    { id: "system_design", name: "System Design & Scalability", branchId: "cse", questionCount: 20, description: "Load balancing, caching, microservices, and sharding" },
    { id: "web_dev", name: "Web Development (HTML/CSS/JS)", branchId: "cse", questionCount: 32, description: "DOM manipulation, ES6+, async/await, and CSS layouts" },
    { id: "react", name: "React.js Architecture", branchId: "cse", questionCount: 35, description: "Hooks, state management, Virtual DOM, and optimization" },
    { id: "nodejs", name: "Node.js & Backend Systems", branchId: "cse", questionCount: 28, description: "Event loop, REST/gRPC APIs, Express, and async I/O" },
    { id: "python", name: "Python Programming", branchId: "cse", questionCount: 30, description: "Decorators, generators, data structures, and APIs" },
    { id: "java", name: "Java Programming", branchId: "cse", questionCount: 26, description: "JVM memory, multithreading, collections framework, and streams" },
    { id: "cpp", name: "C / C++ Programming", branchId: "cse", questionCount: 24, description: "Pointers, memory management, STL containers, and templates" },
    { id: "devops", name: "DevOps & Cloud (AWS/Docker)", branchId: "cse", questionCount: 18, description: "CI/CD pipelines, Docker containers, Kubernetes, and AWS" },
    { id: "ml", name: "Machine Learning Fundamentals", branchId: "cse", questionCount: 22, description: "Regression, classification, neural networks, and scikit-learn" },
    { id: "ai", name: "Artificial Intelligence", branchId: "cse", questionCount: 20, description: "LLMs, prompt engineering, search algorithms, and NLP" },
    { id: "cybersecurity", name: "Cybersecurity Fundamentals", branchId: "cse", questionCount: 16, description: "Cryptography, auth protocols, OWASP top 10, and ethical hacking" },
    { id: "qa", name: "Software Testing & QA", branchId: "cse", questionCount: 15, description: "Unit testing, integration testing, TDD, and Jest/Selenium" },
    { id: "aptitude", name: "Aptitude & Logical Reasoning", branchId: "cse", questionCount: 40, description: "Quantitative aptitude, puzzle solving, and data interpretation" },
    { id: "hr", name: "HR & Behavioral Interview", branchId: "cse", questionCount: 25, description: "STAR method, situational questions, and leadership principles" },
  ],
  it: [
    { id: "dsa", name: "Data Structures & Algorithms", branchId: "it", questionCount: 40, description: "Arrays, lists, searching, and sorting algorithms" },
    { id: "web_dev", name: "Full Stack Web Development", branchId: "it", questionCount: 35, description: "Frontend, backend APIs, and database integration" },
    { id: "dbms", name: "SQL & Relational Databases", branchId: "it", questionCount: 30, description: "Queries, joins, indexing, and schema design" },
    { id: "cloud", name: "Cloud Computing & AWS", branchId: "it", questionCount: 22, description: "EC2, S3, serverless Lambda, and IAM policies" },
    { id: "cybersec", name: "Information Security", branchId: "it", questionCount: 18, description: "Network security, encryption, and firewalls" },
  ],
  ece: [
    { id: "digital_elec", name: "Digital Electronics & Logic", branchId: "ece", questionCount: 25, description: "K-maps, flip-flops, multiplexers, and logic gates" },
    { id: "analog_elec", name: "Analog Electronics & Op-Amps", branchId: "ece", questionCount: 20, description: "BJT, MOSFET, operational amplifiers, and oscillators" },
    { id: "signals_systems", name: "Signals & Systems", branchId: "ece", questionCount: 22, description: "Fourier transform, Laplace, Z-transform, and filters" },
    { id: "microprocessors", name: "Microprocessors & Microcontrollers", branchId: "ece", questionCount: 20, description: "8085/8086, ARM architecture, and assembly language" },
    { id: "comm_systems", name: "Communication Systems", branchId: "ece", questionCount: 18, description: "AM/FM modulation, PCM, wireless comm, and 5G" },
    { id: "vlsi", name: "VLSI Design & Verilog", branchId: "ece", questionCount: 16, description: "CMOS logic, Verilog HDL, and FPGA synthesis" },
    { id: "embedded", name: "Embedded Systems & RTOS", branchId: "ece", questionCount: 18, description: "RTOS tasks, microcontrollers, UART/SPI/I2C protocols" },
    { id: "control_ece", name: "Control Systems", branchId: "ece", questionCount: 15, description: "Transfer functions, Bode plots, and stability analysis" },
    { id: "em_theory", name: "Electromagnetic Field Theory", branchId: "ece", questionCount: 14, description: "Maxwell's equations, wave propagation, and antennas" },
  ],
  eee: [
    { id: "circuit_theory", name: "Electric Circuit Analysis", branchId: "eee", questionCount: 25, description: "Network theorems, RLC transient response, and phasors" },
    { id: "power_systems", name: "Power Systems & Transmission", branchId: "eee", questionCount: 22, description: "Load flow, fault analysis, switchgear, and protection" },
    { id: "machines", name: "Electrical Machines (Transformers & Motors)", branchId: "eee", questionCount: 20, description: "DC motors, induction motors, and synchronous generators" },
    { id: "control_eee", name: "Control Systems Engineering", branchId: "eee", questionCount: 18, description: "Root locus, Nyquist criterion, and PID tuning" },
    { id: "power_elec", name: "Power Electronics & Inverters", branchId: "eee", questionCount: 16, description: "Thyristors, choppers, inverters, and PWM converters" },
    { id: "renewable", name: "Renewable Energy Systems", branchId: "eee", questionCount: 14, description: "Solar PV, wind energy conversion, and smart grids" },
  ],
  me: [
    { id: "thermo", name: "Thermodynamics & IC Engines", branchId: "me", questionCount: 25, description: "Carnot cycles, Otto/Diesel cycles, and laws of thermo" },
    { id: "fluid_mech", name: "Fluid Mechanics & Hydraulics", branchId: "me", questionCount: 22, description: "Bernoulli's theorem, Navier-Stokes, and turbines" },
    { id: "som", name: "Strength of Materials (SOM)", branchId: "me", questionCount: 20, description: "Stress-strain, bending moments, torsion, and Mohr circle" },
    { id: "mfg_proc", name: "Manufacturing Processes", branchId: "me", questionCount: 18, description: "Casting, welding, machining, and metal forming" },
    { id: "machine_design", name: "Machine Element Design", branchId: "me", questionCount: 16, description: "Gears, shafts, bearings, and fatigue design" },
    { id: "cad_cam", name: "CAD / CAM & Automation", branchId: "me", questionCount: 15, description: "3D modeling, CNC G-codes, and FEA simulation" },
    { id: "heat_transfer", name: "Heat Transfer", branchId: "me", questionCount: 18, description: "Conduction, convection, radiation, and heat exchangers" },
  ],
  ce: [
    { id: "structures", name: "Structural Analysis & RCC", branchId: "ce", questionCount: 22, description: "Trusses, moment distribution, and reinforced concrete" },
    { id: "geotech", name: "Geotechnical & Soil Mechanics", branchId: "ce", questionCount: 20, description: "Soil bearing capacity, slope stability, and compaction" },
    { id: "surveying", name: "Surveying & Levelling", branchId: "ce", questionCount: 18, description: "Theodolite, total station, GPS, and contouring" },
    { id: "const_mgmt", name: "Construction Materials & Management", branchId: "ce", questionCount: 16, description: "Concrete technology, CPM/PERT networks, and estimation" },
    { id: "fluid_ce", name: "Fluid Mechanics & Hydraulics", branchId: "ce", questionCount: 18, description: "Open channel flow, pipe flow, and hydrology" },
    { id: "transportation", name: "Transportation & Highway Engg", branchId: "ce", questionCount: 15, description: "Pavement design, traffic engineering, and geometric design" },
  ],
  chemical: [
    { id: "chem_process", name: "Chemical Process Calculations", branchId: "chemical", questionCount: 15, description: "Material & energy balances, stoichiometry" },
    { id: "mass_transfer", name: "Mass Transfer Operations", branchId: "chemical", questionCount: 14, description: "Distillation, absorption, extraction, and drying" },
    { id: "reaction_engg", name: "Chemical Reaction Engineering", branchId: "chemical", questionCount: 16, description: "Reactor design, kinetics, and catalysis" },
  ],
  aerospace: [
    { id: "aerodynamics", name: "Aerodynamics & Lift", branchId: "aerospace", questionCount: 15, description: "Airfoils, compressible flow, and shock waves" },
    { id: "propulsion", name: "Rocket & Jet Propulsion", branchId: "aerospace", questionCount: 14, description: "Gas turbine engines, nozzle flow, and thrust" },
  ],
  automobile: [
    { id: "auto_engines", name: "Automobile Powertrain & EV", branchId: "automobile", questionCount: 15, description: "IC engines, electric motors, and battery management" },
    { id: "chassis", name: "Chassis & Vehicle Dynamics", branchId: "automobile", questionCount: 14, description: "Suspension, steering, braking, and stability" },
  ],
  instrumentation: [
    { id: "sensors", name: "Sensors & Transducers", branchId: "instrumentation", questionCount: 15, description: "Temperature, pressure, flow, and strain measurements" },
    { id: "plc_scada", name: "PLC, SCADA & Industrial Automation", branchId: "instrumentation", questionCount: 14, description: "Ladder logic, DCS, and industrial protocols" },
  ],
  biotech: [
    { id: "genetics", name: "Genetics & Molecular Biology", branchId: "biotech", questionCount: 15, description: "DNA replication, gene expression, and recombinant DNA" },
    { id: "bioprocess", name: "Bioprocess Engineering", branchId: "biotech", questionCount: 14, description: "Fermentation, bioreactors, and downstream processing" },
  ],
  metallurgy: [
    { id: "mat_sci", name: "Material Science & Metallurgy", branchId: "metallurgy", questionCount: 15, description: "Crystal structures, phase diagrams, and heat treatment" },
  ],
  mining: [
    { id: "rock_mech", name: "Rock Mechanics & Mining Methods", branchId: "mining", questionCount: 14, description: "Underground mining, surface excavation, and blasting" },
  ],
  agricultural: [
    { id: "farm_power", name: "Farm Machinery & Power", branchId: "agricultural", questionCount: 14, description: "Tractors, tillage equipment, and irrigation systems" },
  ],
  datascience: [
    { id: "stats_prob", name: "Statistics & Probability", branchId: "datascience", questionCount: 30, description: "Hypothesis testing, Bayes theorem, distributions, and ANOVA" },
    { id: "python_ds", name: "Python for Data Science", branchId: "datascience", questionCount: 35, description: "Pandas, NumPy, data manipulation, and cleaning" },
    { id: "ml_ds", name: "Machine Learning Algorithms", branchId: "datascience", questionCount: 32, description: "Supervised/unsupervised models, tuning, and evaluation" },
    { id: "data_viz", name: "Data Visualization & Storytelling", branchId: "datascience", questionCount: 22, description: "Matplotlib, Seaborn, Tableau dashboard principles" },
    { id: "sql_ds", name: "SQL for Data Analytics", branchId: "datascience", questionCount: 28, description: "Window functions, CTEs, complex aggregations, and subqueries" },
  ],
  bca_mca: [
    { id: "dsa", name: "Data Structures & Algorithms", branchId: "bca_mca", questionCount: 35, description: "Core algorithms, searching, sorting, and recursion" },
    { id: "web_tech", name: "Web Technologies & JavaScript", branchId: "bca_mca", questionCount: 30, description: "HTML5, CSS3, ES6+, and DOM manipulation" },
    { id: "dbms", name: "Database Systems & SQL", branchId: "bca_mca", questionCount: 28, description: "Relational database concepts, normalization, and SQL queries" },
    { id: "software_engg", name: "Software Engineering & SDLC", branchId: "bca_mca", questionCount: 20, description: "Agile, Scrum, UML diagrams, and software testing" },
  ],
  mba: [
    { id: "marketing", name: "Marketing Fundamentals & 4Ps", branchId: "mba", questionCount: 25, description: "STP, branding, digital marketing, and consumer behavior" },
    { id: "finance_accounting", name: "Corporate Finance & Accounting", branchId: "mba", questionCount: 22, description: "Financial statements, DCF valuation, and capital budgeting" },
    { id: "hr_mgmt", name: "Human Resource Management", branchId: "mba", questionCount: 20, description: "Talent acquisition, performance appraisal, and org behavior" },
    { id: "ops_mgmt", name: "Operations & Supply Chain", branchId: "mba", questionCount: 20, description: "Inventory management, Six Sigma, and logistics" },
    { id: "biz_strategy", name: "Business Strategy & Frameworks", branchId: "mba", questionCount: 18, description: "SWOT, Porter's 5 forces, BCG matrix, and PESTEL" },
    { id: "case_studies", name: "Case Study & Guesstimates", branchId: "mba", questionCount: 25, description: "Market sizing, profitability frameworks, and structured thinking" },
  ],
  commerce: [
    { id: "fin_acct", name: "Financial Accounting & Auditing", branchId: "commerce", questionCount: 25, description: "Balance sheets, ledger entries, and audit standards" },
    { id: "economics", name: "Micro & Macro Economics", branchId: "commerce", questionCount: 22, description: "Demand/supply, inflation, GDP, and monetary policy" },
    { id: "taxation", name: "Taxation Basics (Direct & Indirect)", branchId: "commerce", questionCount: 18, description: "Income tax, GST, and corporate tax compliance" },
    { id: "biz_law", name: "Business & Company Law", branchId: "commerce", questionCount: 16, description: "Contract act, companies act, and corporate governance" },
  ],
};

const LAST_SESSION_KEY = "interviewmate_last_session_config";

export function saveLastSessionConfig(config: SessionConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(config));
}

export function getLastSessionConfig(): SessionConfig | null {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LAST_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
