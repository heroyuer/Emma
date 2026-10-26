import {transition} from '../plugin/skills/emma/scripts/session.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {prepareArchive} from '../plugin/skills/emma/scripts/archive.mjs';
import {nextMove} from '../plugin/skills/emma/scripts/conversation.mjs';
import {workflow} from '../plugin/skills/emma/scripts/workflow.mjs';
const summary={topic:'Designing a puzzle',starting_understanding:'Unassessed',later_demonstrated_understanding:'Unassessed',language_help:'No language correction was assessed',reading_source_basis:'No external source used',unanswered_questions:[],proposed_next_activity:'Compare two clues'};
const fixture=()=>({schema_version:1,session_id:'synthetic-quality-session',learner_id:'synthetic-quality',actor_kind:'learner',learner_first_name:'Sample',plugin_version:'0.2.2',rules_revision:null,session_date:'20261025',transcript_coverage:'partial',entries:[{role:'coach',text:'What makes a clue useful?'},...Array.from({length:26},(_,i)=>({role:'learner',text:'Synthetic puzzle idea '+i}))],summary:{}});
test('missing coach capture and empty summary remain preserved, visibly limited and unsuitable for participation ratios',()=>{
 const input=fixture(),result=prepareArchive(input);
 assert.deepEqual(result.record.entries,input.entries);
 assert.deepEqual(result.record.summary,{});
 assert.equal(result.record.quality.summary.status,'missing');
 assert.equal(result.record.quality.rules_revision_status,'unknown');
 assert.ok(result.record.quality.capture.warnings.includes('speaker_capture_may_have_gaps'));
 assert.equal(result.record.quality.lesson_review_status,'limited_evidence');
 assert.equal(result.record.metrics.learner_share_of_word_tokens_approx,null);
 assert.match(result.files[result.stem+'-summary.md'],/## Quality/);
 assert.doesNotMatch(result.files[result.stem+'-transcript.md'],/not verified in Drive/);
 const learnerOnly=prepareArchive({...input,entries:input.entries.slice(1)});
 assert.ok(learnerOnly.record.quality.capture.warnings.includes('speaker_missing'));
});
test('complete balanced text allows a text ratio while partial balanced capture and declared-complete gaps do not',()=>{
 const input={...fixture(),summary,transcript_coverage:'complete',entries:[{role:'coach',text:'Which clue?'},{role:'learner',text:'A map.'}]};
 const result=prepareArchive(input).record;
 assert.equal(result.quality.summary.status,'provided');
 assert.equal(result.quality.capture.status,'declared_complete');
 assert.equal(result.metrics.learner_share_of_word_tokens_approx,0.5);
 assert.equal(prepareArchive({...input,transcript_coverage:'unknown'}).record.metrics.learner_share_of_word_tokens_approx,null);
 assert.equal(prepareArchive({...fixture(),transcript_coverage:'complete'}).record.metrics.learner_share_of_word_tokens_approx,null);
 assert.throws(()=>prepareArchive({...input,summary:'invented summary'}),/Summary must be an object/);
});
test('next-activity requests advance and a stop overrides all steering',()=>{
 for(const text of ["What's next?",'Did we have something for next?','No, something we need to do','We are not finished.','接下来呢？'])assert.equal(nextMove({learner_text:text}).move,'advance_idea_or_topic',text);
 assert.equal(nextMove({learner_text:'I need to go now. What is next?'}).move,'respect_stop');
 const entries=[{role:'coach',text:'Try that sentence again.'},{role:'learner',text:'I felt stressed.'},{role:'coach',text:'Say it once smoothly.'},{role:'learner',text:'I felt stressed.'}];
 const move=nextMove({learner_text:'I felt stressed.',recent_entries:entries});
 assert.equal(move.repetition_warning,true);assert.equal(move.move,'ask_content_followup');assert.equal(move.force_echo,false);
 assert.equal(nextMove({learner_text:'Today I played a game and I felt'}).move,'allow_continuation');
 assert.equal(nextMove({learner_text:'I played Tarkov.'}).move,'explore_game_interest');
});
test('startup evidence is sanitized and pinned; save quality survives receipt verification and no future coach speech is fabricated',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'emma-quality-'));
 try{
 fs.mkdirSync(path.join(root,'runtime'));fs.writeFileSync(path.join(root,'runtime/config.json'),JSON.stringify({learner_id:'synthetic-quality',actor_kind:'parent_test',learner_first_name:'Sample',drive_folder_id:'synthetic-folder'}));
 const call=c=>workflow(c,{root});
 const start=call({action:'start',event_id:'start',now:'2026-10-25T15:00:00Z',capability_report:{host_surface:'native_voice',instruction_loaded:true,transcript_delivery:'learner_only',secret:'must not persist'}});
 assert.equal(start.host_evidence.instruction_loading,'host_reported');assert.equal(start.host_evidence.native_voice_acceptance,'not_verified');assert.equal(start.host_evidence.secret,undefined);
 call({action:'turn',session_id:start.session_id,event_id:'turn',now:'2026-10-25T15:01:00Z',entries:[{role:'learner',text:'A puzzle.'}]});
 const diag=call({action:'diagnostics'});assert.ok(diag.capture_quality.warnings.includes('speaker_missing'));assert.equal(diag.host_evidence.transcript_delivery,'learner_only');
 const job=call({action:'end',session_id:start.session_id,event_id:'end',now:'2026-10-25T15:02:00Z'});
 assert.equal(job.quality.summary.status,'missing');assert.equal(job.archive_verified,false);
 const record=JSON.parse(fs.readFileSync(job.artifacts.find(x=>x.kind==='summary_json').path));assert.equal(record.entries.length,1);assert.equal(record.entries[0].role,'learner');
 const readbacks=job.artifacts.map((a,i)=>{const dest=path.join(root,'remote-'+i);fs.copyFileSync(a.path,dest);return{kind:a.kind,id:'synthetic-id-'+i,name:a.name,mime_type:a.mime_type,parents:['synthetic-folder'],readback_path:dest};});
 const base={session_id:job.session_id,archive_revision:job.archive_revision};
 const receipt=call({...base,action:'prepare_receipt',readbacks,verified_at:'2026-10-25T15:03:00Z'});
 const remote=path.join(root,'remote-receipt');fs.copyFileSync(receipt.receipt_path,remote);
 const verified=call({...base,action:'confirm_receipt',receipt_id:'synthetic-receipt',name:receipt.receipt_name,parents:['synthetic-folder'],readback_path:remote,now:'2026-10-25T15:04:00Z'});
 assert.equal(verified.archive_verified,true);assert.equal(verified.quality.summary.status,'missing');assert.equal(verified.quality.capture.status,'limited');assert.match(verified.verification_scope,/storage/);
 }finally{fs.rmSync(root,{recursive:true});}
});

test('empty content cannot satisfy a lesson summary, while explicit limits can',()=>{
 const input={...fixture(),summary:{topic:'Puzzle',starting_understanding:[],later_demonstrated_understanding:{},language_help:[],reading_source_basis:{},unanswered_questions:[],proposed_next_activity:[]}};
 const quality=prepareArchive(input).record.quality;
 assert.equal(quality.summary.status,'partial');
 assert.ok(quality.summary.missing_fields.includes('starting_understanding'));
 assert.ok(quality.summary.missing_fields.includes('language_help'));
 const explained=prepareArchive({...fixture(),summary:{...summary,proposed_next_activity:null,next_activity_reason:'The parent test ended; no learner activity assigned.'}});
 assert.equal(explained.record.quality.summary.status,'provided');
});
for(const closeAction of ['end','pause'])test('summary-only correction preserves words and clock after '+closeAction,()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'emma-summary-amend-'));
 try {
 fs.mkdirSync(path.join(root,'runtime'));fs.writeFileSync(path.join(root,'runtime/config.json'),JSON.stringify({learner_id:'synthetic-amend',actor_kind:'parent_test',learner_first_name:'Sample',drive_folder_id:'synthetic-folder'}));
 const call=c=>workflow(c,{root}),start=call({action:'start',event_id:'start',now:'2026-10-25T15:00:00Z'});
 call({action:'turn',session_id:start.session_id,event_id:'turn',now:'2026-10-25T15:01:00Z',entries:[{role:'learner',text:'A clue can be a map.'}]});
 const first=call({action:closeAction,session_id:start.session_id,event_id:'end',now:'2026-10-25T15:02:00Z',transcript_coverage:'complete',materials:[{kind:'original_coach_passage',title:'Synthetic puzzle'}]});
 const before=first.artifacts.map(a=>fs.readFileSync(a.path,'utf8'));
 const old=JSON.parse(before[first.artifacts.findIndex(a=>a.kind==='summary_json')]);
 const command={action:'amend_summary',session_id:start.session_id,event_id:'summary-correction',now:'2026-10-26T15:00:00Z',summary};
 const amended=call(command);
 assert.equal(amended.archive_revision,2);assert.equal(amended.practice_seconds,120);assert.equal(amended.session_status,closeAction==='end'?'closed':'paused');assert.equal(amended.quality.summary.status,'provided');
 const after=JSON.parse(fs.readFileSync(amended.artifacts.find(a=>a.kind==='summary_json').path));
 assert.equal(after.transcript_coverage,old.transcript_coverage);assert.deepEqual(after.entries,old.entries);assert.deepEqual(after.materials,old.materials);assert.equal(after.started_at,old.started_at);assert.equal(after.ended_at,old.ended_at);
 assert.deepEqual(first.artifacts.map(a=>fs.readFileSync(a.path,'utf8')),before);assert.equal(call(command).archive_revision,2);
 assert.equal(call({...command,event_id:'invalid-replacement',entries:[{role:'coach',text:'Do not invent this.'}]}).status,'summary_amendment_pending');
 assert.equal(call({...command,event_id:'wrong-session',session_id:'another-synthetic-session'}).status,'session_reference_mismatch');
 assert.equal(call({...command,summary:{topic:'Changed payload'}}).status,'capture_conflict_pending');
 }finally{fs.rmSync(root,{recursive:true});}
});

test('an interrupted unbound amendment cannot replay into a later revision',()=>{
 const start=transition(null,'start',{event_id:'start',now:'2026-10-25T15:00:00Z',learner_id:'synthetic-replay',learner_first_name:'Sample'});
 const stopped=transition(start.state,'end',{event_id:'end',now:'2026-10-25T15:02:00Z'});
 const opts={event_id:'amend-a',now:'2026-10-25T15:03:00Z',session_id:start.session.session_id,summary};
 const a=transition(stopped.state,'amend_summary',opts);
 const b=transition(a.state,'amend_summary',{...opts,event_id:'amend-b',now:'2026-10-25T15:04:00Z',summary:{...summary,topic:'Another clue'}});
 assert.equal(a.session.archive_revision,2);assert.equal(b.session.archive_revision,3);
 assert.throws(()=>transition(b.state,'amend_summary',opts),/Stale unbound summary amendment/);
 assert.equal(b.session.archive_revision,3);assert.equal(b.session.practice_seconds,120);
});
