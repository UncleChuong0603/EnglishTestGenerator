import type { ListeningTalk } from "./talks";

type TalkCopy = Omit<ListeningTalk, "audioUrl">;

export const additionalTalks: readonly TalkCopy[] = [
  {
    slug: "first-day-at-work", minutes: 1,
    topicVi: "Công việc", topicEn: "Work",
    titleVi: "Ngày đầu ở nơi làm việc mới", titleEn: "My First Day at a New Job",
    descriptionVi: "Một sai sót nhỏ giúp tôi hiểu cách đồng nghiệp chào đón người mới.",
    descriptionEn: "A small mistake shows me what a welcoming workplace feels like.",
    transcript: `On my first day at a new job, I arrived early and tried to look confident. By lunchtime, I had forgotten three names and sent a meeting invitation to the wrong room. I expected someone to be annoyed. Instead, my teammate Maya walked over, helped me correct the invitation, and told me about the mistakes she had made during her first week. Later, she drew a simple map of the office on a piece of paper, with everyone's name beside their desk. I kept that map in my notebook for months. The most useful thing Maya gave me was not information about the building. She showed me that asking for help was a normal part of learning the job. When a new colleague joined our team the following year, I remembered how I had felt that first morning. I made a map for him, and I told him that getting lost was allowed.`,
  },
  {
    slug: "community-choir", minutes: 3,
    topicVi: "Âm nhạc", topicEn: "Music",
    titleVi: "Lần đầu tôi hát trong dàn hợp xướng", titleEn: "The First Time I Sang in a Choir",
    descriptionVi: "Từ nỗi sợ hát sai đến niềm vui hòa giọng cùng người khác.",
    descriptionEn: "From fear of singing badly to the pleasure of finding a shared voice.",
    transcript: `I joined a community choir because a friend promised there would be no audition. That detail mattered to me. I liked music, but I had spent years singing only when I was alone in the car. On the first evening, I stood near the door, ready to leave if everyone else sounded perfect. They did not. People missed notes, lost their place on the page, and laughed at themselves. The director asked us to breathe together before singing a single note. The sound that came out was uneven, but it filled the room in a way one voice could not.

At first, I tried to hide inside the group. I listened for the people beside me and moved my mouth quietly. Then our section practiced a short passage on its own. The director stopped us and asked us to notice how the notes moved, rather than worry about being wrong. We tried again. I could hear my own voice for a moment, and it was less frightening than I had imagined. After rehearsal, a woman called Rosa told me she had felt the same way when she joined. She had been singing with the group for six years.

We met every Thursday. Some weeks I arrived tired after work and wondered why I had agreed to spend an evening standing under bright lights. Then we would begin a familiar song. I had to listen carefully to the people around me: when they took a breath, where their line ended, and how my part fitted between theirs. For an hour, I stopped thinking about my unread messages. I was busy doing something with other people that none of us could do in quite the same way alone.

Our first public performance was in a small hall beside the library. My hands shook while we waited to walk onstage. The audience was made up mostly of friends and families, but that did not make me less nervous. During the second song, I missed an entrance. I listened, found the next phrase, and joined in again. Nobody turned around. The song kept moving, and I learned that a small mistake did not have to become the whole story.

I still would not call myself a great singer. I know more about listening now, though. In a choir, making a beautiful sound does not mean pushing your voice above everyone else's. It means hearing what the group needs and adding your part with care. That lesson has followed me out of the rehearsal room. Sometimes the most useful thing I can do in a conversation is pause, listen, and make space for another voice.`,
  },
  {
    slug: "first-telescope-night", minutes: 5,
    topicVi: "Khoa học", topicEn: "Science",
    titleVi: "Đêm tôi nhìn qua kính thiên văn", titleEn: "The Night I Looked Through a Telescope",
    descriptionVi: "Một buổi quan sát bầu trời khiến những kiến thức quen thuộc trở nên sống động.",
    descriptionEn: "An evening under the stars makes familiar facts feel surprisingly real.",
    transcript: `I had seen photographs of the moon all my life, so I thought I knew what it looked like. Then a local astronomy club set up telescopes in the park, and I went along on a clear Saturday evening. The first telescope pointed toward the moon. I expected a bright white circle. Instead, I saw shadows running along the edges of craters and a rough line where daylight turned into darkness. The surface looked like a place, not a symbol in a textbook. I stepped away so the next person could look, then joined the end of the line to see it again.

A volunteer named Sam showed me how the telescope worked. He asked me not to touch the glass, but he let me turn a small wheel to bring the image into focus. I moved it too far and lost the moon completely. Sam laughed and helped me find it again. He said that looking at the sky required patience, partly because the Earth was turning beneath us. While we talked, the moon slowly drifted across the view. I knew the Earth rotated. Watching a familiar object move out of the telescope made that fact feel different.

Farther down the path, another telescope was pointed at Saturn. The planet was much smaller than I expected. At first I thought the ring was a mark on the lens. Then I shifted my eye and saw that the shape stayed with the planet. A child beside me whispered that it looked like a tiny drawing. She was right. The view was not as sharp as the pictures made by space missions, but it was light that had actually traveled from Saturn to the park. That thought made me quiet for a moment.

The club had also brought a large paper map of the night sky. I tried to match its bright dots to the stars above me. It was harder than I expected. The city lights hid many of the smaller stars, and I kept turning the map the wrong way. A student showed me how to begin with a pattern I could easily find, then move outward from there. Once I recognized one group of stars, the next became easier. We were not discovering anything new, but I enjoyed learning how to look rather than simply being told what to see.

Before the clouds arrived, Sam asked us to spend a few minutes without looking at our phones. At first the park seemed almost black beyond the lamps near the path. Gradually I could make out the trees and a few stars I had not noticed earlier. Someone passed around a small flashlight covered with red material so we could read the map without making the whole group squint. I had never thought about how much the light in my hand affected what I could see above me. The change was subtle, but it made the sky feel deeper. A woman pointed out a faint cluster that looked like a smudge. When I returned to it a minute later, I could see more points inside it. I began to understand why people were willing to stand in the cold and look again.

As the evening went on, clouds crossed part of the sky. The volunteers covered the telescopes and waited. People who had come alone began talking while they stood nearby. One man remembered watching a meteor shower with his grandfather. A teenager wanted to know whether the planets would look the same from another city. Sam answered what he could and admitted when he was unsure. I liked that honesty. The night was full of questions, and nobody needed to pretend to have every answer for it to be interesting.

When the clouds cleared, I took one last look at the moon. I noticed a long shadow I had missed earlier. It reminded me that the view could change with the light, the weather, and the way I focused my eye. On the walk home, the streets were familiar, but I kept looking up between the buildings. I had not become an astronomer in one evening. I had gained a more personal reason to be curious. Now, when I see the moon above the bus stop, I remember the volunteers in the park and the small wheel that helped me bring it into focus.`,
  },
  {
    slug: "grandmothers-soup", minutes: 1,
    topicVi: "Ẩm thực", topicEn: "Food",
    titleVi: "Nồi súp của bà", titleEn: "My Grandmother's Soup",
    descriptionVi: "Một ký ức về món ăn gia đình và điều không thể ghi trong công thức.",
    descriptionEn: "A family recipe and the part that cannot be written down.",
    transcript: `When I moved into my first apartment, I asked my grandmother for her soup recipe. She wrote down the vegetables, the herbs, and the time I should leave the pot on the stove. I followed every step, but the soup tasted flat. The next Sunday, I cooked with her and discovered what the paper had missed. She tasted the broth three times. She waited until the onions smelled sweet. And when I reached for the salt, she told me to wait a little longer. We talked about her garden while the soup warmed the kitchen. By the time we ate, I understood that her recipe was also a way of paying attention. I still keep her handwritten page in a drawer. These days I use it as a starting point, then taste, wait, and try again. Every pot is a little different, and that is what makes it feel like hers.`,
  },
  {
    slug: "missed-train", minutes: 1,
    topicVi: "Du lịch", topicEn: "Travel",
    titleVi: "Chuyến tàu tôi đã lỡ", titleEn: "The Train I Missed",
    descriptionVi: "Một chuyến đi chậm lại và cuộc trò chuyện bất ngờ trên sân ga.",
    descriptionEn: "A slower journey and an unexpected conversation on the platform.",
    transcript: `I missed my train by less than a minute. I could still see its red lights as it left the station, and I was annoyed with myself. The next train would not arrive for half an hour. I sat beside a woman carrying a box of flowers, and she noticed me looking at it. She was taking the flowers to a friend who had opened a small cafe that morning. Soon she was telling me how they had met years ago, when both of them were new to the city. By the time my train arrived, I knew the story behind the flowers, and I was no longer watching the clock. I still reached my appointment. I was only a little late. What stayed with me was not the delay, but the reminder that a journey can hold something valuable even when it does not follow the plan.`,
  },
  {
    slug: "repairing-old-things", minutes: 3,
    topicVi: "Sáng tạo", topicEn: "Making",
    titleVi: "Tại sao tôi bắt đầu sửa đồ cũ", titleEn: "Why I Started Repairing Old Things",
    descriptionVi: "Một chiếc đèn hỏng dẫn tới thói quen học cách sửa thay vì vội thay mới.",
    descriptionEn: "A broken lamp begins a habit of repairing instead of replacing.",
    transcript: `The first thing I ever repaired was a desk lamp. It was not valuable. The shade was scratched, and the switch made a little click even when the light did not come on. I nearly threw it away. Then a friend suggested we open the base and look inside. I was certain I would make it worse, but there was only a loose connection. We fixed it in twenty minutes. When I turned it on, I felt an unreasonable amount of pride. The lamp looked exactly as old as it had before, but I looked at it differently.

After that, I began visiting a monthly repair gathering at the community center. People brought a kettle, a jacket with a broken zipper, or a bicycle that made a strange sound. The room was full of small failures and patient people. Nobody pretended to know everything. A retired electrician would ask a teenager for help with a phone, and the teenager would ask her how to use a tool. We learned by watching one another. Sometimes an object could not be saved. Even then, its owner usually left knowing what had gone wrong and what to look for next time.

I used to think of repair as a technical skill, something for people with special hands. Now I think the first skill is curiosity. Before taking something apart, I ask what it was doing when it stopped working. I look for a simple cause. I take a photograph so I can put the pieces back in the right order. I have learned to stop when a job is unsafe, especially when electricity is involved, and ask someone who knows more. There is no shame in that. In fact, working beside someone else is often the most enjoyable part.

At one gathering, a woman brought in a music box that had belonged to her mother. It played only a few notes before stopping. Two volunteers spent the afternoon looking for the problem. They could not repair it that day, but they found a tiny bent part and explained what kind of replacement it needed. The woman was disappointed, yet she was also relieved. The box was no longer a mystery, and she knew what to ask a specialist. Watching her, I understood that repair is not always about a perfect ending. Sometimes it is about taking an object seriously because the story attached to it matters to someone.

The habit has also changed the way I buy things. I notice whether a product has screws I can reach, parts I can replace, or instructions I can understand. Sometimes I still choose the new thing, and sometimes repair costs more than it should. The point is that replacement is no longer my automatic first answer. When I switch on that old desk lamp in the evening, I see a small reminder that an imperfect object can still have a useful life. And I remember the friend who helped me discover that.`,
  },
  {
    slug: "balcony-garden", minutes: 3,
    topicVi: "Thiên nhiên", topicEn: "Nature",
    titleVi: "Khu vườn nhỏ trên ban công", titleEn: "A Garden on a Small Balcony",
    descriptionVi: "Từ vài chậu cây thất bại tới việc hiểu nhịp sống của một khu phố.",
    descriptionEn: "A few failed pots become a lesson in growing food and noticing seasons.",
    transcript: `My balcony is barely wide enough for two chairs, but one summer I decided to grow tomatoes there. I bought a packet of seeds, a bag of soil, and three pots. I imagined bowls of bright tomatoes by the end of the month. The first plants grew quickly, then turned pale. I gave them more water, which only made the problem worse. A neighbor across the hall asked where I had placed the pots. She pointed out that my balcony received morning light but very little afternoon sun. She also showed me how to check the soil with a finger before watering. It was a small lesson, but it saved the last plant.

The next season, I chose herbs that suited the space. Basil grew near the railing. Mint did well in a separate pot, where it could not crowd the others. Each morning I spent a few minutes looking for new leaves and feeling whether the soil was dry. It became a quiet way to begin the day. I noticed when the air changed after rain and when the sunlight reached a different corner. I had lived in that apartment for years without paying much attention to those details.

The garden also introduced me to people in the building. My neighbor shared seeds, and I gave her a handful of basil for dinner. A child from upstairs asked why some leaves had tiny holes. We watched a caterpillar together and decided it could keep one leaf. Later, the child brought me a drawing of the balcony covered in enormous tomatoes. The real harvest was much smaller, but the drawing made me laugh every time I saw it on the fridge.

In late summer, a storm knocked over one of the pots. I found soil across the floor and a stem broken near the base. I carried the plant inside, cut away the damaged part, and used a small stick to support what remained. It did not recover completely, but a few leaves kept growing. That week, my neighbor told me about the plants she had lost during her first season. I had imagined that experienced gardeners simply knew how to prevent problems. She laughed and said experience mostly meant learning not to give up after each one. I thought about that while cleaning the balcony and setting the pot back in its place.

I still lose a plant now and then. Some weeks are too busy, and some seeds never grow. But I no longer think of the balcony as a test I must pass. It is a place to practice observing and adjusting. On a warm evening, I can step outside, pick a few leaves for dinner, and remember that even a very small space can change how a home feels.`,
  },
  {
    slug: "night-without-power", minutes: 5,
    topicVi: "Cộng đồng", topicEn: "Community",
    titleVi: "Đêm cả khu phố mất điện", titleEn: "The Night the Neighborhood Went Dark",
    descriptionVi: "Một lần mất điện khiến hàng xóm bước ra khỏi nhà và quen nhau.",
    descriptionEn: "A power outage brings neighbors outside and into conversation.",
    transcript: `The lights went out just after dinner. At first, I thought a bulb had failed. Then I looked through the window and saw that the whole street was dark. The shops across the road had closed their shutters, and the traffic lights at the corner had stopped working. My phone still had a little battery, but the network was busy. I found a flashlight, checked that the stove was off, and went downstairs to see whether anyone in the building needed help. I expected a few worried faces. Instead, I found nearly everyone gathered in the entrance hall.

Our building has twelve apartments, and I knew the names of only two neighbors. We usually met in the lift for a few seconds, smiling and looking at the floor numbers. That evening there was nowhere else to hurry. A student from the top floor brought a bag of candles, although we used flashlights in the hallway to keep things safer. The family on the second floor carried down a battery radio. Someone else had a packet of biscuits. We made a rough plan: check on the older residents, keep the stairwell clear, and share reliable updates when we had them.

I went upstairs with a neighbor called Lena. We knocked on the door of a man who lived alone on the fourth floor. He was fine, but he had been trying to find his glasses in the dark. We helped him, then stayed for a few minutes while he told us about the first winter he had spent in the building. Back then, he said, the heating had failed during a snowstorm, and people had carried blankets to one another. I had lived there for three years and had never heard that story. When we returned downstairs, I knew the building felt a little different to me.

On the third floor, a family had a baby who usually fell asleep to a small fan. Without the fan, the room felt too quiet and too warm. A neighbor offered them a battery powered fan from her camping supplies. Another brought a bottle of water. None of us could restore the electricity, but we could make the waiting easier. I had assumed help would mean solving the main problem. That evening, it often meant noticing a smaller one that someone nearby could actually handle. The family stayed with us in the hall until the baby finally settled, and the rest of us spoke in softer voices.

Outside, the air was warm enough to sit on the steps. Without the usual light from shop signs, I could see more stars than I expected. A child asked if the city had disappeared. Her father pointed to the sound of a bus coming up the road and told her the city was still there; it was simply taking a short break from its screens. People laughed. Someone mentioned a cafe farther along the street that was handing out cups of water. Two teenagers walked over and brought some back for the people waiting on the steps.

We did not know exactly when the power would return. One person checked the utility company's message and read it aloud, then promised to share any update. After that, we put our phones away to save the batteries. The radio played a quiet song, and people began trading stories about other unexpected evenings. A shop owner remembered a summer storm that had flooded the road. The student from upstairs talked about her first week in the city. I was struck by how easily the conversation moved once we stopped asking only for news about the outage. We were still waiting, but waiting together felt different from waiting alone.

The power returned before midnight. Lights appeared in the windows one by one, and everyone cheered as if we had won a match together. The next morning, the street looked ordinary again. Cars moved through the crossing, the shops opened, and most of us went to work. But the conversations continued. Lena and I began greeting each other by name. The man on the fourth floor lent me a book about the neighborhood. I learned that the student upstairs played the cello, which explained the music I sometimes heard through the ceiling.

I would not choose another power outage. It interrupted work, spoiled food in some homes, and made travel difficult. Still, that night revealed something useful. A building can be full of people who are ready to help, even if they have never been introduced. We did not become close friends overnight. We simply learned that there were faces behind the apartment doors. Now, when I meet someone in the lift, I try to make room for more than a quick smile. A name and a few words can make a shared place feel safer and more human.`,
  },
  {
    slug: "teaching-dad-video-calls", minutes: 5,
    topicVi: "Gia đình", topicEn: "Family",
    titleVi: "Dạy bố gọi video", titleEn: "Teaching My Father to Make Video Calls",
    descriptionVi: "Một câu chuyện về công nghệ, sự kiên nhẫn và cách hai thế hệ học cùng nhau.",
    descriptionEn: "A story about technology, patience, and learning across generations.",
    transcript: `When my sister moved to another country, my father decided he wanted to learn video calling. He had a smartphone, but he mostly used it to read the weather and send very short messages. He asked me to show him what to do, and I said it would take five minutes. That was my first mistake. Five minutes later, he had opened the camera, changed the screen brightness, and somehow turned on a setting I had never seen before. I took the phone from his hand and fixed it quickly. He thanked me, but I could tell he still had no idea how to call my sister on his own.

The next weekend, we started again. This time I sat beside him and let him hold the phone. We wrote the steps on a small card: open the app, find her name, press the camera symbol, and wait. He practiced while I watched. He missed the symbol twice because it was smaller than I realized. I increased the text size and moved the app to the first screen. Then I went into the next room and asked him to call me. He succeeded, but his face filled my screen because he was holding the phone too close. We both laughed, and he tried again.

Over the following weeks, we made many practice calls. Some lasted only a few seconds. On one call, he forgot to turn up the sound. On another, he showed me the ceiling while he searched for his glasses. I noticed that I was often tempted to give a long explanation about how the phone worked. He did not need the whole system. He needed one clear step at a time and the chance to repeat it. When I slowed down, he grew more confident, and I grew less impatient.

One afternoon, he asked why the button sometimes looked different. The app had changed after an update, and I had barely noticed. To him, the small change made the familiar steps uncertain again. We found the new symbol together and added a note to his card. That moment made me think about how often technology asks people to keep learning without warning. A simple task for me can feel like a moving target for someone who uses the app only once a week. I stopped saying that a step was obvious. If it were obvious to him, he would not need to ask.

His first call to my sister without help happened on a Tuesday evening. She was making dinner in her new kitchen. He asked to see the view from her window, then turned his own camera toward the garden to show her the flowers she had planted before leaving. Nothing important happened in the usual sense. They talked about food, the weather, and a neighbor's new dog. But afterward, my father stayed at the table with the phone in his hands. He told me that hearing her voice was good, but seeing her ordinary evening made the distance feel smaller.

The calls became part of their routine. He began planning little things to show her: a repaired chair, the first ripe tomato, a photograph he had found in a drawer. She showed him a busy street near her apartment and the bakery where she bought breakfast. I learned pieces of her life through those calls too. A video window could not replace visiting, and sometimes the connection froze at the worst moment. Still, it gave them a shared space for a few minutes each week.

During one call, my sister's picture froze while she was holding a pan in the air. My father waited patiently, then called her back when the connection returned. A month earlier he would have handed me the phone. This time he solved the problem himself. Later he told me that he had been nervous before pressing the button, even though he knew what to do. I realized confidence did not mean never feeling uncertain. It meant knowing that a mistake was manageable. That idea has helped me when I am learning something new at work and would rather pretend I already understand it.

I had thought I was teaching my father a piece of technology. In fact, he was teaching me something about learning. It is easier to be patient when I remember what the skill means to the person practicing it. To me, a video call was just another button on a screen. To him, it was a way to join his daughter at her kitchen table from far away. We still keep the little instruction card beside his phone charger. He hardly needs it now, but he says it reminds him that he figured it out himself.`,
  },
];
