import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {childGuide} from '../scripts/sync-update-guide.mjs';
test('child guide pins current release and preview consent; stable does not opt into previews',()=>{
 const preview=childGuide('8.7.6','preview'),stable=childGuide('8.7.6','stable');
 assert.match(preview,/emma-v8\.7\.6/);assert.match(preview,/update-kids\.ps1 -Preview/);assert.doesNotMatch(preview,/to version 8\.7\.6/);
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

test('version-free wrapper resolves latest selected release and verifies the returned version',{skip:!powershell||!fs.existsSync(powershell)},()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'emma-latest-'));
 try{
 fs.mkdirSync(path.join(root,'runtime'));fs.writeFileSync(path.join(root,'runtime','toolchain.json'),JSON.stringify({paths:{node:process.execPath}}));
 fs.writeFileSync(path.join(root,'launcher.mjs'),"if(process.argv.includes('--version'))process.exit(9);console.log(JSON.stringify({version:'9.8.7',cache_refresh:'verified',installed_version:'9.8.7'}));");
 const r=spawnSync(powershell,['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.resolve('scripts/update-kids.ps1'),'-Preview','-InstallRoot',root],{encoding:'utf8',windowsHide:true});
 assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/Emma 9\.8\.7 is installed/);
 }finally{fs.rmSync(root,{recursive:true});}
});
test('task reconciliation preserves timing/principal and selected channel',{skip:!powershell||!fs.existsSync(powershell)},()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'emma-scheduler-channel-'));
 try{
 fs.mkdirSync(path.join(root,'runtime'));fs.mkdirSync(path.join(root,'current/scripts'),{recursive:true});
 fs.writeFileSync(path.join(root,'runtime','toolchain.json'),JSON.stringify({paths:{node:process.execPath}}));
 fs.writeFileSync(path.join(root,'current/scripts/toolchain.mjs'),'');fs.writeFileSync(path.join(root,'launcher.mjs'),'');
 for(const [initial,channel,expected] of [['','preview',true],[' --preview','',true],[' --preview','stable',false],['','',false]]){
 const quote=s=>"'"+s.replaceAll("'","''")+"'";
 const harness=[
 "$script:task = [pscustomobject]@{Actions=@([pscustomobject]@{Arguments='launcher"+initial+"'}); Triggers=@('unchanged-trigger');Settings='unchanged-settings';Principal=[pscustomobject]@{UserId=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value}}",
 "function Get-ScheduledTask { [CmdletBinding()]param($TaskName) return $script:task }",
 "function New-ScheduledTaskAction { param($Execute,$WorkingDirectory,$Argument) [pscustomobject]@{Execute=$Execute;WorkingDirectory=$WorkingDirectory;Arguments=$Argument} }",
 "function New-ScheduledTaskTrigger { param([switch]$Daily,$At,[switch]$AtLogOn,$User) 'default-trigger' }",
 "function New-ScheduledTaskSettingsSet { param([switch]$StartWhenAvailable,$MultipleInstances,$ExecutionTimeLimit) 'default-settings' }",
 "function New-ScheduledTaskPrincipal { param($UserId,$LogonType,$RunLevel) [pscustomobject]@{UserId=$UserId} }",
 "function Register-ScheduledTask { param($TaskName,$Action,$Trigger,$Settings,$Principal,[switch]$Force) $script:task=[pscustomobject]@{Actions=@($Action);Triggers=$Trigger;Settings=$Settings;Principal=$Principal} }",
 ". "+quote(path.resolve('scripts/setup-updates.ps1'))+" -InstallRoot "+quote(root)+(channel?' -Channel '+channel:''),
 "$script:task | ConvertTo-Json -Compress -Depth 6"
 ].join('\n');
 const file=path.join(root,'harness.ps1');fs.writeFileSync(file,harness);
 const r=spawnSync(powershell,['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',file],{encoding:'utf8',windowsHide:true});
 assert.equal(r.status,0,r.stderr);
 const task=JSON.parse(r.stdout.trim().split(/\r?\n/).at(-1));
 assert.equal(task.Actions[0].Arguments.includes('--preview'),expected);
 assert.doesNotMatch(task.Actions[0].Arguments,/--version|--between-sessions/);
 assert.deepEqual(task.Triggers,['unchanged-trigger']);assert.equal(task.Settings,'unchanged-settings');
 }
 }finally{fs.rmSync(root,{recursive:true});}
});
