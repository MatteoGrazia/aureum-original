import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Maps DB exercise names (without images) → a similar exercise that HAS images
const ALIASES = {
  "Barbell Overhead Press": "Overhead Press (Barbell)",
  "Machine Row": "Seated Row (Machine)",
  "Chin-ups": "Chin Up",
  "Dumbbell Shoulder Press": "Shoulder Press (Dumbbell)",
  "Barbell Curl": "Bicep Curl (Barbell)",
  "Dumbbell Fly": "Chest Fly (Dumbbell)",
  "Stair Machine (Floors)": "Cycling",
  "Reverse Wrist Curl": "Wrist Curl",
  "Wrist Roller": "Wrist Curl",
  "Landmine Rotation": "Landmine 180",
  "Woodchopper": "Cable Twist (Up to down)",
  "Calf Press on Leg Press": "Leg Press Calf Raise",
  "Cable Hip Thrust": "Hip Thrust (Machine)",
  "Seated Hip Abduction": "Hip Abduction (Machine)",
  "Glute Kickback Machine": "Rear Kick (Machine)",
  "Hip Extension (Cable)": "Standing Cable Glute Kickbacks",
  "Hip Abduction (Cable)": "Hip Abduction (Machine)",
  "Glute Kickback Machine": "Hip Thrust (Machine)",
  "Hip Extension (Cable)": "Hip Thrust (Machine)",
  "Donkey Kick": "Glute Kickback on Floor",
  "Leg Press (Single Leg)": "Single Leg Press (Machine)",
  "Romanian Deadlift (Single Leg)": "Single Leg Romanian Deadlift (Barbell)",
  "Dumbbell Romanian Deadlift": "Romanian Deadlift (Dumbbell)",
  "Smith Machine Squat": "Squat (Smith Machine)",
  "Dip (Tricep)": "Tricep Dip",
  "Dumbbell Overhead Tricep Extension": "Overhead Tricep Extension",
  "Diamond Push-up": "Push Up - Close Grip",
  "Tricep Machine": "Tricep Pushdown",
  "Single Arm Tricep Pushdown": "Tricep Pushdown",
  "EZ Bar Skull Crusher": "Skull Crusher",
  "Cable Overhead Tricep Extension": "Overhead Tricep Extension",
  "Cable Hammer Curl": "Hammer Curl (Cable)",
  "EZ Bar Curl": "EZ Bar Biceps Curl",
  "Pike Push-up": "Push-ups",
  "Handstand Push-up": "Handstand Hold",
  "Cable Rear Delt Fly": "Lateral Raise",
  "Machine Lateral Raise": "Lateral Raise (Machine)",
  "Bent Over Lateral Raise": "Rear Delt Reverse Fly (Dumbbell)",
  "Plate Front Raise": "Front Raise",
  "Cable Front Raise": "Front Raise (Cable)",
  "Seated Good Morning": "Good Morning (Barbell)",
  "Cable Shrug": "Upright Row",
  "Seated Row (Wide Grip)": "Seated Cable Row - Bar Wide Grip",
  "Trap Bar Deadlift": "Deadlift (Trap bar)",
  "Dumbbell Shrug": "Shrug (Dumbbell)",
  "Renegade Row": "Single Arm Dumbbell Row",
  "Chest Supported Row": "Chest Supported Incline Row (Dumbbell)",
  "Svend Press": "Cable Fly",
  "Smith Machine Bench Press": "Bench Press (Smith Machine)",
  "High Cable Fly": "Cable Fly Crossovers",
  "Cable Chest Press": "Bench Press (Cable)",
  "Barbell Row": "Bent Over Row (Barbell)",
  "Pull-ups": "Pull Up (Weighted)",
  "Close Grip Bench Press": "Bench Press - Close Grip (Barbell)",
  "Dumbbell Chest Press": "Bench Press (Dumbbell)",
  "Push-ups": "Ring Push Up",
  "Farmer Carry": "Farmers Walk",
  "Pec Deck Machine": "Butterfly (Pec Deck)",
  "Cable Lateral Raise": "Lateral Raise (Cable)",
  "Incline Dumbbell Curl": "Seated Incline Curl (Dumbbell)",
  "Machine Shoulder Press": "Seated Shoulder Press (Machine)",
  "Single Leg Calf Raise": "Single Leg Standing Calf Raise",
  "Ab Rollout": "Ab Wheel",
  "Dumbbell Kickback": "Triceps Kickback (Cable)",
  "Cable Kickback": "Triceps Kickback (Cable)",
  "Chin-ups": "Chin Up",
  "Barbell Overhead Press": "Overhead Press (Barbell)",
  "Dumbbell Shoulder Press": "Shoulder Press (Dumbbell)",
  "Barbell Curl": "Bicep Curl (Barbell)",
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const exercises = await base44.asServiceRole.entities.Exercise.list('-created_date', 1000);

    // Build lookup: name → exercise
    const nameMap = {};
    exercises.forEach(e => { if (e.name) nameMap[e.name] = e; });

    let updated = 0, skipped = 0;
    const notFound = [];

    for (const [targetName, sourceName] of Object.entries(ALIASES)) {
      const target = nameMap[targetName];
      if (!target) { skipped++; continue; }
      if (target.image_url) { skipped++; continue; }

      const source = nameMap[sourceName];
      if (!source?.image_url) {
        notFound.push(`${targetName} → ${sourceName} (source missing)`);
        continue;
      }

      await base44.asServiceRole.entities.Exercise.update(target.id, {
        image_url: source.image_url,
        image_url_dark: source.image_url_dark || source.image_url,
      });
      updated++;
      await sleep(100);
    }

    return Response.json({ success: true, updated, skipped, notFound });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});