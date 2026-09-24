import type { VocabularyEntry } from "./catalog";
import expandedEntries from "./study-expanded.json";

export type StudyEntry = VocabularyEntry & { example: string };
export type StudyTopic = { id: string; titleVi: string; titleEn: string; entries: StudyEntry[] };

// Original examples and curated workplace senses. Topics follow the settings in the ETS TOEIC L&R handbook.
// https://www.eu.ets.org/content/dam/ets-org/eu/pdfs/toeic/toeic-listening-reading-test.pdf
const word = (key: string, meaningVi: string, meaningEn: string, example: string): StudyEntry => ({ key, term: key, meaningVi, meaningEn, example, kind: "word" });
const phrase = (key: string, term: string, meaningVi: string, meaningEn: string, example: string): StudyEntry => ({ key, term, meaningVi, meaningEn, example, kind: "phrase" });

const foundationalTopics: StudyTopic[] = [
  { id: "office", titleVi: "Văn phòng & email", titleEn: "Office & email", entries: [
    word("agenda", "chương trình họp", "a list of items to discuss", "The agenda was emailed before the meeting."),
    word("memo", "bản ghi nhớ nội bộ", "a short message for colleagues", "The manager sent a memo to all staff."),
    word("attachment", "tệp đính kèm", "a file sent with an email", "Please review the attachment before Friday."),
    word("notify", "thông báo", "to tell someone officially", "We will notify applicants by email."),
    word("confirm", "xác nhận", "to state that an arrangement is certain", "Please confirm your attendance by noon."),
    word("schedule", "lịch trình", "a plan of activities and times", "The updated schedule is on the notice board."),
    word("deadline", "hạn chót", "the latest time for completing something", "The deadline for the report is Monday."),
    word("available", "có sẵn; có thể tham gia", "ready for use or free to participate", "The conference room is available after lunch."),
    phrase("on-behalf-of", "on behalf of", "thay mặt cho", "as a representative of someone", "I am writing on behalf of the sales team."),
    phrase("in-advance", "in advance", "trước thời hạn", "before the expected time", "Please book the room in advance."),
  ] },
  { id: "personnel", titleVi: "Tuyển dụng & nhân sự", titleEn: "Hiring & personnel", entries: [
    word("applicant", "người ứng tuyển", "a person applying for a position", "Each applicant must complete the form."),
    word("vacancy", "vị trí còn trống", "an unfilled job position", "The company posted a vacancy for an assistant."),
    word("interview", "buổi phỏng vấn; phỏng vấn", "a meeting to assess a candidate", "Her interview is scheduled for Tuesday."),
    word("hire", "tuyển dụng", "to employ someone", "The firm plans to hire two engineers."),
    word("qualified", "đủ năng lực; đủ điều kiện", "having the skills needed for a role", "Only qualified candidates will be contacted."),
    word("resume", "sơ yếu lý lịch", "a summary of work experience", "Please attach your resume to the application."),
    word("promotion", "việc thăng chức", "advancement to a higher position", "She received a promotion last month."),
    word("salary", "mức lương", "regular pay for work", "The job notice includes the starting salary."),
    word("training", "việc đào tạo", "instruction to improve work skills", "New employees attend safety training."),
    word("retire", "nghỉ hưu", "to stop working at the end of a career", "Mr. Lee will retire at the end of June."),
  ] },
  { id: "purchasing", titleVi: "Mua hàng & giao nhận", titleEn: "Purchasing & shipping", entries: [
    word("purchase", "mua hàng; đơn mua hàng", "to buy, or something bought", "Please keep the receipt for your purchase."),
    phrase("place-an-order", "place an order", "đặt hàng", "to request goods for purchase", "We need to place an order for more paper."),
    word("supplier", "nhà cung cấp", "a company that provides goods", "Our supplier can deliver the parts tomorrow."),
    word("inventory", "hàng tồn kho", "goods a business has in stock", "The store checks its inventory every week."),
    word("shipment", "lô hàng được vận chuyển", "goods sent to a destination", "The shipment is expected on Thursday."),
    word("delivery", "việc giao hàng", "the act of bringing goods to someone", "Delivery is included in the price."),
    word("invoice", "hóa đơn", "a bill for goods or services", "The invoice is due within 30 days."),
    word("receipt", "biên lai", "proof that payment was received", "Keep the receipt for your records."),
    word("refund", "tiền hoàn lại; hoàn tiền", "money returned after a purchase", "The customer requested a full refund."),
    word("stock", "hàng có sẵn; hàng tồn", "goods available for sale or use", "This model is currently out of stock."),
  ] },
  { id: "meetings", titleVi: "Họp & lập kế hoạch", titleEn: "Meetings & planning", entries: [
    word("attend", "tham dự", "to be present at an event", "All supervisors must attend the briefing."),
    word("postpone", "hoãn lại", "to arrange for something to happen later", "The meeting was postponed until Friday."),
    word("reschedule", "dời lịch", "to arrange a new time", "Could we reschedule the presentation?"),
    word("arrange", "sắp xếp", "to organize or plan something", "The assistant will arrange a meeting."),
    word("participate", "tham gia", "to take part in an activity", "Several branches will participate in the survey."),
    word("proposal", "bản đề xuất", "a plan offered for consideration", "The committee reviewed the proposal."),
    word("approve", "phê duyệt", "to officially accept a request or plan", "The director approved the new plan."),
    word("submit", "nộp tài liệu; trình lên", "to send a document for consideration", "Please submit the form by Monday."),
    phrase("meet-a-deadline", "meet a deadline", "hoàn thành đúng hạn", "to finish work by its due date", "The team worked late to meet a deadline."),
    word("update", "cập nhật; bản cập nhật", "new information or to make information current", "Please send an update after the meeting."),
  ] },
  { id: "finance", titleVi: "Tài chính & hợp đồng", titleEn: "Finance & contracts", entries: [
    word("budget", "ngân sách", "an amount planned for spending", "The project must stay within its budget."),
    word("expense", "khoản chi phí", "money spent for a purpose", "Travel expenses are paid by the company."),
    word("reimburse", "hoàn trả chi phí", "to pay someone back for an expense", "The company will reimburse your taxi fare."),
    word("payment", "khoản thanh toán", "money paid for goods or services", "Payment is required before delivery."),
    word("contract", "hợp đồng", "a formal written agreement", "Both companies signed the contract."),
    word("agreement", "thỏa thuận", "an arrangement accepted by all parties", "The agreement expires next year."),
    word("fee", "khoản phí", "an amount charged for a service", "There is no fee for registration."),
    word("estimate", "bản ước tính; ước tính", "an approximate cost or amount", "The contractor provided an estimate."),
    word("discount", "giảm giá", "a reduction in the usual price", "Members receive a ten percent discount."),
    word("renew", "gia hạn", "to extend the period of an agreement", "We hope to renew the contract in July."),
  ] },
  { id: "travel", titleVi: "Đi lại & khách sạn", titleEn: "Travel & hospitality", entries: [
    word("reservation", "việc đặt chỗ", "an arrangement to hold a place or service", "I made a reservation for two nights."),
    word("itinerary", "lịch trình chuyến đi", "a plan for a trip", "Your itinerary includes two client visits."),
    word("departure", "giờ khởi hành; sự khởi hành", "the act or time of leaving", "The departure time has changed."),
    word("arrival", "giờ đến; sự đến nơi", "the act or time of arriving", "Please confirm your arrival time."),
    word("delay", "trì hoãn; sự chậm trễ", "a wait longer than expected", "A delay affected the morning train."),
    word("cancel", "hủy bỏ", "to call off a planned event or booking", "You may cancel the booking online."),
    word("accommodation", "chỗ ở", "a place to stay", "Accommodation is provided near the venue."),
    word("complimentary", "miễn phí; tặng kèm", "provided free of charge", "Guests receive a complimentary breakfast."),
    word("destination", "điểm đến", "the place someone is traveling to", "The bus will reach its destination at six."),
    phrase("check-in", "check in", "làm thủ tục nhận phòng; lên máy bay", "to register on arrival", "Guests can check in after three o'clock."),
  ] },
  { id: "service", titleVi: "Khách hàng & dịch vụ", titleEn: "Customer service", entries: [
    word("customer", "khách hàng", "a person who buys goods or services", "The customer asked about the warranty."),
    word("inquiry", "câu hỏi; yêu cầu thông tin", "a request for information", "We received an inquiry about the price."),
    word("complaint", "lời phàn nàn", "a statement of dissatisfaction", "The manager responded to the complaint."),
    word("warranty", "chế độ bảo hành", "a promise to repair or replace a product", "The printer comes with a one-year warranty."),
    word("replace", "thay thế", "to provide a new item instead", "We will replace the damaged item."),
    word("repair", "sửa chữa", "to fix something that is broken", "A technician will repair the machine."),
    word("maintenance", "việc bảo trì", "work done to keep something operating", "Regular maintenance prevents problems."),
    word("policy", "chính sách; quy định", "an official rule or approach", "Please read our return policy."),
    word("resolve", "giải quyết", "to find a solution to a problem", "The agent resolved the issue quickly."),
    word("apologize", "xin lỗi", "to express regret for a mistake", "We apologize for the inconvenience."),
  ] },
  { id: "operations", titleVi: "Cơ sở vật chất & vận hành", titleEn: "Facilities & operations", entries: [
    word("equipment", "thiết bị", "tools or machines for a task", "The new equipment arrived this morning."),
    word("facility", "cơ sở; tòa nhà", "a building used for a particular purpose", "The company opened a new facility."),
    word("inspect", "kiểm tra", "to examine carefully", "Workers inspect every package before shipping."),
    word("install", "lắp đặt", "to put equipment in place for use", "The technician will install the software."),
    word("operate", "vận hành", "to run or control equipment", "Only trained staff may operate this machine."),
    word("capacity", "sức chứa; công suất", "the amount something can hold or produce", "The hall has a capacity of 200 people."),
    word("warehouse", "nhà kho", "a building for storing goods", "The goods are stored in a warehouse."),
    word("assembly", "sự lắp ráp", "the process of putting parts together", "Assembly takes place at the main plant."),
    word("renovate", "cải tạo", "to improve a building by repairing it", "The hotel will renovate its lobby."),
    word("safety", "sự an toàn", "freedom from danger or harm", "Safety rules are posted near the entrance."),
  ] },
  { id: "sales", titleVi: "Kinh doanh & tiếp thị", titleEn: "Sales & marketing", entries: [
    word("advertise", "quảng cáo", "to promote a product or service", "The company will advertise the new service."),
    word("launch", "ra mắt", "to introduce a new product or service", "The firm plans to launch a new app."),
    word("campaign", "chiến dịch", "a series of planned promotional activities", "The campaign begins next month."),
    word("demand", "nhu cầu", "the desire for a product or service", "Demand for the product has increased."),
    word("client", "khách hàng; đối tác", "a person or company receiving services", "The client requested a revised design."),
    word("negotiate", "đàm phán", "to discuss terms to reach an agreement", "The teams will negotiate the price."),
    word("revenue", "doanh thu", "money earned from business activity", "Revenue rose during the summer."),
    word("branch", "chi nhánh", "a local office of a business", "The new branch opens in October."),
    word("distribute", "phân phối", "to deliver goods to many places", "The company distributes books nationwide."),
    word("target", "mục tiêu; nhắm tới", "a goal or intended audience", "The team reached its sales target."),
  ] },
  { id: "notices", titleVi: "Thông báo & biểu mẫu", titleEn: "Notices & forms", entries: [
    word("requirement", "yêu cầu; điều kiện", "something that must be done or met", "Experience is a requirement for the role."),
    word("eligible", "đủ điều kiện", "meeting the conditions to receive something", "Members are eligible for a discount."),
    word("application", "đơn đăng ký; hồ sơ ứng tuyển", "a formal request in writing", "The application must be received by May 1."),
    word("register", "đăng ký", "to sign up officially", "You can register for the seminar online."),
    word("announce", "thông báo công khai", "to make information publicly known", "The company will announce the results soon."),
    word("notice", "thông báo", "a written announcement", "A notice was posted near the entrance."),
    word("due", "đến hạn", "expected or required by a certain time", "The report is due on Friday."),
    word("valid", "còn hiệu lực; hợp lệ", "officially acceptable or in effect", "The coupon is valid through June."),
    word("procedure", "quy trình", "a set of steps for doing something", "Please follow the safety procedure."),
    word("provide", "cung cấp", "to give something that is needed", "The form asks you to provide an address."),
  ] },
];

const expansionTopics: StudyTopic[] = Array.from({ length: 9 }, (_, index) => ({
  id: `frequent-${index + 1}`,
  titleVi: `Từ trong đề luyện · nhóm ${index + 1}`,
  titleEn: `Practice vocabulary · set ${index + 1}`,
  entries: expandedEntries.slice(index * 100, (index + 1) * 100).map((entry) => ({ ...entry, kind: "word" as const })),
}));

export const vocabularyStudyTopics: StudyTopic[] = [...foundationalTopics, ...expansionTopics];
export const vocabularyStudyEntries = vocabularyStudyTopics.flatMap((topic) => topic.entries);
export function studyEntryByKey(key: string) { return vocabularyStudyEntries.find((entry) => entry.key === key); }
