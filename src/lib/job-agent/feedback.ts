export const FEEDBACK_REASONS = ['too_senior','too_junior','missing_mandatory_experience','wrong_career_domain','wrong_location','language_mismatch','not_interested','already_applied','duplicate_vacancy'] as const;
export function feedbackReason(value:unknown) {return FEEDBACK_REASONS.find(reason=>reason===value)??'not_interested';}
export type LearningSignal={id:string;signal_type:string;signal_key:string;sample_size:number;active:boolean;value:{reason?:string;role?:string}};
// Only repeated feedback about exactly the same title changes ranking, never domain eligibility.
export function feedbackAdjustment(title:string,signals:LearningSignal[]) {
 const key=title.trim().toLowerCase();
 const repeated=signals.filter(s=>s.active&&s.signal_key===key&&s.sample_size>=2);
 return repeated.some(s=>s.signal_type==='rejected_role')?-3:repeated.some(s=>s.signal_type==='accepted_role')?2:0;
}
