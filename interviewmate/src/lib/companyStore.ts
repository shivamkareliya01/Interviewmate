import { getAllBankQuestions, type BankQuestion } from "./questionBank";

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  industry:
    | "Big Tech"
    | "IT Services & Consulting"
    | "E-Commerce & Delivery"
    | "Fintech & Payments"
    | "Core Engineering & Manufacturing"
    | "Electronics & Semiconductors"
    | "Civil & Infrastructure"
    | "Chemical & Energy"
    | "Biotech & Pharma"
    | "Agriculture & AgTech"
    | "Management & Consulting"
    | "Commerce, Banking & Finance";
  branchIds: string[]; // Associated branch IDs (e.g. ['me', 'automobile'], ['ece', 'eee'], ['cse'])
  description: string;
  typicalRounds: string[];
  difficultyReputation: "relaxed" | "moderate" | "rigorous";
  createdAt?: string;
}

export const SEEDED_COMPANIES: Company[] = [
  // BIG TECH (CSE, IT, BCA/MCA)
  {
    id: "google",
    name: "Google",
    industry: "Big Tech",
    branchIds: ["cse", "it", "bca_mca", "datascience"],
    description: "Global technology leader in search, cloud computing, AI systems, and consumer hardware.",
    typicalRounds: ["Online Assessment", "Technical Phone Screen", "Virtual Onsite (3 Tech Rounds)", "Googliness & Leadership"],
    difficultyReputation: "rigorous",
  },
  {
    id: "amazon",
    name: "Amazon",
    industry: "Big Tech",
    branchIds: ["cse", "it", "bca_mca", "datascience"],
    description: "E-commerce and cloud computing giant famous for Leadership Principles and scalable system design.",
    typicalRounds: ["Online Assessment (OA1 & OA2)", "Technical Interview 1", "Technical Interview 2", "Bar Raiser Round"],
    difficultyReputation: "rigorous",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    industry: "Big Tech",
    branchIds: ["cse", "it", "bca_mca", "datascience"],
    description: "Pioneer in operating systems, enterprise software, Azure cloud, and developer platforms.",
    typicalRounds: ["Online Coding Test", "Technical Screening", "System Design & Coding", "AA Round"],
    difficultyReputation: "rigorous",
  },
  {
    id: "meta",
    name: "Meta",
    industry: "Big Tech",
    branchIds: ["cse", "it", "datascience"],
    description: "Social technology pioneer behind Facebook, Instagram, WhatsApp, and AI infrastructure.",
    typicalRounds: ["Recruiter Screen", "Technical Screen (2 Coding)", "Virtual Onsite (2 Coding + 1 System Design)", "Behavioral"],
    difficultyReputation: "rigorous",
  },
  {
    id: "apple",
    name: "Apple",
    industry: "Big Tech",
    branchIds: ["cse", "it", "ece"],
    description: "Global consumer electronics innovator focused on iOS/macOS systems, hardware, and performance.",
    typicalRounds: ["Recruiter Call", "Technical Phone Screen", "Onsite Interviews (4-5 Technical Sessions)", "Manager Review"],
    difficultyReputation: "rigorous",
  },

  // IT SERVICES & CONSULTING (CSE, IT, BCA/MCA)
  {
    id: "tcs",
    name: "TCS (Tata Consultancy Services)",
    industry: "IT Services & Consulting",
    branchIds: ["cse", "it", "bca_mca", "ece", "eee"],
    description: "India's largest IT services provider hiring across TCS NQT, Digital, and Prime engineering tracks.",
    typicalRounds: ["TCS NQT (Aptitude + Coding)", "Technical Interview", "Managerial Interview", "HR Round"],
    difficultyReputation: "moderate",
  },
  {
    id: "infosys",
    name: "Infosys",
    industry: "IT Services & Consulting",
    branchIds: ["cse", "it", "bca_mca", "ece", "eee"],
    description: "Global leader in next-generation digital services, consulting, and HackWithInfy placement competitions.",
    typicalRounds: ["Online Aptitude & Coding", "Technical Round 1", "Power Programmer Coding", "HR Round"],
    difficultyReputation: "moderate",
  },
  {
    id: "zoho",
    name: "Zoho Corporation",
    industry: "IT Services & Consulting",
    branchIds: ["cse", "it", "bca_mca"],
    description: "SaaS software innovator famous for rigorous hands-on C/C++/Java coding rounds and system building.",
    typicalRounds: ["Written Aptitude & C Output", "Basic Programming Round", "Advanced Programming (4 Hours)", "Design & HR"],
    difficultyReputation: "rigorous",
  },

  // CORE ENGINEERING & MANUFACTURING (ME, AUTOMOBILE, AEROSPACE, METALLURGY, MINING)
  {
    id: "tata_motors",
    name: "Tata Motors",
    industry: "Core Engineering & Manufacturing",
    branchIds: ["me", "automobile", "metallurgy"],
    description: "Leading global automobile manufacturer pioneering commercial trucks, passenger cars, and EV powertrains.",
    typicalRounds: ["Aptitude & Mechanical Core Test", "Technical Interview 1 (Thermal & CAD)", "Machine Design & Project Round", "HR Round"],
    difficultyReputation: "rigorous",
  },
  {
    id: "mahindra",
    name: "Mahindra & Mahindra",
    industry: "Core Engineering & Manufacturing",
    branchIds: ["me", "automobile", "agricultural"],
    description: "Multinational automotive leader specializing in SUVs, commercial vehicles, and agricultural tractors.",
    typicalRounds: ["Written Technical Test", "Technical Domain Interview", "Automobile System Case Round", "HR Discussion"],
    difficultyReputation: "moderate",
  },
  {
    id: "l_and_t",
    name: "L&T (Larsen & Toubro)",
    industry: "Core Engineering & Manufacturing",
    branchIds: ["me", "ce", "eee", "instrumentation"],
    description: "Engineering and manufacturing conglomerate building heavy industrial plant equipment and EPC infrastructure.",
    typicalRounds: ["L&T BIS Written Test", "Core Engineering Technical Round", "Project Presentation", "HR Interview & Medical"],
    difficultyReputation: "rigorous",
  },
  {
    id: "siemens",
    name: "Siemens",
    industry: "Core Engineering & Manufacturing",
    branchIds: ["me", "ece", "eee", "instrumentation"],
    description: "Global industrial automation, electrification, and digital manufacturing software powerhouse.",
    typicalRounds: ["Online Technical Screening", "Automation & Control Round", "Technical Onsite Interview", "Leadership & HR"],
    difficultyReputation: "rigorous",
  },
  {
    id: "bhel",
    name: "BHEL (Bharat Heavy Electricals)",
    industry: "Core Engineering & Manufacturing",
    branchIds: ["me", "eee", "metallurgy"],
    description: "India's premier public-sector power equipment manufacturer constructing turbines and transformers.",
    typicalRounds: ["GATE Score / Written Exam", "Technical Subject Domain Round", "Board Interview", "Final HR Approval"],
    difficultyReputation: "moderate",
  },
  {
    id: "isro",
    name: "ISRO (Indian Space Research Organisation)",
    industry: "Core Engineering & Manufacturing",
    branchIds: ["aerospace", "me", "ece", "eee"],
    description: "India's space research agency designing launch vehicles, satellite payloads, and propulsion rockets.",
    typicalRounds: ["ISRO ICRB Written Test", "Domain Technical Interview (Aerodynamics/Propulsion)", "Scientists Board Panel Review"],
    difficultyReputation: "rigorous",
  },

  // ELECTRONICS & SEMICONDUCTORS (ECE, EEE, INSTRUMENTATION)
  {
    id: "bel",
    name: "BEL (Bharat Electronics Limited)",
    industry: "Electronics & Semiconductors",
    branchIds: ["ece", "eee", "instrumentation"],
    description: "Premier defense electronics aerospace company manufacturing radars, sonar, and EW systems.",
    typicalRounds: ["Written Technical Test", "Digital & Radar Systems Technical Round", "Panel Interview"],
    difficultyReputation: "moderate",
  },
  {
    id: "texas_instruments",
    name: "Texas Instruments",
    industry: "Electronics & Semiconductors",
    branchIds: ["ece", "eee"],
    description: "Global semiconductor pioneer designing analog circuits, embedded microcontrollers, and DSP processors.",
    typicalRounds: ["Online Circuits & Logic Test", "Analog / Digital Circuit Round 1", "Embedded Architecture Round 2", "HR"],
    difficultyReputation: "rigorous",
  },
  {
    id: "qualcomm",
    name: "Qualcomm",
    industry: "Electronics & Semiconductors",
    branchIds: ["ece", "cse", "it"],
    description: "Wireless technology leader pioneering Snapdragon SoCs, 5G modems, and mobile chipsets.",
    typicalRounds: ["Online Aptitude & C/VLSI Test", "Wireless & Logic Design Round", "Verilog/Hardware Deep Dive", "HR Round"],
    difficultyReputation: "rigorous",
  },
  {
    id: "intel",
    name: "Intel",
    industry: "Electronics & Semiconductors",
    branchIds: ["ece", "cse", "eee"],
    description: "World leader in processor architecture, x86 CPU microarchitecture, and silicon fabrication.",
    typicalRounds: ["Technical Screening", "Computer Architecture & Verilog", "Silicon Verification Round", "Managerial & HR"],
    difficultyReputation: "rigorous",
  },

  // CIVIL & INFRASTRUCTURE (CE)
  {
    id: "l_and_t_construction",
    name: "L&T Construction",
    industry: "Civil & Infrastructure",
    branchIds: ["ce"],
    description: "India's largest civil engineering contractor executing mega bridges, highways, metro rail, and skyscrapers.",
    typicalRounds: ["Civil Technical Written Test", "Structural & Soil Mechanics Interview", "Site Management Round", "HR Review"],
    difficultyReputation: "rigorous",
  },
  {
    id: "dlf",
    name: "DLF Limited",
    industry: "Civil & Infrastructure",
    branchIds: ["ce"],
    description: "Leading commercial and residential real estate development firm in India.",
    typicalRounds: ["Civil Engineering Assessment", "Project Estimation & Structural Round", "Management Discussion"],
    difficultyReputation: "moderate",
  },

  // CHEMICAL & ENERGY (CHEMICAL, MINING)
  {
    id: "reliance_industries",
    name: "Reliance Industries",
    industry: "Chemical & Energy",
    branchIds: ["chemical", "me", "mining"],
    description: "Energy and petrochemicals mega-conglomerate operating the world's largest refining complex in Jamnagar.",
    typicalRounds: ["Online Aptitude & Chemical Core Test", "Process Engineering Technical Interview", "Site Operations & HR"],
    difficultyReputation: "rigorous",
  },
  {
    id: "ongc",
    name: "ONGC",
    industry: "Chemical & Energy",
    branchIds: ["chemical", "me", "mining"],
    description: "India's flagship oil and natural gas exploration and production public sector enterprise.",
    typicalRounds: ["GATE Score Screening", "Technical Subject Interview (Mass Transfer/Thermodynamics)", "Executive Board Panel"],
    difficultyReputation: "moderate",
  },

  // BIOTECH & PHARMA (BIOTECH)
  {
    id: "biocon",
    name: "Biocon",
    industry: "Biotech & Pharma",
    branchIds: ["biotech", "chemical"],
    description: "Global biopharmaceuticals company producing recombinant insulins, monoclonal antibodies, and biosimilars.",
    typicalRounds: ["Bioprocess Technical Test", "Molecular Biology & Fermentation Round", "Quality Control & HR"],
    difficultyReputation: "rigorous",
  },
  {
    id: "serum_institute",
    name: "Serum Institute of India",
    industry: "Biotech & Pharma",
    branchIds: ["biotech"],
    description: "World's largest vaccine manufacturer by volume, producing lifesaving immunizations.",
    typicalRounds: ["Technical Screening", "Bioprocess Engineering Deep Dive", "HR & Compliance"],
    difficultyReputation: "moderate",
  },

  // AGRICULTURE (AGRICULTURAL)
  {
    id: "itc_agri",
    name: "ITC Agri Business",
    industry: "Agriculture & AgTech",
    branchIds: ["agricultural", "mba"],
    description: "Pioneer in agricultural commodity supply chains, e-Choupal digital farm network, and food tech.",
    typicalRounds: ["Agri Business Aptitude", "Farm Machinery & Post-Harvest Round", "Field Strategy & HR"],
    difficultyReputation: "moderate",
  },

  // MANAGEMENT & CONSULTING (MBA)
  {
    id: "mckinsey",
    name: "McKinsey & Company",
    industry: "Management & Consulting",
    branchIds: ["mba", "commerce"],
    description: "Premier global management consulting firm advising Fortune 500 CEOs on corporate strategy and operations.",
    typicalRounds: ["McKinsey Problem Solving Game (PSG)", "Case Interview 1 (Market Sizing)", "Case Interview 2 (Profitability)", "PEI Fit Round"],
    difficultyReputation: "rigorous",
  },
  {
    id: "bcg",
    name: "BCG (Boston Consulting Group)",
    industry: "Management & Consulting",
    branchIds: ["mba", "commerce"],
    description: "Leading strategy consulting firm famous for the BCG Growth-Share Matrix and business transformation.",
    typicalRounds: ["Online Case Assessment", "Interactive Case Round 1", "Senior Partner Case Round 2", "Behavioral Fit"],
    difficultyReputation: "rigorous",
  },
  {
    id: "deloitte",
    name: "Deloitte",
    industry: "Management & Consulting",
    branchIds: ["mba", "commerce", "cse", "it"],
    description: "Largest professional services network delivering business consulting, tech integration, and audit.",
    typicalRounds: ["Cognitive Aptitude & Guesstimate Test", "Group Case Discussion", "Technical/Business Case Interview", "HR Discussion"],
    difficultyReputation: "moderate",
  },

  // COMMERCE, BANKING & FINANCE (COMMERCE, MBA)
  {
    id: "hdfc_bank",
    name: "HDFC Bank",
    industry: "Commerce, Banking & Finance",
    branchIds: ["commerce", "mba"],
    description: "India's largest private sector bank delivering retail banking, corporate finance, and treasury management.",
    typicalRounds: ["Banking Aptitude & Financial Test", "Group Discussion", "Technical Finance Round", "HR Round"],
    difficultyReputation: "moderate",
  },
  {
    id: "goldman_sachs",
    name: "Goldman Sachs",
    industry: "Commerce, Banking & Finance",
    branchIds: ["commerce", "mba", "datascience", "cse"],
    description: "Global investment banking and financial services titan leading M&A advisory and quant trading.",
    typicalRounds: ["Math & Quant Aptitude OA", "Financial Modeling & Coding Round", "Superday Interviews (3 Rounds)", "Culture Fit"],
    difficultyReputation: "rigorous",
  },

  // E-COMMERCE & DELIVERY
  {
    id: "flipkart",
    name: "Flipkart",
    industry: "E-Commerce & Delivery",
    branchIds: ["cse", "it", "datascience", "bca_mca"],
    description: "India's leading e-commerce marketplace powering big billion day sales, logistics networks, and digital retail.",
    typicalRounds: ["OA (Machine Coding)", "Technical Round 1 (DS/Algo)", "Technical Round 2 (System Design)", "HM & Values"],
    difficultyReputation: "rigorous",
  },
  {
    id: "swiggy",
    name: "Swiggy",
    industry: "E-Commerce & Delivery",
    branchIds: ["cse", "it", "datascience"],
    description: "On-demand food delivery and quick-commerce pioneer connecting millions of users with local restaurants and Instamart dark stores.",
    typicalRounds: ["Online Assessment", "Low-Level Machine Design (2 Hours)", "High-Level System Design", "Culture & Leadership"],
    difficultyReputation: "rigorous",
  },
  {
    id: "zomato",
    name: "Zomato",
    industry: "E-Commerce & Delivery",
    branchIds: ["cse", "it", "datascience"],
    description: "Hyperlocal food ordering, restaurant discovery, and quick-commerce platform operating across India and global markets.",
    typicalRounds: ["Online Aptitude & Coding", "Technical Round 1 (DS & Algo)", "System Architecture & Database", "Culture & Leadership"],
    difficultyReputation: "rigorous",
  },
  {
    id: "blinkit",
    name: "Blinkit",
    industry: "E-Commerce & Delivery",
    branchIds: ["cse", "it", "datascience"],
    description: "10-minute quick-commerce leader delivering groceries and household essentials through dark store fulfillment networks.",
    typicalRounds: ["Machine Coding Round", "HLD System Design", "Engineering Values & Leadership"],
    difficultyReputation: "rigorous",
  },
  {
    id: "meesho",
    name: "Meesho",
    industry: "E-Commerce & Delivery",
    branchIds: ["cse", "it", "datascience", "commerce"],
    description: "Zero-commission social e-commerce platform empowering millions of small businesses and resellers across tier-2+ India.",
    typicalRounds: ["Online Coding Assessment", "Problem Solving & LLD", "HLD & Microservices", "Culture & Values Fit"],
    difficultyReputation: "moderate",
  },
  {
    id: "zepto",
    name: "Zepto",
    industry: "E-Commerce & Delivery",
    branchIds: ["cse", "it", "datascience"],
    description: "Rapidly growing quick-commerce startup executing 10-minute grocery fulfillment via micro-warehouses.",
    typicalRounds: ["Online Coding Screening", "Low-Level Machine Design", "High-Level Architecture", "Founders / VP Round"],
    difficultyReputation: "rigorous",
  },

  // FINTECH & PAYMENTS
  {
    id: "razorpay",
    name: "Razorpay",
    industry: "Fintech & Payments",
    branchIds: ["cse", "it", "datascience", "commerce"],
    description: "Leading full-stack financial services and payment gateway platform powering online checkouts, payroll, and banking for businesses.",
    typicalRounds: ["Online Assessment", "Machine Coding (LLD)", "HLD System Architecture", "Culture Round"],
    difficultyReputation: "rigorous",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    industry: "Fintech & Payments",
    branchIds: ["cse", "it", "datascience"],
    description: "India's largest digital payments app and UPI switch processing billions of financial transactions monthly.",
    typicalRounds: ["Machine Coding (LLD)", "Technical Deep Dive (DS/Algo)", "System Architecture (Distributed Systems)", "Managerial"],
    difficultyReputation: "rigorous",
  },
  {
    id: "paytm",
    name: "Paytm",
    industry: "Fintech & Payments",
    branchIds: ["cse", "it", "datascience", "commerce"],
    description: "Pioneer in digital wallets, merchant payment soundboxes, QR code payments, and financial technology.",
    typicalRounds: ["Online Aptitude & Coding", "Technical Interview 1", "Technical Interview 2", "HR Discussion"],
    difficultyReputation: "moderate",
  },
  {
    id: "zerodha",
    name: "Zerodha",
    industry: "Fintech & Payments",
    branchIds: ["cse", "it", "datascience", "finance"],
    description: "India's largest retail stockbroker known for building lean, high-throughput financial trading platforms like Kite.",
    typicalRounds: ["Practical Coding Task", "Low-Level & High-Level System Architecture", "Founders / Tech Lead Round"],
    difficultyReputation: "rigorous",
  },
  {
    id: "cred",
    name: "CRED",
    industry: "Fintech & Payments",
    branchIds: ["cse", "it", "datascience"],
    description: "Reward-centric credit card bill payment platform offering financial management and premium member perks.",
    typicalRounds: ["Machine Coding (Clean Code LLD)", "Deep Tech & Architecture", "Product & Culture Round"],
    difficultyReputation: "rigorous",
  },
  {
    id: "groww",
    name: "Groww",
    industry: "Fintech & Payments",
    branchIds: ["cse", "it", "datascience", "commerce"],
    description: "Fast-growing investment platform simplifying mutual funds, stock trading, SIPs, and digital gold for retail investors.",
    typicalRounds: ["Online Coding Assessment", "Technical Interview 1 (DS/Algo)", "Technical Interview 2 (System Design & DB)", "HR"],
    difficultyReputation: "moderate",
  },
];

const LOCAL_STORAGE_COMPANY_MAP_KEY = "interviewmate_question_companies_map";

export function getQuestionCompanyMap(): Record<string, string[]> {
  const initial = getInitialDefaultMap();
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COMPANY_MAP_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    return { ...initial, ...parsed };
  } catch {
    return initial;
  }
}

function getInitialDefaultMap(): Record<string, string[]> {
  return {
    google: ["q_real_google_1", "q_real_google_2", "q_real_google_3", "q_real_google_4", "q_real_google_5"],
    amazon: ["q_real_amazon_1", "q_real_amazon_2", "q_real_amazon_3", "q_real_amazon_4", "q_real_amazon_5"],
    microsoft: ["q_real_msft_1", "q_real_msft_2", "q_real_msft_3", "q_real_msft_4", "q_real_msft_5"],
    meta: ["q_real_meta_1", "q_real_meta_2", "q_real_meta_3", "q_real_meta_4", "q_real_meta_5"],
    apple: ["q_real_apple_1", "q_real_apple_2", "q_real_apple_3", "q_real_apple_4", "q_real_apple_5"],
    tcs: ["q_real_tcs_1", "q_real_tcs_2", "q_real_tcs_3", "q_real_tcs_4", "q_real_tcs_5"],
    infosys: ["q_real_infy_1", "q_real_infy_2", "q_real_infy_3", "q_real_infy_4", "q_real_infy_5"],
    zoho: ["q_real_zoho_1", "q_real_zoho_2", "q_real_zoho_3", "q_real_zoho_4", "q_real_zoho_5"],
    tata_motors: ["q_real_tata_1", "q_real_tata_2", "q_real_tata_3", "q_real_tata_4", "q_real_tata_5"],
    mahindra: ["q_real_mahindra_1", "q_real_mahindra_2", "q_real_mahindra_3", "q_real_mahindra_4", "q_real_mahindra_5"],
    l_and_t: ["q_real_lnt_1", "q_real_lnt_2", "q_real_lnt_3", "q_real_lnt_4", "q_real_lnt_5"],
    siemens: ["q_real_siemens_1", "q_real_siemens_2", "q_real_siemens_3", "q_real_siemens_4", "q_real_siemens_5"],
    bhel: ["q_real_bhel_1", "q_real_bhel_2", "q_real_bhel_3", "q_real_bhel_4", "q_real_bhel_5"],
    isro: ["q_real_isro_1", "q_real_isro_2", "q_real_isro_3", "q_real_isro_4", "q_real_isro_5"],
    bel: ["q_real_bel_1", "q_real_bel_2", "q_real_bel_3", "q_real_bel_4", "q_real_bel_5"],
    texas_instruments: ["q_real_ti_1", "q_real_ti_2", "q_real_ti_3", "q_real_ti_4", "q_real_ti_5"],
    qualcomm: ["q_real_qualcomm_1", "q_real_qualcomm_2", "q_real_qualcomm_3", "q_real_qualcomm_4", "q_real_qualcomm_5"],
    intel: ["q_real_intel_1", "q_real_intel_2", "q_real_intel_3", "q_real_intel_4", "q_real_intel_5"],
    l_and_t_construction: ["q_real_lntc_1", "q_real_lntc_2", "q_real_lntc_3", "q_real_lntc_4", "q_real_lntc_5"],
    dlf: ["q_real_dlf_1", "q_real_dlf_2", "q_real_dlf_3", "q_real_dlf_4", "q_real_dlf_5"],
    reliance_industries: ["q_real_reliance_1", "q_real_reliance_2", "q_real_reliance_3", "q_real_reliance_4", "q_real_reliance_5"],
    ongc: ["q_real_ongc_1", "q_real_ongc_2", "q_real_ongc_3", "q_real_ongc_4", "q_real_ongc_5"],
    biocon: ["q_real_biocon_1", "q_real_biocon_2", "q_real_biocon_3", "q_real_biocon_4", "q_real_biocon_5"],
    serum_institute: ["q_real_serum_1", "q_real_serum_2", "q_real_serum_3", "q_real_serum_4", "q_real_serum_5"],
    itc_agri: ["q_real_itc_1", "q_real_itc_2", "q_real_itc_3", "q_real_itc_4", "q_real_itc_5"],
    mckinsey: ["q_real_mckinsey_1", "q_real_mckinsey_2", "q_real_mckinsey_3", "q_real_mckinsey_4", "q_real_mckinsey_5"],
    bcg: ["q_real_bcg_1", "q_real_bcg_2", "q_real_bcg_3", "q_real_bcg_4", "q_real_bcg_5"],
    deloitte: ["q_real_deloitte_1", "q_real_deloitte_2", "q_real_deloitte_3", "q_real_deloitte_4", "q_real_deloitte_5"],
    hdfc_bank: ["q_real_hdfc_1", "q_real_hdfc_2", "q_real_hdfc_3", "q_real_hdfc_4", "q_real_hdfc_5"],
    goldman_sachs: ["q_real_gs_1", "q_real_gs_2", "q_real_gs_3", "q_real_gs_4", "q_real_gs_5"],
    // E-Commerce & Delivery
    flipkart: ["q_real_flipkart_1", "q_real_flipkart_2", "q_real_flipkart_3", "q_real_flipkart_4", "q_real_flipkart_5"],
    swiggy: ["q_real_swiggy_1", "q_real_swiggy_2", "q_real_swiggy_3", "q_real_swiggy_4", "q_real_swiggy_5"],
    zomato: ["q_real_zomato_1", "q_real_zomato_2", "q_real_zomato_3", "q_real_zomato_4", "q_real_zomato_5"],
    blinkit: ["q_real_blinkit_1", "q_real_blinkit_2", "q_real_blinkit_3", "q_real_blinkit_4", "q_real_blinkit_5"],
    meesho: ["q_real_meesho_1", "q_real_meesho_2", "q_real_meesho_3", "q_real_meesho_4", "q_real_meesho_5"],
    zepto: ["q_real_zepto_1", "q_real_zepto_2", "q_real_zepto_3", "q_real_zepto_4", "q_real_zepto_5"],
    // Fintech & Payments
    razorpay: ["q_real_razorpay_1", "q_real_razorpay_2", "q_real_razorpay_3", "q_real_razorpay_4", "q_real_razorpay_5"],
    phonepe: ["q_real_phonepe_1", "q_real_phonepe_2", "q_real_phonepe_3", "q_real_phonepe_4", "q_real_phonepe_5"],
    paytm: ["q_real_paytm_1", "q_real_paytm_2", "q_real_paytm_3", "q_real_paytm_4", "q_real_paytm_5"],
    zerodha: ["q_real_zerodha_1", "q_real_zerodha_2", "q_real_zerodha_3", "q_real_zerodha_4", "q_real_zerodha_5"],
    cred: ["q_real_cred_1", "q_real_cred_2", "q_real_cred_3", "q_real_cred_4", "q_real_cred_5"],
    groww: ["q_real_groww_1", "q_real_groww_2", "q_real_groww_3", "q_real_groww_4", "q_real_groww_5"],
  };
}

export function saveQuestionCompanyMap(map: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_COMPANY_MAP_KEY, JSON.stringify(map));
  } catch (err) {
    console.error("Failed to save company question map:", err);
  }
}

export function getCompanyQuestions(companyId: string): BankQuestion[] {
  const map = getQuestionCompanyMap();
  const taggedIds = new Set(map[companyId] || []);
  const allQuestions = getAllBankQuestions();

  const explicitTagged = allQuestions.filter((q) => taggedIds.has(q.id));
  if (explicitTagged.length > 0) return explicitTagged;

  // Fallback to domain-relevant questions matching company branchIds
  const targetCompany = SEEDED_COMPANIES.find((c) => c.id.toLowerCase() === companyId.toLowerCase());
  if (targetCompany && targetCompany.branchIds.length > 0) {
    const branchSet = new Set(targetCompany.branchIds);
    const branchMatched = allQuestions.filter((q) => {
      const qDomainLower = q.domain.toLowerCase();
      return (
        qDomainLower.includes("cad") ||
        qDomainLower.includes("thermo") ||
        qDomainLower.includes("digital") ||
        qDomainLower.includes("law") ||
        qDomainLower.includes("finance") ||
        qDomainLower.includes("structur") ||
        branchSet.has("cs") ||
        branchSet.has("me") ||
        branchSet.has("ece")
      );
    });
    if (branchMatched.length > 0) return branchMatched.slice(0, 8);
  }

  return allQuestions.slice(0, 8);
}

export function getCompanyQuestionCount(companyId: string): number {
  const map = getQuestionCompanyMap();
  const taggedIds = map[companyId] || [];
  if (taggedIds.length > 0) return taggedIds.length;
  return 5;
}

export function tagQuestionWithCompany(questionId: string, companyId: string): void {
  const map = getQuestionCompanyMap();
  const current = map[companyId] || [];
  if (!current.includes(questionId)) {
    map[companyId] = [...current, questionId];
    saveQuestionCompanyMap(map);
  }
}

export function untagQuestionWithCompany(questionId: string, companyId: string): void {
  const map = getQuestionCompanyMap();
  const current = map[companyId] || [];
  map[companyId] = current.filter((id) => id !== questionId);
  saveQuestionCompanyMap(map);
}
