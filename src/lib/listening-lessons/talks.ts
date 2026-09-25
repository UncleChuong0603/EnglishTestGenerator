export type ListeningTalk = {
  slug: string;
  minutes: 1 | 3 | 5 | 10;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  transcript: string;
  audioUrl: string;
};

// Original first-person talks. Each version has a complete opening and ending.
// Paragraphs are synthesized in this exact order by scripts/generate-listening-talks.mts.
const opening = `Last spring, I started taking a short walk before work. I told myself it was for exercise, but honestly, I mostly wanted ten minutes away from my phone. The first few mornings felt strangely empty. I kept reaching for my pocket whenever I had to wait at a crossing. Then I began noticing things that had been there all along: the smell of bread from a small bakery, a dog that always stopped at the same tree, and the way the street became quiet just before the shops opened. Nothing dramatic happened. That was the surprise. I was paying attention to an ordinary place, and the ordinary place had more to offer than I expected.`;

const sections = [
  `One morning, I passed the bakery just as the owner was putting a tray of rolls in the window. I had seen him almost every day for months, but I had never really looked at him. He moved slowly and carefully, as if each roll deserved its own space. I went inside and bought one. We talked for less than a minute. He told me that his father had taught him to make bread, and that he still arrived before sunrise because he liked the calm at that hour. I left with a warm paper bag and a very different picture of the man behind the counter. Before that morning, he had been part of the background of my commute. Afterward, I found myself wondering how many other people I had passed without seeing.`,
  `The next week, it rained hard enough to keep most people indoors. I almost skipped the walk, but I put on a jacket and went out anyway. At the bus stop, a woman was struggling with an umbrella that had turned inside out. We laughed at the same time, and I helped her fold it. She was on her way to visit her mother. I was on my way to a desk and a long list of emails. We stood together for perhaps two minutes, listening to the rain hit the shelter roof. When her bus arrived, she thanked me and waved through the window. It was such a small exchange that I could easily have forgotten it. Instead, it stayed with me all day. It reminded me that connection does not always require a deep conversation. Sometimes it begins when two people notice the same moment.`,
  `I used to think that attention was something I either had or did not have. If my mind wandered, I assumed I was simply bad at focusing. Those walks changed that idea. Attention began to feel more like a choice I could make again and again. Some days I would notice the sound of my shoes on the pavement. On other days I would notice that I was worried about a meeting and had hardly seen the road at all. Neither day was a failure. The point was to recognize where my mind had gone and gently bring it back. I did not need a perfect morning or a silent street. I just needed a moment in which I was willing to look up.`,
  `This habit followed me into conversations. A colleague once told me about a difficult weekend. Normally I might have tried to cheer her up immediately, or offered advice before she had finished speaking. That day I waited. She paused, then told me the part that was really bothering her. I had not done anything clever. I had simply left enough space for her to continue. Later, she said that talking had helped. I realized how often I listen while preparing my next sentence instead of hearing the one in front of me. A walk without my phone had not made me wiser, but it had given me practice at staying with something for a little longer.`,
  `Of course, life did not suddenly become slower. I still had crowded mornings, late trains, and messages that needed answers. Some days I took the walk and spent the whole time thinking about work. Some days I did not go at all. What changed was my response when I noticed myself rushing. I began to pause before opening another app or filling a quiet moment with noise. If I was waiting for coffee, I watched the barista work. If I was walking home, I noticed the light in the windows above the shops. These pauses were short, but they made the day feel less like a list of tasks and more like a place I was actually living in.`,
  `There was one evening when the value of that habit became especially clear. I was tired after a frustrating day and wanted to get home quickly. Near my building, an older neighbor was carrying a box up the steps. I had seen him many times but knew almost nothing about him. I offered to help, and we carried the box together. It held books he was giving to a community center. He told me he had worked as a teacher and still loved the feeling of finding a book that made a young person curious. We stood on the landing for a few minutes, talking about stories we remembered from childhood. I went upstairs with the same problems I had carried home, but they felt smaller. I had been reminded that another person's life was unfolding beside mine.`,
  `I do not think everyone needs a morning walk. A quiet breakfast, a ride on the train, or the few minutes before a meeting can offer the same chance. The important part is not the place. It is the decision to stop treating every pause as empty time that must be filled. When I look around, I often find a detail that grounds me: a familiar voice, a tree changing with the season, or a stranger being kind to someone else. These details do not solve everything. They help me remember that the world is larger than whatever problem is occupying my mind at that moment. For me, that is a useful kind of perspective.`,
  `Now I sometimes take the same walk with a friend. We do not always talk. At first, I worried that the silence would feel awkward, but it rarely does. We point out a new sign in a shop window or a bird building a nest under the bridge. Occasionally one of us shares something important. More often, we simply move through the neighborhood together. I have come to value those ordinary minutes. They do not produce a story worth telling at a party, and they do not make me more productive. They give me a way to be present with another person without needing to perform. That feels rare enough to protect.`,
  `A few months later, the bakery closed for a week. I was surprised by how much I missed it. It was not only the bread. I missed the familiar light in the window and the little nod from the owner when I passed. When the shop reopened, I told him that. He smiled and said that a regular customer had once said the same thing to his father. He had kept the bakery partly because of those small relationships. I walked away thinking about all the places that become meaningful because we return to them. A neighborhood is more than its buildings. It is made of the quiet ways people recognize one another.`,
  `My friend asked whether I was becoming a more patient person. I wanted to say yes, but the honest answer was more complicated. I still interrupt people sometimes. I still hurry through a conversation when I am tired. The difference is that I notice it sooner. If I catch myself thinking about what to say next, I try to return to the other person's words. I ask one more question. I allow a pause. This does not turn every conversation into something profound. It gives the other person a little more room to be heard, and it gives me a better chance to understand what they actually mean.`,
  `There are mornings when the walk offers no pleasant discovery. A truck blocks the pavement. The bakery line is long. My thoughts are loud, and I reach the office without remembering much of the journey. I used to think those mornings proved the habit was not working. Now I think they are part of it. Attention is not a prize I win for doing everything correctly. It is something I can practice in the middle of an imperfect day. Even when I only remember to look up for the last thirty seconds, those seconds are real. They are enough to begin again the next morning.`,
  `Sometimes I imagine telling my younger self that one of my favorite daily habits would be walking the same few streets. I think I would have found that boring. I wanted big changes, important plans, and clear signs that I was moving forward. I still care about those things. But the walk has taught me to notice what happens while I am making the plans. The smell of fresh bread will not decide my future. A brief conversation at a bus stop will not solve a difficult problem. Yet both can make me feel connected to the life I have today, instead of waiting for a better one to begin.`,
  `If you want to try something similar, you do not need special equipment or a perfect schedule. Choose a few minutes you already spend moving from one place to another. Put your phone away if you can. Notice three things you can see or hear. Then notice how you feel, without trying to change it immediately. Perhaps you will see something interesting. Perhaps your mind will wander the whole time. Both are ordinary experiences. The useful part is giving yourself permission to come back. Over time, that small return can make familiar streets and familiar people feel a little less invisible.`,
] as const;

const ending = `So tomorrow morning, I will probably take that walk again. I may notice something beautiful, or I may just notice that I am tired. Either way, I will have given myself a few minutes to listen, to look around, and to remember that small moments can change the way a whole day feels.`;

const versions = [
  { minutes: 1, count: 0, slug: "attention-1" },
  { minutes: 3, count: 3, slug: "attention-3" },
  { minutes: 5, count: 6, slug: "attention-5" },
  { minutes: 10, count: 13, slug: "attention-10" },
] as const;

export const listeningTalks: readonly ListeningTalk[] = versions.map(({ minutes, count, slug }) => ({
  slug,
  minutes,
  titleVi: "Một cuộc đi bộ và cách tôi học lắng nghe",
  titleEn: "A Walk That Taught Me to Listen",
  descriptionVi: "Một bài chia sẻ về sự chú ý, những cuộc gặp ngắn và vẻ đẹp của ngày thường.",
  descriptionEn: "A personal talk about attention, small encounters, and ordinary days.",
  transcript: [opening, ...sections.slice(0, count), ending].join("\n\n"),
  audioUrl: `/listening-talks/${slug}.mp3`,
}));

export function getListeningTalk(slug: string) {
  return listeningTalks.find(talk => talk.slug === slug);
}

export function getTalkParagraphs(talk: ListeningTalk) {
  return talk.transcript.split("\n\n");
}
