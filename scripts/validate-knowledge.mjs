import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createKnowledge} from '../src/knowledge.js';
import {AtlasStore} from '../src/store.js';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../data.js',import.meta.url),'utf8');const context=vm.createContext({});vm.runInContext(source+'\nthis.legacy=ATLAS_DATA;',context);const legacy=context.legacy;
const k=createKnowledge(legacy);
for(const n of k.nodes.values()){
 if(n.parent)assert.ok(k.nodes.has(n.parent),`Missing parent for ${n.id}`);
 const visited=new Set();let current=n;while(current){assert.ok(!visited.has(current.id),`Containment cycle at ${n.id}`);visited.add(current.id);current=k.nodes.get(current.parent)}
}
for(const r of k.relations){assert.ok(k.nodes.has(r.from)&&k.nodes.has(r.to),'Dangling relation');assert.ok(['contains','related','appliesTo','prerequisite'].includes(r.type))}
assert.equal(legacy.skills.filter(s=>k.nodes.get(s.id)?.legacyId===s.id).length,50);
assert.equal(k.children('universe').length,7);assert.equal(k.ancestors('rank').map(n=>n.id).join('/'),'universe/mathematics/linear-algebra/rank');
const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
const store=new AtlasStore(legacy),rank=k.nodes.get('rank');assert.equal(store.get(rank).rating,null);store.bookmark(rank);assert.equal(store.get(rank).rating,null);
store.save(rank,{...store.get(rank),rating:2,note:'A private note',state:'active',evidence:['An experiment']});const backup=store.export();const restored=new AtlasStore(legacy);restored.import(backup,new Set(k.nodes.keys()));assert.equal(restored.get(rank).note,'A private note');assert.equal(restored.get(rank).rating,2);
const java=k.nodes.get('java');restored.save(java,{...restored.get(java),rating:4,note:'Legacy interop',state:'explored'});assert.equal(JSON.parse(storage.get('tech-atlas-v2')).overrides.java.mastery,4);
const before=JSON.stringify([restored.old,restored.personal]);assert.throws(()=>restored.import({format:'atlas-universe',version:1,legacy:{overrides:{}},personal:null},new Set(k.nodes.keys())));assert.equal(JSON.stringify([restored.old,restored.personal]),before);
console.log(`PASS: ${k.nodes.size} unique knowledge entries; ${k.relations.length} typed relations; valid ancestry; 50 legacy IDs; unrated bookmarks; local record/backup round trip; failed import leaves records unchanged.`);
