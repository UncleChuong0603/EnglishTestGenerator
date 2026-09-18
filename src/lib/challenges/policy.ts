import type { ChallengeType } from "@/lib/gamification/catalog";
export const CHALLENGE_POLICY={READING_100:{parts:[5,6,7],questions:100,durationMs:75*60_000},LISTENING_100:{parts:[1,2,3,4],questions:100,durationMs:45*60_000},FULL_200:{parts:[1,2,3,4,5,6,7],questions:200,durationMs:120*60_000}} as const;
export function challengePhase(c:{status:string;startsAt:Date|null;endsAt:Date|null},now=new Date()){if(c.status==="CANCELLED")return"CANCELLED";if(c.status!=="PUBLISHED"||!c.startsAt||!c.endsAt)return"DRAFT";if(now<c.startsAt)return"UPCOMING";if(now<c.endsAt)return"LIVE";return"CLOSED";}
export function canStartChallenge(type:ChallengeType,endsAt:Date,now=new Date()){return endsAt.getTime()-now.getTime()>=CHALLENGE_POLICY[type].durationMs;}
