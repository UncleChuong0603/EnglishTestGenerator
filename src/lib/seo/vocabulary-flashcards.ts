export type VocabularyFlashcard = {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  phrase: string;
};

// Original flashcards for the public workplace-vocabulary resource.
export const TOEIC_VOCABULARY_FLASHCARDS: VocabularyFlashcard[] = [
  { id: "issue-invoice", question: "What does the accounting team do after verifying an order?", answer: "It issues an invoice.", phrase: "issue an invoice", explanation: "Issue an invoice means to prepare and send an official bill." },
  { id: "extend-deadline", question: "What can a manager do when a supplier needs two more days?", answer: "The manager can extend the deadline.", phrase: "extend a deadline", explanation: "Extend a deadline means to move the final date to a later time." },
  { id: "track-shipment", question: "What can a customer do online to see when a package will arrive?", answer: "The customer can track the shipment.", phrase: "track a shipment", explanation: "Track a shipment means to follow the delivery status of goods." },
  { id: "meet-qualifications", question: "What does an applicant do before applying for a position?", answer: "The applicant checks whether they meet the qualifications.", phrase: "meet the qualifications", explanation: "Meet the qualifications means to have the skills or experience required for a role." },
  { id: "conduct-interview", question: "What does a hiring manager do with a shortlisted applicant?", answer: "The hiring manager conducts an interview.", phrase: "conduct an interview", explanation: "Conduct an interview means to lead and carry out a formal interview." },
  { id: "reach-agreement", question: "What do two teams do after they accept the same project terms?", answer: "They reach an agreement.", phrase: "reach an agreement", explanation: "Reach an agreement means to settle on the same decision or terms." },
  { id: "submit-proposal", question: "What does a consulting firm send before a client chooses a project plan?", answer: "The firm submits a proposal.", phrase: "submit a proposal", explanation: "Submit a proposal means to send a plan for consideration." },
  { id: "process-order", question: "What does a supplier do after receiving a confirmed customer request?", answer: "The supplier processes the order.", phrase: "process an order", explanation: "Process an order means to handle the request so the goods can be prepared and shipped." },
];
