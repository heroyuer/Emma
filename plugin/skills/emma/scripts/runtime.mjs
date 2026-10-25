import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {fileURLToPath} from 'node:url';import {transition} from './session.mjs';
export function runCommand(command,{root=path.join(os.homedir(),'.emma')}={}){
 const runtime=path.join(root,'runtime'),configPath=path.join(runtime,'config.json');if(!fs.existsSync(configPath))throw Error('Configure this profile first; do not create a chat-local replacement ledger');
 const config=JSON.parse(fs.readFileSync(configPath));if(!/^[-\w]{3,80}$/.test(config.learner_id||'')||!['learner','parent_test'].includes(config.actor_kind))throw Error('Configured stable profile identity required');
 if(command.learner_id&&command.learner_id!==config.learner_id||command.actor_kind&&command.actor_kind!==config.actor_kind)throw Error('Command cannot change configured profile identity');
 const dir=path.join(runtime,'sessions');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,config.learner_id+'.json'),lock=file+'.lock';let fd;
 try{fd=fs.openSync(lock,'wx');const previous=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):null;
  const name=config.learner_first_name||command.learner_first_name;if(!name)throw Error('Ask the preferred first name once, then pass it to startup');
  const result=transition(previous,command.action,{...command,learner_id:config.learner_id,actor_kind:config.actor_kind,learner_first_name:name,timezone:config.timezone||'America/Chicago',plugin_version:'0.1.1'});
  fs.writeFileSync(file+'.tmp',JSON.stringify(result.state,null,2));fs.renameSync(file+'.tmp',file);
  if(!config.learner_first_name){config.learner_first_name=name;fs.writeFileSync(configPath+'.tmp',JSON.stringify(config,null,2));fs.renameSync(configPath+'.tmp',configPath);}
  const pending=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(dir,f))).current).filter(s=>s&&s.status!=='closed').map(s=>({session_id:s.session_id,plugin_version:s.plugin_version,status:s.status}));
  const marker=path.join(runtime,'lesson-active.json');if(pending.length)fs.writeFileSync(marker,JSON.stringify({sessions:pending}));else if(fs.existsSync(marker))fs.unlinkSync(marker);
  return{...result,state:undefined,ledger_path:file,loaded_plugin_version:'0.1.1',pinned_plugin_version:result.session?.plugin_version,version_mismatch:result.session?.plugin_version!=='0.1.1'};
 }finally{if(fd!==undefined){fs.closeSync(fd);fs.unlinkSync(lock);}}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [input]=process.argv.slice(2);if(!input)throw Error('Usage: node runtime.mjs command.json');console.log(JSON.stringify(runCommand(JSON.parse(fs.readFileSync(input)))));
}
