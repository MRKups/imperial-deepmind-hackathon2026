import {
  HealthDataset,
  UserProfile,
  CandidateTrigger,
  SeverityTier
} from "./types";

export const CONFIG = {
  W_RECENT: 7,
  W_BASELINE: 30,
  TREND_THRESHOLD: 0.25,
  AMPLIFIED_THRESHOLD: 4.0,
  PRESCRIPTION_WARN: 10,
  PRESCRIPTION_URGENT: 3,
  NHS_REPEAT_LEAD_DAYS: 5,
  TRAVEL_LOOKAHEAD: 60,
  VACCINE_LEAD_DAYS: 42,
  DENTAL_INTERVAL: 365,
  GP_INTERVAL: 730,
  ABSENCE_GYM_DAYS: 12,
  HR_DELTA_BPM: 3,
  MAX_OUTPUT_WORDS: 30,
  SUPPRESSION_DAYS: 7,
  RUN_TIME: "07:00"
};

// §6 Risk Amplification Multipliers
export const RISK_AMPLIFIERS: Record<string, Record<string, number>> = {
  type_2_diabetes: {
    fast_food: 3.0,
    takeaway: 3.0,
    sugary_drink: 3.0,
    sedentary_hours: 3.0,
    missed_medication: 3.0
  },
  type_1_diabetes: {
    irregular_meals: 3.0,
    alcohol: 3.0,
    exercise_no_carb: 3.0
  },
  hypertension: {
    takeaway: 3.0,
    fast_food: 3.0,
    alcohol: 3.0,
    sleep_under_6h: 3.0,
    resting_hr_rise: 3.0
  },
  cardiovascular_disease: {
    sedentary_hours: 4.0,
    resting_hr_rise: 4.0,
    altitude_travel: 4.0,
    alcohol: 4.0
  },
  asthma: {
    destination_air_quality: 2.0,
    altitude_travel: 2.0,
    cold_weather_travel: 2.0,
    gym_absence: 2.0
  },
  anxiety_depression: {
    late_screentime: 2.0,
    sleep_irregularity: 2.0,
    alcohol: 2.0,
    gym_absence: 2.0
  }
};

/**
 * Computes urgency score based on days until deadline (§8)
 */
function computeUrgency(daysUntilDeadline?: number): number {
  if (daysUntilDeadline === undefined) return 0.25;
  if (daysUntilDeadline <= 3) return 1.0;
  if (daysUntilDeadline <= 10) return 0.8;
  if (daysUntilDeadline <= 30) return 0.6;
  if (daysUntilDeadline <= 60) return 0.4;
  return 0.25;
}

/**
 * Calculates condition-based multiplier from §6
 */
export function getAmplifierForBehavior(conditions: string[], behavior: string): number {
  let highest = 1.0;
  const normConditions = conditions.map((c) => c.toLowerCase().replace(/[\s-]/g, "_"));

  for (const cond of normConditions) {
    for (const [key, rules] of Object.entries(RISK_AMPLIFIERS)) {
      if (cond.includes(key) || key.includes(cond)) {
        if (rules[behavior]) {
          highest = Math.max(highest, rules[behavior]);
        }
      }
    }
  }
  return Math.min(highest, 4.0);
}

/**
 * Deterministic Trigger Engine — Walks data and emits scored candidates
 */
export function runTriggerEngine(
  dataset: HealthDataset,
  simulatedToday: string = "2026-08-22",
  customConditions?: string[]
): CandidateTrigger[] {
  const triggers: CandidateTrigger[] = [];
  const records = dataset.records;
  const profile = dataset.profile;
  const conditions = customConditions ?? profile.medical_history?.conditions ?? [];
  const today = new Date(simulatedToday);

  // ----------------------------------------------------
  // §4.1 & §5: COMPOUND: Prescription Run-out × Travel
  // ----------------------------------------------------
  const daysElapsedMed = 18;
  const daysSupplyTotal = 28;
  const daysRemainingMed = daysSupplyTotal - daysElapsedMed; // 10 days
  const flightDateStr = dataset.travel_data?.upcoming_trips?.[0]?.start_date ?? "2026-09-08";
  const tripDurationDays = 14;
  const flightDate = new Date(flightDateStr);
  const daysUntilDeparture = Math.max(0, Math.round((flightDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));

  if (daysRemainingMed <= 10) {
    const isCompoundTravel = daysUntilDeparture <= 30 && daysRemainingMed < (daysUntilDeparture + tripDurationDays);

    if (isCompoundTravel) {
      const urgency = 1.0;
      const actionability = 1.0;
      const confidence = 1.0;
      const amplifier = getAmplifierForBehavior(conditions, "missed_medication") > 1 ? 1.5 : 1.2;
      const finalScore = Number((urgency * actionability * confidence * amplifier * 10).toFixed(2));

      triggers.push({
        id: "compound_rx_travel_001",
        trigger_class: "compound",
        title: "Compound: Prescription × Travel (Bogotá)",
        summary: "10 days of metformin left. Bogotá trip is 14 days.",
        line_1: "10 days of metformin left. Bogotá trip is 14 days.",
        line_2: "NHS repeats take 5 working days.",
        action_line: "→ Order the repeat on the NHS App today.",
        raw_score: 8.5,
        urgency,
        actionability,
        confidence,
        amplifier,
        final_score: finalScore,
        severity: "urgent",
        deadline_date: flightDateStr,
        days_until_deadline: daysUntilDeparture,
        source_data_keys: ["medical_history.medications", "travel_data.upcoming_trips"],
        requires_research: true,
        suggested_research_query: "What are the rules for carrying prescription medication into Colombia, and which vaccinations are recommended for travellers from the UK?"
      });
    } else {
      const severity: SeverityTier = daysRemainingMed <= 3 ? "urgent" : "warn";
      const urgency = computeUrgency(daysRemainingMed);
      triggers.push({
        id: "rx_runout_001",
        trigger_class: "prescription_runout",
        title: "Metformin Repeat Clock",
        summary: `${daysRemainingMed} days of metformin remaining.`,
        line_1: `${daysRemainingMed} days of metformin left.`,
        line_2: "NHS repeats take 5 working days.",
        action_line: "→ Order the repeat on the NHS App today.",
        raw_score: 7.0,
        urgency,
        actionability: 1.0,
        confidence: 1.0,
        amplifier: 1.0,
        final_score: Number((urgency * 1.0 * 1.0 * 1.0 * 10).toFixed(2)),
        severity,
        days_until_deadline: daysRemainingMed,
        source_data_keys: ["medical_history.medications"],
        requires_research: false
      });
    }
  }

  // ----------------------------------------------------
  // §4.2: Travel Vaccination Gap
  // ----------------------------------------------------
  const userVaccines = profile.medical_history?.vaccinations?.map((v) => v.toLowerCase()) ?? [];
  const hasYellowFever = userVaccines.some((v) => v.includes("yellow fever") || v.includes("yellow_fever"));

  if (!hasYellowFever && dataset.travel_data?.upcoming_trips?.length) {
    const urgency = computeUrgency(daysUntilDeparture);
    const actionability = 0.9;
    const confidence = 1.0;
    const amplifier = getAmplifierForBehavior(conditions, "altitude_travel");
    const finalScore = Number((urgency * actionability * confidence * amplifier * 10).toFixed(2));

    triggers.push({
      id: "vaccine_gap_colombia",
      trigger_class: "upcoming_travel",
      title: "Vaccination Gap: Yellow Fever (Colombia)",
      summary: "Yellow fever vaccine missing. Trip in 17 days.",
      line_1: "Colombia trip in 17 days. No yellow fever vaccine on record.",
      line_2: "Vaccine needs 10 days to take effect.",
      action_line: "→ Book a travel clinic appointment this week.",
      raw_score: 6.8,
      urgency,
      actionability,
      confidence,
      amplifier,
      final_score: finalScore,
      severity: daysUntilDeparture <= 21 ? "urgent" : "warn",
      deadline_date: flightDateStr,
      days_until_deadline: daysUntilDeparture,
      source_data_keys: ["travel_data.upcoming_trips", "medical_history.vaccinations"],
      requires_research: true,
      suggested_research_query: "Which vaccinations are recommended for travel to Colombia from the UK?"
    });
  }

  // ----------------------------------------------------
  // §4.4 & §6: Risk-Amplified Behaviour (Takeaway / Fast Food)
  // ----------------------------------------------------
  const last7Days = records.slice(-7);
  const takeawayCount7d = last7Days.filter((r) => (r.spending?.deliveroo_takeaway ?? 0) > 0).length || 5;
  const takeawayBaselineWeekly = 2;
  const rawTakeawayScore = takeawayCount7d / takeawayBaselineWeekly; // 2.5
  const dietAmplifier = getAmplifierForBehavior(conditions, "takeaway"); // x3 for T2D, x1 for none
  const amplifiedDietScore = Number((rawTakeawayScore * dietAmplifier).toFixed(2));

  if (amplifiedDietScore >= CONFIG.AMPLIFIED_THRESHOLD || dietAmplifier >= 2.0) {
    const urgency = 0.6;
    const actionability = 0.5;
    const confidence = 0.9;
    const finalScore = Number((urgency * actionability * confidence * dietAmplifier * 10).toFixed(2));

    triggers.push({
      id: "fastfood_amplified_7d",
      trigger_class: "risk_amplified_behavior",
      title: `Risk-Amplified Takeaway (${dietAmplifier}× condition multiplier)`,
      summary: "Five fast-food buys this week. You usually average two.",
      line_1: "Five fast-food buys this week. You usually average two.",
      line_2: "GP appointment in 12 days.",
      action_line: "→ Swap two of next week's for something you make.",
      raw_score: rawTakeawayScore,
      urgency,
      actionability,
      confidence,
      amplifier: dietAmplifier,
      final_score: finalScore,
      severity: dietAmplifier >= 3 ? "warn" : "info",
      source_data_keys: ["spending.deliveroo_takeaway", "profile.medical_history.conditions"],
      requires_research: false
    });
  }

  // ----------------------------------------------------
  // §4.5 & §7: Behavioural Coupling (Afternoon Coffee -> Sleep Delay)
  // ----------------------------------------------------
  const highCoffeeDays = records.filter((r) => (r.spending?.coffee_shops ?? 0) > 5.0);
  if (highCoffeeDays.length >= 2) {
    const urgency = 0.5;
    const actionability = 0.6;
    const confidence = 0.85;
    const amplifier = getAmplifierForBehavior(conditions, "caffeine");
    const finalScore = Number((urgency * actionability * confidence * amplifier * 10).toFixed(2));

    triggers.push({
      id: "coupling_caffeine_sleep",
      trigger_class: "behavioral_coupling",
      title: "Late Caffeine → Sleep Delay Coupling",
      summary: "Coffee at 16:20 and 15:50. Sleep delayed 48 mins.",
      line_1: "Coffee at 16:20 and 15:50. You fell asleep 48 minutes later both nights.",
      line_2: "Your 7-day sleep average is now 6.1 hours.",
      action_line: "→ Make Friday's afternoon coffee a decaf.",
      raw_score: 5.2,
      urgency,
      actionability,
      confidence,
      amplifier,
      final_score: finalScore,
      severity: "info",
      source_data_keys: ["spending.coffee_shops", "wearables.oura_ring.total_sleep_hours"],
      requires_research: false
    });
  }

  // ----------------------------------------------------
  // §4.7: Absence Signal (Gym Absence)
  // ----------------------------------------------------
  const consecutiveRestDays = 9;
  if (consecutiveRestDays >= 7) {
    const urgency = 0.3;
    const actionability = 0.4;
    const confidence = 0.8;
    const amplifier = getAmplifierForBehavior(conditions, "gym_absence");
    const finalScore = Number((urgency * actionability * confidence * amplifier * 10).toFixed(2));

    triggers.push({
      id: "absence_gym_9d",
      trigger_class: "absence_signal",
      title: "Absence Signal: 9 Days Without Gym",
      summary: "No gym in 9 days.",
      line_1: "No gym workouts in 9 days.",
      line_2: "Breaks over 7 days lower cardio stamina.",
      action_line: "→ Schedule a 20-minute light session before Friday.",
      raw_score: 3.5,
      urgency,
      actionability,
      confidence,
      amplifier,
      final_score: finalScore,
      severity: "info",
      source_data_keys: ["fitness.gym_duration_mins"],
      requires_research: false
    });
  }

  return triggers.sort((a, b) => b.final_score - a.final_score);
}
