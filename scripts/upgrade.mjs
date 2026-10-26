import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
import {update,run,read,atomic} from './client.mjs';import {loadToolchain} from './toolchain.mjs';
const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export function refreshInstalled({root=path.join(os.homedir(),'.emma'),home=os.homedir(),execute,codexExecutable}={}){
 if(fs.existsSync(path.join(root,'runtime/lesson-active.json')))return{cache_refresh:'deferred_for_session_or_save_queue'};
 const catalog=read(path.join(home,'.agents/plugins/marketplace.json')),entry=catalog?.plugins?.find(p=>p.name==='emma'),source=path.resolve(home,entry?.source?.path||'');
 if(!catalog?.name||source!==path.resolve(root,'current/plugin'))throw Error('Existing Emma marketplace binding must match; no duplicate plugin created');
 const tools=execute?null:loadToolchain(root),exe=codexExecutable||tools?.paths.codex;if(!exe)return{cache_refresh:'host_command_unavailable'};
 const invoke=execute||((cmd,args)=>run(cmd,args,{env:tools.env})),selector='emma@'+catalog.name;
 const result=JSON.parse(invoke(exe,['plugin','add',selector,'--json'])),manifest=read(path.join(source,'plugin.json'));
 if(result.pluginId!==selector||result.version!==manifest.version||!result.installedPath||!path.isAbsolute(result.installedPath))throw Error('Host did not confirm the same Emma identity/version');
 for(const file of ['plugin.json','.app.json'])if(canonical(read(path.join(result.installedPath,file)))!==canonical(read(path.join(source,file))))throw Error('Installed manifest/dependency differs from source');
 const skill='skills/emma/SKILL.md',installed=fs.readFileSync(path.join(result.installedPath,skill),'utf8').replace(/\r\n/g,'\n'),expected=fs.readFileSync(path.join(source,skill),'utf8').replace(/\r\n/g,'\n');if(installed!==expected)throw Error('Installed coaching skill differs from source');
 return{cache_refresh:'verified',plugin_identity:selector,installed_version:result.version,loaded_chat_version:'requires fresh chat; native Voice not verified'};
}
export function performUpgrade(options={}){const root=options.root||path.join(os.homedir(),'.emma'),result=update(options);if(!['current','activated_restart_required'].includes(result.status))return result;try{return{...result,...refreshInstalled({...options,root})};}catch{return{...result,cache_refresh:'failed_pending',diagnostic:'Source activation is separate from host installation; inspect supported plugin add/readback before claiming upgrade complete.'};}}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),value=x=>{const i=args.indexOf(x);return i<0?undefined:args[i+1];},root=value('--root')||path.join(os.homedir(),'.emma');let result;
 try{result=performUpgrade({root,preview:args.includes('--preview'),targetVersion:value('--version'),betweenSessions:args.includes('--between-sessions')});if(result.cache_refresh&&result.cache_refresh!=='verified')process.exitCode=2;}catch(e){result={status:'upgrade_failed',error_code:e.code||'upgrade_error',diagnostic:'Existing settings/queue retained; check toolchain and private repository access.'};process.exitCode=1;}
 result={...result,checked_at:new Date().toISOString()};atomic(path.join(root,'update-status.json'),result);console.log(JSON.stringify(result));
}
