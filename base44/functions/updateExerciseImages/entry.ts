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
  "Leg Press":                { light: "e5ed34bb1_generated_image.png", dark: "fdba51174_generated_image.png" },
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
  "Cable Kickback":           { light: "b33aaf13b_generated_image.png", dark: "6eadb182d_generated_image.png" },
  "Glute Bridge":             { light: "0bb529857_generated_image.png", dark: "accdab0d0_generated_image.png" },
  "Single Leg Hip Thrust":    { light: "d3c24bdb9_generated_image.png", dark: "e64fd21b2_generated_image.png" },
  "Cable Pull Through":       { light: "4558b12f3_generated_image.png", dark: "c7edef34a_generated_image.png" },
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
};

const NEW_EXERCISES = [
  { name: "Abductor Machine", muscle_group: "glutes", equipment: "machine", secondary_muscles: [], instructions: "Sit in the abductor machine with pads on the outside of your knees. Press outward against the resistance, then slowly return." },
  { name: "Adductor Machine", muscle_group: "legs", equipment: "machine", secondary_muscles: [], instructions: "Sit in the adductor machine with pads on the inside of your knees. Press inward against the resistance, then slowly return." },
  { name: "Band Pull Apart", muscle_group: "shoulders", equipment: "bands", secondary_muscles: ["back"], instructions: "Hold a resistance band in front of you with both hands. Pull the band apart by moving your arms outward, squeezing shoulder blades together." },
  { name: "Barbell Lunge", muscle_group: "legs", equipment: "barbell", secondary_muscles: ["glutes"], instructions: "Hold a barbell across your upper back. Step forward into a lunge, lowering your back knee toward the floor, then push back up." },
  { name: "Barbell Shrug", muscle_group: "back", equipment: "barbell", secondary_muscles: [], instructions: "Hold a barbell at thigh level. Shrug your shoulders straight up toward your ears, hold briefly at the top, then lower." },
  { name: "Battle Ropes", muscle_group: "shoulders", equipment: "bodyweight", secondary_muscles: ["core"], instructions: "Hold the ends of battle ropes and create waves by alternating arm movements rapidly while maintaining a half-squat position." },
  { name: "Bent Over Lateral Raise", muscle_group: "shoulders", equipment: "dumbbell", secondary_muscles: ["back"], instructions: "Hinge forward at the hips holding dumbbells. Raise them out to the sides until parallel to the floor, then lower." },
  { name: "Bicycle Crunch", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your back with hands behind head. Bring opposite elbow to knee while extending the other leg, alternating in a pedaling motion." },
  { name: "Box Squat", muscle_group: "legs", equipment: "barbell", secondary_muscles: ["glutes"], instructions: "With a barbell on your back, squat back onto a box until seated, pause briefly, then drive back up to standing." },
  { name: "Cable Chest Press", muscle_group: "chest", equipment: "cable", secondary_muscles: ["triceps"], instructions: "Stand between two cable stacks. Press the handles forward and together until arms are extended, then slowly return." },
  { name: "Cable Front Raise", muscle_group: "shoulders", equipment: "cable", secondary_muscles: [], instructions: "Stand facing away from a low cable. Raise the handle straight in front to shoulder height, then lower slowly." },
  { name: "Cable Hammer Curl", muscle_group: "biceps", equipment: "cable", secondary_muscles: ["forearms"], instructions: "Stand at a low cable with rope attachment. Curl with a neutral grip, keeping elbows at your sides, then lower." },
  { name: "Cable Hip Thrust", muscle_group: "glutes", equipment: "cable", secondary_muscles: ["legs"], instructions: "Sit with your upper back against a bench, cable attached to hips. Drive hips up until body is straight, squeezing glutes." },
  { name: "Cable Overhead Tricep Extension", muscle_group: "triceps", equipment: "cable", secondary_muscles: [], instructions: "Face away from a high cable with rope held overhead. Extend arms forward until straight, then return with control." },
  { name: "Cable Pullover", muscle_group: "back", equipment: "cable", secondary_muscles: ["chest"], instructions: "Stand facing a high cable with straight bar. With arms nearly straight, pull the bar down in an arc to your thighs, then return." },
  { name: "Cable Rear Delt Fly", muscle_group: "shoulders", equipment: "cable", secondary_muscles: ["back"], instructions: "Stand between two high cables. Pull the cables across your body and outward, squeezing rear delts, then return." },
  { name: "Cable Shrug", muscle_group: "back", equipment: "cable", secondary_muscles: [], instructions: "Stand holding cable handles at your sides. Shrug shoulders straight up toward ears, hold briefly, then lower." },
  { name: "Calf Press on Leg Press", muscle_group: "calves", equipment: "machine", secondary_muscles: [], instructions: "Sit in a leg press with only the balls of your feet on the platform. Press through your toes, then lower heels for a stretch." },
  { name: "Chest Supported Row", muscle_group: "back", equipment: "machine", secondary_muscles: ["biceps"], instructions: "Lie face down on an incline bench or chest-supported row machine. Pull handles toward you, squeezing shoulder blades together." },
  { name: "Clamshell", muscle_group: "glutes", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your side with knees bent at 90°. Keeping feet together, raise your top knee as high as possible, then lower." },
  { name: "Clean and Press", muscle_group: "shoulders", equipment: "barbell", secondary_muscles: ["legs"], instructions: "Pull the barbell from floor to shoulders in one motion (clean), then press it overhead. Lower and repeat." },
  { name: "Cross Body Hammer Curl", muscle_group: "biceps", equipment: "dumbbell", secondary_muscles: ["forearms"], instructions: "Hold dumbbells at your sides. Curl one across your body toward the opposite shoulder, then alternate arms." },
  { name: "Crunch", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your back with knees bent. Curl your upper body toward your knees, lifting shoulder blades off the floor, then lower." },
  { name: "Diamond Push-up", muscle_group: "triceps", equipment: "bodyweight", secondary_muscles: ["chest"], instructions: "Place hands close together forming a diamond shape. Lower chest to hands, then push back up, keeping elbows close to body." },
  { name: "Dip (Tricep)", muscle_group: "triceps", equipment: "bodyweight", secondary_muscles: ["chest"], instructions: "Support yourself on parallel bars with arms straight. Lower by bending elbows until upper arms are parallel, then press up." },
  { name: "Donkey Kick", muscle_group: "glutes", equipment: "bodyweight", secondary_muscles: [], instructions: "On hands and knees, kick one leg back and up while keeping knee bent at 90°. Squeeze glute at top, then lower." },
  { name: "Dumbbell Fly", muscle_group: "chest", equipment: "dumbbell", secondary_muscles: ["shoulders"], instructions: "Lie on a bench with dumbbells above chest. Lower them in a wide arc until you feel a stretch, then bring back together." },
  { name: "Dumbbell Overhead Tricep Extension", muscle_group: "triceps", equipment: "dumbbell", secondary_muscles: [], instructions: "Hold a dumbbell overhead with both hands. Lower it behind your head by bending elbows, then extend back up." },
  { name: "Dumbbell Pullover", muscle_group: "back", equipment: "dumbbell", secondary_muscles: ["chest"], instructions: "Lie perpendicular on a bench holding a dumbbell overhead. Lower it behind your head in an arc, then pull back over chest." },
  { name: "Dumbbell Romanian Deadlift", muscle_group: "legs", equipment: "dumbbell", secondary_muscles: ["glutes", "back"], instructions: "Hold dumbbells in front of thighs. Hinge at hips, lowering the dumbbells along your legs, then drive hips forward to stand." },
  { name: "Dumbbell Shrug", muscle_group: "back", equipment: "dumbbell", secondary_muscles: [], instructions: "Hold dumbbells at your sides. Shrug shoulders straight up toward ears, hold briefly, then lower." },
  { name: "Dumbbell Step Up", muscle_group: "legs", equipment: "dumbbell", secondary_muscles: ["glutes"], instructions: "Hold dumbbells and step onto an elevated platform. Drive through front foot to stand, then step back down." },
  { name: "EZ Bar Curl", muscle_group: "biceps", equipment: "barbell", secondary_muscles: [], instructions: "Hold an EZ curl bar with underhand grip. Curl the bar to shoulder height, keeping elbows stationary, then lower." },
  { name: "EZ Bar Skull Crusher", muscle_group: "triceps", equipment: "barbell", secondary_muscles: [], instructions: "Lie on bench holding EZ bar above chest. Lower the bar toward your forehead by bending elbows, then extend back up." },
  { name: "Fire Hydrant", muscle_group: "glutes", equipment: "bodyweight", secondary_muscles: [], instructions: "On hands and knees, raise one leg out to the side keeping knee bent at 90°. Squeeze glute at top, then lower." },
  { name: "Flutter Kicks", muscle_group: "core", equipment: "bodyweight", secondary_muscles: ["legs"], instructions: "Lie on your back with legs straight and slightly elevated. Kick legs up and down in a small, rapid motion." },
  { name: "Glute Kickback Machine", muscle_group: "glutes", equipment: "machine", secondary_muscles: [], instructions: "Position yourself in the glute kickback machine. Push the platform back by extending your hip, squeezing the glute." },
  { name: "Good Morning", muscle_group: "legs", equipment: "barbell", secondary_muscles: ["back", "glutes"], instructions: "With barbell on upper back, hinge at hips lowering your torso toward parallel while keeping back straight, then return." },
  { name: "Handstand Push-up", muscle_group: "shoulders", equipment: "bodyweight", secondary_muscles: ["triceps"], instructions: "Kick up into a handstand against a wall. Lower your head toward the floor by bending elbows, then press back up." },
  { name: "High Cable Fly", muscle_group: "chest", equipment: "cable", secondary_muscles: ["shoulders"], instructions: "Set cables high. Stand centered and bring handles down and together in front of your hips in a hugging motion." },
  { name: "Hip Abduction (Cable)", muscle_group: "glutes", equipment: "cable", secondary_muscles: [], instructions: "Attach cable to ankle and stand sideways. Raise leg out to the side against resistance, then lower with control." },
  { name: "Hip Extension (Cable)", muscle_group: "glutes", equipment: "cable", secondary_muscles: ["legs"], instructions: "Attach cable to ankle and face the machine. Extend leg backward against resistance, squeezing glute, then return." },
  { name: "Inverted Row", muscle_group: "back", equipment: "bodyweight", secondary_muscles: ["biceps"], instructions: "Hang from a bar with body straight. Pull chest to the bar by squeezing shoulder blades together, then lower." },
  { name: "Jump Rope", muscle_group: "calves", equipment: "bodyweight", secondary_muscles: [], instructions: "Jump continuously over a spinning rope, landing softly on the balls of your feet." },
  { name: "Kettlebell Clean", muscle_group: "shoulders", equipment: "kettlebell", secondary_muscles: ["legs"], instructions: "Swing kettlebell between legs, then pull it up close to body, catching it in rack position at shoulder." },
  { name: "Kettlebell Goblet Squat", muscle_group: "legs", equipment: "kettlebell", secondary_muscles: ["core", "glutes"], instructions: "Hold a kettlebell at chest level. Squat down keeping torso upright, then drive back up through heels." },
  { name: "Kettlebell Press", muscle_group: "shoulders", equipment: "kettlebell", secondary_muscles: ["triceps"], instructions: "Hold kettlebell in rack position at shoulder. Press it overhead until arm is fully extended, then lower." },
  { name: "Kettlebell Snatch", muscle_group: "shoulders", equipment: "kettlebell", secondary_muscles: ["core"], instructions: "Swing kettlebell between legs, then explosively pull it overhead in one motion, catching with arm locked out." },
  { name: "Kettlebell Turkish Get Up", muscle_group: "core", equipment: "kettlebell", secondary_muscles: ["shoulders"], instructions: "Lie down holding kettlebell overhead. Stand up through a series of movements while keeping arm extended, then reverse." },
  { name: "L-Sit", muscle_group: "core", equipment: "bodyweight", secondary_muscles: ["triceps"], instructions: "Support yourself on parallel bars or floor with arms straight. Lift legs parallel to ground, forming an L shape. Hold." },
  { name: "Landmine Press", muscle_group: "shoulders", equipment: "barbell", secondary_muscles: ["chest", "triceps"], instructions: "Hold the end of a landmine barbell at shoulder height. Press it up and forward until arm extends, then lower." },
  { name: "Landmine Rotation", muscle_group: "core", equipment: "barbell", secondary_muscles: ["shoulders"], instructions: "Hold the end of a landmine barbell with both hands at chest level. Rotate side to side in a controlled arc." },
  { name: "Lateral Band Walk", muscle_group: "glutes", equipment: "bands", secondary_muscles: [], instructions: "Place a resistance band around thighs or ankles. Step sideways maintaining tension, keeping feet parallel." },
  { name: "Leg Press (Single Leg)", muscle_group: "legs", equipment: "machine", secondary_muscles: ["glutes"], instructions: "Sit in leg press with one foot on the platform. Press away until leg extends, then lower with control." },
  { name: "Leg Raise", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie flat or hang from a bar. Raise straight legs until they're perpendicular to the floor, then lower slowly." },
  { name: "Low Cable Fly", muscle_group: "chest", equipment: "cable", secondary_muscles: ["shoulders"], instructions: "Set cables low. Bring handles up and together in front of your chest in a hugging motion, focusing on upper chest." },
  { name: "Machine Bicep Curl", muscle_group: "biceps", equipment: "machine", secondary_muscles: [], instructions: "Sit at bicep curl machine with arms on pad. Curl handles toward shoulders, squeezing biceps, then lower." },
  { name: "Machine Lateral Raise", muscle_group: "shoulders", equipment: "machine", secondary_muscles: [], instructions: "Sit at lateral raise machine with arms under pads. Raise pads out to the sides to shoulder height, then lower." },
  { name: "Medicine Ball Slam", muscle_group: "core", equipment: "bodyweight", secondary_muscles: ["shoulders"], instructions: "Hold medicine ball overhead. Slam it down to the ground with full force, catch the bounce, and repeat." },
  { name: "Mountain Climber", muscle_group: "core", equipment: "bodyweight", secondary_muscles: ["shoulders", "legs"], instructions: "Start in push-up position. Rapidly alternate bringing knees toward chest in a running motion." },
  { name: "Muscle Up", muscle_group: "back", equipment: "bodyweight", secondary_muscles: ["triceps", "chest"], instructions: "Hang from a bar. Pull explosively, transitioning at the top to push yourself above the bar until arms are straight." },
  { name: "Pause Squat", muscle_group: "legs", equipment: "barbell", secondary_muscles: ["glutes", "core"], instructions: "Squat down and pause for 2-3 seconds at the bottom position before driving back up explosively." },
  { name: "Pendlay Row", muscle_group: "back", equipment: "barbell", secondary_muscles: ["biceps"], instructions: "With barbell on floor, hinge to a parallel torso. Row the bar explosively to your chest, then lower it fully to the floor." },
  { name: "Pike Push-up", muscle_group: "shoulders", equipment: "bodyweight", secondary_muscles: ["triceps"], instructions: "Start in downward dog position. Bend elbows to lower head toward floor, then press back up." },
  { name: "Pistol Squat", muscle_group: "legs", equipment: "bodyweight", secondary_muscles: ["core", "glutes"], instructions: "Stand on one leg with other leg extended forward. Squat down as low as possible, then drive back up." },
  { name: "Plank to Push-up", muscle_group: "core", equipment: "bodyweight", secondary_muscles: ["chest", "triceps"], instructions: "Start in forearm plank. Push up to hand plank one arm at a time, then lower back down. Alternate lead arm." },
  { name: "Plate Front Raise", muscle_group: "shoulders", equipment: "bodyweight", secondary_muscles: [], instructions: "Hold a weight plate with both hands at thighs. Raise it straight in front to shoulder height, then lower." },
  { name: "Plate Pinch", muscle_group: "forearms", equipment: "bodyweight", secondary_muscles: [], instructions: "Pinch two weight plates together smooth-side-out using just your fingers. Hold for time." },
  { name: "Rack Pull", muscle_group: "back", equipment: "barbell", secondary_muscles: ["glutes", "legs"], instructions: "Set a barbell on rack pins at knee height. Perform the top portion of a deadlift from the pins." },
  { name: "Renegade Row", muscle_group: "back", equipment: "dumbbell", secondary_muscles: ["core", "biceps"], instructions: "In push-up position holding dumbbells, row one dumbbell to your hip while stabilizing with the other arm. Alternate." },
  { name: "Reverse Crunch", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your back with knees bent. Curl hips off the floor bringing knees toward chest, then lower with control." },
  { name: "Reverse Hyperextension", muscle_group: "glutes", equipment: "machine", secondary_muscles: ["legs", "back"], instructions: "Lie face down on the machine. Raise your legs by extending hips until body is straight, then lower." },
  { name: "Reverse Wrist Curl", muscle_group: "forearms", equipment: "barbell", secondary_muscles: [], instructions: "Hold barbell with overhand grip, forearms on thighs. Curl wrists up, then lower slowly." },
  { name: "Romanian Deadlift (Single Leg)", muscle_group: "legs", equipment: "dumbbell", secondary_muscles: ["glutes", "core"], instructions: "Stand on one leg holding dumbbells. Hinge forward, extending free leg behind for balance, then return." },
  { name: "Seated Good Morning", muscle_group: "back", equipment: "barbell", secondary_muscles: ["glutes"], instructions: "Sit on a bench with barbell on upper back. Hinge forward at hips, then return to upright." },
  { name: "Seated Hip Abduction", muscle_group: "glutes", equipment: "machine", secondary_muscles: [], instructions: "Sit in the hip abduction machine. Press legs apart against the resistance, then return slowly." },
  { name: "Seated Leg Curl", muscle_group: "legs", equipment: "machine", secondary_muscles: [], instructions: "Sit in the machine with pad above ankles. Curl legs down and back, squeezing hamstrings, then return." },
  { name: "Seated Row (Wide Grip)", muscle_group: "back", equipment: "cable", secondary_muscles: ["biceps"], instructions: "Sit at cable row with wide bar attachment. Pull to lower chest with elbows flared, squeezing shoulder blades." },
  { name: "Single Arm Tricep Pushdown", muscle_group: "triceps", equipment: "cable", secondary_muscles: [], instructions: "Stand at high cable with single handle. Push down until arm is straight, keeping elbow at side, then return." },
  { name: "Sled Push", muscle_group: "legs", equipment: "bodyweight", secondary_muscles: ["core"], instructions: "Lean into a weighted sled with extended arms. Drive through legs to push the sled forward." },
  { name: "Smith Machine Bench Press", muscle_group: "chest", equipment: "machine", secondary_muscles: ["triceps"], instructions: "Lie on bench under Smith machine bar. Unrack, lower to chest, then press back up." },
  { name: "Smith Machine Squat", muscle_group: "legs", equipment: "machine", secondary_muscles: ["glutes"], instructions: "Stand under Smith machine bar on upper back. Unrack and squat down, then drive back up." },
  { name: "Step Up", muscle_group: "legs", equipment: "bodyweight", secondary_muscles: ["glutes"], instructions: "Step onto an elevated platform with one leg. Drive through that leg to stand on top, then step back down." },
  { name: "Straight Arm Pulldown", muscle_group: "back", equipment: "cable", secondary_muscles: [], instructions: "Stand at high cable with straight bar. With arms straight, pull the bar down to your thighs, then return." },
  { name: "Sumo Squat", muscle_group: "legs", equipment: "bodyweight", secondary_muscles: ["glutes"], instructions: "Stand with feet wide and toes pointed out. Squat down keeping knees tracking over toes, then stand." },
  { name: "Svend Press", muscle_group: "chest", equipment: "bodyweight", secondary_muscles: [], instructions: "Press two plates together at chest level. Extend arms forward while squeezing the plates, then return." },
  { name: "Thruster", muscle_group: "legs", equipment: "barbell", secondary_muscles: ["shoulders"], instructions: "Hold barbell in front rack. Squat down, then drive up explosively and press the bar overhead in one motion." },
  { name: "Trap Bar Deadlift", muscle_group: "back", equipment: "barbell", secondary_muscles: ["legs", "glutes"], instructions: "Stand inside trap bar, grip handles. Drive through heels to stand up straight, then lower." },
  { name: "Tricep Machine", muscle_group: "triceps", equipment: "machine", secondary_muscles: [], instructions: "Sit at tricep machine and grip handles. Press down until arms are fully extended, then return slowly." },
  { name: "Tuck Crunch", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your back. Simultaneously raise knees and upper body, bringing them together, then lower." },
  { name: "V-Up", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie flat with arms overhead. Simultaneously raise legs and torso to touch toes at the top, forming a V shape." },
  { name: "Wall Sit", muscle_group: "legs", equipment: "bodyweight", secondary_muscles: [], instructions: "Lean against a wall and slide down until thighs are parallel to floor. Hold this position for time." },
  { name: "Woodchopper", muscle_group: "core", equipment: "cable", secondary_muscles: ["shoulders"], instructions: "Stand sideways to cable set high. Pull diagonally across body from high to low in a chopping motion." },
  { name: "Wrist Roller", muscle_group: "forearms", equipment: "bodyweight", secondary_muscles: [], instructions: "Hold a wrist roller with arms extended. Roll the weight up by rotating wrists, then lower slowly." },
  { name: "Zottman Curl", muscle_group: "biceps", equipment: "dumbbell", secondary_muscles: ["forearms"], instructions: "Curl dumbbells with palms up. At top, rotate to palms down and lower slowly. Rotate back at bottom." },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const exercises = await base44.asServiceRole.entities.Exercise.list('-created_date', 1000);
    let imgUpdated = 0, imgSkipped = 0;

    for (const exercise of exercises) {
      const imgs = IMAGES[exercise.name];
      if (imgs) {
        await base44.asServiceRole.entities.Exercise.update(exercise.id, {
          image_url: BASE_URL + imgs.light,
          image_url_dark: BASE_URL + imgs.dark,
        });
        imgUpdated++;
      } else {
        imgSkipped++;
      }
    }

    const existingNames = new Set(exercises.map(e => e.name.toLowerCase()));
    let added = 0, skippedNew = 0;

    for (const ex of NEW_EXERCISES) {
      if (existingNames.has(ex.name.toLowerCase())) {
        skippedNew++;
      } else {
        await base44.asServiceRole.entities.Exercise.create(ex);
        added++;
      }
    }

    return Response.json({
      success: true,
      images: { updated: imgUpdated, skipped: imgSkipped },
      exercises: { added, skipped: skippedNew },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});