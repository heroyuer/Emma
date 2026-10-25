import {update} from './client.mjs';
try{const args=process.argv.slice(2),value=x=>{const i=args.indexOf(x);return i<0?undefined:args[i+1];};console.log(JSON.stringify(update({root:value('--root'),preview:args.includes('--preview'),betweenSessions:args.includes('--between-sessions')})));}catch(e){console.error(JSON.stringify({status:'update_failed',message:e.message}));process.exitCode=1;}
