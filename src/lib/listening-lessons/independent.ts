export type IndependentQuestion = {
  prompt: string;
  options: readonly [string, string, string];
  answerIndex: number;
  explanationVi: string;
  explanationEn: string;
};

export type IndependentLesson = {
  slug: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  transcript: string;
  audioUrl: string;
  imageUrl?: string;
  imageAltVi?: string;
  imageAltEn?: string;
  questions: readonly IndependentQuestion[];
};

// Original short listening exercises. These do not belong to a TOEIC Part or the question bank.
export const independentLessons: readonly IndependentLesson[] = [
  {
    slug: "morning-routine",
    titleVi: "Thói quen buổi sáng",
    titleEn: "A morning routine",
    descriptionVi: "Nghe một người kể về cách bắt đầu ngày mới.",
    descriptionEn: "Listen to someone describe the start of their day.",
    transcript: "I usually wake up at six thirty. After breakfast, I walk to the park near my apartment. I spend about twenty minutes there before going home to get ready for work. On rainy days, I stay inside and read a book instead. My first meeting starts at nine, so I leave home at eight fifteen.",
    audioUrl: "/listening-exercises/morning-routine.mp3",
    questions: [
      { prompt: "What does the speaker usually do after breakfast?", options: ["Walk to the park", "Read a book", "Leave for work"], answerIndex: 0, explanationVi: "Người nói thường đi bộ đến công viên sau bữa sáng.", explanationEn: "The speaker usually walks to the park after breakfast." },
      { prompt: "When does the speaker leave home for work?", options: ["At 6:30", "At 8:15", "At 9:00"], answerIndex: 1, explanationVi: "Người nói rời nhà lúc 8 giờ 15.", explanationEn: "The speaker leaves home at 8:15." },
    ],
  },
  {
    slug: "weekend-market",
    titleVi: "Đi chợ cuối tuần",
    titleEn: "A weekend market",
    descriptionVi: "Nghe kế hoạch mua đồ ăn cho bữa tối.",
    descriptionEn: "Listen to a plan for buying dinner ingredients.",
    transcript: "This Saturday, I'm meeting my sister at the farmers' market. We need tomatoes, carrots, and fresh bread for dinner. She will bring a shopping bag, and I will bring the list. We planned to meet at ten, but she has a class in the morning, so we changed the time to eleven. After shopping, we'll have lunch at the small cafe across the street.",
    audioUrl: "/listening-exercises/weekend-market.mp3",
    questions: [
      { prompt: "What will the speaker bring?", options: ["Fresh bread", "A shopping bag", "The shopping list"], answerIndex: 2, explanationVi: "Người nói sẽ mang danh sách mua sắm.", explanationEn: "The speaker will bring the shopping list." },
      { prompt: "What time will they meet?", options: ["At 10:00", "At 11:00", "At noon"], answerIndex: 1, explanationVi: "Họ đổi giờ hẹn từ 10 giờ sang 11 giờ.", explanationEn: "They changed the meeting time from ten to eleven." },
    ],
  },
  {
    slug: "library-visit",
    titleVi: "Một buổi ở thư viện",
    titleEn: "A visit to the library",
    descriptionVi: "Nghe thông tin về việc mượn và trả sách.",
    descriptionEn: "Listen for details about borrowing and returning books.",
    transcript: "I went to the library yesterday to return two books. One was about photography, and the other was a travel guide. I wanted to borrow a novel, but I couldn't find the author I was looking for. The librarian showed me how to search the online catalog. The novel is available at another branch, and it should arrive here on Thursday. I'll pick it up after work.",
    audioUrl: "/listening-exercises/library-visit.mp3",
    questions: [
      { prompt: "Why did the speaker first go to the library?", options: ["To return books", "To use a computer", "To meet a friend"], answerIndex: 0, explanationVi: "Người nói đến thư viện để trả hai cuốn sách.", explanationEn: "The speaker went to return two books." },
      { prompt: "When should the novel arrive?", options: ["Yesterday", "Thursday", "After work today"], answerIndex: 1, explanationVi: "Cuốn tiểu thuyết dự kiến đến vào thứ Năm.", explanationEn: "The novel should arrive on Thursday." },
    ],
  },
];

export function getIndependentLesson(slug: string) {
  return independentLessons.find(lesson => lesson.slug === slug);
}
