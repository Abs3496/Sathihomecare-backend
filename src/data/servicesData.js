import { serviceAssets } from "../assets";

const nursingImg = serviceAssets.nursing;
const therapyImg = serviceAssets.therapy;
const counsellingImg = serviceAssets.counselling;

export const servicesData = {
  nursing: [
    { id: 1, name: "Patient Care at Home", price: 1500, desc: "Daily bedside support for bedridden patients, hygiene care, feeding help, and comfort monitoring.", image: nursingImg },
    { id: 2, name: "Elderly Care", price: 2000, desc: "24x7 senior support including companionship, mobility help, medicine reminders, and daily routine assistance.", image: nursingImg },
    { id: 3, name: "Mother & Baby Care", price: 1800, desc: "Post-delivery assistance for mothers and newborn support including feeding guidance and baby hygiene care.", image: nursingImg },
    { id: 4, name: "Post-Surgery Care", price: 1700, desc: "Recovery-focused care after operation with dressing support, mobility assistance, and health observation.", image: nursingImg },
    { id: 5, name: "Nursing Visit (One-Time)", price: 500, desc: "Short one-time nurse visit for injection, IV drip support, blood pressure check, or dressing change.", image: nursingImg },
    { id: 6, name: "Professional Nursing Care", price: 2200, desc: "Skilled nurse support for catheter care, wound dressing, IV line management, and routine clinical tasks.", image: nursingImg },
    { id: 7, name: "Advanced Nursing Care", price: 2500, desc: "For critical patients needing oxygen support, frequent monitoring, and trained nursing supervision at home.", image: nursingImg },
    { id: 8, name: "ICU Care at Home", price: 4000, desc: "Complete home ICU setup support with ventilator coordination, monitoring systems, and critical care supervision.", image: nursingImg }
  ],
  therapy: [
    { id: 101, name: "Hriday Basti (Heart Oil Therapy)", price: 2200, desc: "Localized warm medicated oil retention therapy around the chest area to support circulation and calm the heart region.", image: therapyImg },
    { id: 102, name: "Ayurvedic Heart Disease Management", price: 2800, desc: "Holistic therapy plan focused on strengthening heart function, improving routine, diet guidance, and herbal care support.", image: therapyImg },
    { id: 103, name: "Hypertension (BP Control Therapy)", price: 1800, desc: "Ayurvedic care routine for blood pressure management through calming therapies, herbs, and supportive lifestyle recommendations.", image: therapyImg },
    { id: 104, name: "Cholesterol Management Therapy", price: 1750, desc: "Wellness-focused therapy to support better lipid balance with detox methods, diet support, and circulation care.", image: therapyImg },
    { id: 105, name: "Diabetes Reversal Program (Ayurvedic)", price: 3200, desc: "Structured diabetes support program using Ayurvedic therapies, food planning, and daily routine correction.", image: therapyImg },
    { id: 106, name: "Insulin Resistance Therapy", price: 2100, desc: "Supportive therapy plan aimed at metabolic balance, body detox, and improved lifestyle management.", image: therapyImg },
    { id: 107, name: "Abhyanga (Full Body Massage)", price: 999, desc: "Traditional warm oil full body massage for relaxation, improved circulation, joint comfort, and nervous system balance.", image: therapyImg },
    { id: 108, name: "Shirodhara", price: 1600, desc: "A calming stream of medicated oil on the forehead to ease stress, mental fatigue, and sleep-related concerns.", image: therapyImg },
    { id: 109, name: "Basti Therapy", price: 2400, desc: "Classical Ayurvedic basti treatment to support detoxification, gut balance, and chronic condition management.", image: therapyImg },
    { id: 110, name: "Virechana Detox", price: 2600, desc: "Guided purification therapy focused on detox, pitta balance, digestion support, and internal cleansing.", image: therapyImg },
    { id: 111, name: "Sugar Control Panchakarma", price: 2900, desc: "Ayurvedic detox and regulation program designed to support better sugar balance and long-term metabolic stability.", image: therapyImg },
    { id: 112, name: "Kati Basti (Back Pain)", price: 1500, desc: "Warm medicated oil pooling therapy for lower back pain, stiffness, muscular weakness, and mobility improvement.", image: therapyImg },
    { id: 113, name: "Janu Basti (Knee Pain)", price: 1500, desc: "Localized knee therapy to reduce stiffness, improve lubrication, and support chronic pain management.", image: therapyImg },
    { id: 114, name: "Arthritis Treatment", price: 2100, desc: "Ayurvedic pain and inflammation relief support for joint stiffness, discomfort, and movement limitations.", image: therapyImg },
    { id: 115, name: "Cervical / Spine Therapy", price: 1900, desc: "Neck and spinal comfort therapy designed for posture issues, stiffness, muscular strain, and stress-related pain.", image: therapyImg },
    { id: 116, name: "Obesity + Diabetes Combined Therapy", price: 3400, desc: "Integrated metabolic care plan for weight and sugar balance using detox therapy, bodywork, and food guidance.", image: therapyImg },
    { id: 117, name: "Stress Management Therapy", price: 1400, desc: "Relaxation-focused Ayurvedic support for mental calm, better recovery, and reduced tension in body and mind.", image: therapyImg },
    { id: 118, name: "Sleep Disorder Treatment", price: 1450, desc: "Therapeutic support for disturbed sleep, restlessness, and poor sleep cycles using calming Ayurvedic methods.", image: therapyImg },
    { id: 119, name: "Anxiety Relief Therapy", price: 1500, desc: "Mind-body balancing session to support calmness, emotional steadiness, and stress reduction.", image: therapyImg },
    { id: 120, name: "Ayurvedic Diet Consultation + Lifestyle Plan", price: 1300, desc: "Personalized food, daily routine, and body constitution guidance for long-term preventive wellness.", image: therapyImg }
  ],
  counselling: [
    { id: 201, name: "Career Interest Assessment (Psychometric Test)", price: 999, desc: "A guided psychometric-based session to identify natural interests, strengths, and career inclination areas.", image: counsellingImg },
    { id: 202, name: "Career Discovery Session", price: 899, desc: "One-on-one career clarity session to understand options, interests, personality fit, and future direction.", image: counsellingImg },
    { id: 203, name: "Future Career Roadmap Planning (Class 6–12)", price: 1200, desc: "Stepwise long-term roadmap for students from middle school to senior classes based on interests and goals.", image: counsellingImg },
    { id: 204, name: "Stream Selection Guidance (Science / Commerce / Arts)", price: 1100, desc: "Structured counselling to choose the right stream confidently based on aptitude, goals, and academic comfort.", image: counsellingImg },
    { id: 205, name: "Career Options Awareness (100+ Careers)", price: 950, desc: "Awareness session covering modern and traditional careers so students and parents can explore wisely.", image: counsellingImg },
    { id: 206, name: "Personalized Study Plan", price: 800, desc: "Custom study strategy based on student strengths, school demands, target exams, and daily rhythm.", image: counsellingImg },
    { id: 207, name: "Time Table Design & Management", price: 750, desc: "Practical planning support to build a sustainable daily timetable and better time management habits.", image: counsellingImg },
    { id: 208, name: "Focus & Concentration Improvement", price: 850, desc: "Session aimed at improving attention span, consistency, and distraction control during studies.", image: counsellingImg },
    { id: 209, name: "Exam Strategy (Boards / Competitive)", price: 1100, desc: "Targeted exam guidance covering preparation structure, revision planning, and performance strategy.", image: counsellingImg },
    { id: 210, name: "Productivity & Discipline Coaching", price: 900, desc: "Habit-building coaching for routine consistency, execution discipline, and better daily productivity.", image: counsellingImg },
    { id: 211, name: "Communication Skills Training", price: 950, desc: "Confidence-building support for verbal expression, articulation, listening skills, and structured communication.", image: counsellingImg },
    { id: 212, name: "Public Speaking Coaching", price: 1000, desc: "Practice-driven guidance for stage confidence, voice control, body language, and speaking clarity.", image: counsellingImg },
    { id: 213, name: "Logical Thinking & Problem Solving", price: 920, desc: "Skill-building session focused on reasoning, structured thinking, and practical problem solving.", image: counsellingImg },
    { id: 214, name: "Critical Thinking Development", price: 920, desc: "A guided session to sharpen analysis, thoughtful decision-making, and better independent judgement.", image: counsellingImg },
    { id: 215, name: "Coding / Tech Awareness Guidance", price: 950, desc: "Beginner-friendly awareness session on technology careers, coding paths, and digital skill opportunities.", image: counsellingImg },
    { id: 216, name: "Stress & Anxiety Management", price: 850, desc: "Emotional support session to reduce academic pressure, overthinking, and performance stress.", image: counsellingImg },
    { id: 217, name: "Exam Fear Handling", price: 800, desc: "Supportive counselling to reduce exam panic, improve confidence, and create a calmer test mindset.", image: counsellingImg },
    { id: 218, name: "Confidence Building Sessions", price: 850, desc: "Guided coaching for self-belief, positive expression, and better personal confidence in studies and life.", image: counsellingImg },
    { id: 219, name: "Motivation & Goal Setting Coaching", price: 900, desc: "Goal-clarity and motivation session for students struggling with consistency, direction, or commitment.", image: counsellingImg },
    { id: 220, name: "Parent-Child Communication Guidance", price: 950, desc: "A family-oriented counselling session to improve trust, conversation quality, and emotional understanding.", image: counsellingImg },
    { id: 221, name: "How to Guide Your Child Career", price: 1000, desc: "Parent support session on how to guide a child’s career decisions without creating pressure or confusion.", image: counsellingImg },
    { id: 222, name: "Screen Time Management Strategy", price: 780, desc: "Practical guidance for reducing digital distraction and building healthier device habits.", image: counsellingImg },
    { id: 223, name: "Discipline & Habit Building", price: 820, desc: "Support to create repeatable routines and positive habits that improve academic and personal growth.", image: counsellingImg },
    { id: 224, name: "IIT-JEE Early Preparation Roadmap", price: 1250, desc: "Early-stage planning session for IIT-JEE aspirants covering base-building, timeline, and preparation structure.", image: counsellingImg },
    { id: 225, name: "NEET Foundation Guidance", price: 1250, desc: "Medical entrance preparation foundation roadmap with subject focus, schedule, and expectation setting.", image: counsellingImg },
    { id: 226, name: "Olympiad Preparation Strategy", price: 1050, desc: "Smart planning session for Olympiads with preparation stages, practice methods, and long-term approach.", image: counsellingImg },
    { id: 227, name: "Right Coaching Selection Guidance", price: 850, desc: "Advisory session to evaluate coaching choices based on student needs, budget, and study style.", image: counsellingImg },
    { id: 228, name: "Personality Development Analysis", price: 900, desc: "Assessment-style session to understand personality, growth areas, and self-presentation strengths.", image: counsellingImg },
    { id: 229, name: "Leadership Skills Training", price: 980, desc: "Skill development for initiative, responsibility, collaboration, and leading in academic environments.", image: counsellingImg },
    { id: 230, name: "Decision Making Skills", price: 880, desc: "Guided coaching to make clearer choices under pressure with better reasoning and self-awareness.", image: counsellingImg },
    { id: 231, name: "Goal Setting & Achievement Planning", price: 920, desc: "Structured session to define meaningful goals, create milestones, and maintain execution discipline.", image: counsellingImg }
  ]
};
