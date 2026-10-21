/** Local persistence adapter. Public content is never written here. */
export class AtlasStore {
 constructor(legacy){this.legacy=legacy;this.listeners=new Set();this.warning='';this.read();}
 read(){
  const get=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}};
  const old=get('tech-atlas-v2',{version:2,overrides:{},milestones:{}});
  this.old=old.version===2&&old.overrides&&typeof old.overrides==='object'&&!Array.isArray(old.overrides)?old:{version:2,overrides:{},milestones:{}};
  const current=get('atlas-personal-v1',{});
  this.personal={version:1,records:current.records&&typeof current.records==='object'&&!Array.isArray(current.records)?current.records:{}};
 }
 notify(){this.listeners.forEach(fn=>fn())}
 write(){try{localStorage.setItem('tech-atlas-v2',JSON.stringify(this.old));localStorage.setItem('atlas-personal-v1',JSON.stringify(this.personal));this.warning='';this.notify();return true}catch{this.warning='浏览器存储不可用，请立即导出备份。';this.notify();return false}}
 get(node){const personal=this.personal.records[node.id]||{};if(node.legacyId){const base=this.legacy.skills.find(s=>s.id===node.legacyId);const old={...base,...this.old.overrides[node.legacyId]};return {rating:old.mastery,state:old.status,note:old.note||'',evidence:old.evidence||[],...personal}}return {rating:null,state:'unrated',note:'',evidence:[],bookmarked:false,...personal}}
 save(node,next){
  if(node.legacyId){const old=this.old.overrides[node.legacyId]||{},base=this.legacy.skills.find(s=>s.id===node.legacyId);this.old.overrides[node.legacyId]={...old,mastery:next.rating===null?(old.mastery??base.mastery):next.rating,status:next.state==='unrated'?(old.status||base.status):next.state,priority:old.priority||base.priority,note:next.note,evidence:next.evidence};}
  const old=this.personal.records[node.id]||{};
  this.personal.records[node.id]={...old,...next,updatedAt:new Date().toISOString()};
  // Existing skills remain authoritative in the original storage format.
  if(node.legacyId)for(const key of ['rating','state','note','evidence'])delete this.personal.records[node.id][key];
  return this.write();
 }
 bookmark(node){return this.save(node,{...this.get(node),bookmarked:!this.get(node).bookmarked})}
 export(){return {format:'atlas-universe',version:1,exportedAt:new Date().toISOString(),legacy:{...this.old,format:'tech-atlas'},personal:this.personal}}
 import(payload,validIds){
  if(!payload||typeof payload!=='object')throw new Error('备份格式不正确');
  const isOld=payload.format==='tech-atlas'&&payload.version===2;
  const isNew=payload.format==='atlas-universe'&&payload.version===1;
  if(!isOld&&!isNew)throw new Error('请选择知识宇宙或原版技术星图的 JSON 备份');
  const old=isOld?payload:payload.legacy;
  if(!old||!old.overrides||typeof old.overrides!=='object'||Array.isArray(old.overrides))throw new Error('缺少有效的技术档案备份');
  const overrides={};const safeState=x=>['explored','active','future'].includes(x)?x:'future';
  for(const base of this.legacy.skills){const o=old.overrides[base.id];if(!o||typeof o!=='object')continue;overrides[base.id]={mastery:Math.max(0,Math.min(5,Math.round(Number(o.mastery)||0))),status:safeState(o.status),priority:['now','parallel','later'].includes(o.priority)?o.priority:'later',note:String(o.note||'').slice(0,3000),evidence:Array.isArray(o.evidence)?o.evidence.slice(0,30).map(x=>String(x).slice(0,160)):[]}}
  const milestones={};for(const m of this.legacy.milestones) m.checks.forEach((_,i)=>{const k=`${m.id}:${i}`;if(old.milestones?.[k]===true)milestones[k]=true});
  let records=this.personal.records;
  if(isNew){if(!payload.personal||payload.personal.version!==1||!payload.personal.records||typeof payload.personal.records!=='object'||Array.isArray(payload.personal.records))throw new Error('缺少有效的个人记录备份');records={};for(const [id,r] of Object.entries(payload.personal.records)){if(!validIds.has(id)||!r||typeof r!=='object')continue;records[id]={rating:r.rating===null?null:Math.max(0,Math.min(5,Math.round(Number(r.rating)||0))),state:['unrated','future','active','explored'].includes(r.state)?r.state:'unrated',note:String(r.note||'').slice(0,3000),evidence:Array.isArray(r.evidence)?r.evidence.slice(0,30).map(x=>String(x).slice(0,160)):[],bookmarked:r.bookmarked===true,updatedAt:typeof r.updatedAt==='string'?r.updatedAt:''};if(this.legacy.skills.some(s=>s.id===id))for(const key of ['rating','state','note','evidence'])delete records[id][key]}}
  this.old={version:2,overrides,milestones};this.personal={version:1,records};return this.write();
 }
}
