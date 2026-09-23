import { part1Expansion } from "./part1-expansion.mjs";

// Additional spoken descriptions are tied to photographs already reviewed for
// the bank. Every sentence below describes the same visible action or object
// as its paired original; the three distractors are new for each item.
const alternatives = [
  ["A filing cabinet is being filled with folders.", "Folders are being put away in an office cabinet."],
  ["A restaurant employee is cleaning a table.", "A dining table is being wiped with a cloth."],
  ["Travelers are getting onto a bus.", "People are entering a bus at a stop."],
  ["Indoor plants are being watered by a worker.", "A worker is tending plants inside an office."],
  ["A document is being scanned on a copier.", "A woman is using a photocopier to scan a page."],
  ["A sofa is being moved through a doorway.", "Two men are transporting a sofa into another room."],
  ["A mechanic is inspecting an open car hood.", "The hood of a car has been raised for inspection."],
  ["People are sitting at a meeting table.", "A group is seated around a conference table."],
  ["A sign is being fastened to an interior wall.", "A man is mounting a sign on a wall."],
  ["A shopper is choosing fruit at a market stall.", "Fruit is being selected at an outdoor market."],
  ["Luggage has been placed next to a service counter.", "Several suitcases are standing beside a counter."],
  ["A customer is receiving a menu from a server.", "A server is giving a menu to a seated diner."],
  ["A paved path is being swept by a worker.", "A man is cleaning a walkway with a broom."],
  ["Books have been laid out on a table.", "A display of books covers a table."],
  ["A cyclist is securing her helmet.", "A woman is adjusting the strap of a bicycle helmet."],
  ["A ceiling fixture is being installed.", "A technician is fitting a light above a room."],
  ["A traveler is reading a station timetable.", "A man is looking at a train schedule board."],
  ["Guests are dining at outdoor tables.", "People are having a meal on a restaurant patio."],
  ["Shirts are being folded on a retail display.", "A store employee is arranging folded shirts."],
  ["A van is standing near a warehouse entrance.", "A delivery vehicle has been parked beside a warehouse."],
  ["A window frame is being measured by two workers.", "Two people are using a tape measure at a window."],
  ["A shopper is pushing a cart down an aisle.", "A man is moving a shopping cart through a store."],
  ["Rows of chairs fill an event hall.", "Chairs have been set out in orderly rows."],
  ["A speaker is standing behind a podium.", "A woman is addressing an audience from a podium."],
  ["Cardboard boxes are being piled onto a pallet.", "A warehouse employee is stacking cartons."],
  ["A pedestrian is opening an umbrella outdoors.", "A man is raising an umbrella on a wet sidewalk."],
  ["Shoppers are standing in a checkout line.", "Customers are waiting to pay at a counter."],
  ["A laptop is being used beside a window.", "A woman is working on a computer near a window."],
  ["A hedge is being cut by a gardener.", "A gardener is shaping a hedge with shears."],
  ["Two travelers are consulting a paper map.", "People are looking over a map together."],
  ["A suitcase is being put into a car trunk.", "A man is loading luggage into a vehicle."],
  ["Clean plates have been left to dry near a sink.", "Dishes are resting on a rack beside a sink."],
  ["A microphone is being positioned on a stand.", "A woman is adjusting a microphone before speaking."],
  ["A wooden door is being painted by a worker.", "A worker is applying paint to a door."],
  ["Several small boats are moored at a dock.", "Boats have been tied beside a marina walkway."],
  ["A printer cartridge is being changed.", "An office worker is fitting a new printer cartridge."],
  ["Employees are walking through an office entrance.", "Several people are entering a glass-fronted office building."],
  ["Labels are being attached to packages.", "A warehouse worker is putting labels on boxes."],
  ["A glass is being filled with water by a waiter.", "A server is pouring water for a customer."],
  ["A photographer is aiming a camera at a building.", "A man is photographing the exterior of a building."],
  ["Tools have been mounted on a workshop wall.", "A selection of tools is hanging on a board."],
  ["Curtains are being pulled open beside a window.", "A woman is opening the curtains in a room."],
  ["A carpet is being unrolled across a floor.", "Two workers are laying out a carpet."],
  ["A notice is being read on a bulletin board.", "A man is studying a posted announcement."],
  ["Bicycles are being placed on a vehicle rack.", "Workers are loading bikes onto a carrier."],
  ["Fresh vegetables are being weighed at a stall.", "A market vendor is using a scale for vegetables."],
  ["A glass entrance door is being cleaned.", "A worker is wiping down a glass door."],
  ["A ticket is being passed to an attendant.", "A traveler is giving an attendant a ticket."],
  ["Lamps are arranged in a showroom.", "Several lighting fixtures are on display."],
  ["Items are being placed in a cardboard box.", "A woman is packing belongings into a carton."],
  ["A section of pavement is being repaired.", "A road worker is fixing part of a paved surface."],
  ["Pedestrians are strolling along a waterfront.", "People are walking beside the water."],
  ["Pastries are being arranged behind glass.", "A baker is placing pastries in a display case."],
  ["A woman is glancing at a wall clock.", "The time is being checked on a clock above a wall."],
];
const keys = ["A", "B", "C", "D"];
const distractorActions = [
  "A pilot is checking flight equipment", "A sailor is repairing a boat", "A farmer is gathering crops",
  "A lifeguard is watching swimmers", "A florist is arranging bouquets", "A chef is preparing a meal",
  "A scientist is examining a sample", "A musician is tuning an instrument", "A park ranger is guiding hikers",
];
const distractorPlaces = [
  "the Eastport airfield", "the Brookhaven marina", "the Westfield orchard", "the Lakeside pool", "the Maple Street florist", "the Hillcrest kitchen",
  "the Bayview laboratory", "the Cedar Hall stage", "the Pine Valley trail", "the Riverbend terminal", "the Oakwood harbor", "the Silverlake farm",
  "the Meadowbrook resort", "the Northgate greenhouse", "the Fairview cafeteria", "the Stonebridge research center", "the Highpoint theater", "the Juniper nature reserve",
  "the Seabrook runway", "the Clearview pier", "the Greenford field", "the Sandstone aquatic center", "the Redcliff flower market", "the Southport restaurant",
  "the Willow Creek institute", "the Elmwood concert hall", "the Crestview national park", "the Goldleaf airport", "the Fernhill fishing port", "the Ashgrove vineyard",
];

export const part1TwentyFiveFormExpansion = [
  ...alternatives.map((pair, index) => [index, pair[0]]),
  ...alternatives.slice(0, 36).map((pair, index) => [index, pair[1]]),
].map(([sourceIndex, correct], index) => {
  const source = part1Expansion[sourceIndex];
  const answerIndex = (index + 2) % 4;
  const wrong = [0, 1, 2].map((offset) => {
    const number = index * 3 + offset;
    return `${distractorActions[Math.floor(number / distractorPlaces.length)]} at ${distractorPlaces[number % distractorPlaces.length]}.`;
  });
  const choices = [...wrong]; choices.splice(answerIndex, 0, correct);
  const id = `L-P1-FORM25-${String(index + 1).padStart(3, "0")}`;
  return {
    ...source, externalId: id,
    transcript: choices.map((text, choiceIndex) => `${keys[choiceIndex]}. ${text}`).join("\n"),
    script: [{ speaker: "NARRATOR", text: choices.map((text, choiceIndex) => `${keys[choiceIndex]}. ${text}`).join(" ") }],
    media: source.media.map((media) => media.role === "IMAGE" ? { ...media, altText: correct } : { ...media, assetRef: `content/listening/audio/${id}.mp3` }),
    question: { ...source.question, options: choices.map((text, choiceIndex) => ({ key: keys[choiceIndex], text })), correctKey: keys[answerIndex], explanationEn: `The photograph shows ${correct[0].toLowerCase()}${correct.slice(1)}`, explanationVi: `Bức ảnh thể hiện: ${correct}` },
  };
});
