// A photograph question gets three unrelated actions. The second index varies
// the setting only across questions, never among choices in the same question.
const activities = [
  "A diver is inspecting coral beneath the water",
  "A chef is decorating a wedding cake",
  "A pilot is testing a flight simulator",
  "A sculptor is carving a block of stone",
  "A veterinarian is examining a horse",
  "A drummer is rehearsing with an orchestra",
  "A firefighter is climbing a training tower",
  "A scientist is observing bacteria through a microscope",
  "A fisherman is casting a net from a boat",
  "A dancer is practicing a ballet routine",
  "A beekeeper is collecting honey from a hive",
  "A mechanic is repairing a motorcycle engine",
  "A potter is shaping a clay bowl",
  "A lifeguard is signaling to swimmers",
  "A farmer is harvesting wheat with a tractor",
  "A musician is tuning a grand piano",
  "A sailor is raising a flag on a ship",
  "A scientist is launching a weather balloon",
  "A zookeeper is feeding a giraffe",
  "A florist is wrapping a bouquet of roses",
  "A blacksmith is heating metal in a furnace",
  "A surfer is carrying a board toward the sea",
  "A dentist is examining a patient's teeth",
  "A mountain climber is fastening a safety rope",
  "A tailor is stitching a jacket on a sewing machine",
  "A farmer is milking a cow in a barn",
  "A film director is positioning actors on a set",
  "A swimmer is diving from a starting block",
  "A train conductor is inspecting the engine",
  "A geologist is collecting rocks beside a cliff",
  "A magician is performing a trick on stage",
  "A chef is grilling fish over an open fire",
  "A veterinarian is bandaging a dog's paw",
  "A sailor is untangling a rope on deck",
  "A scientist is measuring water from a river",
  "A pilot is walking around a helicopter",
  "A musician is playing a harp for an audience",
  "A farmer is guiding sheep through a gate",
  "A lifeguard is cleaning equipment at a beach",
  "A florist is planting flowers in a greenhouse",
  "A carpenter is cutting timber with a saw",
  "A photographer is developing film in a darkroom",
  "A baker is kneading dough on a workbench",
  "A ranger is observing birds through binoculars",
  "A coach is demonstrating a tennis serve",
];
const settings = [
  "in the morning", "in the afternoon", "before noon", "near the end of the day",
  "early in the day", "late in the day", "at midday", "before sunset",
  "on a weekday morning", "on a weekend afternoon",
];

export function part1Distractor(index) {
  const activity = activities[index % activities.length];
  const cycle = Math.floor(index / activities.length);
  const setting = settings[(cycle + index % activities.length) % settings.length];
  if (cycle >= settings.length) throw new Error(`No Part 1 distractor for index ${index}`);
  return `${activity} ${setting}.`;
}
