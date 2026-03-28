import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL = "https://media.base44.com/images/public/69b2f15b471168c6ba346b2e/";

const IMAGES = {
  "Bench Press":              { light: "ff3b1e6ce_generated_image.png", dark: "a56809883_generated_image.png" },
  "Squat":                    { light: "89a9a5723_generated_image.png", dark: "5b9f3144f_generated_image.png" },
  "Deadlift":                 { light: "a05a27705_generated_image.png", dark: "031745dc0_generated_image.png" },
  "Shoulder Press":           { light: "5ec7dd421_generated_image.png", dark: "fb74fb204_generated_image.png" },
  "Barbell Row":              { light: "c2e0f20af_generated_image.png", dark: "c3271b4a3_generated_image.png" },
  "Pull-ups":                 { light: "3fa1c4483_generated_image.png", dark: "0e7eedcb8_generated_image.png" },
  "Dumbbell Curl":            { light: "3740665aa_generated_image.png", dark: "79be58da7_generated_image.png" },
  "Tricep Pushdown":          { light: "b380cbb71_generated_image.png", dark: "b101e6c08_generated_image.png" },
  "Leg Press":                { light: "f640ba718_generated_image.png", dark: "fdba51174_generated_image.png" },
  "Lat Pulldown":             { light: "6f8cf96de_generated_image.png", dark: "dd317de70_generated_image.png" },
  "Incline Dumbbell Press":   { light: "7fc305625_generated_image.png", dark: "0d7979211_generated_image.png" },
  "Romanian Deadlift":        { light: "af092ac72_generated_image.png", dark: "c201b6db2_generated_image.png" },
  "Plank":                    { light: "e75cf94b2_generated_image.png", dark: "922f0d851_generated_image.png" },
  "Cable Fly":                { light: "f8cf84203_generated_image.png", dark: "eac12b958_generated_image.png" },
  "Hip Thrust":               { light: "dce8f4d3d_generated_image.png", dark: "a7fd8df8b_generated_image.png" },
  "Incline Bench Press":      { light: "5392a6a35_generated_image.png", dark: "b4e25c970_generated_image.png" },
  "Decline Bench Press":      { light: "43dc9e14d_generated_image.png", dark: "9eef31062_generated_image.png" },
  "Dumbbell Chest Press":     { light: "6ef9a9d1b_generated_image.png", dark: "2a3dda063_generated_image.png" },
  "Pec Deck Machine":         { light: "46e135a03_generated_image.png", dark: "68c7c26a8_generated_image.png" },
  "Push-ups":                 { light: "2dd5acf47_generated_image.png", dark: "cc32285ad_generated_image.png" },
  "Chest Dip":                { light: "4cb719dd7_generated_image.png", dark: "00f83eea5_generated_image.png" },
  "Front Squat":              { light: "9126b2610_generated_image.png", dark: "fe457ee15_generated_image.png" },
  "Leg Curl":                 { light: "18739bf48_generated_image.png", dark: "52a359698_generated_image.png" },
  "Leg Extension":            { light: "f17c41efb_generated_image.png", dark: "44d13ac5c_generated_image.png" },
  "Hack Squat":               { light: "ef0de1d21_generated_image.png", dark: "b12c5fa56_generated_image.png" },
  "Walking Lunge":            { light: "4b979a515_generated_image.png", dark: "e836d26e8_generated_image.png" },
  "Goblet Squat":             { light: "8063a59e9_generated_image.png", dark: "e96278e9b_generated_image.png" },
  "Sumo Deadlift":            { light: "8db68f7e5_generated_image.png", dark: "97f962d87_generated_image.png" },
  "Bulgarian Split Squat":    { light: "b8d56a71a_generated_image.png", dark: "d90ae69a9_generated_image.png" },
  "Lateral Raise":            { light: "90e9e7ace_generated_image.png", dark: "323b40cfd_generated_image.png" },
  "Front Raise":              { light: "79b9fc65c_generated_image.png", dark: "e42420456_generated_image.png" },
  "Rear Delt Fly":            { light: "717cd654a_generated_image.png", dark: "ed1e03fcf_generated_image.png" },
  "Face Pull":                { light: "db547b554_generated_image.png", dark: "5db1fdc07_generated_image.png" },
  "Upright Row":              { light: "6fb41e799_generated_image.png", dark: "4ad33d64f_generated_image.png" },
  "Arnold Press":             { light: "4ac11f2c6_generated_image.png", dark: "8af2f322e_generated_image.png" },
  "Dumbbell Shoulder Press":  { light: "b356a3593_generated_image.png", dark: "4c4354eaf_generated_image.png" },
  "Cable Lateral Raise":      { light: "4f959c686_generated_image.png", dark: "5f6e6e169_generated_image.png" },
  "Barbell Curl":             { light: "42f874d2e_generated_image.png", dark: "9a4c3c985_generated_image.png" },
  "Hammer Curl":              { light: "ee8f3250a_generated_image.png", dark: "c8b5e8e1e_generated_image.png" },
  "Cable Curl":               { light: "70610dbc3_generated_image.png", dark: "f1976f821_generated_image.png" },
  "Preacher Curl":            { light: "7f9d016b4_generated_image.png", dark: "a0085ba96_generated_image.png" },
  "Concentration Curl":       { light: "7d5912ee2_generated_image.png", dark: "50da77f96_generated_image.png" },
  "Incline Dumbbell Curl":    { light: "b7ebfbb96_generated_image.png", dark: "dc0a59232_generated_image.png" },
  "Spider Curl":              { light: "9ec60bdf0_generated_image.png", dark: "bda946add_generated_image.png" },
  "Bayesian Curl":            { light: "5e288437c_generated_image.png", dark: "bec3f62f8_generated_image.png" },
  "Tricep Dip":               { light: "446c1b002_generated_image.png", dark: "ff23f27e0_generated_image.png" },
  "Close Grip Bench Press":   { light: "b5f716cc2_generated_image.png", dark: "b23c5290d_generated_image.png" },
  "Skull Crusher":            { light: "e6155751a_generated_image.png", dark: "2fc69528d_generated_image.png" },
  "Overhead Tricep Extension":{ light: "c74f280f8_generated_image.png", dark: "c0e8d5bce_generated_image.png" },
  "Dumbbell Kickback":        { light: "23a81489d_generated_image.png", dark: "873efb7fa_generated_image.png" },
  "Seated Cable Row":         { light: "78d3864ea_generated_image.png", dark: "d7d9aa2a5_generated_image.png" },
  "Single Arm Dumbbell Row":  { light: "4c9ad9fc1_generated_image.png", dark: "f62b72bd7_generated_image.png" },
  "T-Bar Row":                { light: "1e11a88d3_generated_image.png", dark: "4b490708b_generated_image.png" },
  "Machine Row":              { light: "f3495ecc2_generated_image.png", dark: "7c58bbac5_generated_image.png" },
  "Hyperextension":           { light: "e4517d825_generated_image.png", dark: "4d821e37a_generated_image.png" },
  "Machine Shoulder Press":   { light: "0c3409a59_generated_image.png", dark: "99879479a_generated_image.png" },
  "Cable Crunch":             { light: "eb9c0dd6e_generated_image.png", dark: "b407b7dd6_generated_image.png" },
  "Russian Twist":            { light: "d3b1b80fc_generated_image.png", dark: "3eef73761_generated_image.png" },
  "Decline Crunch":           { light: "bd6d47609_generated_image.png", dark: "463c007fd_generated_image.png" },
  "Hanging Leg Raise":        { light: "f2bcfd3f9_generated_image.png", dark: "b0157850e_generated_image.png" },
  "Ab Rollout":               { light: "93e324175_generated_image.png", dark: "44f5ed1ec_generated_image.png" },
  "Side Plank":               { light: "89eb02f92_generated_image.png", dark: "a65b1e6a6_generated_image.png" },
  "Dead Bug":                 { light: "9143f1e83_generated_image.png", dark: "e4b63961d_generated_image.png" },
  "Toes to Bar":              { light: "97be9af2b_generated_image.png", dark: "660c4cedd_generated_image.png" },
  "Pallof Press":             { light: "b70e1da4e_generated_image.png", dark: "4a0a8d06d_generated_image.png" },
  "Hollow Body Hold":         { light: "cfa5a2e01_generated_image.png", dark: "82f042068_generated_image.png" },
  "Dragon Flag":              { light: "c648540f6_generated_image.png", dark: "874bde82d_generated_image.png" },
  "Cable Glute Kickback":     { light: "b33aaf13b_generated_image.png", dark: "6eadb182d_generated_image.png" },
  "Cable Kickback":           { light: "b33aaf13b_generated_image.png", dark: "6eadb182d_generated_image.png" },
  "Glute Kickback":           { light: "a43924946_generated_image.png", dark: "1790c0e3a_generated_image.png" },
  "Glute Bridge":             { light: "0bb529857_generated_image.png", dark: "accdab0d0_generated_image.png" },
  "Single Leg Hip Thrust":    { light: "d3c24bdb9_generated_image.png", dark: "e64fd21b2_generated_image.png" },
  "Cable Pull Through":       { light: "4558b12f3_generated_image.png", dark: "c7edef34a_generated_image.png" },
  "Frog Pump":                { light: "0bb529857_generated_image.png", dark: "accdab0d0_generated_image.png" },
  "Standing Calf Raise":      { light: "d8da58053_generated_image.png", dark: "65427fda1_generated_image.png" },
  "Seated Calf Raise":        { light: "728cb200b_generated_image.png", dark: "bce36b788_generated_image.png" },
  "Donkey Calf Raise":        { light: "91f4d8092_generated_image.png", dark: "b15180536_generated_image.png" },
  "Leg Press Calf Raise":     { light: "2ea642eb3_generated_image.png", dark: "0a728cece_generated_image.png" },
  "Farmer Carry":             { light: "cc62420bd_generated_image.png", dark: "12016ac25_generated_image.png" },
  "Reverse Curl":             { light: "17b9b21c2_generated_image.png", dark: "317be8d51_generated_image.png" },
  "Kettlebell Swing":         { light: "62033fb71_generated_image.png", dark: "eff4089b3_generated_image.png" },
  "Box Jump":                 { light: "adca0047d_generated_image.png", dark: "761f2e375_generated_image.png" },
  "Burpees":                  { light: "f290c0951_generated_image.png", dark: "4b75efb62_generated_image.png" },
  "Power Clean":              { light: "55fbe5f52_generated_image.png", dark: "9cfd228c9_generated_image.png" },
  "Nordic Hamstring Curl":    { light: "1e83d0f7f_generated_image.png", dark: "3abbff058_generated_image.png" },
  "Sissy Squat":              { light: "2e30672b8_generated_image.png", dark: "e699e986d_generated_image.png" },
  "Meadows Row":              { light: "275d75415_generated_image.png", dark: "5044e3e1b_generated_image.png" },
  "Wrist Curl":               { light: "6f04347d3_generated_image.png", dark: "cdf8b536a_generated_image.png" },
  "Single Leg Calf Raise":    { light: "a4e06cc73_generated_image.png", dark: "333691206_generated_image.png" },
  "Chin-ups":                 { light: "9313f0aa6_generated_image.png", dark: "c5f2e1479_generated_image.png" },
  "Barbell Overhead Press":   { light: "024d2c096_generated_image.png", dark: "7f40fbe3e_generated_image.png" },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const exercises = await base44.asServiceRole.entities.Exercise.list();
    let updated = 0, skipped = 0;
    const results = [];

    for (const exercise of exercises) {
      const imgs = IMAGES[exercise.name];
      if (imgs) {
        await base44.asServiceRole.entities.Exercise.update(exercise.id, {
          image_url: BASE_URL + imgs.light,
          image_url_dark: BASE_URL + imgs.dark,
        });
        updated++;
        results.push(`✅ ${exercise.name}`);
      } else {
        skipped++;
        results.push(`⚠️ No image: ${exercise.name}`);
      }
    }

    return Response.json({ success: true, updated, skipped, total: exercises.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});