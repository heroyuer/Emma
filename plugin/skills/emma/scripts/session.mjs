import {hostEvidence} from './quality.mjs';
import crypto from 'node:crypto';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {PLUGIN_VERSION} from './version.mjs';
export const localDay=(now,tz='America/Chicago')=>new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
const milliseconds=x=>new Date(x).getTime();
function firstBoundary(s,now){let lo=milliseconds(s.started_at),hi=milliseconds(now);while(hi-lo>1){const mid=Math.floor((hi+lo)/2);if(localDay(mid,s.timezone)===s.local_date)lo=mid;else hi=mid;}return new Date(hi).toISOString();}
export function clock(s,now){return Math.floor((s.accumulated_ms+(s.status==='active'?Math.max(0,milliseconds(now)-milliseconds(s.active_since)):0))/1000);}
export function transition(previous,action,opts={}){
 const state=structuredClone(previous||{current:null,history:[],seen:{}}),now=new Date(opts.now||Date.now()).toISOString(),id=opts.event_id;
 if(!id||typeof id!=='string')throw Error('Stable command event_id required');
 const signature=JSON.stringify({action,entry:opts.entry||null,permanent:!!opts.permanent,...(action==='capture_tail'?{entries:opts.entries||null}:action==='amend_summary'?{summary:opts.summary||null}:{})});
 if(state.seen[id]){if(state.seen[id]!==signature)throw Error('Conflicting checkpoint retry');if(action==='amend_summary'){const event=state.summary_events?.[id];if(!event||event.session_id!==state.current?.session_id||event.archive_revision!==state.current?.archive_revision)throw Error('Stale unbound summary amendment; original payload must remain pending');}return{state,duplicate:true,session:state.current};}
 let s=state.current;const tz=s?.timezone||opts.timezone||'America/Chicago';if(tz!=='America/Chicago')throw Error('Configured learner timezone must be America/Chicago in v1');
 if(s&&milliseconds(now)<milliseconds(s.last_observed_at))throw Error('Clock moved backward; retain previous state');
 if(s&&localDay(now,tz)!==s.local_date&&action!=='amend_summary') {
  if(action!=='start')return{state,rollover_required:true,session:s,notice:'New local day: seal prior partial work before a fresh session; do not attach new words silently.'};
  const boundary=firstBoundary(s,now);if(s.status!=='closed'){s.archive_revision=(s.archive_revision||0)+1;s.practice_seconds=clock(s,boundary);s.accumulated_ms=s.practice_seconds*1000;s.active_since=null;s.status='closed';s.ended_at=boundary;s.close_reason='ended_day_boundary';s.transcript_coverage='partial';}state.history.push(s);state.current=null;s=null;
 }
 if(action==='start'){
  if(!s||s.status==='closed'){s={session_id:crypto.randomUUID(),learner_id:opts.learner_id,learner_first_name:opts.learner_first_name,actor_kind:opts.actor_kind||'learner',host_evidence:hostEvidence(opts.capability_report),plugin_version:opts.plugin_version||PLUGIN_VERSION,rules_revision:opts.rules_revision??null,timezone:tz,local_date:localDay(now,tz),started_at:now,last_observed_at:now,active_since:now,accumulated_ms:0,status:'active',archive_revision:0,entries:[],transcript_coverage:'unknown'};if(state.current)state.history.push(state.current);state.current=s;}
  else if(s.status==='paused'){s.active_since=now;s.status='active';}
 }else{
  if(!s)throw Error('Start a session before recording or closing');
  if(action==='append'){if(s.status!=='active')throw Error('Resume before adding new words');if(!opts.entry||!['learner','coach'].includes(opts.entry.role)||typeof opts.entry.text!=='string'||!opts.entry.text.trim())throw Error('Actual labelled text required');s.entries.push({...opts.entry,event_id:id});}
  else if(action==='capture_tail'){
   if(opts.session_id!==s.session_id||!['paused','closed'].includes(s.status)||!Array.isArray(opts.entries)||!opts.entries.length||opts.entries.some(e=>!['learner','coach'].includes(e.role)||typeof e.text!=='string'||!e.text.trim()))throw Error('Actual same-session closing tail required after pause/close');
   s.entries.push(...opts.entries.map((e,i)=>({...e,event_id:id+'/'+i})));s.archive_revision=(s.archive_revision||0)+1;s.closing_capture_received_at=now;s.transcript_coverage='partial';
  }
  else if(action==='amend_summary'){
   if(opts.session_id!==s.session_id||!['paused','closed'].includes(s.status)||!opts.summary||typeof opts.summary!=='object'||Array.isArray(opts.summary)||!Object.keys(opts.summary).length)throw Error('Actual same-session nonempty summary required after pause/close');
   s.archive_revision=(s.archive_revision||0)+1;state.summary_events??={};state.summary_events[id]={session_id:s.session_id,archive_revision:s.archive_revision};
  }
  else if(action==='stop'||action==='pause'||action==='end'){
   if(s.status!=='closed'){s.archive_revision=(s.archive_revision||0)+1;const elapsed=clock(s,now);s.accumulated_ms=elapsed*1000;s.active_since=null;s.practice_seconds=elapsed;const close=action==='end'||opts.permanent||action==='stop'&&elapsed>=25*60;s.status=close?'closed':'paused';s.close_reason=close?(elapsed<25*60?'explicit_early_close':'requested_wrap_up'):'pause_before_25_minutes';s.ended_at=close?now:null;s.paused_at=close?null:now;s.transcript_coverage='partial';}
  }else if(action!=='context')throw Error('Unknown session action');
 }
 if(s)s.last_observed_at=now;state.seen[id]=signature;const elapsed=s?clock(s,now):0;
 return{state,session:s,practice_seconds:elapsed,wrap_up_due:elapsed>=30*60,requested_stop_closes:elapsed>=25*60,save_checkpoint:action==='stop'||action==='pause'||action==='end'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [statePath,inputPath]=process.argv.slice(2);if(!statePath||!inputPath)throw Error('Usage: node session.mjs runtime-state.json command.json');const command=JSON.parse(fs.readFileSync(inputPath,'utf8'));const old=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):null;const result=transition(old,command.action,command);fs.mkdirSync(path.dirname(statePath),{recursive:true});fs.writeFileSync(statePath+'.tmp',JSON.stringify(result.state,null,2));fs.renameSync(statePath+'.tmp',statePath);console.log(JSON.stringify(result));
}
