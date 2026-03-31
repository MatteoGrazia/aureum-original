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
  "Chin-ups":                 { light: "9313f0aa6_generated_image.png", dark: "c5f2e1479_generated_image.png" },
  "Barbell Overhead Press":   { light: "024d2c096_generated_image.png", dark: "7f40fbe3e_generated_image.png" },
};

const NEW_EXERCISES = [
  { name: "Dumbbell Fly", muscle_group: "chest", equipment: "dumbbell", secondary_muscles: ["shoulders"], instructions: "Lie on a flat bench holding dumbbells above your chest with a slight bend in the elbows. Lower the weights out to the sides in a wide arc until you feel a stretch in the chest, then bring them back up." },
  { name: "Cable Chest Press", muscle_group: "chest", equipment: "cable", secondary_muscles: ["triceps", "shoulders"], instructions: "Stand between two cable stations with handles at chest height. Press both handles forward until arms are extended, then slowly return." },
  { name: "Low Cable Fly", muscle_group: "chest", equipment: "cable", secondary_muscles: ["shoulders"], instructions: "Set cables to the lowest position. With a slight forward lean, bring the handles up and together in a wide arc, focusing on the upper chest." },
  { name: "High Cable Fly", muscle_group: "chest", equipment: "cable", secondary_muscles: ["shoulders"], instructions: "Set cables to the highest position. Bring the handles down and together in a wide arc, focusing on the lower chest." },
  { name: "Smith Machine Bench Press", muscle_group: "chest", equipment: "machine", secondary_muscles: ["triceps", "shoulders"], instructions: "Lie on a bench inside a Smith machine. Unrack the bar, lower it to your chest, then press it back up." },
  { name: "Dumbbell Pullover", muscle_group: "chest", equipment: "dumbbell", secondary_muscles: ["back", "triceps"], instructions: "Lie perpendicular on a bench. Hold a dumbbell above your chest with both hands. Lower it behind your head in an arc, keeping arms slightly bent, then return." },
  { name: "Landmine Press", muscle_group: "chest", equipment: "barbell", secondary_muscles: ["shoulders", "triceps"], instructions: "Anchor a barbell in a landmine attachment. Hold the end of the bar at chest height and press it up and forward." },
  { name: "Svend Press", muscle_group: "chest", equipment: "bodyweight", secondary_muscles: ["shoulders"], instructions: "Hold two weight plates together between your palms. Press them forward from your chest until arms are extended, squeezing the plates together throughout." },
  { name: "Cable Pullover", muscle_group: "back", equipment: "cable", secondary_muscles: ["chest", "triceps"], instructions: "Stand facing a high cable pulley. Pull the straight bar down in an arc from overhead to your hips, keeping arms straight." },
  { name: "Straight Arm Pulldown", muscle_group: "back", equipment: "cable", secondary_muscles: ["chest"], instructions: "Stand facing a high cable. With arms straight, pull the bar down to your thighs in an arc, squeezing the lats." },
  { name: "Chest Supported Row", muscle_group: "back", equipment: "dumbbell", secondary_muscles: ["biceps"], instructions: "Lie face down on an incline bench. Let the dumbbells hang down, then row them up to your sides, squeezing your shoulder blades together." },
  { name: "Pendlay Row", muscle_group: "back", equipment: "barbell", secondary_muscles: ["biceps", "core"], instructions: "With the bar on the floor, hinge over parallel to the ground. Explosively row the bar to your lower chest, then lower it back to the floor each rep." },
  { name: "Inverted Row", muscle_group: "back", equipment: "bodyweight", secondary_muscles: ["biceps", "core"], instructions: "Lie under a bar set at waist height. Grab the bar with an overhand grip, keep your body straight, and pull your chest up to the bar." },
  { name: "Renegade Row", muscle_group: "back", equipment: "dumbbell", secondary_muscles: ["core", "biceps"], instructions: "Start in a push-up position holding dumbbells. Row one dumbbell up to your hip while balancing on the other, then switch sides." },
  { name: "Dumbbell Shrug", muscle_group: "back", equipment: "dumbbell", secondary_muscles: [], instructions: "Hold dumbbells at your sides. Shrug your shoulders straight up toward your ears, hold briefly, then lower." },
  { name: "Barbell Shrug", muscle_group: "back", equipment: "barbell", secondary_muscles: [], instructions: "Hold a barbell in front of you with an overhand grip. Shrug your shoulders straight up toward your ears, hold briefly, then lower." },
  { name: "Trap Bar Deadlift", muscle_group: "back", equipment: "barbell", secondary_muscles: ["legs", "glutes"], instructions: "Stand inside a trap bar with handles at your sides. Hinge and grip the handles, then drive through your heels to stand up straight." },
  { name: "Rack Pull", muscle_group: "back", equipment: "barbell", secondary_muscles: ["glutes"], instructions: "Set a barbell on rack pins at knee height. Grip the bar and drive your hips forward to stand up, keeping the bar close to your body." },
  { name: "Good Morning", muscle_group: "back", equipment: "barbell", secondary_muscles: ["legs", "glutes"], instructions: "Place a barbell on your upper back. Hinge forward at the hips, keeping a slight knee bend, until your torso is near parallel to the floor, then return." },
  { name: "Seated Row (Wide Grip)", muscle_group: "back", equipment: "cable", secondary_muscles: ["biceps"], instructions: "Use a wide bar on a seated cable row machine. Pull the bar to your lower chest with elbows flared out, squeezing the upper back." },
  { name: "Cable Shrug", muscle_group: "back", equipment: "cable", secondary_muscles: [], instructions: "Stand facing a low cable machine holding a bar or handles. Shrug your shoulders upward, hold briefly, then lower." },
  { name: "Muscle Up", muscle_group: "back", equipment: "bodyweight", secondary_muscles: ["chest", "triceps"], instructions: "From a hanging position on a bar, explosively pull up and transition to a dip position at the top, finishing with arms extended." },
  { name: "Seated Good Morning", muscle_group: "back", equipment: "barbell", secondary_muscles: ["core"], instructions: "Sit on a bench with a barbell across your upper back. Hinge forward from your hips, keeping your back straight, then return to upright." },
  { name: "Cable Front Raise", muscle_group: "shoulders", equipment: "cable", secondary_muscles: [], instructions: "Stand facing away from a low cable. Hold the handle and raise your arm straight in front of you to shoulder height." },
  { name: "Plate Front Raise", muscle_group: "shoulders", equipment: "bodyweight", secondary_muscles: [], instructions: "Hold a weight plate with both hands at your waist. Raise it straight in front of you to shoulder height, then lower." },
  { name: "Bent Over Lateral Raise", muscle_group: "shoulders", equipment: "dumbbell", secondary_muscles: ["back"], instructions: "Hinge forward at the hips holding dumbbells. Raise the weights out to the sides until parallel with the floor, keeping a slight bend in the elbows." },
  { name: "Machine Lateral Raise", muscle_group: "shoulders", equipment: "machine", secondary_muscles: [], instructions: "Sit at a lateral raise machine. Place your elbows or wrists on the pads and raise them to shoulder height, then lower slowly." },
  { name: "Cable Rear Delt Fly", muscle_group: "shoulders", equipment: "cable", secondary_muscles: ["back"], instructions: "Set two cables at face height, crossed. Hold the right handle with your left hand and vice versa. Pull the handles apart, extending your arms outward." },
  { name: "Handstand Push-up", muscle_group: "shoulders", equipment: "bodyweight", secondary_muscles: ["triceps", "core"], instructions: "Kick up into a handstand against a wall. Lower your head toward the floor by bending the elbows, then push back up." },
  { name: "Pike Push-up", muscle_group: "shoulders", equipment: "bodyweight", secondary_muscles: ["triceps"], instructions: "Start in a downward dog position. Bend your elbows to lower the top of your head toward the floor, then push back up." },
  { name: "Kettlebell Press", muscle_group: "shoulders", equipment: "kettlebell", secondary_muscles: ["triceps", "core"], instructions: "Hold a kettlebell in rack position at shoulder height. Press it straight overhead until your arm is locked out, then lower." },
  { name: "Band Pull Apart", muscle_group: "shoulders", equipment: "bands", secondary_muscles: ["back"], instructions: "Hold a resistance band in front of you at shoulder height. Pull it apart by moving your hands outward, squeezing your rear delts and rhomboids." },
  { name: "EZ Bar Curl", muscle_group: "biceps", equipment: "barbell", secondary_muscles: ["forearms"], instructions: "Hold an EZ bar with an underhand grip at the angled grip positions. Curl the bar up to shoulder height, then lower." },
  { name: "Cable Hammer Curl", muscle_group: "biceps", equipment: "cable", secondary_muscles: ["forearms"], instructions: "Attach a rope to a low cable. Hold the rope with a neutral grip and curl up to shoulder height, keeping the neutral wrist position." },
  { name: "Machine Bicep Curl", muscle_group: "biceps", equipment: "machine", secondary_muscles: [], instructions: "Sit at a bicep curl machine with your upper arms on the pad. Curl the handles up, then slowly lower." },
  { name: "Zottman Curl", muscle_group: "biceps", equipment: "dumbbell", secondary_muscles: ["forearms"], instructions: "Curl dumbbells up with a supinated grip, rotate to a pronated grip at the top, then slowly lower. Rotate back to supinated at the bottom." },
  { name: "Cross Body Hammer Curl", muscle_group: "biceps", equipment: "dumbbell", secondary_muscles: ["forearms"], instructions: "Hold dumbbells at your sides with a neutral grip. Curl one dumbbell across your body toward the opposite shoulder, then alternate." },
  { name: "Cable Overhead Tricep Extension", muscle_group: "triceps", equipment: "cable", secondary_muscles: [], instructions: "Face away from a high cable with a rope attachment behind your head. Extend your arms forward and up, then slowly return." },
  { name: "EZ Bar Skull Crusher", muscle_group: "triceps", equipment: "barbell", secondary_muscles: [], instructions: "Lie on a bench holding an EZ bar over your chest. Keeping upper arms vertical, lower the bar toward your forehead, then extend back up." },
  { name: "Single Arm Tricep Pushdown", muscle_group: "triceps", equipment: "cable", secondary_muscles: [], instructions: "Hold a single cable handle at a high pulley. Keeping your upper arm still, push the handle down until your arm is fully extended, then return." },
  { name: "Tricep Machine", muscle_group: "triceps", equipment: "machine", secondary_muscles: [], instructions: "Sit at a tricep extension machine. Grip the handles and extend your arms forward or downward, then slowly return." },
  { name: "Diamond Push-up", muscle_group: "triceps", equipment: "bodyweight", secondary_muscles: ["chest"], instructions: "Place your hands close together under your chest forming a diamond shape. Lower your chest to your hands, then push back up." },
  { name: "Dumbbell Overhead Tricep Extension", muscle_group: "triceps", equipment: "dumbbell", secondary_muscles: [], instructions: "Hold one dumbbell with both hands overhead. Lower it behind your head by bending the elbows, then extend back up." },
  { name: "Dip (Tricep)", muscle_group: "triceps", equipment: "bodyweight", secondary_muscles: ["chest", "shoulders"], instructions: "Support yourself on parallel bars. Lower your body by bending the elbows, keeping torso upright, then press back up." },
  { name: "Sumo Squat", muscle_group: "legs", equipment: "dumbbell", secondary_muscles: ["glutes"], instructions: "Stand with feet wide and toes pointed out, holding a dumbbell. Lower into a squat, keeping your chest up, then drive back up." },
  { name: "Barbell Lunge", muscle_group: "legs", equipment: "barbell", secondary_muscles: ["glutes"], instructions: "Hold a barbell on your upper back. Step forward into a lunge, lowering your back knee toward the floor, then push back up." },
  { name: "Step Up", muscle_group: "legs", equipment: "dumbbell", secondary_muscles: ["glutes"], instructions: "Hold dumbbells at your sides. Step up onto a box or bench with one foot, bring the other up, then step back down." },
  { name: "Smith Machine Squat", muscle_group: "legs", equipment: "machine", secondary_muscles: ["glutes"], instructions: "Stand under the bar in a Smith machine with feet slightly forward. Lower into a squat, then drive back up." },
  { name: "Dumbbell Romanian Deadlift", muscle_group: "legs", equipment: "dumbbell", secondary_muscles: ["glutes", "back"], instructions: "Hold dumbbells in front of your thighs. Hinge at the hips, letting the dumbbells slide down your legs, then drive your hips forward to stand." },
  { name: "Pistol Squat", muscle_group: "legs", equipment: "bodyweight", secondary_muscles: ["core", "glutes"], instructions: "Stand on one leg with the other extended forward. Lower into a single-leg squat as deep as possible, then press back up." },
  { name: "Wall Sit", muscle_group: "legs", equipment: "bodyweight", secondary_muscles: [], instructions: "Stand with your back against a wall and slide down until your thighs are parallel to the floor. Hold the position." },
  { name: "Seated Leg Curl", muscle_group: "legs", equipment: "machine", secondary_muscles: [], instructions: "Sit in a seated leg curl machine with the pad on top of your ankles. Curl your legs down and back, then slowly return." },
  { name: "Adductor Machine", muscle_group: "legs", equipment: "machine", secondary_muscles: [], instructions: "Sit in the adductor machine with pads on the inside of your knees. Squeeze your knees together against the resistance, then slowly return." },
  { name: "Box Squat", muscle_group: "legs", equipment: "barbell", secondary_muscles: ["glutes"], instructions: "Set a box behind you. Squat back and down until you sit on the box briefly, then drive back up." },
  { name: "Pause Squat", muscle_group: "legs", equipment: "barbell", secondary_muscles: ["glutes", "core"], instructions: "Perform a barbell squat but pause for 2-3 seconds at the bottom before driving back up." },
  { name: "Romanian Deadlift (Single Leg)", muscle_group: "legs", equipment: "dumbbell", secondary_muscles: ["glutes", "core"], instructions: "Hold a dumbbell in one hand. Balance on the opposite leg and hinge forward, letting the dumbbell lower toward the floor while extending the free leg behind you." },
  { name: "Dumbbell Step Up", muscle_group: "legs", equipment: "dumbbell", secondary_muscles: ["glutes"], instructions: "Hold dumbbells at your sides and step up onto a sturdy box or bench with one foot, then bring the other foot up. Step back down and repeat." },
  { name: "Leg Press (Single Leg)", muscle_group: "legs", equipment: "machine", secondary_muscles: ["glutes"], instructions: "Sit in a leg press machine. Place one foot on the platform and press it away, then slowly return. Complete reps before switching legs." },
  { name: "Kettlebell Goblet Squat", muscle_group: "legs", equipment: "kettlebell", secondary_muscles: ["core", "glutes"], instructions: "Hold a kettlebell at your chest with both hands. Squat deep, keeping your chest up and elbows inside your knees, then stand." },
  { name: "Donkey Kick", muscle_group: "glutes", equipment: "bodyweight", secondary_muscles: [], instructions: "On hands and knees, kick one leg back and up, keeping the knee bent at 90 degrees. Squeeze the glute at the top." },
  { name: "Fire Hydrant", muscle_group: "glutes", equipment: "bodyweight", secondary_muscles: [], instructions: "On hands and knees, lift one knee out to the side like a dog at a hydrant, keeping it bent. Lower and repeat." },
  { name: "Abductor Machine", muscle_group: "glutes", equipment: "machine", secondary_muscles: [], instructions: "Sit in the abductor machine with pads on the outside of your knees. Push your knees outward against the resistance, then slowly return." },
  { name: "Reverse Hyperextension", muscle_group: "glutes", equipment: "machine", secondary_muscles: ["back"], instructions: "Lie face down on a reverse hyper machine with hips at the edge. Swing your legs up behind you using glute and hamstring strength." },
  { name: "Hip Abduction (Cable)", muscle_group: "glutes", equipment: "cable", secondary_muscles: [], instructions: "Attach a cable cuff to your ankle. Stand sideways to the machine and lift your leg out to the side against the resistance." },
  { name: "Hip Extension (Cable)", muscle_group: "glutes", equipment: "cable", secondary_muscles: [], instructions: "Attach a cable cuff to your ankle. Face the machine and kick your leg back, squeezing the glute at the top." },
  { name: "Lateral Band Walk", muscle_group: "glutes", equipment: "bands", secondary_muscles: ["legs"], instructions: "Place a resistance band around your ankles. Stand in a slight squat and sidestep laterally, keeping tension on the band throughout." },
  { name: "Clamshell", muscle_group: "glutes", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your side with knees bent at 45 degrees. Keeping your feet together, rotate your top knee up as far as possible, then lower." },
  { name: "Glute Kickback Machine", muscle_group: "glutes", equipment: "machine", secondary_muscles: [], instructions: "Position yourself in a glute kickback machine. Push one leg back and up against the resistance, squeezing the glute at the top." },
  { name: "Seated Hip Abduction", muscle_group: "glutes", equipment: "machine", secondary_muscles: [], instructions: "Sit in a hip abduction machine. Push your knees outward against the pads, then slowly bring them back together." },
  { name: "Cable Hip Thrust", muscle_group: "glutes", equipment: "cable", secondary_muscles: [], instructions: "Sit on the floor in front of a low cable with the bar across your hips. Drive your hips up to a bridge position, squeezing the glutes at the top." },
  { name: "Calf Press on Leg Press", muscle_group: "calves", equipment: "machine", secondary_muscles: [], instructions: "Sit in a leg press machine and place only the balls of your feet on the bottom of the platform. Press up onto your toes, then slowly lower." },
  { name: "L-Sit", muscle_group: "core", equipment: "bodyweight", secondary_muscles: ["triceps", "legs"], instructions: "Support yourself on parallel bars or the floor with arms straight. Lift your legs parallel to the ground and hold the L-position." },
  { name: "V-Up", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie flat on your back. Simultaneously raise your legs and torso, reaching your hands toward your feet to form a V shape, then lower." },
  { name: "Bicycle Crunch", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your back with hands behind your head. Bring one knee to your chest while rotating to touch the opposite elbow to it, alternating sides." },
  { name: "Mountain Climber", muscle_group: "core", equipment: "bodyweight", secondary_muscles: ["shoulders"], instructions: "Start in a push-up position. Rapidly alternate driving each knee toward your chest, keeping your hips level." },
  { name: "Woodchopper", muscle_group: "core", equipment: "cable", secondary_muscles: ["shoulders"], instructions: "Set a cable to the high position. Pull the handle diagonally down and across your body from high to low, rotating through your core." },
  { name: "Landmine Rotation", muscle_group: "core", equipment: "barbell", secondary_muscles: ["shoulders"], instructions: "Hold the end of a landmine barbell with both hands. Rotate from side to side in an arc, keeping arms extended." },
  { name: "Crunch", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your back with knees bent. Curl your upper body toward your knees, lifting your shoulder blades off the floor, then lower." },
  { name: "Leg Raise", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie flat on your back. Keeping your legs straight, raise them to 90 degrees, then slowly lower without letting them touch the floor." },
  { name: "Flutter Kicks", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your back and raise both legs a few inches off the floor. Alternate kicking them up and down in a small, rapid motion." },
  { name: "Reverse Crunch", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your back with knees bent. Use your lower abs to curl your hips up off the floor, bringing your knees toward your chest." },
  { name: "Tuck Crunch", muscle_group: "core", equipment: "bodyweight", secondary_muscles: [], instructions: "Lie on your back. Simultaneously bring your knees to your chest and curl your torso up, then extend back out." },
  { name: "Plank to Push-up", muscle_group: "core", equipment: "bodyweight", secondary_muscles: ["chest", "triceps"], instructions: "Start in a forearm plank. Push up one arm at a time to a full push-up position, then lower back to forearms. Alternate the leading arm." },
  { name: "Wrist Roller", muscle_group: "forearms", equipment: "bodyweight", secondary_muscles: [], instructions: "Hold a wrist roller at shoulder height. Roll it to wind the weight up, then slowly unwind it. Alternate directions." },
  { name: "Reverse Wrist Curl", muscle_group: "forearms", equipment: "barbell", secondary_muscles: [], instructions: "Hold a barbell with an overhand grip, forearms resting on a bench. Extend your wrists upward, then slowly lower." },
  { name: "Plate Pinch", muscle_group: "forearms", equipment: "bodyweight", secondary_muscles: [], instructions: "Pinch two weight plates smooth side out between your thumb and fingers. Hold for time, or carry for distance." },
  { name: "Jump Rope", muscle_group: "calves", equipment: "bodyweight", secondary_muscles: ["core"], instructions: "Hold a jump rope handle in each hand. Swing the rope overhead and jump over it with both feet, maintaining a steady rhythm." },
  { name: "Battle Ropes", muscle_group: "shoulders", equipment: "bodyweight", secondary_muscles: ["core"], instructions: "Hold one end of each battle rope. Create waves by alternately raising and lowering your arms rapidly, maintaining a wide stance." },
  { name: "Sled Push", muscle_group: "legs", equipment: "bodyweight", secondary_muscles: ["core"], instructions: "Load a sled with weight. Lean into the handles and drive forward with powerful leg strides." },
  { name: "Clean and Press", muscle_group: "shoulders", equipment: "barbell", secondary_muscles: ["legs"], instructions: "From the floor, explosively pull the barbell to shoulder height (clean), then press it overhead. Lower and repeat." },
  { name: "Thruster", muscle_group: "legs", equipment: "barbell", secondary_muscles: ["shoulders"], instructions: "Hold a barbell at shoulder height. Squat down, then as you stand up, use the momentum to press the bar overhead in one fluid motion." },
  { name: "Medicine Ball Slam", muscle_group: "core", equipment: "bodyweight", secondary_muscles: ["shoulders"], instructions: "Hold a medicine ball overhead. Slam it down to the floor with full force, then pick it up and repeat." },
  { name: "Kettlebell Clean", muscle_group: "shoulders", equipment: "kettlebell", secondary_muscles: ["legs"], instructions: "Swing a kettlebell back between your legs, then explosively drive your hips forward, pulling the bell up to rack position at shoulder height." },
  { name: "Kettlebell Turkish Get Up", muscle_group: "core", equipment: "kettlebell", secondary_muscles: ["shoulders"], instructions: "Lie on your back holding a kettlebell at arm's length. Follow a specific sequence of movements to stand up while keeping the bell overhead, then reverse." },
  { name: "Kettlebell Snatch", muscle_group: "shoulders", equipment: "kettlebell", secondary_muscles: ["core"], instructions: "Swing the kettlebell back between your legs, then drive your hips forward and pull it overhead in one smooth motion." },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const exercises = await base44.asServiceRole.entities.Exercise.list();
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