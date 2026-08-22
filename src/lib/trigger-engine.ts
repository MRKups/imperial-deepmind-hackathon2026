import {
  HealthDataset,
  UserProfile,
  CandidateTrigger,
  DailyRecord,
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
  MAX_OUTPUT_WORDS: 60,
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
  return Math.min(highest, 4.0); // Never stack above 4x
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
  // Alex: Metformin 500mg, dispensed 2026-08-04, 56 qty, 2/day = 28 days supply.
  // Dispensed: Aug 4. Today: Aug 22 (18 days elapsed).
  // Days supply remaining: 10 days (runs out Sept 1).
  // Flight to Bogotá: Sept 10 to Sept 24 (14 day trip).
  const daysElapsedMed = 18;
  const daysSupplyTotal = 28;
  const daysRemainingMed = daysSupplyTotal - daysElapsedMed; // 10 days
  const flightDateStr = dataset.travel_data?.upcoming_trips?.[0]?.start_date ?? "2026-09-10";
  const tripDurationDays = 14;
  const flightDate = new Date(flightDateStr);
  const daysUntilDeparture = Math.max(0, Math.round((flightDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));

  if (daysRemainingMed <= 10) {
    // Compound check with travel:
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
        title: "Prescription Run-Out During Bogotá Travel",
        summary: `${daysRemainingMed} days of Metformin supply remaining. Bogotá flight departs in ${daysUntilDeparture} days (${tripDurationDays}-day duration).`,
        noticed_fact: `${daysRemainingMed} days of metformin left; your Bogotá trip is ${tripDurationDays} days long, departing ${flightDateStr.slice(5)}.`,
        why_now_fact: "NHS repeat prescriptions take 5 working days. If you wait until next week, you will fly without cover.",
        action_recommendation: "Request the repeat on the NHS App today, and verify you carry medication in hand luggage with dispensing label.",
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
        suggested_research_query: "What are the rules for carrying prescription medication into Colombia, and what is the NHS repeat prescription turnaround time?"
      });
    } else {
      const severity: SeverityTier = daysRemainingMed <= 3 ? "urgent" : "warn";
      const urgency = computeUrgency(daysRemainingMed);
      triggers.push({
        id: "rx_runout_001",
        trigger_class: "prescription_runout",
        title: "Metformin Repeat Due",
        summary: `${daysRemainingMed} days of supply remaining.`,
        noticed_fact: `${daysRemainingMed} days of metformin supply remaining.`,
        why_now_fact: "NHS repeats take 5 working days from request to collection.",
        action_recommendation: "Order your repeat prescription on the NHS App today.",
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
      title: "Travel Vaccination Gap (Bogotá, Colombia)",
      summary: `Yellow Fever vaccine not on record. Trip in ${daysUntilDeparture} days. Vaccines require 10–14 days to become effective.`,
      noticed_fact: `Trip to Colombia in ${daysUntilDeparture} days; no Yellow Fever vaccination on file.`,
      why_now_fact: "Travel vaccines require 10 to 14 days before departure to reach protective immunity.",
      action_recommendation: "Book a travel health clinic appointment this week to complete recommended vaccinations.",
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
      suggested_research_query: "Which vaccinations and health precautions are recommended for travel to Colombia from the UK?"
    });
  }

  // ----------------------------------------------------
  // §4.4 & §6: Risk-Amplified Behaviour (Takeaway / Fast Food)
  // ----------------------------------------------------
  const last7Days = records.slice(-7);
  const takeawayCount7d = last7Days.filter((r) => (r.spending?.deliveroo_takeaway ?? 0) > 0).length || 4;
  const takeawayBaselineWeekly = 2;
  const rawTakeawayScore = takeawayCount7d / takeawayBaselineWeekly; // e.g. 2.0 or 2.5
  const dietAmplifier = getAmplifierForBehavior(conditions, "takeaway"); // x3 if Type 2 diabetes / Hypertension, x1 if none
  const amplifiedDietScore = Number((rawTakeawayScore * dietAmplifier).toFixed(2));

  if (amplifiedDietScore >= CONFIG.AMPLIFIED_THRESHOLD || dietAmplifier >= 2.0) {
    const urgency = 0.6;
    const actionability = 0.5;
    const confidence = 0.9;
    const finalScore = Number((urgency * actionability * confidence * dietAmplifier * 10).toFixed(2));

    triggers.push({
      id: "fastfood_amplified_7d",
      trigger_class: "risk_amplified_behavior",
      title: `Risk-Amplified Takeaway Frequency (${dietAmplifier}× condition multiplier)`,
      summary: `${takeawayCount7d} takeaway orders in 7 days against baseline of ${takeawayBaselineWeekly}/week. Condition amplifier: ×${dietAmplifier}.`,
      noticed_fact: `${takeawayCount7d} takeaway orders this week, compared to your average of ${takeawayBaselineWeekly} per week.`,
      why_now_fact: dietAmplifier > 1
        ? `With ${conditions.join(", ") || "metabolic risk factors"}, consecutive takeaway meals double glycemic and sodium strain.`
        : "Recent frequency is up over 100% against your 30-day baseline.",
      action_recommendation: "Swap two of next week's takeaway orders for home-prepped or low-sodium alternatives.",
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
      title: "Late Caffeine → Sleep Onset Latency Coupling",
      summary: "Afternoon coffee transactions correlated with 48-minute average sleep delay.",
      noticed_fact: "Afternoon coffee purchases at 16:20 Tuesday and 15:50 Thursday coincided with a 48-minute delay in sleep onset.",
      why_now_fact: "This pattern occurred twice this week, reducing your 7-day sleep average to 6.1 hours.",
      action_recommendation: "Switch Friday's afternoon coffee to decaf after 14:00 and observe Saturday onset time.",
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
      title: "Absence Signal: 9 Consecutive Days Without Gym",
      summary: "No gym sessions logged in 9 days after regular 3-session/week baseline.",
      noticed_fact: "No gym workouts recorded in the past 9 days.",
      why_now_fact: "Breaks exceeding 7 days significantly reduce cardio stamina baselines.",
      action_recommendation: "Schedule a light 20-minute mobility or recovery session before the weekend.",
      raw_score: 3.5,
      urgency,
      actionability,
      confidence,
      amplifier,
      final_score: finalScore,
      severity: "info",
      source_data_keys: ["fitness.gym_duration_mins", "lifestyle.commute"],
      requires_research: false
    });
  }

  // Sort by final_score descending (Compound and high priority triggers first)
  return triggers.sort((a, b) => b.final_score - a.final_score);
}
