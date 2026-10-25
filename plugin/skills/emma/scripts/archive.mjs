import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const latin=s=>s.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)||[];
export function prepareArchive(input){
 if(input.schema_version!==1||!Array.isArray(input.entries)||!input.entries.length)throw Error('Nonempty actual entries required');
 if(!/^[a-zA-Z0-9_-]{8,100}$/.test(input.session_id||''))throw Error('Stable safe session ID required');
 if(!/^[a-zA-Z0-9_-]{3,80}$/.test(input.learner_id||'')||!['learner','parent_test'].includes(input.actor_kind))throw Error('Configured stable learner ID and actor kind required');
 if(typeof input.learner_first_name!=='string'||!input.learner_first_name.trim()||input.learner_first_name.length>40)throw Error('Preferred first name required');
 if(!['complete','partial','unknown'].includes(input.transcript_coverage))throw Error('Explicit transcript coverage required');
 const start=input.started_at?new Date(input.started_at):null,end=input.ended_at?new Date(input.ended_at):null;
 if(start&&!Number.isFinite(+start)||end&&(!Number.isFinite(+end)||start&&end<start))throw Error('Actual ordered timestamps required');
 if(!input.plugin_version||input.rules_revision!==null&&!['string','number'].includes(typeof input.rules_revision))throw Error('Version and actual/unknown rule revision required');
 const entries=input.entries.map(e=>{if(!['learner','coach'].includes(e.role)||typeof e.text!=='string'||!e.text.trim())throw Error('Actual labelled entries required');return{role:e.role,text:e.text};});
 if(input.archive_revision!==undefined&&(!Number.isInteger(input.archive_revision)||input.archive_revision<1))throw Error('Positive archive revision required');if(input.practice_seconds!==undefined&&input.practice_seconds!==null&&(!Number.isInteger(input.practice_seconds)||input.practice_seconds<0))throw Error('Invalid practice clock');const summary=input.summary||{};
 for(const x of summary.demonstrations||[]){if(!Number.isInteger(x.entry)||entries[x.entry-1]?.role!=='learner'||typeof x.note!=='string')throw Error('Assessment must cite a real learner entry');}
 const learner=entries.filter(e=>e.role==='learner'),coach=entries.filter(e=>e.role==='coach'),lw=learner.reduce((n,e)=>n+latin(e.text).length,0),cw=coach.reduce((n,e)=>n+latin(e.text).length,0);
 const language={english_only_turns_approx:0,mixed_turns_approx:0,chinese_turns_approx:0,unclassified_turns:0};
 for(const e of learner){const en=/[A-Za-z]/.test(e.text),zh=/\p{Script=Han}/u.test(e.text);language[en&&zh?'mixed_turns_approx':en?'english_only_turns_approx':zh?'chinese_turns_approx':'unclassified_turns']++;}
 const metrics={learner_turns:learner.length,coach_turns:coach.length,paired_exchanges:entries.filter((e,i)=>e.role==='learner'&&entries[i-1]?.role==='coach').length,learner_words_approx:lw,learner_characters:learner.reduce((n,e)=>n+[...e.text].length,0),learner_share_of_word_tokens_approx:lw+cw?Number((lw/(lw+cw)).toFixed(3)):null,elapsed_seconds:start&&end?Math.floor((end-start)/1000):null,...language,engagement_assessment:summary.demonstrations?.length?'evidence-linked observations; not a proficiency score':'unassessed'};
 const date=start?new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(start).replaceAll('-',''):input.session_date;if(!/^\d{8}$/.test(date||''))throw Error('Known client date required when actual start time is unavailable');
 const slug=input.learner_first_name.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');if(!slug)throw Error('Name needs a usable filename label');
 const stem=`${date}-${slug}-${input.session_id}`;
 const record={schema_version:1,archive_revision:input.archive_revision||1,session_status:input.session_status||'closed',practice_seconds:input.practice_seconds??null,session_id:input.session_id,learner_id:input.learner_id,actor_kind:input.actor_kind,learner_first_name:input.learner_first_name,plugin_version:input.plugin_version,rules_revision:input.rules_revision,session_date:date,started_at:start?.toISOString()||null,ended_at:end?.toISOString()||null,timezone:'America/Chicago',transcript_coverage:input.transcript_coverage,archive_status:'prepared_not_uploaded',metrics,summary,materials:input.materials||[],entries};
 const pre=`# Emma lesson — ${input.learner_first_name}\n\nSession: ${input.session_id}\nPlugin: ${input.plugin_version}; rules: ${input.rules_revision??'unknown'}\nCoverage: ${input.transcript_coverage}; prepared locally, not verified in Drive.\n`;
 return{stem,record,files:{[stem+'-transcript.md']:pre+'\n'+entries.map((e,i)=>`## ${i+1}. ${e.role}\n\n${e.text}`).join('\n\n')+'\n',[stem+'-summary.json']:JSON.stringify(record,null,2)+'\n',[stem+'-summary.md']:pre+'\n## Summary\n\n'+JSON.stringify(summary,null,2)+'\n\n## Metrics\n\n'+JSON.stringify(metrics,null,2)+'\n\nCounts describe captured text only, not speaking time, motivation or mastery.\n'}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [inputFile,output]=process.argv.slice(2);if(!inputFile||!output)throw Error('Usage: node archive.mjs session.json output-directory');
 const archive=prepareArchive(JSON.parse(fs.readFileSync(inputFile,'utf8')));fs.mkdirSync(output,{recursive:true});
 for(const [name,text] of Object.entries(archive.files)){const target=path.join(output,name);if(fs.existsSync(target)&&fs.readFileSync(target,'utf8')!==text)throw Error('Conflicting existing artifact; original preserved');}
 for(const [name,text] of Object.entries(archive.files))fs.writeFileSync(path.join(output,name),text);
 console.log(JSON.stringify({stem:archive.stem,files:Object.keys(archive.files),status:'prepared_not_uploaded'}));
}
