// These checks describe supplied text, never missing speech or learner ability.
export function archiveQuality({entries,transcript_coverage,summary,rules_revision}) {
 const counts={learner:0,coach:0};
 for(const entry of entries)counts[entry.role]++;
 const warnings=[];
 if(transcript_coverage!=='complete')warnings.push('capture_not_declared_complete');
 if(!counts.learner||!counts.coach)warnings.push('speaker_missing');
 if(Math.max(counts.learner,counts.coach)>=6&&Math.max(counts.learner,counts.coach)>4*Math.max(1,Math.min(counts.learner,counts.coach)))warnings.push('speaker_capture_may_have_gaps');
 const fields=['starting_understanding','later_demonstrated_understanding','language_help','reading_source_basis','unanswered_questions','proposed_next_activity'];
 const text=value=>typeof value==='string'&&value.trim().length>0;
 const list=value=>Array.isArray(value)&&value.every(text);
 const present=(value,key)=>key==='unanswered_questions'?list(value):key==='language_help'?text(value)||(list(value)&&value.length>0):key==='proposed_next_activity'?text(value)||(value===null&&text(summary.next_activity_reason)):text(value);
 const missing=fields.filter(key=>!present(summary[key],key));
 if(!text(summary.topic)&&!(list(summary.topics)&&summary.topics.length))missing.unshift('topic');
 const summaryStatus=Object.keys(summary).length===0?'missing':missing.length?'partial':'provided';
 return {
  capture:{status:warnings.length?'limited':'declared_complete',declared_coverage:transcript_coverage,role_counts:counts,warnings,basis:'supplied entries only; completeness is not independently verified'},
  summary:{status:summaryStatus,missing_fields:missing,basis:'field presence only; learning claims still require evidence'},
  rules_revision_status:rules_revision===null?'unknown':'recorded',
  lesson_review_status:warnings.length||summaryStatus!=='provided'?'limited_evidence':'evidence_available_not_validated',
  storage_verification:'separate_receipt_required'
 };
}
export function hostEvidence(report) {
 const supplied=report&&typeof report==='object'&&!Array.isArray(report)?report:{};
 return {
  host_surface:['native_voice','text'].includes(supplied.host_surface)?supplied.host_surface:'unknown',
  instruction_loading:supplied.instruction_loaded===true?'host_reported':'not_reported',
  transcript_delivery:['both_speakers','learner_only','coach_only'].includes(supplied.transcript_delivery)?supplied.transcript_delivery:'unknown',
  native_voice_acceptance:'not_verified',
  basis:'host-reported observations; local execution does not prove native Voice instruction loading or complete capture'
 };
}
