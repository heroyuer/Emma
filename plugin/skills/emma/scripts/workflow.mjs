import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
import {runCommand,refreshProtection} from './runtime.mjs';import {prepareCheckpoint,writeArchive} from './archive.mjs';import {createReceipt} from './receipt.mjs';import {nextMove} from './conversation.mjs';import {localDay,clock} from './session.mjs';import {PLUGIN_VERSION} from './version.mjs';
const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const durable=(p,v)=>{fs.mkdirSync(path.dirname(p),{recursive:true});let fd;try{fd=fs.openSync(p,'wx');fs.writeFileSync(fd,JSON.stringify(v));fs.fsyncSync(fd);return true;}catch(e){if(e.code==='EEXIST')return false;throw e;}finally{if(fd!==undefined)fs.closeSync(fd);}};
const hash=x=>crypto.createHash('sha256').update(x).digest('hex'),read=(p,fallback=null)=>fs.existsSync(p)?JSON.parse(fs.readFileSync(p)):fallback;
const write=(p,v)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p+'.tmp',JSON.stringify(v,null,2));fs.renameSync(p+'.tmp',p);};
const walk=p=>!fs.existsSync(p)?[]:fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
function profile(root){const c=read(path.join(root,'runtime/config.json'));if(!c||!/^[-\w]{3,80}$/.test(c.learner_id||'')||!['learner','parent_test'].includes(c.actor_kind))throw Error('profile_required');return c;}
const ledger=(root,c)=>read(path.join(root,'runtime/sessions',c.learner_id+'.json'));
function jobPath(root,id,revision){if(!/^[-\w]{8,100}$/.test(id||'')||!Number.isInteger(revision)||revision<1)throw Error('Invalid job identity');return path.join(root,'runtime/save-queue',id,'r'+String(revision).padStart(6,'0'),'job.json');}
const jobs=root=>walk(path.join(root,'runtime/save-queue')).filter(p=>path.basename(p)==='job.json').map(p=>({file:p,...read(p)}));
function report(job,file){return{save_state:job.save_state,job_id:job.job_id,job_path:file,session_id:job.session_id,archive_revision:job.archive_revision,session_status:job.snapshot?.status||null,practice_seconds:job.snapshot?.practice_seconds??null,artifacts:job.artifacts||[],receipt_path:job.receipt_path||null,receipt_name:job.receipt_name||null,destination_folder_id:job.folder_id||null,source_session_plugin_version:job.snapshot?.plugin_version||null,archive_generator_version:job.generator_version,diagnostic:job.diagnostic||null,archive_verified:job.save_state==='verified',cloud_io:'performed by host Drive tools, not this helper'};}
function prepare(job,file,root,summary){
 if(job.artifacts?.length){for(const a of job.artifacts)if(!fs.existsSync(a.path)||hash(fs.readFileSync(a.path))!==a.sha256)throw Error('Prepared artifact changed; original queue retained');return report(job,file);}
 if(job.generator_version!==PLUGIN_VERSION){job.save_state='pinned_generator_required';write(file,job);return report(job,file);}
 try{const archive=prepareCheckpoint(job.snapshot,{summary:summary??job.request.summary??{},materials:job.request.materials||[],transcript_coverage:job.request.transcript_coverage||'partial'}),directory=writeArchive(archive,path.join(path.dirname(file),'artifacts'));
  job.artifacts=Object.keys(archive.files).map(name=>{const p=path.join(directory,name);return{kind:name.endsWith('-summary.json')?'summary_json':name.endsWith('-summary.md')?'summary_markdown':'transcript_markdown',name,path:p,sha256:hash(fs.readFileSync(p)),mime_type:name.endsWith('.json')?'application/json':'text/markdown'};});
  job.effective_summary=summary??job.request.summary??{};job.save_state=job.folder_id?'artifacts_prepared_awaiting_drive':'destination_required';job.diagnostic=null;
 }catch{job.save_state='preparation_blocked';job.diagnostic='Actual payload retained; correct missing/invalid summary evidence or inspect artifact conflict before retry.';}
 write(file,job);refreshProtection(root);return report(job,file);
}
function queueSession(root,c,s,request){
 const file=jobPath(root,s.session_id,s.archive_revision),existing=read(file);if(existing)return report(existing,file);
 const job={kind:'save_job',job_id:s.session_id+':'+s.archive_revision,session_id:s.session_id,learner_id:c.learner_id,archive_revision:s.archive_revision,generator_version:PLUGIN_VERSION,folder_id:c.drive_folder_id||null,created_at:request.now,save_state:s.entries.length?'payload_retained':'nothing_to_archive',snapshot:structuredClone(s),request:structuredClone(request)};
 write(file,job);refreshProtection(root);return s.entries.length?prepare(job,file,root):report(job,file);
}
function history(root,c,now){const anchor=new Date(localDay(now)+'T12:00:00Z'),dates=new Set(Array.from({length:7},(_,i)=>{const d=new Date(anchor);d.setUTCDate(d.getUTCDate()-i);return d.toISOString().slice(0,10);}));return jobs(root).filter(j=>j.learner_id===c.learner_id&&j.snapshot?.started_at&&dates.has(localDay(j.snapshot.started_at))).slice(-12).map(j=>({session_id:j.session_id,save_state:j.save_state,topics:((j.effective_summary||j.request.summary)?.topics||[]).slice(0,5),unanswered_questions:((j.effective_summary||j.request.summary)?.unanswered_questions||[]).slice(0,4),reliability:j.save_state==='verified'?'verified archive':'local pending summary'}));}
function workflowUnlocked(command,{root}){
 const now=new Date(command.now||Date.now()).toISOString();let c;try{c=profile(root);}catch{return{status:command._submission_path?'untracked_capture_pending':'setup_required',recorded_session_started:false,submission_path:command._submission_path||null,archive_verified:false,diagnostic:'Profile/startup unavailable; any supplied closing payload is retained locally, with no invented session or clock.',plugin_version:PLUGIN_VERSION};}
 if(command.action==='diagnostics'){const current=ledger(root,c)?.current;return{plugin_version:PLUGIN_VERSION,profile_loaded:true,actor_kind:c.actor_kind,session_status:current?.status||'not_started',recorded_session_exists:!!current?.session_id,clock_available:!!current?.started_at,destination_configured:!!c.drive_folder_id,save_states:jobs(root).filter(j=>j.learner_id===c.learner_id).map(j=>({save_state:j.save_state,archive_revision:j.archive_revision})),limits:'Local diagnostics only; no native Voice capture or remote saving proof.'};}
 if(command.action==='start'){
  let r;try{r=runCommand({...command,now},{root});}catch{return{status:'setup_required',recorded_session_started:false,diagnostic:'Startup did not complete; check profile name, runtime access and real tool error before teaching as a tracked session.',plugin_version:PLUGIN_VERSION};}
  if(r.session?.status!=='active')return{status:'prior_start_event_not_active',recorded_session_started:false,session_id:r.session?.session_id||null,diagnostic:'Use a fresh invocation ID to start/resume; prior event refers to a non-active state.'};
  for(const prior of ledger(root,c).history||[])if(prior.close_reason==='ended_day_boundary'&&prior.entries.length)queueSession(root,c,prior,{now,summary:{topics:[],coverage_limits:'Preserved at new-day boundary; prior learning remains unassessed.'},transcript_coverage:'partial'});
  return{status:'tracked_local_ready',recorded_session_started:true,session_id:r.session.session_id,session_status:r.session.status,actor_kind:c.actor_kind,plugin_version:PLUGIN_VERSION,pinned_plugin_version:r.session.plugin_version,practice_seconds:clock(r.session,now),clock_source:'actual local session ledger',history:history(root,c,now),history_source:'this profile local save queue; remote Drive history not fetched by helper',archive_status:c.drive_folder_id?'destination_configured_remote_saving_unverified':'destination_required',archive_tools_check:command.capability_report?'host-reported; not independently verified by local helper':'not_reported',pending_saves:refreshProtection(root).pending_saves};
 }
 if(command.action==='turn'){
  if(!command.session_id||ledger(root,c)?.current?.session_id!==command.session_id)return{status:'session_reference_mismatch',recorded_session_started:false,diagnostic:'Use the confirmed startup session ID; delayed input was not appended.'};
  const r=runCommand({...command,action:'context',now},{root});if(r.rollover_required)return r;
  for(const [i,e] of (command.entries||[]).entries())runCommand({action:'append',event_id:command.event_id+'/entry/'+i,entry:e,now},{root});
  return{status:'tracked_turn',session_id:r.session.session_id,practice_seconds:r.practice_seconds,wrap_up_due:r.wrap_up_due,next:nextMove({learner_text:command.learner_text||command.entries?.filter(e=>e.role==='learner').at(-1)?.text||'',previous_move:command.previous_move})};
 }
 if(['stop','pause','end','capture_final'].includes(command.action)){
  const s=ledger(root,c)?.current,submission=command._submission_path||path.join(root,'runtime/save-queue',s?.session_id||'untracked','submissions',hash(String(command.event_id||'missing')),'submission.json');
  if(!command.event_id)throw Error('Stable event_id required');
  if(!fs.existsSync(submission))write(submission,{kind:'closing_submission',job_id:hash(command.event_id),session_id:s?.session_id||null,save_state:'unbound_pending',submitted_at:now,actual_command:{...command,now}});refreshProtection(root);
  if(!s)return{status:'untracked_capture_pending',recorded_session_started:false,submission_path:submission,archive_verified:false,diagnostic:'Actual supplied payload retained. No prior tracked startup/clock; do not fabricate a historical lesson.'};
  const savedSubmission=read(submission);if(savedSubmission.job_path){const expected=path.resolve(root,'runtime/save-queue')+path.sep;if(!path.resolve(savedSubmission.job_path).startsWith(expected))throw Error('Invalid queued binding');const bound=read(savedSubmission.job_path);if(bound)return report(bound,savedSubmission.job_path);}const original=savedSubmission.actual_command;if(command._untracked_at_submission)return{status:'untracked_capture_pending',submission_path:submission,archive_verified:false,diagnostic:'No valid tracked session reference existed at submission; do not attach old content to a new lesson.'};if(!original.session_id||s.session_id!==original.session_id)return{status:'session_reference_mismatch',submission_path:submission,archive_verified:false,diagnostic:'Actual payload retained; not applied to a different session.'};const entryBase=original.final_entries?s.entries.length:0;
  if(original.final_entries){const prefix=s.entries;if(original.final_entries.length<prefix.length||prefix.some((e,i)=>e.role!==original.final_entries[i]?.role||e.text!==original.final_entries[i]?.text))return{status:'capture_conflict_pending',submission_path:submission,archive_verified:false,diagnostic:'Actual closing content retained separately; existing transcript unchanged.'};original.entries=original.final_entries.slice(prefix.length);}
  try{let r;if(['paused','closed'].includes(s.status)){
   if(original.entries?.length)r=runCommand({action:'capture_tail',session_id:s.session_id,event_id:original.event_id+'/capture-tail',entries:original.entries,now:original.now},{root});else r={session:s};
   if(original.action==='end'&&r.session.status==='paused')r=runCommand({...original,action:'end',entries:undefined,now:original.now},{root});
  }else{for(const [i,e] of (original.entries||[]).entries())runCommand({action:'append',event_id:original.event_id+'/closing-entry/'+(entryBase+i),entry:e,now:original.now},{root});r=runCommand({...original,action:original.action==='capture_final'?'stop':original.action,now:original.now},{root});}
  const result=queueSession(root,c,r.session,original);const bound=read(submission);bound.save_state='bound_to_job';bound.job_path=result.job_path;write(submission,bound);refreshProtection(root);return result;}
  catch{return{status:'close_pending',submission_path:submission,archive_verified:false,diagnostic:'Actual closing payload retained; retry the same event_id after inspecting the runtime error.'};}
 }
 if(['retry','prepare_receipt','confirm_receipt','status'].includes(command.action)){
  const file=jobPath(root,command.session_id,command.archive_revision),job=read(file);if(!job||job.learner_id!==c.learner_id)throw Error('Authorized queued job required');
  if(command.action==='status')return report(job,file);if(job.save_state==='verified')return report(job,file);
  if(jobs(root).some(j=>j.session_id===job.session_id&&j.archive_revision>job.archive_revision))return{status:'newer_checkpoint_exists',archive_verified:false,diagnostic:'Finish the newer queue revision; do not overwrite it with older prepared files.'};
  if(command.action==='retry'){if(!job.folder_id&&c.drive_folder_id){job.folder_id=c.drive_folder_id;if(job.artifacts?.length)job.save_state='artifacts_prepared_awaiting_drive';write(file,job);}return prepare(job,file,root,command.summary);}
  if(command.action==='prepare_receipt'){
   if(!job.artifacts?.length||!job.folder_id)throw Error('Prepared artifacts and configured destination required');
   const files=(command.readbacks||[]).map(f=>{const local=job.artifacts.find(a=>a.kind===f.kind);if(!local||f.name!==local.name||f.mime_type!==local.mime_type||hash(fs.readFileSync(local.path))!==local.sha256||fs.realpathSync(local.path)===fs.realpathSync(f.readback_path))throw Error('Separate authenticated remote readback required');return{...f,local_bytes:fs.readFileSync(local.path),remote_bytes:fs.readFileSync(f.readback_path)};});
   const receipt=createReceipt({folder_id:job.folder_id,verified_at:command.verified_at,files});if(receipt.session_id!==job.session_id||receipt.learner_id!==job.learner_id||receipt.archive_revision!==job.archive_revision||receipt.actor_kind!==job.snapshot.actor_kind||receipt.plugin_version!==job.snapshot.plugin_version)throw Error('Receipt job mismatch');
   job.receipt_name=job.artifacts.find(a=>a.kind==='summary_json').name.replace(/-summary\.json$/,'-receipt.json');job.receipt_path=path.join(path.dirname(file),'receipt.json');fs.writeFileSync(job.receipt_path,JSON.stringify(receipt,null,2)+'\n');job.save_state='receipt_prepared_upload_pending';write(file,job);return report(job,file);
  }
  if(!job.receipt_path||!command.receipt_id||command.name!==job.receipt_name||!command.parents?.includes(job.folder_id)||fs.realpathSync(job.receipt_path)===fs.realpathSync(command.readback_path)||!fs.readFileSync(job.receipt_path).equals(fs.readFileSync(command.readback_path)))throw Error('Actual uploaded receipt content and parent readback required');
  job.save_state='verified';job.verified_at=now;job.receipt_id=command.receipt_id;job.verification_basis='authenticated Drive readbacks supplied by host; no passive audio verification';write(file,job);
  for(const old of jobs(root).filter(j=>j.session_id===job.session_id&&j.archive_revision<job.archive_revision&&j.save_state!=='verified')){old.save_state='superseded_by_verified_revision';old.superseded_by=job.archive_revision;const p=old.file;delete old.file;write(p,old);}refreshProtection(root);return report(job,file);
 }
 throw Error('Unsupported workflow action');
}
export function workflow(command,{root=path.join(os.homedir(),'.emma')}={}){
 root=path.resolve(root);const runtime=path.join(root,'runtime');let incoming=null,payloadHash=null,eventHash=null;
 if(['stop','pause','end','capture_final'].includes(command.action)){
  if(!command.event_id)throw Error('Stable closing event_id required');
  const {now,...payload}=command;eventHash=hash(command.event_id);payloadHash=hash(canonical(payload));
  incoming=path.join(runtime,'save-queue','incoming',eventHash,payloadHash,'submission.json');
  durable(incoming,{kind:'closing_submission',job_id:eventHash+':'+payloadHash,session_id:command.session_id||null,save_state:'unbound_pending',submitted_at:new Date(now||Date.now()).toISOString(),actual_command:{...command,now:new Date(now||Date.now()).toISOString()}});
  let retained;try{retained=read(incoming);}catch{const fallback=path.join(runtime,'save-queue','interrupted',crypto.randomUUID(),'submission.json');durable(fallback,{kind:'closing_submission',job_id:crypto.randomUUID(),save_state:'unbound_pending',actual_command:command});return{status:'workflow_busy_pending',submission_path:fallback,archive_verified:false};}
  command={...retained.actual_command,_submission_path:incoming};refreshProtection(root);
 }
 fs.mkdirSync(runtime,{recursive:true});const lock=path.join(runtime,'workflow.lock');let fd;
 try{
  try{fd=fs.openSync(lock,'wx');}catch{return{status:incoming?'workflow_busy_pending':'workflow_busy',submission_path:incoming,archive_verified:false,recorded_session_started:false};}
  if(incoming){const bindingPath=path.join(runtime,'workflow-events',eventHash+'.json');let binding=read(bindingPath);
   if(binding&&binding.payload_hash!==payloadHash)return{status:'capture_conflict_pending',submission_path:incoming,archive_verified:false};
   if(!binding){let observed=null;try{observed=ledger(root,profile(root))?.current?.session_id||null;}catch{}binding={payload_hash:payloadHash,observed_session_id:observed,expected_session_id:command.session_id||null};write(bindingPath,binding);}
   command._untracked_at_submission=!binding.observed_session_id||!binding.expected_session_id;
  }
  return workflowUnlocked(command,{root});
 }finally{if(fd!==undefined){try{refreshProtection(root);}finally{try{fs.closeSync(fd);}finally{fs.unlinkSync(lock);}}}}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const [input]=process.argv.slice(2);if(!input)throw Error('Usage: node workflow.mjs command.json');console.log(JSON.stringify(workflow(JSON.parse(fs.readFileSync(input)))));}
