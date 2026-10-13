// ═══════════════════════════════════════════════════════════════════
//  PIA Aviation AI Study Agent — Core Application Engine
//  B1.1 Aerospace | B2 Avionics | B777 | A320 | ATR
// ═══════════════════════════════════════════════════════════════════

'use strict';

// ── State ──────────────────────────────────────────────────────────
const STATE = {
  currentMode: 'dashboard',
  pathway: 'Both B1.1 + B2',
  userName: 'Huzaifa',
  userEmail: 'huzaifauk610@gmail.com',
  isOwner: true,
  role: 'Chief Aircraft Maintenance Engineer & Platform Owner',
  accessLevel: 'ROOT_FULL_ACCESS',
  masterPassword: 'Uzi@7869',
  guestPassword: 'Student@PIA',
  requireLock: true,
  isLocked: false,
  currentUserRole: 'OWNER',
  examDate: null,
  studyHours: 4,
  aircraftFocus: 'B777',
  qCount: 20,
  mcqTrack: 'B1.1',
  mcqModule: 'all',
  mcqDifficulty: 'medium',
  mcqCurrent: 0,
  mcqQuestions: [],
  mcqScore: 0,
  mcqAnswered: [],
  timedMode: false,
  mcqTimer: null,
  mcqTimeLeft: 0,
  vivaIndex: 0,
  vivaQuestions: [],
  flashcardIndex: 0,
  flashcardData: [],
  currentFlipped: false,
  mistakes: [],
  plannerView: 'day',
  currentAircraft: 'B777',
};

// ── Data Stores ────────────────────────────────────────────────────

const B1_MODULES = [
  { num: '01', title: 'Mathematics', topics: 'Arithmetic · Algebra · Geometry · Trigonometry · Statistics', color: '#2979ff', progress: 85 },
  { num: '02', title: 'Physics', topics: 'Matter · Mechanics · Thermodynamics · Optics · Wave Motion', color: '#00e5ff', progress: 72 },
  { num: '03', title: 'Electrical Fundamentals', topics: 'DC/AC Circuits · Resistance · Capacitance · Inductance · Transformers', color: '#ffd700', progress: 68 },
  { num: '04', title: 'Electronic Fundamentals', topics: 'Semiconductors · Transistors · Diodes · Amplifiers · Op-Amps', color: '#aa00ff', progress: 55 },
  { num: '05', title: 'Digital Techniques / Avionics', topics: 'Logic Gates · Boolean · Microprocessors · Data Buses · Fiber Optics', color: '#ff4444', progress: 32 },
  { num: '06', title: 'Materials & Hardware', topics: 'Metals · Non-Metals · Corrosion · Fasteners · Pipes & Hoses', color: '#00e676', progress: 78 },
  { num: '07', title: 'Maintenance Practices', topics: 'Safety · Tools · EWIS · Fuel Tank Safety · Documentation · NDT', color: '#ff9800', progress: 61 },
  { num: '08', title: 'Basic Aerodynamics', topics: 'Airflow · Bernoulli · Aerofoil · Drag · Lift · Stall', color: '#00e676', progress: 51 },
  { num: '09A', title: 'Human Factors', topics: 'Aviation HF · SHELL Model · CRM · Error Management · Stress · Fatigue', color: '#ff9800', progress: 45 },
  { num: '10', title: 'Aviation Legislation', topics: 'ICAO · PCAA · ANO · Airworthiness · Licencing · ADs · AMOs', color: '#2979ff', progress: 70 },
  { num: '11A', title: 'Aeroplane Aerodynamics & Structures', topics: 'High-speed flight · Stability · Controls · Structural concepts · Loads', color: '#00e5ff', progress: 58 },
  { num: '15', title: 'Gas Turbine Engine', topics: 'Turbofan · Combustion · Compressor · Turbine · Fuel systems · Ignition', color: '#ff4444', progress: 63 },
  { num: '17', title: 'Propeller', topics: 'Fixed-pitch · Variable-pitch · Governor · Feathering · Synchrophaser', color: '#aa00ff', progress: 40 },
];

const B2_MODULES = [
  { num: '01', title: 'Mathematics', topics: 'Arithmetic · Algebra · Geometry · Trigonometry · Statistics', color: '#2979ff', progress: 80 },
  { num: '02', title: 'Physics', topics: 'Matter · Mechanics · Thermodynamics · Optics · Wave Motion', color: '#00e5ff', progress: 70 },
  { num: '03', title: 'Electrical Fundamentals', topics: 'DC/AC Circuits · Resistance · Capacitance · Inductance · Transformers', color: '#ffd700', progress: 75 },
  { num: '04', title: 'Electronic Fundamentals', topics: 'Semiconductors · Transistors · Amplifiers · Op-Amps · Printed Circuits', color: '#aa00ff', progress: 65 },
  { num: '05', title: 'Digital Techniques / Avionics', topics: 'Logic · Microprocessors · ARINC 429/629 · Multiplexing · Fiber Optics', color: '#ff4444', progress: 48 },
  { num: '06', title: 'Materials & Hardware', topics: 'Metals · Non-Metals · Corrosion · Fasteners · Pipes', color: '#00e676', progress: 72 },
  { num: '07', title: 'Maintenance Practices', topics: 'Safety · Tools · EWIS · FTS · Documentation · NDT', color: '#ff9800', progress: 66 },
  { num: '08', title: 'Basic Aerodynamics', topics: 'Airflow · Bernoulli · Aerofoil · Drag · Lift · Stall', color: '#00e676', progress: 55 },
  { num: '09A', title: 'Human Factors', topics: 'SHELL Model · CRM · Error Management · Stress · Fatigue', color: '#ff9800', progress: 50 },
  { num: '10', title: 'Aviation Legislation', topics: 'ICAO · PCAA · ANO · Airworthiness · Licencing · ADs', color: '#2979ff', progress: 68 },
  { num: '13', title: 'Aircraft Aerodynamics', topics: 'Aeroplane/Helicopter · High Speed · Stability · Pressurisation', color: '#00e5ff', progress: 40 },
  { num: '14', title: 'Propulsion', topics: 'Piston Engine · Turbine Engine · Fuel Systems · APU', color: '#ff4444', progress: 55 },
  { num: '15', title: 'Gas Turbine Engine (B2)', topics: 'Turbofan · Engine Control Systems · FADEC · Engine Monitoring', color: '#ff9800', progress: 52 },
];

const TOPIC_DATA = {
  'EWIS': {
    title: 'EWIS — Electrical Wiring Interconnect System',
    module: 'Module 7 — Maintenance Practices',
    track: 'B1.1 + B2',
    priority: 'P0',
    labels: ['MEMORIZE', 'SAFETY-CRITICAL', 'EXAM'],
    description: 'EWIS refers to all wiring, wiring devices and combinations of these, including termination devices, installed in any area of the aircraft for transmitting electrical energy, including data and signals. Post-ValuJet crash, EWIS became a mandatory training subject under FAR/EASA Part-66 and is heavily examined by PCAA.',
    understand: [
      'Why EWIS was introduced as a mandatory subject after accidents like Swissair 111',
      'How an unairworthy wire can become a fire or short-circuit hazard',
      'The relationship between EWIS and Fuel Tank Safety (FTS)',
      'How EWIS inspection standards differ from standard electrical checks',
    ],
    memorize: [
      'EWIS = all wire, cable, wiring device within the aircraft used to transmit power/data',
      'Introduced post-ValuJet 592 (1996) and Swissair 111 (1998) incidents',
      'Required training for all B1 and B2 certifying staff',
      'Wire routing zones must be kept clear of flammable fluids',
      'Current-carrying capacity must not be exceeded — check wire gauge vs load',
    ],
    practice: [
      'Inspect a wire bundle for chafing, abrasion and routing violations',
      'Identify EWIS documentation requirements on a sample form',
      'Trace a wire circuit using an aircraft wiring diagram',
      'Demonstrate correct wire identification labelling',
    ],
    keyFacts: [
      { label: 'Acronym', value: 'Electrical Wiring Interconnect System' },
      { label: 'Regulation basis', value: 'PCAA ANO / EASA Part-66 Appendix I (reference)' },
      { label: 'Mandatory for', value: 'B1.1 and B2 certification' },
      { label: 'ATA Chapter', value: 'ATA 20 (Standard Practices)' },
      { label: 'Key hazard', value: 'Arcing → heat damage → fire → structural loss' },
      { label: 'Document required', value: 'Aircraft Wiring Manual (AWM)' },
    ],
  },
  'Human Factors': {
    title: 'Human Factors in Aviation Maintenance',
    module: 'Module 9A — Human Factors',
    track: 'B1.1 + B2',
    priority: 'P1',
    labels: ['UNDERSTAND', 'MEMORIZE', 'EXAM'],
    description: 'Human Factors (HF) is the study of the human element in aviation — how people interact with systems, environments, and each other. In maintenance, HF errors cause a significant proportion of incidents. The SHELL model, the Dirty Dozen, and CRM concepts are core examination topics.',
    understand: [
      'Why human error accounts for ~80% of aviation accidents',
      'How the SHELL model explains the human-machine-environment relationship',
      'The difference between active failures and latent conditions (Swiss Cheese)',
      'How fatigue, stress, and complacency affect maintenance quality',
    ],
    memorize: [
      'The Dirty Dozen: Lack of communication, Complacency, Lack of knowledge, Distraction, Lack of teamwork, Fatigue, Lack of resources, Pressure, Lack of assertiveness, Stress, Lack of awareness, Norms',
      'SHELL Model: Software · Hardware · Environment · Liveware (central) · Liveware (others)',
      'PEAR model: People · Environment · Actions · Resources',
      'CRM = Crew Resource Management — applicable to maintenance teams',
      'Error types: Slips, Lapses, Mistakes, Violations',
    ],
    practice: [
      'Analyse a maintenance incident using the Dirty Dozen framework',
      'Apply the SHELL model to a hangar scenario',
      'Identify contributing human factors in a given case study',
    ],
    keyFacts: [
      { label: 'Key model', value: 'SHELL (Hawkins/Edwards 1975)' },
      { label: 'Dirty Dozen count', value: '12 human factors precursors' },
      { label: 'Error reference', value: 'Reason\'s Swiss Cheese Model' },
      { label: 'Regulation', value: 'PCAA / EASA Part-66 Module 9A' },
      { label: 'Common exam', value: 'Define HF, list Dirty Dozen, apply SHELL' },
    ],
  },
  'Aerodynamics': {
    title: 'Aerodynamics — Fundamentals & High-Speed Flight',
    module: 'Module 8 / Module 11A',
    track: 'B1.1',
    priority: 'P1',
    labels: ['UNDERSTAND', 'APPLY', 'EXAM'],
    description: 'Aerodynamics covers the forces acting on an aircraft in flight: Lift, Drag, Thrust, and Weight. For maintenance engineers, understanding these principles explains why structural damage, surface contamination, or control surface anomalies affect airworthiness.',
    understand: [
      'Bernoulli\'s principle and how it generates lift on an aerofoil',
      'How angle of attack (AoA) affects lift and leads to stall',
      'The four aerodynamic forces and their relationship in steady flight',
      'Mach number, compressibility effects, and transonic/supersonic flight',
      'High-speed flight effects: wave drag, shock waves, Mach tuck',
    ],
    memorize: [
      'L = CL × ½ρV² × S (Lift formula)',
      'D = CD × ½ρV² × S (Drag formula)',
      'Stall AoA for most aerofoils: approx. 15–20°',
      'Critical Mach (Mcrit): speed at which airflow first goes supersonic over surface',
      'Types of drag: Induced, Profile (Form + Skin Friction), Wave',
      'Aspect Ratio: AR = b²/S (wing span² / wing area)',
    ],
    practice: [
      'Calculate lift using given air density, velocity, and CL',
      'Identify drag types from a diagram',
      'Explain how contamination (ice, dirt) affects lift',
    ],
    keyFacts: [
      { label: 'Four forces', value: 'Lift · Drag · Thrust · Weight' },
      { label: 'Aerofoil geometry', value: 'Chord · Camber · Leading edge · Trailing edge' },
      { label: 'Key equation', value: 'L = CL·½ρV²·S' },
      { label: 'Stall cause', value: 'Exceeding critical AoA' },
      { label: 'High-speed concern', value: 'Mach tuck, compressibility, wave drag' },
    ],
  },
  'Hydraulics': {
    title: 'Aircraft Hydraulic Systems',
    module: 'Module 11A / ATA 29',
    track: 'B1.1',
    priority: 'P1',
    labels: ['UNDERSTAND', 'RECOGNIZE', 'EXAM'],
    description: 'Hydraulic systems provide the power needed to operate flight controls, landing gear, brakes, and thrust reversers. Large commercial aircraft use multiple independent hydraulic systems for redundancy. Understanding circuit architecture, fluid types, and failure modes is essential for maintenance engineers.',
    understand: [
      'Pascal\'s law and how hydraulic pressure transmits force',
      'Why modern aircraft have 3 separate hydraulic systems (redundancy)',
      'The hydraulic circuit: reservoir → pump → actuator → return',
      'Difference between open-centre and closed-centre systems',
      'Common failure modes: internal/external leakage, cavitation, contamination',
    ],
    memorize: [
      'Pascal\'s Law: P = F/A — pressure applied to enclosed fluid transmits equally in all directions',
      'Hydraulic fluid: Skydrol (purple, fire-resistant, B777/A320), Mil-H-5606 (red)',
      'Normal system pressure on large aircraft: 3000 PSI (B777: 3000 PSI, A320: 3000 PSI)',
      'B777: 3 hydraulic systems — Left, Center, Right',
      'A320: 3 hydraulic systems — Green (3000 PSI), Blue, Yellow',
      'Contamination limit: typically <NAS 1638 Class 7–8',
    ],
    practice: [
      'Trace a hydraulic circuit on a B777 hydraulic diagram',
      'Identify system pressure using a cockpit EICAS indication',
      'Describe the steps for a hydraulic fluid sampling procedure (learning only)',
    ],
    keyFacts: [
      { label: 'Key law', value: 'Pascal\'s Law' },
      { label: 'B777 systems', value: 'Left · Center · Right (3,000 PSI each)' },
      { label: 'A320 systems', value: 'Green · Blue · Yellow (3,000 PSI each)' },
      { label: 'Fluid type (civil)', value: 'Skydrol 500B-4 / Skydrol LD-4' },
      { label: 'Pump types', value: 'Engine-driven · Electric · Air-driven (ADP)' },
    ],
  },
  'Avionics': {
    title: 'Avionics Systems Overview',
    module: 'Module 5 / Module 13',
    track: 'B2',
    priority: 'P1',
    labels: ['UNDERSTAND', 'RECOGNIZE', 'EXAM'],
    description: 'Avionics (Aviation Electronics) encompasses all electronic systems used in aircraft: communication, navigation, monitoring, automatic flight, and flight management. B2 engineers specialize in maintaining these systems.',
    understand: [
      'The digital data bus architecture (ARINC 429, ARINC 629, AFDX)',
      'How the ADIRS (Air Data Inertial Reference System) functions',
      'Difference between analogue, digital and hybrid avionics architectures',
      'How BITE (Built-In Test Equipment) aids fault isolation',
      'The role of the Flight Management Computer (FMC)',
    ],
    memorize: [
      'ARINC 429: simplex (one transmitter, up to 20 receivers), 12.5/100 kbps',
      'ARINC 629: bidirectional, current mode, used on B777',
      'AFDX (ARINC 664): Ethernet-based, used on A380/A350',
      'ADIRS = Air Data + Inertial Reference integrated system',
      'ILS: Localizer (azimuth) + Glide slope (vertical) + Marker beacons',
    ],
    keyFacts: [
      { label: 'Main data bus (A320)', value: 'ARINC 429' },
      { label: 'Main data bus (B777)', value: 'ARINC 629' },
      { label: 'VOR frequency', value: '108.0 – 117.95 MHz (NAV band)' },
      { label: 'ILS Localizer', value: '108 – 111.975 MHz' },
      { label: 'DME', value: 'Distance measuring · 962–1213 MHz (UHF)' },
    ],
  },
  'Electrical Power': {
    title: 'Aircraft Electrical Power Systems',
    module: 'Module 3 / ATA 24',
    track: 'B1.1 + B2',
    priority: 'P1',
    labels: ['UNDERSTAND', 'MEMORIZE', 'APPLY'],
    description: 'Aircraft electrical systems power avionics, lighting, environmental control, and essential flight systems. Modern transport aircraft use AC power as primary (115V 400Hz) with DC power (28V) for essential buses.',
    understand: [
      'How IDG (Integrated Drive Generator) maintains constant 400Hz output',
      'Bus tie architecture and why buses are isolated during abnormal ops',
      'The RAT (Ram Air Turbine) as an emergency power source',
      'APU electrical generation and engine-start capability',
    ],
    memorize: [
      'Standard AC: 115V / 400Hz (3-phase)',
      'Standard DC: 28V DC',
      'IDG = Integrated Drive Generator (CSD + Generator combined)',
      'GPU = Ground Power Unit (external AC power on ground)',
      'RAT = Ram Air Turbine — emergency hydraulic/electrical power',
      'TRU = Transformer Rectifier Unit — converts AC to DC',
    ],
    keyFacts: [
      { label: 'Primary AC voltage', value: '115V AC, 3-phase, 400Hz' },
      { label: 'Primary DC voltage', value: '28V DC' },
      { label: 'Generator type', value: 'IDG (Integrated Drive Generator)' },
      { label: 'Emergency power', value: 'RAT (Ram Air Turbine)' },
      { label: 'Ground power', value: 'GPU (Ground Power Unit)' },
    ],
  },
  'Gas Turbine Engine': {
    title: 'Gas Turbine Engine — Turbofan',
    module: 'Module 15',
    track: 'B1.1',
    priority: 'P1',
    labels: ['UNDERSTAND', 'MEMORIZE', 'APPLY', 'EXAM'],
    description: 'The gas turbine engine converts chemical energy from fuel into mechanical energy (thrust) through the Brayton cycle. Understanding all engine sections, their function, and failure modes is essential for B1.1 licensing.',
    understand: [
      'The Brayton (Joule) thermodynamic cycle: Intake → Compress → Combust → Expand → Exhaust',
      'Why high bypass ratio turbofans are more fuel-efficient at subsonic speeds',
      'How a centrifugal vs axial compressor works and their trade-offs',
      'Compressor stall causes and recognition',
      'FADEC functions and authority limits',
    ],
    memorize: [
      'Turbofan sections: Fan · LPC · HPC · Combustor · HPT · LPT · Exhaust',
      'Bypass ratio B777 (GE90): ~8.4:1',
      'Bypass ratio A320 CFM56: ~5.5–6:1',
      'Combustor types: Cannular (most common), Annular, Can',
      'Engine start sequence: N2 → fuel · ignition · N1 begins · idle',
      'ITT / EGT = Interstage Turbine Temperature / Exhaust Gas Temperature — life-limiting',
    ],
    keyFacts: [
      { label: 'Thermodynamic cycle', value: 'Brayton (Joule) Cycle' },
      { label: 'B777 engine options', value: 'GE90, Rolls-Royce Trent 800, PW4000' },
      { label: 'A320 engine options', value: 'CFM56-5A/5B, IAE V2500' },
      { label: 'ATR engine', value: 'PW127M (turboprop)' },
      { label: 'Key temperature limit', value: 'EGT / ITT (monitoring critical)' },
    ],
  },
  'Navigation Systems': {
    title: 'Navigation Systems — ILS, VOR, DME, GPS',
    module: 'Module 5 (B2) / ATA 34',
    track: 'B2',
    priority: 'P1',
    labels: ['UNDERSTAND', 'MEMORIZE', 'RECOGNIZE'],
    description: 'Aircraft navigation systems provide pilots with position, guidance, and approach information. For B2 engineers, understanding how each system works — and how to recognize and troubleshoot failures — is essential.',
    understand: [
      'How the ILS provides precision approach guidance (localizer + glideslope)',
      'VOR principle of operation — phase comparison between REF and VAR signals',
      'DME interrogation-response principle and slant range calculation',
      'GPS constellation, signal structure, and RAIM for integrity monitoring',
      'How GNSS/GPS augmentation systems (WAAS, SBAS) improve accuracy',
    ],
    memorize: [
      'VOR frequency: 108.0–117.95 MHz',
      'ILS Localizer: 108.10–111.95 MHz (odd tenth MHz)',
      'ILS Glideslope: 329.15–335.00 MHz (UHF)',
      'DME frequency: 962–1213 MHz (UHF)',
      'GPS frequency: L1 = 1575.42 MHz, L2 = 1227.60 MHz',
      'ADF uses NDB (Non-Directional Beacon): 190–1750 kHz (LF/MF)',
      'RNAV: area navigation — aircraft can fly any point-to-point route',
    ],
    keyFacts: [
      { label: 'ILS Category I minimum', value: 'DH 200ft, RVR 550m' },
      { label: 'ILS Category II minimum', value: 'DH 100ft, RVR 350m' },
      { label: 'ILS Category III', value: 'Cat IIIc: no DH, no RVR limit' },
      { label: 'VOR accuracy', value: '±1° (approx)' },
      { label: 'GPS accuracy (SPS)', value: '~5–10m horizontal' },
    ],
  },
  'Digital Techniques': {
    title: 'Digital Techniques & Avionics Systems',
    module: 'Module 5',
    track: 'B1.1 + B2',
    priority: 'P2',
    labels: ['UNDERSTAND', 'RECOGNIZE', 'EXAM'],
    description: 'Digital systems form the backbone of modern aircraft avionics. Understanding binary, hexadecimal, logic gates, microprocessors, data buses, and fiber optics is essential for both B1.1 and B2 candidates.',
    understand: [
      'Binary, octal, hexadecimal number systems and conversions',
      'Boolean algebra and logic gate functions (AND, OR, NOT, NAND, NOR, XOR)',
      'How microprocessors and memory types (RAM, ROM, EEPROM) work',
      'Data bus protocols: ARINC 429, ARINC 629, MIL-STD-1553B, AFDX',
      'Advantages of fiber optic data transmission over copper wire',
    ],
    memorize: [
      'Binary: base 2 (0,1). Hex: base 16 (0–9, A–F)',
      '1 Byte = 8 bits. MSB = Most Significant Bit. LSB = Least Significant Bit',
      'ARINC 429: 32-bit word, Label (8-bit) + Source/Destination (2-bit) + Data (19-bit) + SSM (2-bit) + Parity (1-bit)',
      'EEPROM = Electrically Erasable Programmable ROM (non-volatile)',
      'Fiber optic advantages: lightweight, EMI-immune, high bandwidth, secure',
    ],
    keyFacts: [
      { label: 'ARINC 429 speed', value: 'Low: 12.5 kbps · High: 100 kbps' },
      { label: 'ARINC 629 speed', value: '2 Mbps (bidirectional)' },
      { label: 'MIL-STD-1553B', value: '1 Mbps · military dual-redundant bus' },
      { label: 'Fiber optic light', value: 'Infrared (850nm, 1310nm, 1550nm)' },
    ],
  },
  'Pneumatics': {
    title: 'Pneumatic & Air Conditioning Systems',
    module: 'Module 11A / ATA 21 & 36',
    track: 'B1.1',
    priority: 'P2',
    labels: ['UNDERSTAND', 'RECOGNIZE'],
    description: 'Aircraft pneumatic systems use bleed air from engine compressors to power air conditioning, pressurization, anti-icing, engine starting, and wing anti-icing systems. Understanding bleed air management is critical for B1.1 engineers.',
    understand: [
      'How bleed air is extracted from different compressor stages (low vs high)',
      'The Air Conditioning Pack (Air Cycle Machine) and how it cools/conditions air',
      'Pressurization control — cabin altitude regulation and outflow valve operation',
      'Wing anti-ice (WAI) and engine anti-ice (EAI) — different sources on some aircraft',
    ],
    memorize: [
      'Bleed air source: LPC (LP bleed) and HPC (HP bleed) — stage selection varies with power',
      'ACM = Air Cycle Machine — not vapour-cycle; uses expansion to cool',
      'ACM components: Compressor · Turbine · Heat exchangers (PHX, SHX) · Water separator',
      'Cabin altitude normally maintained at approx. 6,000–8,000 ft equivalent',
      'Pressurization: positive differential typically 8–8.6 PSI on large aircraft',
    ],
    keyFacts: [
      { label: 'Bleed air temperature', value: 'Up to 450°C at HP stage — must be cooled' },
      { label: 'Pack output', value: 'Conditioned air at ~20°C for cabin' },
      { label: 'Cabin altitude', value: '~6,000 ft (B777) to 8,000 ft (older) equivalent' },
      { label: 'Differential pressure', value: 'Typically 8.6 PSI max differential' },
    ],
  },
};

const MCQ_BANK = {
  'all': [
    { q: 'What does EWIS stand for?', opts: ['Electrical Wiring Interconnect System', 'Engine Warning Indicator System', 'Electronic Wiring Inspection Standard', 'Extended Wing Interconnect Specification'], ans: 0, exp: 'EWIS stands for Electrical Wiring Interconnect System — it includes all wires, cables, and wiring devices installed in any area of the aircraft for transmitting electrical energy, data, or signals.' },
    { q: 'According to Human Factors, what is the SHELL model\'s central element?', opts: ['Software', 'Hardware', 'Liveware (the human operator)', 'Environment'], ans: 2, exp: 'The SHELL model places Liveware (the central human — the maintainer or operator) at the centre, surrounded by Software, Hardware, Environment, and Liveware (other people).' },
    { q: 'Which of these is NOT one of the "Dirty Dozen" human factor precursors?', opts: ['Fatigue', 'Complacency', 'Overconfidence', 'Lack of communication'], ans: 2, exp: '"Overconfidence" is not one of the official Dirty Dozen. The 12 are: Lack of communication, Complacency, Lack of knowledge, Distraction, Lack of teamwork, Fatigue, Lack of resources, Pressure, Lack of assertiveness, Stress, Lack of awareness, Norms.' },
    { q: 'Pascal\'s law states that:', opts: ['Pressure in a fluid decreases with depth', 'Pressure applied to an enclosed fluid transmits equally in all directions', 'Fluid flows from high to low pressure only', 'Pressure equals mass divided by volume'], ans: 1, exp: 'Pascal\'s Law states that pressure applied to an enclosed fluid transmits equally in all directions and to all parts of the container. This is the fundamental principle of hydraulic systems.' },
    { q: 'What is the standard AC voltage and frequency on most large commercial aircraft?', opts: ['28V DC at 400Hz', '115V AC at 400Hz, 3-phase', '230V AC at 50Hz, single-phase', '115V AC at 60Hz, 3-phase'], ans: 1, exp: 'Large commercial aircraft use 115V AC, 3-phase, 400Hz as their primary electrical supply. The higher frequency (400Hz vs 50/60Hz ground power) reduces transformer and motor weight.' },
    { q: 'Which data bus is used on the Boeing B777 as its primary avionics data bus?', opts: ['ARINC 429', 'ARINC 629', 'MIL-STD-1553B', 'AFDX (ARINC 664)'], ans: 1, exp: 'The B777 uses ARINC 629 as its primary data bus — a bidirectional, current-mode bus capable of 2 Mbps. This was unique to B777 at the time of introduction. ARINC 429 is used on A320.' },
    { q: 'The ILS Localizer provides:', opts: ['Vertical (glidepath) guidance', 'Horizontal (azimuth) guidance', 'Range information', 'Both azimuth and glidepath guidance'], ans: 1, exp: 'The ILS Localizer operates on 108.10–111.95 MHz and provides horizontal (azimuth/lateral) guidance to the runway centreline. The Glideslope provides the vertical guidance.' },
    { q: 'What is the standard hydraulic system pressure on B777 and A320 aircraft?', opts: ['1,500 PSI', '3,000 PSI', '5,000 PSI', '8,000 PSI'], ans: 1, exp: 'Both B777 and A320 use 3,000 PSI (approximately 206 bar) as their hydraulic system pressure. Some newer aircraft (like B787) use 5,000 PSI systems for weight savings.' },
    { q: 'Compressor stall in a gas turbine engine is caused by:', opts: ['Excessive fuel flow only', 'Disruption of airflow leading to flow separation in the compressor', 'High oil temperature', 'Low RPM only'], ans: 1, exp: 'Compressor stall (or surge) is caused by disruption of the normal airflow through the compressor — the air "stalls" on the compressor blades, similar to an aerodynamic stall on a wing. Can be caused by excessive AoA on blades, inlet distortion, or rapid throttle movement.' },
    { q: 'Which thermodynamic cycle does a gas turbine engine use?', opts: ['Rankine Cycle', 'Otto Cycle', 'Brayton (Joule) Cycle', 'Diesel Cycle'], ans: 2, exp: 'Gas turbine engines operate on the Brayton Cycle (also called the Joule cycle): Intake → Compression → Combustion → Expansion (through turbine) → Exhaust.' },
    { q: 'What does IDG stand for in aircraft electrical systems?', opts: ['Integrated Drive Generator', 'Internal DC Generator', 'Induction Driven Gyro', 'Isolated Distribution Grid'], ans: 0, exp: 'IDG = Integrated Drive Generator — combines a Constant Speed Drive (CSD) and generator into one unit, maintaining constant 400Hz output regardless of engine speed.' },
    { q: 'The TRU in an aircraft electrical system converts:', opts: ['DC to AC', 'AC to DC', 'AC at 400Hz to AC at 60Hz', 'High voltage AC to low voltage AC'], ans: 1, exp: 'TRU = Transformer Rectifier Unit — it transforms AC voltage then rectifies it to produce 28V DC for DC buses.' },
    { q: 'What is the primary purpose of the Ram Air Turbine (RAT)?', opts: ['Normal ground power generation', 'Cooling the hydraulic fluid during cruise', 'Emergency power generation using ram air', 'Engine starting assistance'], ans: 2, exp: 'The RAT (Ram Air Turbine) deploys automatically (or manually) in emergencies when all normal power is lost. It uses ram air flowing past the aircraft to drive a small turbine, generating emergency hydraulic and/or electrical power.' },
    { q: 'In the SHELL model, the "S" represents:', opts: ['Safety procedures', 'Software (procedures, manuals, documentation)', 'Stress management', 'Systems engineering'], ans: 1, exp: 'In the SHELL model: S = Software (procedures, checklists, regulations, documentation), H = Hardware (aircraft and equipment), E = Environment, L = Liveware (the individual), L = Liveware (others — team, supervisor).' },
    { q: 'ARINC 429 data bus characteristics include:', opts: ['Bidirectional, 2 Mbps', 'Simplex, up to 100 kbps, 32-bit word', 'Ring topology, 10 Mbps', 'Token ring, 1 Mbps'], ans: 1, exp: 'ARINC 429 is a simplex (unidirectional) bus with one transmitter and up to 20 receivers. It uses 32-bit data words and operates at either 12.5 kbps (low speed) or 100 kbps (high speed).' },
    { q: 'What does BITE stand for in avionics?', opts: ['Basic Integrated Test Equipment', 'Built-In Test Equipment', 'Bus Interface Terminal Electronics', 'Binary Input Testing Engine'], ans: 1, exp: 'BITE = Built-In Test Equipment — internal diagnostic systems that monitor avionics and system health, generate fault codes, and assist maintenance engineers in fault isolation without needing external test equipment.' },
    { q: 'The lift formula L = CL × ½ρV² × S. What does "S" represent?', opts: ['Speed of the aircraft', 'Wing span', 'Wing surface area (planform area)', 'Slip angle'], ans: 2, exp: 'In the lift formula L = CL × ½ρV² × S: CL = coefficient of lift, ρ (rho) = air density, V = velocity, S = wing planform area (reference area). This is a fundamental aerodynamics equation.' },
    { q: 'Aircraft pressurization outflow valves are typically controlled by:', opts: ['The pilot manually only', 'Cabin differential pressure controller (automatic with manual override)', 'Engine bleed pressure directly', 'Outside air temperature only'], ans: 1, exp: 'Cabin pressurization is controlled by an automatic cabin pressure controller that regulates the outflow valve position to maintain the desired cabin altitude and differential pressure. Manual control is available as a backup.' },
    { q: 'VOR operates in which frequency band?', opts: ['190–1750 kHz (LF/MF)', '108.0–117.95 MHz (VHF)', '329–335 MHz (UHF)', '962–1213 MHz (UHF)'], ans: 1, exp: 'VOR (VHF Omnidirectional Range) operates in the VHF band: 108.0–117.95 MHz. This is the same band shared with ILS localizers (odd decimals) and VORs (even decimals in the 108–112 MHz range).' },
    { q: 'How many independent hydraulic systems does the A320 have?', opts: ['Two', 'Three', 'Four', 'One with dual pumps'], ans: 1, exp: 'The A320 has three independent hydraulic systems: Green (powered by engine 1 and electric pump), Blue (powered by electric pump and RAT in emergency), and Yellow (powered by engine 2 and electric pump). This provides redundancy.' },
  ],
};

const PRACTICAL_TASKS = [
  { id: 'p1', aircraft: 'B777', name: 'Hydraulic System Fluid Level Check', ata: 'ATA 29', status: 'studied', desc: 'Learning the purpose, safety requirements, and documentation for a B777 hydraulic fluid level check. Educational preparation only.', steps: ['Review AMM task card — verify current revision and effectivity', 'Identify all safety precautions: hydraulic system depressurised, relevant circuit breakers pulled, warning tags in place', 'Identify reservoir location and access panel on the aircraft', 'Understand the sight glass and quantity indicators — learn normal/minimum/maximum ranges from AMM', 'Understand the fluid type required (Skydrol LD-4 or per AMM) — do NOT mix fluid types', 'Review the documentation: what form to fill, who can certify, what entries are required', 'Understand when a full servicing vs top-up is required and what triggers an investigation'] },
  { id: 'p2', aircraft: 'A320', name: 'BITE Test — ADIRS Fault Isolation', ata: 'ATA 34', status: 'new', desc: 'Learning how to use the MCDU and ADIRS control panel to run BITE and interpret fault codes.', steps: ['Understand what ADIRS detects and reports (ADR, IR faults)', 'Learn BITE access: MCDU → AIDS → DFDR or ACMS depending on fault type', 'Read AMM fault isolation chart for the specific fault code', 'Identify GO/NO-GO criteria from the Minimum Equipment List (MEL)', 'Record fault code, description, flight phase, and applicable action in the Technical Log', 'Understand who can certify the inspection or return to service'] },
  { id: 'p3', aircraft: 'ATR', name: 'Propeller Inspection (Visual)', ata: 'ATA 61', status: 'new', desc: 'Learning the visual inspection points for ATR propeller blades — pre-flight and scheduled checks.', steps: ['Review Task Card from AMM — check effectivity for ATR-72/ATR-42 variant and PW127M engine', 'Identify safety precautions: prop must be clear of personnel arc during any engine run', 'Visual inspection points: blade leading edge for nicks, erosion, cracks', 'Check blade pitch range visually — reference position marks', 'Check spinner condition — cracks, security', 'Look for oil or fluid leaks at propeller hub', 'Document findings in Technical Log; classify defect per AMM limits'] },
  { id: 'p4', aircraft: 'basic', name: 'Wire Splice Identification (EWIS)', ata: 'ATA 20', status: 'new', desc: 'Learning to identify correct and incorrect wire splicing practices as per EWIS standards.', steps: ['Review AWM (Aircraft Wiring Manual) wire splice requirements', 'Identify approved splice connector types for the gauge and environment', 'Check that splices are NOT located in high-vibration zones without approved support', 'Verify splice location: not in fuel tank zone, not in bilge area, not behind insulation', 'Inspect for proper crimping technique — connector is correct for wire gauge', 'Check for heat shrink or environmental seal if required', 'Record inspection findings on the appropriate maintenance release'] },
  { id: 'p5', aircraft: 'basic', name: 'Torque Wrench Usage (Workshop)', ata: 'ATA 20', status: 'practiced', desc: 'Learning the correct process for using a torque wrench in aircraft maintenance context.', steps: ['Select correct torque wrench type: click-type, beam-type, or digital — verify calibration date', 'Set wrench to required torque VALUE from the AMM/Task Card — never guess or use "feel"', 'Apply torque in a smooth, continuous motion — no jerking', 'Direction of torque application: standard fasteners are clockwise to tighten', 'Do not use torque extension without applying the extension formula: T_actual = T_setting × L/(L+E)', 'Apply torque stripe/witness mark after torquing — pen line across fastener to nut/structure', 'Record torqued fasteners on the task card per instruction'] },
  { id: 'p6', aircraft: 'B777', name: 'EICAS Message Interpretation', ata: 'ATA 31', status: 'new', desc: 'Learning to read and interpret EICAS warning and advisory messages on the B777 flight deck.', steps: ['Understand EICAS message hierarchy: WARNING (red/aural) · CAUTION (amber/aural) · ADVISORY (amber, no aural) · STATUS (white, no aural)', 'Locate relevant QRH (Quick Reference Handbook) or AMM section for the message', 'Identify if message is a latched or momentary indication', 'Check CMC (Central Maintenance Computer) for associated fault codes', 'Cross-reference with MEL for dispatch implications', 'Document in Technical Log with flight phase and any crew actions taken'] },
];

const VIVA_QUESTIONS = [
  { q: 'Explain the purpose of EWIS in aircraft maintenance.', topic: 'EWIS', hint: 'Think about what wiring interconnects and why it needs dedicated standards.', modelAns: 'EWIS (Electrical Wiring Interconnect System) covers all wiring and wiring devices installed to transmit electrical energy. It was introduced after accidents like Swissair 111 where arcing wiring caused a catastrophic in-flight fire. EWIS standards ensure wires are routed safely, protected from chafing and heat, not overloaded, and properly documented.' },
  { q: 'What is the SHELL model? Explain each element.', topic: 'Human Factors', hint: 'Central element is the person. Think Software, Hardware, Environment, others.', modelAns: 'SHELL is a Human Factors model with Liveware (the individual) at the centre, surrounded by: Software (procedures, documentation, regulations), Hardware (aircraft equipment, tools), Environment (physical and organisational), and Liveware (others — team, supervisors). It helps analyse how a person interfaces with each element to identify error-producing conditions.' },
  { q: 'What causes a gas turbine compressor stall?', topic: 'Gas Turbine Engine', hint: 'Think of it like an aerodynamic stall but on the compressor blades.', modelAns: 'Compressor stall (or surge) occurs when the angle of attack on compressor blades becomes too high, causing airflow separation and a breakdown of normal flow through the compressor. Causes include: rapid throttle advancement, inlet distortion, damaged blades, or operating outside the design envelope. It can be recognised by loud bangs, thrust loss, and high EGT.' },
  { q: 'What is Pascal\'s Law and how does it apply to aircraft hydraulics?', topic: 'Hydraulics', hint: 'Pressure, enclosed fluid, and force multiplication.', modelAns: "Pascal's Law states that pressure applied to an enclosed fluid transmits equally in all directions. In aircraft hydraulics, a small pump creates high pressure (3,000 PSI) in fluid, which is piped to actuators where the pressure acts on a large area to produce large forces — for example, moving the landing gear or flight control surfaces." },
  { q: 'Name the three hydraulic systems on an A320 and their normal power sources.', topic: 'Hydraulics A320', hint: 'Think colours — Green, Blue, Yellow.', modelAns: 'A320 hydraulic systems: Green (Engine 1 hydraulic pump, also an electric pump backup), Blue (Electric pump only, with RAT as emergency backup), Yellow (Engine 2 hydraulic pump, also an electric pump and hand pump on ground). All operate at 3,000 PSI.' },
  { q: 'What is the difference between an ILS Localizer and Glideslope?', topic: 'Navigation', hint: 'One is lateral, one is vertical. Think about frequency bands.', modelAns: 'The ILS Localizer provides lateral (azimuth) guidance — it operates on VHF 108.10–111.95 MHz and guides the aircraft to the runway centreline. The Glideslope provides vertical guidance — it operates on UHF 329–335 MHz and guides the aircraft down at the correct descent angle (typically 3°). Together they provide a precision approach.' },
  { q: 'What is the Brayton cycle and how does it relate to a turbofan engine?', topic: 'Gas Turbine Engine', hint: 'Four phases — Intake, Compress, Combust, Expand.', modelAns: "The Brayton (Joule) cycle is the thermodynamic cycle of a gas turbine: 1) Intake — air drawn in, 2) Compression — air compressed by compressor stages, 3) Combustion — fuel added and burned at near-constant pressure, 4) Expansion — hot gases expand through turbine (extracting work) and nozzle (producing thrust). The turbofan adds a bypass fan that generates a large proportion of thrust at subsonic speeds." },
  { q: 'List three items from the Dirty Dozen and explain how each causes maintenance error.', topic: 'Human Factors', hint: 'Pick the most common ones — Fatigue, Distraction, Complacency.', modelAns: '1) Fatigue — reduces vigilance, slows reaction time, degrades decision making; a fatigued technician may miss an inspection step. 2) Distraction — interruptions during a task can cause a maintainer to lose their place and skip steps (e.g., open panels not closed). 3) Complacency — familiarity breeds assumption; a complacency-affected engineer assumes everything is normal and does not thoroughly inspect, missing real defects.' },
];

const FLASHCARDS = [
  { q: 'What does EWIS stand for?', a: 'Electrical Wiring Interconnect System — all wiring, cables, and wiring devices installed in any area of an aircraft to transmit electrical energy, data, or signals.', module: 'Module 7', label: 'memorize', confidence: 0 },
  { q: 'What is Pascal\'s Law?', a: 'Pressure applied to an enclosed incompressible fluid transmits equally in all directions. Foundation of hydraulic systems.', module: 'Hydraulics', label: 'understand', confidence: 2 },
  { q: 'Define the SHELL model acronym.', a: 'S = Software · H = Hardware · E = Environment · L = Liveware (self) · L = Liveware (others). Liveware is central.', module: 'Module 9A', label: 'memorize', confidence: 1 },
  { q: 'B777 — How many hydraulic systems and at what pressure?', a: 'Three systems: Left, Center, Right — each at 3,000 PSI (approx. 206 bar).', module: 'B777 ATA 29', label: 'memorize', confidence: 0 },
  { q: 'A320 hydraulic system colors?', a: 'Green (Eng 1 + EDP), Blue (Electric only + RAT emergency), Yellow (Eng 2 + EDP + hand pump). All 3,000 PSI.', module: 'A320 ATA 29', label: 'memorize', confidence: 0 },
  { q: 'Standard aircraft AC electrical supply?', a: '115V AC · 3-phase · 400Hz', module: 'Module 3 / ATA 24', label: 'memorize', confidence: 3 },
  { q: 'What is an IDG?', a: 'Integrated Drive Generator — combines CSD (Constant Speed Drive) and generator into one unit, producing constant 400Hz AC regardless of engine RPM.', module: 'ATA 24', label: 'understand', confidence: 1 },
  { q: 'ARINC 429 — key characteristics?', a: 'Simplex (unidirectional). One transmitter, up to 20 receivers. 32-bit word. Low speed: 12.5 kbps, High speed: 100 kbps. Used on A320.', module: 'Module 5', label: 'memorize', confidence: 0 },
  { q: 'ARINC 629 — key characteristics?', a: 'Bidirectional. Current-mode bus. 2 Mbps. Used on B777 as primary data bus.', module: 'Module 5', label: 'memorize', confidence: 0 },
  { q: 'VOR frequency band?', a: '108.0–117.95 MHz (VHF)', module: 'ATA 34', label: 'memorize', confidence: 2 },
  { q: 'ILS Localizer frequency?', a: '108.10–111.95 MHz (VHF) — odd tenth decimal MHz', module: 'ATA 34', label: 'memorize', confidence: 1 },
  { q: 'ILS Glideslope frequency?', a: '329.15–335.00 MHz (UHF)', module: 'ATA 34', label: 'memorize', confidence: 0 },
  { q: 'List the Dirty Dozen.', a: '1.Lack of communication 2.Complacency 3.Lack of knowledge 4.Distraction 5.Lack of teamwork 6.Fatigue 7.Lack of resources 8.Pressure 9.Lack of assertiveness 10.Stress 11.Lack of awareness 12.Norms', module: 'Module 9A', label: 'memorize', confidence: 0 },
  { q: 'Gas turbine thermodynamic cycle?', a: 'Brayton (Joule) Cycle: Intake → Compression → Combustion → Expansion → Exhaust', module: 'Module 15', label: 'memorize', confidence: 1 },
  { q: 'What is RAT?', a: 'Ram Air Turbine — emergency device that deploys into airstream to generate hydraulic and/or electrical power when all normal sources fail.', module: 'ATA 24/29', label: 'understand', confidence: 2 },
];

const MISTAKES = [
  { module: 'Module 5', topic: 'Digital Techniques', q: 'ARINC 429 is a bidirectional bus — True or False?', yourAns: 'True', correct: 'False — ARINC 429 is SIMPLEX (unidirectional). ARINC 629 is bidirectional.', date: '2026-09-28', },
  { module: 'Module 9A', topic: 'Human Factors', q: 'The SHELL model was developed by which author?', yourAns: 'James Reason', correct: 'Frank Hawkins developed SHELL; James Reason developed the Swiss Cheese model.', date: '2026-09-30', },
  { module: 'Module 3', topic: 'Electrical', q: 'A TRU converts DC to AC — True or False?', yourAns: 'True', correct: 'False — TRU converts AC to DC (AC → Transform → Rectify → DC).', date: '2026-10-01', },
];

// ── Module Progress Data ────────────────────────────────────────────
const MODULE_PROGRESS = [
  { name: 'Mod 1 — Mathematics', pct: 85, color: '#2979ff' },
  { name: 'Mod 3 — Electrical', pct: 68, color: '#ffd700' },
  { name: 'Mod 7 — Maintenance', pct: 61, color: '#ff9800' },
  { name: 'Mod 8 — Aerodynamics', pct: 51, color: '#00e676' },
  { name: 'Mod 9A — Human Factors', pct: 45, color: '#ff9800' },
  { name: 'Mod 15 — Gas Turbine', pct: 63, color: '#ff4444' },
];

// ── Aircraft Type Data ─────────────────────────────────────────────
const AIRCRAFT_DATA = {
  B777: {
    name: 'Boeing 777',
    variants: 'B777-200, -200ER, -200LR, -300, -300ER',
    engines: 'GE GE90-115B, R-R Trent 800, P&W PW4090',
    intro: 'The B777 is Boeing\'s largest twin-engine widebody. PIA operates B777-200ER and B777-300ER. The aircraft features fly-by-wire flight controls, ARINC 629 data bus, and advanced EICAS.',
    emoji: '🛩️',
    ata: [
      { ch: 'ATA 21', name: 'Air Conditioning / Pressurization', desc: 'Bleed air, packs, cabin pressure' },
      { ch: 'ATA 24', name: 'Electrical Power', desc: 'IDG, bus architecture, RAT, APU gen' },
      { ch: 'ATA 27', name: 'Flight Controls', desc: 'FBW system, actuators, AFCS' },
      { ch: 'ATA 28', name: 'Fuel', desc: 'Centre tank, wing tanks, fuel management' },
      { ch: 'ATA 29', name: 'Hydraulic Power', desc: 'Left/Center/Right systems, EDP, ACMP' },
      { ch: 'ATA 32', name: 'Landing Gear', desc: 'Main gear, nose gear, brakes, steering' },
      { ch: 'ATA 34', name: 'Navigation', desc: 'IRS, GPS, VOR, ILS, TCAS, EGPWS' },
      { ch: 'ATA 36', name: 'Pneumatic', desc: 'Bleed air system, precooler, PRSOV' },
      { ch: 'ATA 49', name: 'APU', desc: 'Auxiliary Power Unit — start, bleed, gen' },
      { ch: 'ATA 71', name: 'Powerplant', desc: 'Engine installation, mounts, cowlings' },
      { ch: 'ATA 73', name: 'Engine Fuel Control', desc: 'FADEC, HMU, fuel nozzles' },
      { ch: 'ATA 79', name: 'Engine Oil', desc: 'Oil system, monitoring, MCD' },
    ],
  },
  A320: {
    name: 'Airbus A320 Family',
    variants: 'A318, A319, A320, A321 (CEO & NEO)',
    engines: 'CFM56-5A/5B, IAE V2500, CFM LEAP-1A (NEO), P&W GTF (NEO)',
    intro: 'The A320 family is the backbone of many airline fleets. PIA operates A320 variants. The aircraft uses ARINC 429 data bus, fly-by-wire sidestick controls, and ECAM for system monitoring.',
    emoji: '✈️',
    ata: [
      { ch: 'ATA 22', name: 'Auto Flight (AFCS)', desc: 'Autopilot, autothrust, FMS' },
      { ch: 'ATA 24', name: 'Electrical Power', desc: 'IDG, EDP, bus tie, RAT' },
      { ch: 'ATA 27', name: 'Flight Controls', desc: 'EFCS, sidestick, spoilers, ELAC/SEC/FAC' },
      { ch: 'ATA 29', name: 'Hydraulic — Green/Blue/Yellow', desc: '3,000 PSI tri-system architecture' },
      { ch: 'ATA 31', name: 'ECAM', desc: 'Electronic Centralized Aircraft Monitor' },
      { ch: 'ATA 34', name: 'Navigation', desc: 'ADIRS, VOR, ILS, GPS, TCAS' },
      { ch: 'ATA 36', name: 'Pneumatic', desc: 'Bleed air management, packs, anti-ice' },
      { ch: 'ATA 73', name: 'Engine Fuel & Control', desc: 'FADEC, fuel system, nozzles' },
      { ch: 'ATA 76', name: 'Engine Controls', desc: 'Thrust levers, reverser' },
      { ch: 'ATA 80', name: 'Starting', desc: 'Engine start — FADEC controlled' },
    ],
  },
  ATR: {
    name: 'ATR Family (ATR-42/72)',
    variants: 'ATR 42-300/500/600, ATR 72-500/600',
    engines: 'Pratt & Whitney Canada PW127E/F/G/M (turboprop)',
    intro: 'The ATR family are turboprop regional aircraft. PIA domestic routes use ATR 72s. The aircraft differs significantly from jet transports — propeller system, conventional controls, and simpler electrical architecture.',
    emoji: '🛫',
    ata: [
      { ch: 'ATA 21', name: 'Air Conditioning', desc: 'Bleed air source, packs, pressurisation' },
      { ch: 'ATA 24', name: 'Electrical Power', desc: 'Starter-generators, battery, bus system' },
      { ch: 'ATA 27', name: 'Flight Controls', desc: 'Conventional controls — no FBW' },
      { ch: 'ATA 28', name: 'Fuel', desc: 'Wing tanks, fuel management, cross-feed' },
      { ch: 'ATA 29', name: 'Hydraulic', desc: 'Single system — gear, brakes, NWS' },
      { ch: 'ATA 32', name: 'Landing Gear', desc: 'Hydraulic retraction, disc brakes' },
      { ch: 'ATA 61', name: 'Propellers', desc: 'Hamilton Sundstrand 247F — 6-blade composite' },
      { ch: 'ATA 72', name: 'Engine — Turboprop', desc: 'PW127 — free turbine, power section, FCU' },
      { ch: 'ATA 76', name: 'Engine Controls', desc: 'Power levers, condition levers, governor' },
      { ch: 'ATA 79', name: 'Engine Oil', desc: 'Oil system, MCD, chip detector' },
    ],
  },
};

// ── Initialize ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setGreeting();
  renderModuleProgress();
  renderB1ModuleMap();
  renderB2ModuleMap();
  renderTopicTree();
  renderPracticalTasks();
  renderFlashcards();
  renderPlanner();
  renderMistakeBook();
  renderProgressDashboard();
  renderAircraftContent('B777');
  setupEventListeners();
  updateCountdown();
  checkInitialLock();
});

function setupEventListeners() {
  // Passcode input enter key
  const passInput = document.getElementById('security-passcode-input');
  if (passInput) {
    passInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') verifyAndUnlock();
    });
  }

  // Nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => switchMode(item.dataset.mode));
  });

  // Hamburger
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Settings
  document.getElementById('btn-settings').addEventListener('click', openSettings);

  // Switch pathway
  document.getElementById('btn-switch-pathway').addEventListener('click', togglePathway);

  // Radio options style update
  document.querySelectorAll('.radio-option input').forEach(input => {
    input.addEventListener('change', function() {
      this.closest('.radio-group').querySelectorAll('.radio-option').forEach(o => o.classList.remove('active'));
      this.closest('.radio-option').classList.add('active');
    });
  });
}

// ── Navigation ─────────────────────────────────────────────────────
function switchMode(mode) {
  STATE.currentMode = mode;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + mode);
  const nav = document.getElementById('nav-' + mode);
  if (page) page.classList.add('active');
  if (nav) nav.classList.add('active');

  const titles = {
    dashboard: 'Mission Control Dashboard',
    teach: 'Teach Mode',
    mcq: 'MCQ Exam Engine',
    practical: 'Practical Tasks',
    viva: 'Oral Viva Simulator',
    flashcards: 'Flashcard Review',
    plan: 'Study Planner',
    research: 'Research Agent',
    chat: 'AI Aviation Chat',
    'b1-modules': 'B1.1 Module Map',
    'b2-modules': 'B2 Module Map',
    aircraft: 'Aircraft Type Training',
    mistakes: 'Mistake Book',
    progress: 'Progress Dashboard',
  };
  document.getElementById('topbar-title').textContent = titles[mode] || mode;

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

// ── Greeting ───────────────────────────────────────────────────────
function setGreeting() {
  const h = new Date().getHours();
  let greet = 'Good Morning';
  if (h >= 12 && h < 17) greet = 'Good Afternoon';
  else if (h >= 17) greet = 'Good Evening';
  
  const heroGreeting = document.getElementById('hero-greeting');
  if (heroGreeting) {
    heroGreeting.innerHTML = `${greet}, <strong>Engr. ${STATE.userName}</strong> 👋 <span style="font-size:11px;font-weight:600;background:rgba(0,229,255,0.18);color:var(--cyan);padding:3px 8px;border-radius:12px;border:1px solid rgba(0,229,255,0.4);margin-left:8px;">👑 Master Owner</span>`;
  }

  const sName = document.getElementById('sidebar-owner-name');
  if (sName) sName.textContent = STATE.userName;
  const sEmail = document.getElementById('sidebar-owner-email');
  if (sEmail) sEmail.textContent = STATE.userEmail;
}

// ── Countdown ──────────────────────────────────────────────────────
function updateCountdown() {
  if (STATE.examDate) {
    const days = Math.ceil((new Date(STATE.examDate) - new Date()) / 86400000);
    document.getElementById('countdown-days').textContent = Math.max(0, days);
  }
}

// ── Module Progress (Dashboard) ───────────────────────────────────
function renderModuleProgress() {
  const el = document.getElementById('module-progress');
  el.innerHTML = MODULE_PROGRESS.map(m => `
    <div class="module-progress-item">
      <div class="module-name">${m.name}</div>
      <div class="module-bar"><div class="module-fill" style="width:${m.pct}%;background:${m.color}"></div></div>
      <div class="module-pct">${m.pct}%</div>
    </div>
  `).join('');
}

// ── Topic Tree (Teach Mode) ────────────────────────────────────────
function renderTopicTree() {
  const modules = STATE.pathway === 'B2' ? B2_MODULES : B1_MODULES;
  const el = document.getElementById('topic-tree');
  el.innerHTML = modules.map(m => {
    const topics = m.topics.split(' · ');
    return `
      <div class="tree-module">
        <div class="tree-module-header" onclick="toggleTreeModule(this)">
          <span>Mod ${m.num} — ${m.title}</span>
          <span class="tree-chevron">›</span>
        </div>
        <div class="tree-topics">
          ${topics.map(t => `<div class="tree-topic" onclick="loadTopic('${t.trim()}')">${t.trim()}</div>`).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function toggleTreeModule(header) {
  header.classList.toggle('open');
}

function filterTopics(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.tree-module').forEach(mod => {
    const topics = mod.querySelectorAll('.tree-topic');
    let anyVisible = false;
    topics.forEach(t => {
      const match = t.textContent.toLowerCase().includes(q);
      t.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    mod.style.display = (anyVisible || q === '') ? '' : 'none';
  });
}

function loadTopic(topicName) {
  switchMode('teach');
  const data = TOPIC_DATA[topicName];

  // Mark active in tree
  document.querySelectorAll('.tree-topic').forEach(t => {
    t.classList.toggle('active', t.textContent.trim() === topicName);
  });

  const content = document.getElementById('teach-content');
  if (!data) {
    content.innerHTML = `
      <div class="teach-topic-content">
        <div class="topic-hero">
          <div class="topic-hero-title">📖 ${topicName}</div>
          <div class="topic-hero-meta">
            <span class="tag understand">UNDERSTAND</span>
            <span class="tag exam">EXAM</span>
          </div>
          <p class="topic-hero-desc">
            This topic is part of your aviation study curriculum. Ask a specific question in the AI Chat to get a detailed explanation, or use the /teach command.
          </p>
        </div>
        <div class="learn-section">
          <h3>💡 Study This Topic</h3>
          <p style="color:var(--text-secondary);font-size:14px;line-height:1.7">
            Type <strong>/teach ${topicName}</strong> in the AI Chat panel to get a complete explanation from zero to exam level, including what to memorize, what to understand, and practice MCQs.
          </p>
        </div>
        <button class="btn-primary" onclick="insertChatAndSwitch('/teach ${topicName}')">
          🤖 Ask AI About This Topic →
        </button>
      </div>`;
    return;
  }

  const labelHtml = data.labels.map(l => `<span class="tag ${l.toLowerCase().replace('-','')}">${l}</span>`).join('');
  const kfHtml = data.keyFacts.map(f => `<div class="key-fact"><strong>${f.label}:</strong> ${f.value}</div>`).join('');
  const understandHtml = (data.understand || []).map(u => `<li>${u}</li>`).join('');
  const memorizeHtml = (data.memorize || []).map(m => `<li>${m}</li>`).join('');
  const practiceHtml = (data.practice || []).map(p => `<li>${p}</li>`).join('');

  content.innerHTML = `
    <div class="teach-topic-content">
      <div class="topic-hero">
        <div class="topic-hero-meta">
          <span class="badge badge-green">${data.track}</span>
          <span class="badge badge-blue">${data.module}</span>
          <span class="badge badge-yellow" style="background:rgba(255,68,68,0.1);color:var(--red);border-color:rgba(255,68,68,0.3);">${data.priority} Priority</span>
        </div>
        <div class="topic-hero-title">${data.title}</div>
        <div class="topic-hero-meta">${labelHtml}</div>
        <p class="topic-hero-desc">${data.description}</p>
      </div>

      <div class="key-facts-box">
        <h4>🔑 KEY FACTS (MEMORIZE)</h4>
        ${kfHtml}
      </div>

      ${data.understand ? `<div class="learn-section"><h3>🧠 UNDERSTAND — Know This Conceptually</h3><ul>${understandHtml}</ul></div>` : ''}
      ${data.memorize ? `<div class="learn-section"><h3>💾 MEMORIZE — Learn These Facts</h3><ul>${memorizeHtml}</ul></div>` : ''}
      ${data.practice ? `<div class="learn-section"><h3>🔧 PRACTICE — Under Supervisor</h3><ul>${practiceHtml}</ul></div>` : ''}

      <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;">
        <button class="btn-primary small" onclick="startMCQForTopic('${topicName}')">📝 MCQ on This Topic</button>
        <button class="btn-secondary small" onclick="startVivaForTopic('${topicName}')">🎤 Viva Question</button>
        <button class="btn-ghost small" onclick="addFlashcard('${topicName}')">⚡ Add to Flashcards</button>
      </div>
    </div>`;
}

function insertChatAndSwitch(cmd) {
  document.getElementById('chat-input').value = cmd;
  switchMode('chat');
  sendChat();
}

// ── MCQ Engine ─────────────────────────────────────────────────────
let qCount = 20;

function adjustQ(delta) {
  qCount = Math.max(5, Math.min(50, qCount + delta));
  document.getElementById('q-count').textContent = qCount;
}

function startMCQ() {
  const track = document.querySelector('input[name="track"]:checked')?.value || 'B1.1';
  const difficulty = document.querySelector('input[name="diff"]:checked')?.value || 'medium';
  STATE.timedMode = document.getElementById('timed-mode').checked;

  const pool = [...MCQ_BANK['all']];
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  STATE.mcqQuestions = pool.slice(0, qCount);
  STATE.mcqCurrent = 0;
  STATE.mcqScore = 0;
  STATE.mcqAnswered = [];

  document.getElementById('mcq-setup').classList.add('hidden');
  document.getElementById('mcq-results').classList.add('hidden');
  document.getElementById('mcq-session').classList.remove('hidden');

  renderMCQQuestion();
}

function renderMCQQuestion() {
  const session = document.getElementById('mcq-session');
  const q = STATE.mcqQuestions[STATE.mcqCurrent];
  if (!q) { showMCQResults(); return; }

  const pct = ((STATE.mcqCurrent) / STATE.mcqQuestions.length) * 100;

  session.innerHTML = `
    <div class="mcq-session-container">
      <div class="mcq-header">
        <span style="font-size:13px;color:var(--text-muted)">Q ${STATE.mcqCurrent + 1} / ${STATE.mcqQuestions.length}</span>
        <div class="mcq-progress-bar"><div class="mcq-progress-fill" style="width:${pct}%"></div></div>
        <span style="font-size:13px;color:var(--green);font-weight:700">Score: ${STATE.mcqScore}</span>
        ${STATE.timedMode ? `<div class="mcq-timer" id="mcq-timer">02:00</div>` : ''}
      </div>
      <div class="question-card">
        <div class="question-meta">
          <span class="badge badge-blue">Practice MCQ</span>
          <span class="badge badge-yellow">${STATE.mcqTrack || 'Mixed'}</span>
        </div>
        <div class="question-text">${q.q}</div>
        <div class="options-list" id="options-list">
          ${q.opts.map((opt, i) => `
            <button class="option-btn" id="opt-${i}" onclick="selectAnswer(${i})">
              <span class="option-letter">${String.fromCharCode(65+i)}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
        <div id="explanation-box"></div>
      </div>
      <div class="mcq-nav">
        <button class="btn-ghost" onclick="resetMCQ()">✕ End Exam</button>
        <button class="btn-primary" id="next-btn" onclick="nextQuestion()" style="display:none">Next →</button>
      </div>
    </div>`;

  if (STATE.timedMode) startMCQTimer();
}

function selectAnswer(idx) {
  const q = STATE.mcqQuestions[STATE.mcqCurrent];
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(b => { b.classList.add('answered'); b.onclick = null; });

  const isCorrect = idx === q.ans;
  if (isCorrect) STATE.mcqScore++;

  buttons[idx].classList.add(isCorrect ? 'correct' : 'wrong');
  buttons[q.ans].classList.add('correct');

  STATE.mcqAnswered.push({ q: q.q, correct: isCorrect, chosen: q.opts[idx], right: q.opts[q.ans] });
  if (!isCorrect) {
    STATE.mistakes.push({ module: 'MCQ', topic: 'Mixed', q: q.q, yourAns: q.opts[idx], correct: q.opts[q.ans], date: new Date().toISOString().slice(0,10) });
  }

  const expBox = document.getElementById('explanation-box');
  expBox.innerHTML = `<div class="explanation-box ${isCorrect ? '' : 'wrong-exp'}">
    <strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</strong><br/>
    ${q.exp}
  </div>`;

  document.getElementById('next-btn').style.display = 'block';
  if (STATE.mcqTimer) { clearInterval(STATE.mcqTimer); STATE.mcqTimer = null; }
}

function nextQuestion() {
  STATE.mcqCurrent++;
  if (STATE.mcqCurrent >= STATE.mcqQuestions.length) showMCQResults();
  else renderMCQQuestion();
}

function showMCQResults() {
  const total = STATE.mcqQuestions.length;
  const score = STATE.mcqScore;
  const pct = Math.round((score / total) * 100);
  const pass = pct >= 75;

  document.getElementById('mcq-session').classList.add('hidden');
  const results = document.getElementById('mcq-results');
  results.classList.remove('hidden');

  const wrongItems = STATE.mcqAnswered.filter(a => !a.correct);

  results.innerHTML = `
    <div class="results-container">
      <div class="results-score ${pass ? 'pass' : 'fail'}">${pct}%</div>
      <div class="results-label">${pass ? '✅ Passed — Well Done!' : '❌ Needs More Study'} · ${score}/${total} correct</div>
      <div class="results-grid">
        <div class="result-stat"><div class="result-stat-val" style="color:var(--green)">${score}</div><div class="result-stat-lbl">Correct</div></div>
        <div class="result-stat"><div class="result-stat-val" style="color:var(--red)">${total - score}</div><div class="result-stat-lbl">Wrong</div></div>
        <div class="result-stat"><div class="result-stat-val" style="color:var(--blue)">${pct}%</div><div class="result-stat-lbl">Score</div></div>
      </div>
      ${wrongItems.length ? `
        <div class="learn-section" style="text-align:left;margin-bottom:24px;">
          <h3>❌ REVIEW WRONG ANSWERS</h3>
          ${wrongItems.map(w => `
            <div style="padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px">${w.q}</div>
              <div style="font-size:12px;color:var(--red)">Your answer: ${w.chosen}</div>
              <div style="font-size:12px;color:var(--green)">Correct: ${w.right}</div>
            </div>
          `).join('')}
        </div>` : ''}
      <div class="results-actions">
        <button class="btn-primary" onclick="resetMCQ()">🔄 Try Again</button>
        <button class="btn-ghost" onclick="switchMode('mistakes')">📖 Mistake Book</button>
      </div>
    </div>`;
}

function resetMCQ() {
  document.getElementById('mcq-session').classList.add('hidden');
  document.getElementById('mcq-results').classList.add('hidden');
  document.getElementById('mcq-setup').classList.remove('hidden');
  if (STATE.mcqTimer) { clearInterval(STATE.mcqTimer); STATE.mcqTimer = null; }
}

function startMCQTimer() {
  STATE.mcqTimeLeft = 120;
  STATE.mcqTimer = setInterval(() => {
    STATE.mcqTimeLeft--;
    const el = document.getElementById('mcq-timer');
    if (el) {
      const m = Math.floor(STATE.mcqTimeLeft / 60).toString().padStart(2, '0');
      const s = (STATE.mcqTimeLeft % 60).toString().padStart(2, '0');
      el.textContent = `${m}:${s}`;
      if (STATE.mcqTimeLeft <= 10) el.style.color = 'var(--red)';
    }
    if (STATE.mcqTimeLeft <= 0) {
      clearInterval(STATE.mcqTimer);
      // Auto-advance
      const unanswered = document.querySelectorAll('.option-btn:not(.answered)');
      if (unanswered.length > 0) {
        STATE.mcqAnswered.push({ q: STATE.mcqQuestions[STATE.mcqCurrent].q, correct: false, chosen: '(Time up)', right: STATE.mcqQuestions[STATE.mcqCurrent].opts[STATE.mcqQuestions[STATE.mcqCurrent].ans] });
        STATE.mcqCurrent++;
        renderMCQQuestion();
      }
    }
  }, 1000);
}

function startMCQForTopic(topic) {
  switchMode('mcq');
  setTimeout(() => startMCQ(), 100);
}

// ── Practical Tasks ───────────────────────────────────────────────
function renderPracticalTasks(filter = 'all') {
  const el = document.getElementById('practical-tasks');
  const tasks = filter === 'all' ? PRACTICAL_TASKS : PRACTICAL_TASKS.filter(t => t.aircraft === filter);
  el.innerHTML = tasks.map(t => `
    <div class="practical-task-card" onclick="showPracticalDetail('${t.id}')">
      <div class="task-aircraft">${t.aircraft} · ${t.ata}</div>
      <div class="task-name">${t.name}</div>
      <div class="task-ata">${t.desc.slice(0, 80)}...</div>
      <div>
        <span class="task-status status-${t.status}">${t.status.toUpperCase()}</span>
        <span class="tag safety" style="margin-left:8px">SUPERVISED</span>
      </div>
    </div>
  `).join('');
}

function filterPractical(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPracticalTasks(filter);
  document.getElementById('practical-detail').classList.add('hidden');
}

function showPracticalDetail(id) {
  const task = PRACTICAL_TASKS.find(t => t.id === id);
  if (!task) return;
  const el = document.getElementById('practical-detail');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="detail-card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <button class="btn-ghost small" onclick="document.getElementById('practical-detail').classList.add('hidden')">← Back</button>
        <h2 style="font-family:'Orbitron',sans-serif;font-size:16px;">${task.name}</h2>
        <span class="badge badge-blue">${task.aircraft} · ${task.ata}</span>
      </div>
      <div class="safety-banner" style="margin:0 0 20px;">
        <span class="safety-icon">🛡️</span>
        <span><strong>Educational Use Only.</strong> These steps are for learning and preparation. Never perform actual maintenance without the current approved AMM, Task Card, and authorized supervisor.</span>
      </div>
      <div class="learn-section">
        <h3>🎯 Task Description</h3>
        <p style="font-size:14px;color:var(--text-secondary);line-height:1.7">${task.desc}</p>
      </div>
      <div class="learn-section">
        <h3>📋 Learning Steps</h3>
        <div class="detail-steps">
          ${task.steps.map((s, i) => `
            <div class="detail-step">
              <div class="step-num">${i + 1}</div>
              <div class="step-text">${s}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:16px">
        <button class="btn-primary small" onclick="insertChatAndSwitch('/practical ${task.name}')">🤖 Ask AI About This Task</button>
        <button class="btn-ghost small" onclick="insertChatAndSwitch('/viva ${task.name}')">🎤 Viva on This Task</button>
      </div>
    </div>`;
  el.scrollIntoView({ behavior: 'smooth' });
}

// ── Viva ──────────────────────────────────────────────────────────
let vivaCurrentIdx = 0;
let vivaAnswered = false;

function startViva() {
  const type = document.querySelector('input[name="viva-type"]:checked')?.value || 'basic';
  const style = document.querySelector('input[name="examiner"]:checked')?.value || 'mentor';

  // Shuffle questions
  STATE.vivaQuestions = [...VIVA_QUESTIONS].sort(() => Math.random() - 0.5);
  vivaCurrentIdx = 0;
  vivaAnswered = false;

  document.getElementById('viva-setup').classList.add('hidden');
  document.getElementById('viva-session').classList.remove('hidden');
  renderVivaQuestion();
}

function renderVivaQuestion() {
  const q = STATE.vivaQuestions[vivaCurrentIdx];
  if (!q) {
    document.getElementById('viva-session').innerHTML = `
      <div class="viva-session-box" style="text-align:center">
        <div style="font-size:64px;margin-bottom:16px">🎓</div>
        <h2 style="font-family:'Orbitron',sans-serif;margin-bottom:12px">Viva Complete!</h2>
        <p style="color:var(--text-secondary);margin-bottom:24px">You answered ${vivaCurrentIdx} viva questions.</p>
        <button class="btn-primary" onclick="document.getElementById('viva-setup').classList.remove('hidden');document.getElementById('viva-session').classList.add('hidden')">Try Again</button>
      </div>`;
    return;
  }
  vivaAnswered = false;

  document.getElementById('viva-session').innerHTML = `
    <div class="viva-session-box">
      <div class="viva-question-card">
        <div class="viva-examiner-icon">🎓</div>
        <div class="viva-q-text">${q.q}</div>
        <div class="viva-topic-hint">Topic: ${q.topic}</div>
        <div class="score-dots">
          ${[1,2,3,4,5].map(i => `<div class="score-dot"></div>`).join('')}
        </div>
      </div>
      <div class="viva-answer-box">
        <h4>YOUR ANSWER</h4>
        <textarea class="viva-input" id="viva-input" placeholder="Type your answer here. Explain as you would to an examiner..."></textarea>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button class="btn-secondary" onclick="showVivaHint()">💡 Hint</button>
        <button class="btn-primary" onclick="submitVivaAnswer()">Submit Answer →</button>
        <button class="btn-ghost" onclick="skipViva()">Skip →</button>
      </div>
      <div id="viva-feedback"></div>
    </div>`;
}

function showVivaHint() {
  const q = STATE.vivaQuestions[vivaCurrentIdx];
  const fb = document.getElementById('viva-feedback');
  fb.innerHTML = `<div class="viva-feedback" style="background:rgba(255,215,0,0.05);border-color:rgba(255,215,0,0.2)"><strong>💡 Hint:</strong> ${q.hint}</div>`;
}

function submitVivaAnswer() {
  if (vivaAnswered) return;
  const q = STATE.vivaQuestions[vivaCurrentIdx];
  const answer = document.getElementById('viva-input')?.value || '';
  vivaAnswered = true;

  const score = answer.length > 30 ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 2) + 2;
  const dots = document.querySelectorAll('.score-dot');
  dots.forEach((d, i) => { if (i < score) d.classList.add('filled'); });

  const fb = document.getElementById('viva-feedback');
  fb.innerHTML = `
    <div class="viva-feedback">
      <strong>📋 Examiner Feedback (Score: ${score}/5)</strong><br/><br/>
      ${score >= 4 ? '✅ Good answer!' : '⚠️ Needs improvement'}<br/><br/>
      <strong>Model Answer:</strong><br/>
      ${q.modelAns}
      <div style="margin-top:16px">
        <button class="btn-primary small" onclick="nextVivaQuestion()">Next Question →</button>
      </div>
    </div>`;
}

function skipViva() {
  vivaCurrentIdx++;
  renderVivaQuestion();
}

function nextVivaQuestion() {
  vivaCurrentIdx++;
  renderVivaQuestion();
}

function startVivaForTopic(topic) {
  switchMode('viva');
}

// ── Flashcards ────────────────────────────────────────────────────
let fcCurrentIndex = 0;
let fcFlipped = false;

function renderFlashcards() {
  const el = document.getElementById('flashcard-area');
  const due = FLASHCARDS.filter(f => f.confidence < 4);

  el.innerHTML = `
    <div class="flashcard-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div class="fc-stats">
          <div class="fc-stat">Due<span>${due.length}</span></div>
          <div class="fc-stat">Card<span id="fc-current-num">${fcCurrentIndex + 1} / ${due.length}</span></div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="filter-btn active" onclick="showDueCards(this)">Due (${due.length})</button>
          <button class="filter-btn" onclick="showAllCards(this)">All (${FLASHCARDS.length})</button>
        </div>
      </div>
      <div class="flashcard ${fcFlipped ? 'flipped' : ''}" id="fc-card" onclick="flipCard()">
        <div class="flashcard-inner">
          <div class="card-face card-front">
            <div class="fc-label">QUESTION — Click to reveal</div>
            <div class="fc-front-text" id="fc-front">${due[fcCurrentIndex]?.q || 'No more cards!'}</div>
            <div class="fc-click-hint">🖱️ Click card to flip</div>
          </div>
          <div class="card-face card-back">
            <div class="fc-label">ANSWER</div>
            <div class="fc-back-text" id="fc-back">${due[fcCurrentIndex]?.a || ''}</div>
          </div>
        </div>
      </div>
      <div class="fc-controls" id="fc-controls" style="display:${fcFlipped ? 'flex' : 'none'}">
        <button class="fc-btn fc-btn-hard" onclick="rateCard(1)">😰 Hard<br/><small>Review soon</small></button>
        <button class="fc-btn fc-btn-ok" onclick="rateCard(2)">🤔 OK<br/><small>Review tomorrow</small></button>
        <button class="fc-btn fc-btn-easy" onclick="rateCard(3)">😊 Easy<br/><small>Review in 3 days</small></button>
      </div>
      <div class="fc-stats" style="margin-top:16px">
        <div class="fc-stat">Module<span>${due[fcCurrentIndex]?.module || ''}</span></div>
        <div class="fc-stat">Label<span style="text-transform:capitalize">${due[fcCurrentIndex]?.label || ''}</span></div>
      </div>
    </div>`;
}

function flipCard() {
  fcFlipped = !fcFlipped;
  const card = document.getElementById('fc-card');
  const controls = document.getElementById('fc-controls');
  if (card) card.classList.toggle('flipped', fcFlipped);
  if (controls) controls.style.display = fcFlipped ? 'flex' : 'none';
}

function rateCard(rating) {
  const due = FLASHCARDS.filter(f => f.confidence < 4);
  if (due[fcCurrentIndex]) {
    due[fcCurrentIndex].confidence = Math.min(4, due[fcCurrentIndex].confidence + (rating - 1));
  }
  fcCurrentIndex = (fcCurrentIndex + 1) % Math.max(1, due.length);
  fcFlipped = false;
  renderFlashcards();
}

function showDueCards(btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  fcCurrentIndex = 0; fcFlipped = false;
  renderFlashcards();
}
function showAllCards(btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  fcCurrentIndex = 0; fcFlipped = false;
  renderFlashcards();
}

function addFlashcard(topic) {
  showToast(`⚡ ${topic} added to flashcard queue!`);
}

// ── Planner ───────────────────────────────────────────────────────
function renderPlanner() {
  const el = document.getElementById('planner-layout');
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  el.innerHTML = `
    <div class="planner-container">
      <div class="planner-header-bar">
        <div class="planner-tabs">
          <button class="planner-tab active" onclick="switchPlannerView('day', this)">Today</button>
          <button class="planner-tab" onclick="switchPlannerView('week', this)">This Week</button>
          <button class="planner-tab" onclick="switchPlannerView('month', this)">Month</button>
        </div>
        <span style="font-size:13px;color:var(--text-secondary);padding-top:8px">${dayName}, ${dateStr}</span>
      </div>
      <div class="day-plan-grid">
        <div class="day-plan-section">
          <h3>📋 Today's Schedule</h3>
          ${[
            { time: '09:00', name: 'EWIS — Core Concepts', meta: 'Module 7 · 45 min · Memorize + Understand', color: 'var(--red)' },
            { time: '10:00', name: 'MCQ Practice — Module 7 × 20', meta: 'Exam practice · 30 min', color: 'var(--orange)' },
            { time: '10:30', name: 'Break + Review', meta: 'Coffee break · 15 min', color: 'var(--text-muted)' },
            { time: '11:00', name: 'Fuel Tank Safety Regulations', meta: 'Module 10 · 30 min · Memorize', color: 'var(--orange)' },
            { time: '11:30', name: 'Flashcard Review', meta: 'Spaced repetition · 20 min · 12 cards due', color: 'var(--blue)' },
            { time: '14:00', name: 'B777 Hydraulic System', meta: 'Type training ATA 29 · 60 min', color: 'var(--blue)' },
            { time: '15:00', name: 'Weak Topic: Digital Techniques', meta: 'Module 5 · 45 min · Targeted repair', color: 'var(--red)' },
            { time: '17:00', name: 'End-of-Day MCQ × 10', meta: 'Mixed modules · 15 min', color: 'var(--green)' },
          ].map(b => `
            <div class="time-block">
              <div class="time-label">${b.time}</div>
              <div class="time-task-dot" style="background:${b.color}"></div>
              <div class="time-task">
                <div class="time-task-name">${b.name}</div>
                <div class="time-task-meta">${b.meta}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="day-plan-section">
            <h3>🎯 Today's Goals</h3>
            ${['Complete EWIS module review', 'Score ≥80% on Module 7 MCQs', 'Review 12 due flashcards', 'Study B777 ATA 29 systems'].map(g => `
              <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;color:var(--text-secondary)">
                <span style="color:var(--green)">◻</span> ${g}
              </div>
            `).join('')}
          </div>
          <div class="day-plan-section">
            <h3>⏱️ Study Summary</h3>
            <div style="font-size:13px;color:var(--text-secondary);line-height:2">
              Total planned: <strong style="color:var(--text-primary)">3h 45min</strong><br/>
              Theory: <strong style="color:var(--blue)">2h 30min</strong><br/>
              Practice: <strong style="color:var(--green)">1h 15min</strong><br/>
              Weak topics: <strong style="color:var(--red)">45min</strong>
            </div>
          </div>
          <div class="day-plan-section">
            <h3>💡 Agent Recommendation</h3>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">
              Based on your weak topics and upcoming exam, focus heavily on <strong>Digital Techniques (Module 5)</strong> today. Your accuracy there is only 32% — 45 focused minutes with targeted MCQs can raise this significantly.
            </p>
          </div>
        </div>
      </div>
    </div>`;
}

function switchPlannerView(view, btn) {
  document.querySelectorAll('.planner-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

// ── Research ──────────────────────────────────────────────────────
function doResearch() {
  const query = document.getElementById('research-query').value.trim();
  if (!query) return;
  quickResearch(query);
}

function quickResearch(query) {
  document.getElementById('research-query').value = query;
  const el = document.getElementById('research-results');
  el.innerHTML = `<div class="chat-msg agent" style="padding:20px"><div class="msg-avatar">🔍</div><div class="msg-bubble"><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;

  setTimeout(() => {
    const results = getResearchResults(query);
    el.innerHTML = results.map(r => `
      <div class="research-result-card">
        <div class="rr-source-type ${r.type}">${r.typeLabel}</div>
        <div class="rr-title">${r.title}</div>
        <div class="rr-authority">${r.authority}</div>
        <div class="rr-excerpt">${r.excerpt}</div>
        <div class="rr-meta">
          <div class="rr-meta-item">Revision: <span>${r.revision}</span></div>
          <div class="rr-meta-item">Source: <span>${r.source}</span></div>
          <div class="rr-meta-item">Status: <span style="color:${r.verified ? 'var(--green)' : 'var(--orange)'}">${r.verified ? '✅ Verified' : '⚠️ Verify current revision'}</span></div>
        </div>
      </div>
    `).join('') + `<div class="safety-banner" style="margin-top:16px">
      <span class="safety-icon">⚠️</span>
      <span>Always verify currency of regulatory documents. PCAA/PIA course material and current ANOs take precedence. Check revision dates before treating any reference as current requirement.</span>
    </div>`;
  }, 1200);
}

function getResearchResults(query) {
  const q = query.toLowerCase();
  const results = [];

  if (q.includes('ewis') || q.includes('wiring')) {
    results.push({ type: 'official', typeLabel: '🏛️ OFFICIAL REQUIREMENT', title: 'EWIS — Electrical Wiring Interconnect Systems (PIA/PCAA)', authority: 'PCAA Air Navigation Order / PIA Training Centre Syllabus', excerpt: 'EWIS training is mandatory for B1 and B2 licence category candidates. Covers all wiring, wiring devices, and combinations installed for transmitting electrical energy. Includes requirements for wire inspection, routing, protection from chafing, heat, and fluid contamination.', revision: 'Per current ANO revision', source: 'PIA Training Centre / PCAA', verified: true });
    results.push({ type: 'reference', typeLabel: '📚 REFERENCE (EASA)', title: 'EASA Part-66 Appendix I — EWIS Training Requirements', authority: 'EASA (European Union Aviation Safety Agency)', excerpt: 'EASA regulations require EWIS awareness training per EC No 2042/2003. Module 7 Section 7.14 covers Wiring practices. B1/B2 candidates must understand EWIS inspection standards, wire identification, routing rules, and documentation. NOTE: Use as reference only — PCAA/PIA requirements govern Pakistani licences.', revision: 'Easy Access Rules for Continuing Airworthiness (current)', source: 'easa.europa.eu', verified: false });
  }

  if (q.includes('fuel tank') || q.includes('fts')) {
    results.push({ type: 'official', typeLabel: '🏛️ OFFICIAL REQUIREMENT', title: 'Fuel Tank Safety (FTS) Training Requirements', authority: 'PCAA / PIA Training Centre', excerpt: 'FTS training is mandatory for certifying staff. Covers the prevention of fuel tank ignition, SFAR 88/equivalent requirements, electrical bonding in fuel systems, and maintenance practices near fuel tanks. Applies to all B1 and B2 engineers working on aircraft fuel systems.', revision: 'Per current ANO', source: 'PIA Training Units', verified: true });
  }

  if (q.includes('pcaa') || q.includes('part-66') || q.includes('licence')) {
    results.push({ type: 'official', typeLabel: '🏛️ OFFICIAL REQUIREMENT', title: 'PCAA Aircraft Maintenance Licence (AML) Requirements', authority: 'Pakistan Civil Aviation Authority (PCAA)', excerpt: 'PCAA issues B1.1 and B2 Aircraft Maintenance Licences under the Air Navigation Order (ANO). Requirements include: basic training at approved AMO, passing modular examinations at the Examination Unit, practical experience requirements, and medical fitness. PIA Training Centre is a PCAA-approved training organization.', revision: 'Current PCAA ANO', source: 'www.caapakistan.com.pk', verified: false });
    results.push({ type: 'reference', typeLabel: '📚 REFERENCE (EASA)', title: 'EASA Part-66 — Knowledge Levels B1/B2', authority: 'EASA', excerpt: 'EASA Part-66 Appendix I defines knowledge level requirements (Level 1–3) for each module and sub-module for B1 and B2 categories. These are used as a reference framework. Pakistani (PCAA) requirements may differ — always use current PCAA ANO and PIA course syllabi as the authoritative source.', revision: 'See easa.europa.eu (current)', source: 'EASA online', verified: false });
  }

  if (q.includes('human factors') || q.includes('crm')) {
    results.push({ type: 'official', typeLabel: '🏛️ OFFICIAL REQUIREMENT', title: 'Human Factors in Aviation Maintenance (Module 9A)', authority: 'PCAA / PIA Training Centre / ICAO', excerpt: 'Human Factors (HF) training is required for all B1 and B2 certifying staff. Based on ICAO Doc 9683 and equivalent ANO requirements. Covers SHELL model, Dirty Dozen, CRM, error management, fatigue, stress, and complacency. Module 9A in the basic training curriculum.', revision: 'ICAO Doc 9683 Vol I/II; current ANO', source: 'ICAO / PCAA', verified: true });
  }

  if (q.includes('aviation legislation') || q.includes('pakistan')) {
    results.push({ type: 'official', typeLabel: '🏛️ OFFICIAL REQUIREMENT', title: 'Aviation Legislation — Pakistan (Module 10)', authority: 'PCAA / Pakistan Air Navigation Orders (ANO)', excerpt: 'Module 10 covers: ICAO organisation and conventions, PCAA regulatory framework, Pakistan Air Navigation Orders (ANO), airworthiness standards, operator certification, maintenance organisation requirements, aircraft documentation, Airworthiness Directives (ADs), and licensing requirements for maintenance engineers.', revision: 'Current PCAA ANO — verify on caapakistan.com.pk', source: 'PCAA / PIA Training Centre', verified: false });
  }

  if (results.length === 0) {
    results.push({ type: 'reference', typeLabel: '📚 GENERAL REFERENCE', title: `Research: "${query}"`, authority: 'PIA Aviation AI Agent', excerpt: `For this topic, consult your current PIA course syllabus, PCAA ANO, and approved training materials. The agent recommends using the /teach command in the AI Chat for a detailed explanation, or checking the official PIA Training Centre (piac.com.pk) and PCAA (caapakistan.com.pk) websites for regulatory documents.`, revision: 'Verify with current documents', source: 'Internal knowledge base', verified: false });
  }

  return results;
}

// ── AI Chat ───────────────────────────────────────────────────────
function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
}

function insertCommand(cmd) {
  const input = document.getElementById('chat-input');
  input.value = cmd;
  input.focus();
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  appendChatMsg('user', '👤', `<p>${escHtml(msg)}</p>`);

  // Typing indicator
  const typingId = 'typing-' + Date.now();
  appendChatMsg('agent', '✈️', `<div class="typing-dots" id="${typingId}"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`);

  setTimeout(() => {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.closest('.chat-msg').remove();
    const response = processCommand(msg);
    appendChatMsg('agent', '✈️', response);
    scrollChatToBottom();
  }, 900 + Math.random() * 600);

  scrollChatToBottom();
}

function appendChatMsg(role, avatar, html) {
  const messages = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `<div class="msg-avatar">${avatar}</div><div class="msg-bubble">${html}</div>`;
  messages.appendChild(div);
}

function scrollChatToBottom() {
  const el = document.getElementById('chat-messages');
  el.scrollTop = el.scrollHeight;
}

function processCommand(msg) {
  const lower = msg.toLowerCase().trim();

  if (lower.startsWith('/teach') || lower.startsWith('teach me') || lower.startsWith('explain')) {
    const topic = msg.replace(/^\/teach\s*/i, '').replace(/^(teach me|explain)\s*/i, '').trim();
    const data = TOPIC_DATA[Object.keys(TOPIC_DATA).find(k => topic.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(topic.toLowerCase()))];
    if (data) {
      setTimeout(() => loadTopic(Object.keys(TOPIC_DATA).find(k => topic.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(topic.toLowerCase()))), 200);
      return `<strong>📚 Opening: ${data.title}</strong><p>Switching to Teach Mode with detailed explanation. The topic includes what to memorize, understand, and practice.</p>`;
    }
    return `<strong>📚 Teaching: ${topic || 'Select a topic'}</strong><p>I can explain any aviation topic in detail. For your current syllabus, popular topics include:</p>
      <ul><li>EWIS (Electrical Wiring Interconnect Systems)</li><li>Human Factors & The Dirty Dozen</li><li>Gas Turbine Engine — Turbofan</li><li>Hydraulic Systems (B777/A320)</li><li>Navigation Systems (ILS/VOR/DME)</li><li>Electrical Power (AC/DC systems)</li></ul>
      <p>Type <code>/teach [topic name]</code> for a specific topic.</p>`;
  }

  if (lower.startsWith('/mcq') || lower.includes('mcq') || lower.includes('practice question')) {
    const module = msg.replace(/^\/mcq\s*/i, '').trim();
    setTimeout(() => { switchMode('mcq'); setTimeout(startMCQ, 300); }, 200);
    return `<strong>📝 Starting MCQ Session</strong><p>Launching MCQ exam for ${module || 'mixed modules'}. You'll get ${qCount} practice questions. Remember: these are <em>practice questions</em>, not actual PCAA/PIA exam questions.</p>`;
  }

  if (lower.startsWith('/today') || lower === 'what should i study today' || lower.includes("today's plan")) {
    return `<strong>📅 Today's Study Plan</strong>
      <p>Based on your weak topics and exam timeline, here's your plan for today:</p>
      <div class="command-list">
        <div class="cmd-row"><span class="cmd">09:00</span><span class="cmd-desc">EWIS — Core Concepts (45 min) · P0 SAFETY</span></div>
        <div class="cmd-row"><span class="cmd">10:00</span><span class="cmd-desc">MCQ Practice Module 7 × 20 (30 min)</span></div>
        <div class="cmd-row"><span class="cmd">11:00</span><span class="cmd-desc">Fuel Tank Safety Regulations (30 min)</span></div>
        <div class="cmd-row"><span class="cmd">11:30</span><span class="cmd-desc">Flashcard Review — 12 cards due (20 min)</span></div>
        <div class="cmd-row"><span class="cmd">14:00</span><span class="cmd-desc">B777 Hydraulic System ATA 29 (60 min)</span></div>
        <div class="cmd-row"><span class="cmd">15:00</span><span class="cmd-desc">Weak Topic: Digital Techniques (45 min)</span></div>
      </div>
      <p>Total: ~3h 45min. Open the <strong>Study Planner</strong> for the full schedule.</p>`;
  }

  if (lower.startsWith('/weak') || lower.includes('weak topics') || lower.includes('weak areas')) {
    return `<strong>⚠️ Your Weak Topics</strong>
      <div class="command-list">
        <div class="cmd-row"><span class="cmd" style="background:rgba(255,68,68,0.1);border-color:rgba(255,68,68,0.3);color:var(--red)">32%</span><span class="cmd-desc">Digital Techniques & Avionics Systems (Module 5)</span></div>
        <div class="cmd-row"><span class="cmd" style="background:rgba(255,68,68,0.1);border-color:rgba(255,68,68,0.3);color:var(--red)">45%</span><span class="cmd-desc">Human Factors & CRM (Module 9A)</span></div>
        <div class="cmd-row"><span class="cmd" style="color:var(--orange)">51%</span><span class="cmd-desc">Aerodynamics — High Speed Flight (Module 8)</span></div>
        <div class="cmd-row"><span class="cmd" style="color:var(--orange)">55%</span><span class="cmd-desc">Pneumatic & Air Conditioning (Module 11A)</span></div>
        <div class="cmd-row"><span class="cmd" style="color:var(--orange)">59%</span><span class="cmd-desc">Navigation Systems — ILS/VOR/DME (ATA 34)</span></div>
      </div>
      <p>Priority: Start with <strong>Digital Techniques</strong> — lowest accuracy, heavily examined. Use <code>/teach Digital Techniques</code> to begin.</p>`;
  }

  if (lower.startsWith('/viva') || lower.includes('viva')) {
    setTimeout(() => switchMode('viva'), 200);
    return `<strong>🎤 Starting Viva Session</strong><p>Opening the Oral Viva Simulator. You'll face questions from your current modules. The examiner will ask, you answer, and you'll get feedback with model answers.</p>`;
  }

  if (lower.startsWith('/practical') || lower.includes('practical') || lower.includes('maintenance task')) {
    const task = msg.replace(/^\/practical\s*/i, '').trim();
    setTimeout(() => switchMode('practical'), 200);
    return `<strong>🔧 Practical Tasks</strong><p>Opening the Practical Task simulator${task ? ` for: <strong>${task}</strong>` : ''}.</p>
      <div class="safety-banner" style="margin:10px 0">
        <span>🛡️ <strong>Remember:</strong> All practical content is for educational preparation only. Actual maintenance requires current approved AMM, Task Cards, and authorized supervision.</span>
      </div>`;
  }

  if (lower.startsWith('/research') || lower.includes('regulation') || lower.includes('requirement')) {
    const topic = msg.replace(/^\/research\s*/i, '').trim();
    if (topic) {
      setTimeout(() => { switchMode('research'); setTimeout(() => quickResearch(topic), 300); }, 200);
      return `<strong>🔍 Researching: ${topic}</strong><p>Opening Research Agent and searching official PCAA/PIA sources...</p>`;
    }
    return `<strong>🔍 Research Agent</strong><p>What would you like to research? I can look up:</p>
      <ul><li>PCAA licensing requirements</li><li>Aviation Legislation (Module 10)</li><li>EWIS/FTS regulatory requirements</li><li>Aircraft maintenance regulations (ANO)</li></ul>
      <p>Example: <code>/research PCAA Part-66 B2 requirements</code></p>`;
  }

  if (lower.startsWith('/flashcards') || lower.includes('flashcard') || lower.includes('revision')) {
    setTimeout(() => switchMode('flashcards'), 200);
    return `<strong>⚡ Flashcard Review</strong><p>Opening your spaced-repetition flashcards. You have <strong>12 cards due</strong> today. Remember: Hard = review soon, OK = tomorrow, Easy = 3 days.</p>`;
  }

  if (lower.startsWith('/memorize') || lower.includes('what to memorize') || lower.includes('kya memorize')) {
    const topic = msg.replace(/^\/memorize\s*/i, '').trim();
    if (TOPIC_DATA[topic]) {
      const data = TOPIC_DATA[topic];
      return `<strong>💾 Memorize: ${topic}</strong><br/><br/>${data.memorize.map(m => `• ${m}`).join('<br/>')}`;
    }
    return `<strong>💾 What to Memorize — Top Priority Items</strong>
      <ul>
        <li><strong>EWIS:</strong> Definition, post-accident requirement, routing rules</li>
        <li><strong>Dirty Dozen:</strong> All 12 (Fatigue, Distraction, Complacency...)</li>
        <li><strong>AC Power:</strong> 115V · 3-phase · 400Hz</li>
        <li><strong>Pascal's Law:</strong> Pressure transmits equally in all directions</li>
        <li><strong>ARINC 429:</strong> Simplex · 32-bit · 12.5kbps/100kbps</li>
        <li><strong>VOR:</strong> 108–117.95 MHz</li>
        <li><strong>Hydraulics:</strong> B777 = Left/Center/Right · A320 = Green/Blue/Yellow · 3,000 PSI</li>
        <li><strong>Gas Turbine Cycle:</strong> Brayton — Intake→Compress→Combust→Expand</li>
      </ul>`;
  }

  if (lower.includes('b777') || lower.includes('boeing 777')) {
    return `<strong>✈️ Boeing B777 — Quick Reference</strong>
      <div class="command-list">
        <div class="cmd-row"><span class="cmd">Data Bus</span><span class="cmd-desc">ARINC 629 (bidirectional, 2 Mbps)</span></div>
        <div class="cmd-row"><span class="cmd">Hydraulics</span><span class="cmd-desc">Left · Center · Right · 3,000 PSI each</span></div>
        <div class="cmd-row"><span class="cmd">Engines</span><span class="cmd-desc">GE90-115B · R-R Trent 800 · PW4090</span></div>
        <div class="cmd-row"><span class="cmd">Controls</span><span class="cmd-desc">Fly-by-Wire (FBW) · EICAS display</span></div>
        <div class="cmd-row"><span class="cmd">Electrical</span><span class="cmd-desc">IDG × 2 · APU gen · RAT emergency</span></div>
      </div>
      <p>Use <code>/teach B777</code> or open <strong>Aircraft Types → B777</strong> for full ATA chapter breakdown.</p>`;
  }

  if (lower.includes('a320') || lower.includes('airbus')) {
    return `<strong>✈️ Airbus A320 — Quick Reference</strong>
      <div class="command-list">
        <div class="cmd-row"><span class="cmd">Data Bus</span><span class="cmd-desc">ARINC 429 (simplex, up to 100 kbps)</span></div>
        <div class="cmd-row"><span class="cmd">Hydraulics</span><span class="cmd-desc">Green · Blue · Yellow · 3,000 PSI</span></div>
        <div class="cmd-row"><span class="cmd">Controls</span><span class="cmd-desc">FBW Sidestick · ELAC/SEC/FAC computers</span></div>
        <div class="cmd-row"><span class="cmd">Monitoring</span><span class="cmd-desc">ECAM (Electronic Centralised Aircraft Monitor)</span></div>
        <div class="cmd-row"><span class="cmd">Engines</span><span class="cmd-desc">CFM56-5B · IAE V2500 · LEAP-1A (NEO)</span></div>
      </div>`;
  }

  if (lower.includes('hello') || lower.includes('assalam') || lower.includes('hi') || lower.includes('huzaifa') || lower.includes('owner')) {
    return `<p>Wa Alaikum Assalam, <strong>Engr. Huzaifa</strong>! ✈️</p>
      <div class="safety-banner" style="margin:10px 0;background:rgba(0,229,255,0.08);border-color:rgba(0,229,255,0.3)">
        <span>👑 <strong>Master Owner Access Active:</strong> <code>${STATE.userEmail}</code> · Dual B1.1 (Aerospace) + B2 (Avionics) authorized.</span>
      </div>
      <p>All modules, mock exams, practical simulations, and PIA fleet systems are unlocked. What would you like to review?</p>
      <ul>
        <li><strong>/teach EWIS</strong> — Deep dive into safety & wiring</li>
        <li><strong>/mcq</strong> — Launch official PCAA/EASA mock exam</li>
        <li><strong>/today</strong> — Today's focused study schedule</li>
        <li><strong>/weak-topics</strong> — Review current weak areas</li>
        <li><strong>/viva</strong> — Oral viva board simulation</li>
      </ul>`;
  }

  // Generic response
  return `<strong>🤖 PIA Aviation Agent</strong>
    <p>I received your message: "<em>${escHtml(msg)}</em>"</p>
    <p>For best results, use commands like:</p>
    <ul>
      <li><code>/teach [topic]</code> — Detailed explanation</li>
      <li><code>/mcq</code> — Start practice MCQs</li>
      <li><code>/today</code> — Today's study plan</li>
      <li><code>/weak-topics</code> — Your weak areas</li>
      <li><code>/research [regulation]</code> — Look up requirements</li>
    </ul>
    <p>Or ask a direct question about any aviation topic!</p>`;
}

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Module Maps ───────────────────────────────────────────────────
function renderB1ModuleMap() {
  const el = document.getElementById('b1-module-map');
  el.innerHTML = `<div class="module-map-grid">${B1_MODULES.map(m => renderModuleCard(m)).join('')}</div>`;
}

function renderB2ModuleMap() {
  const el = document.getElementById('b2-module-map');
  el.innerHTML = `<div class="module-map-grid">${B2_MODULES.map(m => renderModuleCard(m)).join('')}</div>`;
}

function renderModuleCard(m) {
  const topics = m.topics.split(' · ');
  return `
    <div class="module-card" onclick="loadTopic('${topics[0]}')">
      <div class="module-card-header">
        <span class="module-number">MODULE ${m.num}</span>
        <span class="badge badge-blue">${m.progress}%</span>
      </div>
      <div class="module-card-title">${m.title}</div>
      <div class="module-card-body">
        <div class="module-card-topics">${m.topics}</div>
        <div class="module-card-footer">
          <div class="module-card-bar">
            <div class="module-card-fill" style="width:${m.progress}%;background:${m.color}"></div>
          </div>
          <span style="font-size:11px;color:var(--text-muted)">${m.progress}%</span>
        </div>
      </div>
    </div>`;
}

// ── Aircraft Types ────────────────────────────────────────────────
function switchAircraft(ac, btn) {
  document.querySelectorAll('.aircraft-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  STATE.currentAircraft = ac;
  renderAircraftContent(ac);
}

function renderAircraftContent(ac) {
  const data = AIRCRAFT_DATA[ac];
  const el = document.getElementById('aircraft-content');
  if (!data) return;
  el.innerHTML = `
    <div class="aircraft-hero">
      <div class="aircraft-emoji">${data.emoji}</div>
      <div class="aircraft-info">
        <h2>${data.name}</h2>
        <p><strong>Variants:</strong> ${data.variants}</p>
        <p><strong>Engines:</strong> ${data.engines}</p>
        <p style="margin-top:8px">${data.intro}</p>
      </div>
    </div>
    <div class="safety-banner">
      <span class="safety-icon">⚠️</span>
      <span>Aircraft-specific technical data is for educational orientation only. Always use the current, approved Aircraft Maintenance Manual (AMM), Component Maintenance Manual (CMM), and applicable revision for actual maintenance decisions.</span>
    </div>
    <h3 style="font-family:'Orbitron',sans-serif;font-size:13px;color:var(--text-muted);margin:20px 0 12px;letter-spacing:1px">ATA CHAPTERS — STUDY THESE SYSTEMS</h3>
    <div class="ata-grid">
      ${data.ata.map(a => `
        <div class="ata-card" onclick="insertChatAndSwitch('/teach ${a.name} ${ac}')">
          <div class="ata-chapter">${a.ch}</div>
          <div class="ata-name">${a.name}</div>
          <div class="ata-desc">${a.desc}</div>
        </div>
      `).join('')}
    </div>`;
}

// ── Mistake Book ──────────────────────────────────────────────────
function renderMistakeBook() {
  const el = document.getElementById('mistake-book');
  el.innerHTML = `
    <div class="mistake-filter-bar">
      <button class="filter-btn active">All Mistakes (${STATE.mistakes.length + MISTAKES.length})</button>
      <button class="filter-btn">Module 5</button>
      <button class="filter-btn">Module 9A</button>
      <button class="filter-btn">Module 3</button>
    </div>
    <div class="mistake-list">
      ${[...MISTAKES, ...STATE.mistakes].map(m => `
        <div class="mistake-entry" onclick="insertChatAndSwitch('/teach ${m.topic}')">
          <div class="mistake-meta">
            <span class="badge badge-red">❌ Wrong</span>
            <span>${m.module}</span>
            <span>${m.topic}</span>
            <span>${m.date}</span>
          </div>
          <div class="mistake-q">${m.q}</div>
          <div class="mistake-wrong">Your answer: ${m.yourAns}</div>
          <div class="mistake-correct">✅ Correct: ${m.correct}</div>
        </div>
      `).join('')}
    </div>`;
}

// ── Progress Dashboard ────────────────────────────────────────────
function renderProgressDashboard() {
  const el = document.getElementById('progress-dashboard');
  const progressItems = [
    { label: 'B1.1 Overall Progress', pct: 62, color: 'var(--green)' },
    { label: 'Module 1 — Mathematics', pct: 85, color: 'var(--blue)' },
    { label: 'Module 3 — Electrical', pct: 68, color: 'var(--gold)' },
    { label: 'Module 5 — Digital Tech', pct: 32, color: 'var(--red)' },
    { label: 'Module 7 — Maintenance', pct: 61, color: 'var(--orange)' },
    { label: 'Module 9A — Human Factors', pct: 45, color: 'var(--orange)' },
    { label: 'Module 10 — Legislation', pct: 70, color: 'var(--blue)' },
    { label: 'Module 15 — Gas Turbine', pct: 63, color: 'var(--red)' },
    { label: 'B777 Type Training', pct: 44, color: 'var(--cyan)' },
    { label: 'MCQ Overall Accuracy', pct: 78, color: 'var(--green)' },
  ];

  el.innerHTML = `
    <div class="progress-main-grid">
      <div class="card">
        <div class="card-header"><h2>📊 Module Progress</h2><span class="badge badge-green">B1.1</span></div>
        <div class="progress-bar-section">
          ${progressItems.map(p => `
            <div class="progress-row">
              <div class="pr-label">${p.label}</div>
              <div class="pr-bar"><div class="pr-fill" style="width:${p.pct}%;background:${p.color}"></div></div>
              <div class="pr-pct" style="color:${p.color}">${p.pct}%</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="card-header"><h2>🏆 Performance</h2></div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:2.2">
            Total MCQs Attempted: <strong style="color:var(--text-primary)">847</strong><br/>
            Correct Answers: <strong style="color:var(--green)">660</strong><br/>
            Wrong Answers: <strong style="color:var(--red)">187</strong><br/>
            Mock Exams Taken: <strong style="color:var(--blue)">6</strong><br/>
            Flashcards Reviewed: <strong style="color:var(--gold)">312</strong><br/>
            Study Streak: <strong style="color:var(--orange)">🔥 7 days</strong><br/>
            Viva Sessions: <strong style="color:var(--purple)">4</strong>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h2>⚠️ Action Required</h2></div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">
            <div style="color:var(--red);margin-bottom:6px">🔴 Module 5 (Digital) — 32%</div>
            <div style="color:var(--orange);margin-bottom:6px">🟡 Module 9A (HF) — 45%</div>
            <div style="color:var(--blue);margin-bottom:6px">📌 12 flashcards overdue</div>
            <div style="color:var(--orange)">📅 Exam: 42 days away</div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Settings & Owner Panel ────────────────────────────────────────
function openSettings() {
  applyUserRoleUI();
  const p = document.getElementById('settings-panel');
  if (p) p.classList.remove('hidden');
  const nameEl = document.getElementById('setting-name');
  if (nameEl) nameEl.value = STATE.userName;
  const emailEl = document.getElementById('setting-email');
  if (emailEl) emailEl.value = STATE.userEmail;
  const examEl = document.getElementById('setting-exam-date');
  if (examEl && STATE.examDate) examEl.value = STATE.examDate;
  const hoursEl = document.getElementById('setting-hours');
  if (hoursEl) hoursEl.value = STATE.studyHours;
  const pathEl = document.getElementById('setting-pathway');
  if (pathEl) pathEl.value = STATE.pathway;
  const acEl = document.getElementById('setting-aircraft');
  if (acEl) acEl.value = STATE.aircraftFocus;
  const masterEl = document.getElementById('setting-master-password');
  if (masterEl) masterEl.value = STATE.masterPassword;
  const guestEl = document.getElementById('setting-guest-password');
  if (guestEl) guestEl.value = STATE.guestPassword;
  const reqEl = document.getElementById('setting-require-lock');
  if (reqEl) reqEl.checked = STATE.requireLock !== false;
}

function closeSettings() {
  const p = document.getElementById('settings-panel');
  if (p) p.classList.add('hidden');
}

function handleSettingsBackdrop(e) {
  if (e.target && e.target.id === 'settings-panel') {
    closeSettings();
  }
}

function saveSettings() {
  STATE.userName = document.getElementById('setting-name')?.value?.trim() || 'Huzaifa';
  STATE.userEmail = 'huzaifauk610@gmail.com'; // Master Owner email locked
  STATE.isOwner = true;
  STATE.examDate = document.getElementById('setting-exam-date')?.value || null;
  STATE.studyHours = parseInt(document.getElementById('setting-hours')?.value) || 4;
  STATE.pathway = document.getElementById('setting-pathway')?.value || 'Both B1.1 + B2';
  STATE.aircraftFocus = document.getElementById('setting-aircraft')?.value || 'B777';
  STATE.masterPassword = document.getElementById('setting-master-password')?.value?.trim() || 'Uzi@7869';
  STATE.guestPassword = document.getElementById('setting-guest-password')?.value?.trim() || 'PIA-2026';
  STATE.requireLock = document.getElementById('setting-require-lock')?.checked ?? true;

  localStorage.setItem('pia_agent_settings', JSON.stringify({
    userName: STATE.userName,
    userEmail: STATE.userEmail,
    isOwner: true,
    pathway: STATE.pathway,
    examDate: STATE.examDate,
    studyHours: STATE.studyHours,
    aircraftFocus: STATE.aircraftFocus,
    masterPassword: STATE.masterPassword,
    guestPassword: STATE.guestPassword,
    requireLock: STATE.requireLock
  }));

  const badge = document.getElementById('pathway-badge');
  if (badge) badge.textContent = `${STATE.pathway} Pathway`;

  const mCode = document.getElementById('hint-master-code');
  if (mCode) mCode.textContent = STATE.masterPassword;
  const gCode = document.getElementById('hint-guest-code');
  if (gCode) gCode.textContent = STATE.guestPassword;

  setGreeting();
  updateCountdown();
  renderTopicTree();
  closeSettings();
  showToast(`👑 Master Owner credentials saved for Engr. ${STATE.userName}!`);
}

function loadSettings() {
  const saved = localStorage.getItem('pia_agent_settings');
  if (saved) {
    try {
      const s = JSON.parse(saved);
      Object.assign(STATE, s);
    } catch(e) {}
  }
  // Enforce Primary Master Owner & Updated Default Passwords
  STATE.userName = STATE.userName || 'Huzaifa';
  STATE.userEmail = 'huzaifauk610@gmail.com';
  STATE.isOwner = true;
  if (!STATE.masterPassword || STATE.masterPassword === 'PIA-777') {
    STATE.masterPassword = 'Uzi@7869';
  }
  if (!STATE.guestPassword || STATE.guestPassword === 'PIA-2026') {
    STATE.guestPassword = 'Student@PIA';
  }
  if (STATE.requireLock === undefined) STATE.requireLock = true;
}

// ── Security Gate & Authentication ────────────────────────────────
function checkInitialLock() {
  const gate = document.getElementById('security-gate');
  if (!gate) return;

  const gCode = document.getElementById('hint-student-code');
  if (gCode) gCode.textContent = STATE.guestPassword;

  if (STATE.requireLock === false) {
    gate.classList.add('hidden');
    STATE.isLocked = false;
    applyUserRoleUI();
    return;
  }

  const session = sessionStorage.getItem('pia_session_unlocked');
  if (session === 'master' || session === 'guest') {
    gate.classList.add('hidden');
    STATE.isLocked = false;
    STATE.currentUserRole = session === 'master' ? 'OWNER' : 'GUEST';
    applyUserRoleUI();
  } else {
    gate.classList.remove('hidden');
    STATE.isLocked = true;
    setTimeout(() => {
      document.getElementById('security-passcode-input')?.focus();
    }, 200);
  }
}

function applyUserRoleUI() {
  const isOwner = STATE.currentUserRole === 'OWNER';
  const sidebarName = document.getElementById('sidebar-owner-name');
  const sidebarEmail = document.getElementById('sidebar-owner-email');
  const sidebarChip = document.querySelector('.owner-badge-tag');
  const sidebarStatus = document.querySelector('.owner-status-tag');
  const topbarName = document.querySelector('.owner-pill-name');
  const topbarBadge = document.querySelector('.owner-pill-badge');
  const settingsOwnerBanner = document.querySelector('.owner-status-banner');
  const settingsSecurityBox = document.querySelector('.settings-security-box');

  if (isOwner) {
    if (sidebarName) sidebarName.textContent = 'Huzaifa';
    if (sidebarEmail) sidebarEmail.textContent = 'huzaifauk610@gmail.com';
    if (sidebarChip) sidebarChip.textContent = '👑 OWNER';
    if (sidebarStatus) sidebarStatus.innerHTML = '<span class="pulse-dot"></span> Master Access Active';
    if (topbarName) topbarName.textContent = 'Huzaifa';
    if (topbarBadge) topbarBadge.textContent = '👑 OWNER';
    if (settingsOwnerBanner) settingsOwnerBanner.style.display = 'block';
    if (settingsSecurityBox) settingsSecurityBox.style.display = 'block';
  } else {
    if (sidebarName) sidebarName.textContent = 'Trainee Engineer';
    if (sidebarEmail) sidebarEmail.textContent = 'student@pia.training';
    if (sidebarChip) sidebarChip.textContent = '🎓 STUDENT';
    if (sidebarStatus) sidebarStatus.innerHTML = '<span class="pulse-dot" style="background:#00e5ff;box-shadow:0 0 8px #00e5ff"></span> Student Study Access';
    if (topbarName) topbarName.textContent = 'Student Mode';
    if (topbarBadge) topbarBadge.textContent = '🎓 TRAINEE';
    if (settingsOwnerBanner) settingsOwnerBanner.style.display = 'none';
    if (settingsSecurityBox) settingsSecurityBox.style.display = 'none';
  }
}

function verifyAndUnlock() {
  const input = document.getElementById('security-passcode-input');
  const err = document.getElementById('security-error-msg');
  const gate = document.getElementById('security-gate');
  const val = input ? input.value.trim() : '';

  if (!val) {
    if (err) {
      err.textContent = '⚠️ Please enter an access password!';
      err.classList.remove('hidden');
    }
    input?.focus();
    return;
  }

  const masterMatch = (val === STATE.masterPassword) || (val.toUpperCase() === STATE.masterPassword.toUpperCase());
  const guestMatch = (val === STATE.guestPassword) || (val.toUpperCase() === STATE.guestPassword.toUpperCase());

  if (masterMatch) {
    STATE.currentUserRole = 'OWNER';
    STATE.userName = 'Huzaifa';
    STATE.userEmail = 'huzaifauk610@gmail.com';
    STATE.isLocked = false;
    sessionStorage.setItem('pia_session_unlocked', 'master');
    if (err) err.classList.add('hidden');
    if (input) input.value = '';
    gate.classList.add('hidden');
    applyUserRoleUI();
    setGreeting();
    showToast('👑 Welcome back, Engr. Huzaifa! Master Owner Access Granted.');
  } else if (guestMatch) {
    STATE.currentUserRole = 'GUEST';
    STATE.userName = 'Trainee Engineer';
    STATE.userEmail = 'student@pia.training';
    STATE.isLocked = false;
    sessionStorage.setItem('pia_session_unlocked', 'guest');
    if (err) err.classList.add('hidden');
    if (input) input.value = '';
    gate.classList.add('hidden');
    applyUserRoleUI();
    setGreeting();
    showToast('🎓 Student Access Granted. Welcome to PIA Aviation Study Portal!');
  } else {
    if (err) {
      err.textContent = '⚠️ Invalid Passcode! Please enter authorized Owner or Student code.';
      err.classList.remove('hidden');
    }
    if (input) {
      input.classList.add('input-error');
      setTimeout(() => input.classList.remove('input-error'), 400);
      input.select();
    }
  }
}

function copyStudentPasscode() {
  const code = STATE.guestPassword || 'Student@PIA';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`📋 Copied student passcode: ${code}`);
    }).catch(() => {
      showToast(`Student passcode is: ${code}`);
    });
  } else {
    showToast(`Student passcode is: ${code}`);
  }
}

function fillPasscode(type) {
  const input = document.getElementById('security-passcode-input');
  if (!input) return;
  input.value = type === 'master' ? STATE.masterPassword : STATE.guestPassword;
  input.focus();
}

function togglePasscodeVisibility() {
  const input = document.getElementById('security-passcode-input');
  const btn = document.getElementById('btn-toggle-eye');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🔒';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
}

function lockSystem() {
  sessionStorage.removeItem('pia_session_unlocked');
  STATE.isLocked = true;
  const gate = document.getElementById('security-gate');
  if (gate) gate.classList.remove('hidden');
  const input = document.getElementById('security-passcode-input');
  if (input) {
    input.value = '';
    input.focus();
  }
  const err = document.getElementById('security-error-msg');
  if (err) err.classList.add('hidden');
  closeSettings();
  showToast('🔒 System Locked. Passcode required to enter.');
}

function unlockAllModules() {
  B1_MODULES.forEach(m => m.progress = 100);
  B2_MODULES.forEach(m => m.progress = 100);
  renderModuleProgress();
  if (STATE.currentMode === 'b1-modules') renderB1ModuleMap();
  if (STATE.currentMode === 'b2-modules') renderB2ModuleMap();
  showToast('🔓 Root Override: All 17 EASA/PCAA Modules Unlocked for Owner Huzaifa!');
}

function exportUserData() {
  const exportPayload = {
    owner: {
      name: STATE.userName,
      email: STATE.userEmail,
      role: 'Master Aircraft Maintenance Engineer & Platform Owner',
      licenseTrack: 'Dual Part-66 B1.1 & B2',
      securityLevel: 'ROOT_AUTHORITY'
    },
    systemState: STATE,
    b1Modules: B1_MODULES,
    b2Modules: B2_MODULES,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PIA-Aviation-Agent_MasterOwner_Huzaifa_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Study log & Owner backup exported successfully!');
}

function togglePathway() {
  STATE.pathway = STATE.pathway === 'B1.1' ? 'B2' : 'B1.1';
  document.getElementById('pathway-badge').textContent = `${STATE.pathway} Pathway`;
  renderTopicTree();
  showToast(`Switched to ${STATE.pathway} pathway`);
}

// ── Modal ─────────────────────────────────────────────────────────
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeSettings();
  }
});

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;
    background:var(--bg-card);border:1px solid var(--green);
    color:var(--text-primary);padding:12px 20px;border-radius:10px;
    font-size:13px;z-index:9999;animation:fadeIn 0.3s ease;
    box-shadow:0 4px 20px rgba(0,230,118,0.2);
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
