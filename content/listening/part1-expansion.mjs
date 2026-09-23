const keys = ["A", "B", "C", "D"];

const scenes = [
  ["A woman is placing folders into a filing cabinet.", "woman actively placing folders into an open filing cabinet in a modern office"],
  ["A man is wiping a restaurant table.", "restaurant worker actively wiping a dining table with a cloth"],
  ["Some passengers are boarding a bus.", "several passengers actively boarding a city bus at a bus stop"],
  ["A worker is watering plants in an office.", "office worker watering several indoor plants with a watering can"],
  ["A woman is scanning a document at a copier.", "businesswoman scanning a document on an office photocopier"],
  ["Two men are carrying a sofa through a doorway.", "two movers actively carrying a sofa through a wide doorway"],
  ["A mechanic is looking under the hood of a car.", "auto mechanic inspecting beneath the open hood of a car"],
  ["Some people are seated around a conference table.", "businesspeople seated around a conference table during a meeting"],
  ["A man is attaching a sign to a wall.", "worker actively attaching a blank sign to an interior wall"],
  ["A woman is selecting fruit at an outdoor market.", "woman selecting fresh fruit from a stall at an outdoor market"],
  ["Several suitcases are lined up beside a counter.", "several travel suitcases lined up beside an airport service counter"],
  ["A server is handing a menu to a customer.", "restaurant server handing a menu to a seated customer"],
  ["A man is sweeping a walkway.", "maintenance worker sweeping an outdoor paved walkway"],
  ["Some books are displayed on a table.", "many books neatly displayed on a table at a book fair"],
  ["A woman is fastening a bicycle helmet.", "woman fastening the strap of a bicycle helmet beside a bicycle"],
  ["A technician is installing a ceiling light.", "technician on a small ladder installing a ceiling light fixture"],
  ["A man is checking a train schedule.", "traveler looking closely at a large train schedule board in a station"],
  ["Some diners are eating on a patio.", "several diners eating at tables on an outdoor restaurant patio"],
  ["A woman is folding shirts on a display table.", "retail employee folding shirts on a clothing store display table"],
  ["A delivery van is parked beside a warehouse.", "delivery van parked beside a warehouse loading entrance"],
  ["Two workers are measuring a window.", "two construction workers measuring a window frame with a tape measure"],
  ["A man is pushing a cart through a supermarket.", "man pushing a shopping cart through a supermarket aisle"],
  ["Some chairs have been arranged in rows.", "many chairs arranged in neat rows in an event hall"],
  ["A woman is speaking at a podium.", "businesswoman speaking at a podium in a conference room"],
  ["A worker is stacking boxes on a pallet.", "warehouse worker actively stacking cardboard boxes on a wooden pallet"],
  ["A man is opening an umbrella.", "man opening an umbrella on a rainy city sidewalk"],
  ["Some customers are waiting at a checkout counter.", "several customers waiting in line at a retail checkout counter"],
  ["A woman is typing on a laptop near a window.", "woman typing on a laptop at a desk beside a large window"],
  ["A gardener is trimming a hedge.", "gardener actively trimming a green hedge with garden shears"],
  ["Two people are reviewing a map.", "two travelers reviewing a paper map together at a station"],
  ["A man is placing luggage in a car trunk.", "man actively placing a suitcase into the open trunk of a car"],
  ["Some dishes are drying beside a sink.", "clean dishes drying on a rack beside a kitchen sink"],
  ["A woman is adjusting a microphone.", "woman adjusting a microphone on a stand before a presentation"],
  ["A worker is painting a door.", "worker actively painting a wooden door with a paintbrush"],
  ["Several boats are tied to a dock.", "several small boats tied to a wooden dock at a marina"],
  ["A man is replacing a printer cartridge.", "office worker replacing the toner cartridge in a printer"],
  ["Some employees are entering an office building.", "several employees entering a modern office building through glass doors"],
  ["A woman is labeling packages.", "warehouse employee applying blank shipping labels to cardboard packages"],
  ["A waiter is pouring water into a glass.", "waiter actively pouring water from a bottle into a customer's glass"],
  ["A man is taking a photograph of a building.", "man using a camera to photograph a modern building"],
  ["Some tools are hanging on a wall.", "workshop tools neatly hanging on a wall-mounted tool board"],
  ["A woman is opening the curtains.", "woman actively opening curtains beside a large hotel room window"],
  ["Two workers are rolling a carpet across a floor.", "two workers unrolling a carpet across an empty room floor"],
  ["A man is reading a notice on a bulletin board.", "man reading a posted notice on an office bulletin board"],
  ["Some bicycles are being loaded onto a rack.", "workers loading bicycles onto a vehicle bicycle rack"],
  ["A woman is weighing vegetables.", "market vendor weighing fresh vegetables on a scale"],
  ["A worker is cleaning a glass door.", "cleaner wiping a large glass door with a cloth"],
  ["A man is handing a ticket to an attendant.", "traveler handing a ticket to an attendant at an entrance gate"],
  ["Several lamps are displayed in a showroom.", "several table and floor lamps displayed in a furniture showroom"],
  ["A woman is packing items into a cardboard box.", "woman actively packing office items into a cardboard box"],
  ["A worker is repairing a section of pavement.", "road worker repairing a small section of pavement with tools"],
  ["Some people are walking along a waterfront.", "several people walking along a paved waterfront promenade"],
  ["A man is arranging pastries in a display case.", "bakery employee arranging pastries inside a glass display case"],
  ["A woman is checking the time on a wall clock.", "businesswoman looking up to check a large wall clock in an office"],
];

// Each generated photograph gets three distinct spoken alternatives. Keep this
// deterministic: the transcript, answer key, and recorded audio must agree.
const distractorPeople = [
  ["A pilot", "at an airport"], ["A nurse", "at a clinic"],
  ["A farmer", "on a farm"], ["A musician", "in a rehearsal room"],
  ["A lifeguard", "at a swimming pool"], ["A scientist", "in a laboratory"],
  ["A sailor", "at a harbor"], ["A firefighter", "at a fire station"],
  ["A librarian", "in a library"], ["A florist", "at a flower shop"],
  ["A tour guide", "at a museum"], ["A baker", "in a bakery"],
  ["A veterinarian", "at an animal clinic"], ["A photographer", "in a studio"],
  ["A carpenter", "in a workshop"], ["A chef", "in a kitchen"],
  ["A swimming instructor", "at a sports center"], ["A painter", "in an art studio"],
];
const distractorActions = [
  "is speaking with a colleague", "is carrying a folder", "is checking a schedule",
  "is making a phone call", "is writing on a clipboard", "is opening a cabinet",
  "is reading a notice", "is sorting some paperwork", "is walking through a doorway",
];
const distractorPool = Array.from({ length: scenes.length * 3 }, (_, index) =>
  `${distractorPeople[index % distractorPeople.length][0]} ${distractorActions[Math.floor(index / distractorPeople.length)]} ${distractorPeople[index % distractorPeople.length][1]}.`
);

export const part1Expansion = scenes.map(([correct, imagePrompt], index) => {
  const number = index + 7;
  const answer = index % 4;
  const choices = distractorPool.slice(index * 3, index * 3 + 3);
  choices.splice(answer, 0, correct);
  const id = `L-P1-BANK-${String(number).padStart(3, "0")}`;
  return {
    externalId: id, version: 1, part: 1, type: "photograph", status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: number % 5 === 0 ? "medium" : "easy",
    transcript: choices.map((text, choiceIndex) => `${keys[choiceIndex]}. ${text}`).join("\n"),
    script: [{ speaker: "NARRATOR", text: choices.map((text, choiceIndex) => `${keys[choiceIndex]}. ${text}`).join(" ") }],
    media: [{ role: "IMAGE", assetRef: `content/listening/source/${id}.png`, altText: correct }, { role: "AUDIO", assetRef: `content/listening/audio/${id}.mp3` }],
    imagePrompt,
    question: { order: 1, text: "[Spoken choices only]", skill: "photographs", subSkill: "visual_detail", difficulty: number % 5 === 0 ? "medium" : "easy", options: choices.map((text, choiceIndex) => ({ key: keys[choiceIndex], text })), correctKey: keys[answer], explanationEn: `The photograph shows that ${correct.toLowerCase()}`, explanationVi: `Bức ảnh cho thấy rõ: ${correct}`, },
  };
});
