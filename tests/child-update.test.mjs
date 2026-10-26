import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {childGuide} from '../scripts/sync-update-guide.mjs';
test('child guide pins current release and preview consent; stable does not opt into previews',()=>{
 const preview=childGuide('8.7.6','preview'),stable=childGuide('8.7.6','stable');
 assert.match(preview,/emma-v8\.7\.6/);assert.match(preview,/-Version 8\.7\.6 -Preview/);
 assert.doesNotMatch(stable,/-Preview/);assert.throws(()=>childGuide('../escape','preview'));
});
const powershell=process.platform==='win32'?path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe'):null;
test('child wrapper checks the installed version and preserves all existing runtime settings',{skip:!powershell||!fs.existsSync(powershell)},()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'emma-kid-update-'));
 try{
 fs.mkdirSync(path.join(root,'runtime'));const settings='{"synthetic":"keep this byte-for-byte"}';fs.writeFileSync(path.join(root,'runtime','config.json'),settings);
 fs.writeFileSync(path.join(root,'runtime','toolchain.json'),JSON.stringify({paths:{node:process.execPath}}));
 const launcher=path.join(root,'launcher.mjs'),script=path.resolve('scripts/update-kids.ps1');
 const invoke=()=>spawnSync(powershell,['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script,'-Version','8.7.6','-Preview','-InstallRoot',root],{encoding:'utf8',windowsHide:true});
 fs.writeFileSync(launcher,"if(!process.argv.includes('--preview')||!process.argv.includes('8.7.6')||!process.argv.includes('--between-sessions'))process.exit(7);console.log(JSON.stringify({cache_refresh:'verified',installed_version:'8.7.6'}));");
 let r=invoke();assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/8\.7\.6 is installed/);
 fs.writeFileSync(launcher,"console.log(JSON.stringify({status:'staged'}));");
 r=invoke();assert.equal(r.status,2);assert.doesNotMatch(r.stdout,/8\.7\.6 is installed/);
 fs.writeFileSync(launcher,"console.log(JSON.stringify({cache_refresh:'verified',installed_version:'1.0.0'}));");
 r=invoke();assert.equal(r.status,2);assert.equal(fs.readFileSync(path.join(root,'runtime','config.json'),'utf8'),settings);
 }finally{fs.rmSync(root,{recursive:true});}
});
test('child wrapper never launches updater while a lesson or queued save is guarded',{skip:!powershell||!fs.existsSync(powershell)},()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'emma-kid-guard-'));
 try{
 fs.mkdirSync(path.join(root,'runtime'));fs.writeFileSync(path.join(root,'runtime','lesson-active.json'),'{}');
 const r=spawnSync(powershell,['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.resolve('scripts/update-kids.ps1'),'-Version','8.7.6','-InstallRoot',root],{encoding:'utf8',windowsHide:true});
 assert.equal(r.status,2,r.stderr);assert.match(r.stdout,/deferred/);
 assert.ok(!fs.existsSync(path.join(root,'update-status.json')));
 }finally{fs.rmSync(root,{recursive:true});}
});
