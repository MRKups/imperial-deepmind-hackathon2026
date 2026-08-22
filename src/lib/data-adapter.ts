import comprehensiveData from "../../data/comprehensive-health-data.json";
import basicHealthData from "../../data/health-data.json";
import { HealthDataset, DailyRecord, UserProfile } from "./types";

/**
 * Normalizes health data records across both data files
 */
export function getHealthDataset(): HealthDataset {
  try {
    const raw = comprehensiveData as unknown as HealthDataset;
    if (raw && raw.records && raw.records.length > 0) {
      return raw;
    }
  } catch {
    // fallback
  }

  // Fallback to basic health data
  const fallback = basicHealthData as unknown as {
    profile: UserProfile;
    records: DailyRecord[];
  };

  return {
    profile: fallback.profile || {
      id: "usr_default",
      name: "Alex",
      age: 30,
      baseline_bmr: 1750,
      medical_history: {
        conditions: ["Mild asthma", "Caffeine dependency"],
        allergies: ["Penicillin", "Peanuts"],
        medications: ["Albuterol inhaler (as needed)"],
        vaccinations: ["COVID-19", "Flu (2025)", "Hepatitis A", "Typhoid (2022)"]
      }
    },
    records: fallback.records || []
  };
}

export interface OverviewMetrics {
  totalDays: number;
  latestDate: string;
  // Sleep
  latestSleep: number;
  avgSleep7d: number;
  avgSleep30d: number;
  ouraSleepScore: number;
  deepSleepHours: number;
  remSleepHours: number;
  // Screen time
  latestScreenTime: number;
  avgScreenTime7d: number;
  avgScreenTime30d: number;
  doomscrollingMins: number;
  alarmsSnoozed: number;
  // Vitals
  restingHr: number;
  hrvMs: number;
  whoopRecovery: number;
  whoopStrain: number;
  stepsCount: number;
  standHours: number;
  vo2Max: number;
  // Energy & Nutrition
  caloriesIn: number;
  caloriesOut: number;
  waterIntakeL: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  // Spending & Lifestyle
  coffeeSpend7d: number;
  takeawaySpend7d: number;
  gymMins7d: number;
  latestGymActivity: string;
}

export function computeOverviewMetrics(dataset: HealthDataset): OverviewMetrics {
  const records = dataset.records;
  const totalDays = records.length;
  if (totalDays === 0) {
    return {
      totalDays: 0,
      latestDate: "N/A",
      latestSleep: 0,
      avgSleep7d: 0,
      avgSleep30d: 0,
      ouraSleepScore: 0,
      deepSleepHours: 0,
      remSleepHours: 0,
      latestScreenTime: 0,
      avgScreenTime7d: 0,
      avgScreenTime30d: 0,
      doomscrollingMins: 0,
      alarmsSnoozed: 0,
      restingHr: 0,
      hrvMs: 0,
      whoopRecovery: 0,
      whoopStrain: 0,
      stepsCount: 0,
      standHours: 0,
      vo2Max: 0,
      caloriesIn: 0,
      caloriesOut: 0,
      waterIntakeL: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      coffeeSpend7d: 0,
      takeawaySpend7d: 0,
      gymMins7d: 0,
      latestGymActivity: "None"
    };
  }

  const latest = records[records.length - 1];
  const last7 = records.slice(-7);

  const getSleep = (r: DailyRecord) => r.wearables?.oura_ring?.total_sleep_hours ?? r.sleep_hours ?? 0;
  const getScreen = (r: DailyRecord) => r.lifestyle?.screen_time_hours ?? r.screen_time ?? 0;

  const avgSleep7d = Number((last7.reduce((acc, r) => acc + getSleep(r), 0) / Math.max(last7.length, 1)).toFixed(1));
  const avgSleep30d = Number((records.reduce((acc, r) => acc + getSleep(r), 0) / totalDays).toFixed(1));

  const avgScreenTime7d = Number((last7.reduce((acc, r) => acc + getScreen(r), 0) / Math.max(last7.length, 1)).toFixed(1));
  const avgScreenTime30d = Number((records.reduce((acc, r) => acc + getScreen(r), 0) / totalDays).toFixed(1));

  const coffeeSpend7d = Number(last7.reduce((acc, r) => acc + (r.spending?.coffee_shops ?? 0), 0).toFixed(2));
  const takeawaySpend7d = Number(last7.reduce((acc, r) => acc + (r.spending?.deliveroo_takeaway ?? 0), 0).toFixed(2));
  const gymMins7d = last7.reduce((acc, r) => acc + (r.fitness?.gym_duration_mins ?? r.gym_duration_mins ?? 0), 0);

  return {
    totalDays,
    latestDate: latest.date,
    // Sleep
    latestSleep: getSleep(latest),
    avgSleep7d,
    avgSleep30d,
    ouraSleepScore: latest.wearables?.oura_ring?.sleep_score ?? 78,
    deepSleepHours: latest.wearables?.oura_ring?.deep_sleep_hours ?? 1.2,
    remSleepHours: latest.wearables?.oura_ring?.rem_sleep_hours ?? 1.4,
    // Screen time
    latestScreenTime: getScreen(latest),
    avgScreenTime7d,
    avgScreenTime30d,
    doomscrollingMins: latest.lifestyle?.doomscrolling_mins ?? 45,
    alarmsSnoozed: latest.lifestyle?.snoozed_alarms_count ?? 1,
    // Vitals
    restingHr: latest.wearables?.whoop?.resting_heart_rate ?? latest.avg_heart_rate ?? 62,
    hrvMs: latest.wearables?.whoop?.hrv_ms ?? 65,
    whoopRecovery: latest.wearables?.whoop?.recovery_score ?? 76,
    whoopStrain: latest.wearables?.whoop?.strain_score ?? 8.5,
    stepsCount: latest.wearables?.apple_watch?.step_count ?? 8500,
    standHours: latest.wearables?.apple_watch?.stand_hours ?? latest.stand_hours ?? 12,
    vo2Max: latest.wearables?.apple_watch?.vo2_max ?? 42.1,
    // Energy & Nutrition
    caloriesIn: latest.calories_in,
    caloriesOut: latest.calories_out,
    waterIntakeL: latest.lifestyle?.water_intake_liters ?? 2.5,
    proteinG: latest.nutrition?.protein_g ?? 125,
    carbsG: latest.nutrition?.carbs_g ?? 240,
    fatG: latest.nutrition?.fat_g ?? 75,
    // Spending & Lifestyle
    coffeeSpend7d,
    takeawaySpend7d,
    gymMins7d,
    latestGymActivity: latest.fitness?.gym_activity ?? latest.gym_activity ?? "Rest"
  };
}
