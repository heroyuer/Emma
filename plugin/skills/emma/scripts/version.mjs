import fs from 'node:fs';
export const PLUGIN_VERSION=JSON.parse(fs.readFileSync(new URL('../../../plugin.json',import.meta.url),'utf8')).version;
