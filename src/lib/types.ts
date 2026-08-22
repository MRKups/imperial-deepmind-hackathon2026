export interface MedicalHistory {
  conditions: string[];
  allergies: string[];
  medications: string[];
  vaccinations: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  height_cm?: number;
  weight_kg?: number;
  baseline_bmr?: number;
  medical_history?: MedicalHistory;
  dob?: string;
  pharmacy_platform?: string;
  onboarding_complete?: boolean;
}

export interface UpcomingTrip {
  destination: string;
  start_date: string;
  end_date: string;
  source: string;
  flight?: string;
  status?: string;
  vaccination_alerts?: string[];
}

export interface TravelData {
  upcoming_trips: UpcomingTrip[];
}

export interface NutritionData {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface SpendingData {
  groceries_and_food: number;
  coffee_shops: number;
  deliveroo_takeaway: number;
  transport: number;
  [key: string]: number;
}

export interface CommuteData {
  home_to_gym_mins: number;
  home_to_work_mins: number;
  mode: string;
}

export interface LifestyleData {
  screen_time_hours: number;
  doomscrolling_mins: number;
  snoozed_alarms_count: number;
  water_intake_liters: number;
  alcohol_units: number;
  supplements: string[];
}

export interface FitnessData {
  gym_activity: string;
  gym_duration_mins: number;
}

export interface AppleWatchData {
  stand_hours: number;
  step_count: number;
  vo2_max: number;
}

export interface WhoopData {
  strain_score: number;
  recovery_score: number;
  hrv_ms: number;
  resting_heart_rate: number;
  sleep_performance_percent: number;
}

export interface OuraRingData {
  readiness_score: number;
  sleep_score: number;
  total_sleep_hours: number;
  deep_sleep_hours: number;
  rem_sleep_hours: number;
  temperature_deviation_c: number;
}

export interface WearablesData {
  apple_watch?: AppleWatchData;
  whoop?: WhoopData;
  oura_ring?: OuraRingData;
}

export interface DailyRecord {
  date: string;
  calories_in: number;
  calories_out: number;
  nutrition?: NutritionData;
  spending?: SpendingData;
  commute?: CommuteData;
  lifestyle?: LifestyleData;
  fitness?: FitnessData;
  wearables?: WearablesData;
  // Legacy / fallback fields from basic health-data.json
  stand_hours?: number;
  avg_heart_rate?: number;
  sleep_hours?: number;
  screen_time?: number;
  gym_activity?: string;
  gym_duration_mins?: number;
}

export interface HealthDataset {
  profile: UserProfile;
  travel_data?: TravelData;
  records: DailyRecord[];
}

// ==========================================
// AGENT.md Specific Types & Data Structures
// ==========================================

export type TriggerClass =
  | "prescription_runout"
  | "upcoming_travel"
  | "appointment_due"
  | "risk_amplified_behavior"
  | "behavioral_coupling"
  | "trend_inflection"
  | "absence_signal"
  | "compound";

export type SeverityTier = "info" | "warn" | "urgent" | "escalate";

export interface CandidateTrigger {
  id: string;
  trigger_class: TriggerClass;
  title: string;
  summary: string;
  noticed_fact: string;
  why_now_fact: string;
  action_recommendation: string;
  raw_score: number;
  urgency: number;
  actionability: number;
  confidence: number;
  amplifier: number;
  final_score: number;
  severity: SeverityTier;
  deadline_date?: string;
  days_until_deadline?: number;
  source_data_keys: string[];
  requires_research: boolean;
  suggested_research_query?: string;
}

export interface PassAOutput {
  hero_trigger_id: string;
  hero_reason: string;
  secondary_trigger_ids: string[];
  needs_research: boolean;
  research_question: string | null;
  pii_check_passed: boolean;
  sanitization_log: {
    rule: string;
    passed: boolean;
    detail: string;
  }[];
}

export interface ResearchOutput {
  answer: string;
  key_facts: string[];
  lead_time_days: number;
  source_name: string;
  source_url: string;
  status: "verified" | "insufficient_source" | "skipped";
}

export interface PassBOutput {
  noticed: string;
  why_now: string;
  action: string | null;
  source_name: string | null;
  source_url: string | null;
  secondaries: string[];
  word_count: number;
  validation_passed: boolean;
}

export interface PipelineExecution {
  id: string;
  timestamp: string;
  stage1_triggers: CandidateTrigger[];
  stage2_passA: PassAOutput;
  stage3_research: ResearchOutput | null;
  stage4_passB: PassBOutput;
  activeProfile: UserProfile;
}
