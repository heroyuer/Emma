import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {update,atomic} from './client.mjs';
const root=path.join(os.homedir(),'.emma'),preview=process.argv.includes('--preview');
try{
 const result=update({root,preview,betweenSessions:true});
 if(!['current','activated_restart_required','newer_installed'].includes(result.status)){console.log(JSON.stringify(result));process.exitCode=2;}else{
  fs.mkdirSync(path.join(root,'runtime'),{recursive:true});
  if(!fs.existsSync(path.join(root,'runtime/config.json')))atomic(path.join(root,'runtime/config.json'),{learner_first_name:null,learner_id:null,actor_kind:'learner',drive_folder_id:null,instruction_file_id:null,timezone:'America/Chicago'});
  fs.writeFileSync(path.join(root,'launcher.mjs'),"import './current/scripts/update.mjs';\n");
  console.log(JSON.stringify({...result,root,next:'Restart client, install Emma from local marketplace and connect own Drive. Native Voice/account eligibility unverified; configure archive destination before real lessons. To schedule run setup-updates.ps1 in this account.'}));
 }
}catch(e){console.error(e.message);process.exitCode=1;}
