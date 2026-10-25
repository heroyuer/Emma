import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
export function createReceipt({folder_id,verified_at,files}){
 if(!/^[-\w]+$/.test(folder_id||'')||!Number.isFinite(Date.parse(verified_at))||!Array.isArray(files)||files.length!==3)throw Error('Exact folder, observed verification time and three read-back artifacts required');
 const kinds=new Set(),ids=new Set();const verified=files.map(f=>{
  if(!['summary_json','summary_markdown','transcript_markdown'].includes(f.kind)||kinds.has(f.kind)||!f.id||ids.has(f.id)||!f.parents?.includes(folder_id)||typeof f.name!=='string')throw Error('Invalid read-back artifact metadata');kinds.add(f.kind);ids.add(f.id);
  if(!Buffer.isBuffer(f.local_bytes)||!Buffer.isBuffer(f.remote_bytes)||!f.local_bytes.equals(f.remote_bytes))throw Error('Remote bytes must exactly match prepared artifact');
  if(f.mime_type!==(f.kind==='summary_json'?'application/json':'text/markdown'))throw Error('Unexpected archive MIME type');
  return{kind:f.kind,id:f.id,name:f.name,mime_type:f.mime_type,sha256:hash(f.remote_bytes)};
 });
 const s=JSON.parse(files.find(f=>f.kind==='summary_json').remote_bytes);
 if(s.schema_version!==1||!s.session_id||!s.learner_id||!Number.isInteger(s.archive_revision)||s.archive_revision<1)throw Error('Archive identity/revision required');
 return{schema_version:1,archive_status:'verified',archive_revision:s.archive_revision,folder_id,verified_at,session_id:s.session_id,learner_id:s.learner_id,actor_kind:s.actor_kind,plugin_version:s.plugin_version,files:verified};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('Usage: node receipt.mjs authenticated-readbacks.json receipt.json');
 const spec=JSON.parse(fs.readFileSync(input));spec.files=spec.files.map(f=>{if(fs.realpathSync(f.local_path)===fs.realpathSync(f.readback_path))throw Error('Use a separate materialized authenticated Drive readback, not the upload source');return{...f,local_bytes:fs.readFileSync(f.local_path),remote_bytes:fs.readFileSync(f.readback_path)};});
 const receipt=createReceipt(spec);fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({status:'receipt_prepared_from_supplied_readbacks',session_id:receipt.session_id,files:receipt.files.length,next:'Upload and read back this receipt before claiming saved'}));
}
