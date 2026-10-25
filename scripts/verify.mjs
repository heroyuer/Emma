import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8')),version=fs.readFileSync('VERSION','utf8').trim(),manifest=j('plugin/plugin.json');
assert.equal(manifest.version,version);assert.equal(j('package.json').version,version);assert.equal(j('release.json').version,version);assert.equal(manifest.name,'emma');
assert.equal(manifest.$schema,'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');assert.ok(manifest.extensions['com.openai'].interface.shortDescription.length<=30);
assert.equal(j('plugin/.app.json').apps['google-drive'].id,'connector_5f3c8c41a1e54ad7a76272c89e2554fa');assert.ok(!fs.existsSync('plugin/mcp.json'));assert.ok(!fs.existsSync('plugin/.mcp.json'));
for(const p of ['logo','composerIcon'])assert.ok(fs.existsSync(path.join('plugin',manifest.extensions['com.openai'].interface[p])));
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
for(const p of walk('plugin')){assert.ok(!fs.lstatSync(p).isSymbolicLink());if(!p.endsWith('.png'))assert.doesNotMatch(fs.readFileSync(p,'utf8'),/asdk_app_sites_|family-english-coach\.chalkydog12|mcp__.*z_english_coach/);}
const cr=j('docs/changes/index.json').changes[0];assert.ok(fs.readFileSync(cr.path,'utf8').includes('Document revision: '+cr.revision));assert.ok(fs.readFileSync('CHANGELOG.md','utf8').includes(cr.id));
console.log(JSON.stringify({version,status:'package_checks_passed',host_installation:'not_proven_by_validation'}));
