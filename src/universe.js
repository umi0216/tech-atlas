import {createKnowledge} from './knowledge.js';
import {AtlasStore} from './store.js';
import {KnowledgeSpace} from './space.js';
const legacy=globalThis.ATLAS_LEGACY;
const knowledge=createKnowledge(legacy),store=new AtlasStore(legacy);
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KIND={discipline:'学科',branch:'分支',concept:'概念'};
const STATE={unrated:'尚未评价',future:'想要探索',active:'正在探索',explored:'已经涉足'};
let currentView='universe',scope='universe',readerId=null,personalFilter='bookmarked',renderedScope=null,toastTimer,previousView='universe';
let catalogQuery='',catalogField='all',searchQuery='',returnFocus=null;
$('#openSearch kbd').textContent=/Mac|iPhone|iPad/.test(navigator.platform)?'⌘ K':'Ctrl K';
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let motionPreference='on';try{motionPreference=localStorage.getItem('tech-atlas-motion')||'on'}catch{}
let motionEnabled=!systemMotion.matches&&motionPreference!=='off';
const toast=message=>{const el=$('#universeToast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3100)};
const colorOf=node=>node.color||knowledge.rootOf(node.id).color||'#b6a3df';
const canEnter=node=>knowledge.children(node.id).length>0;
const fieldOf=node=>knowledge.rootOf(node.id);
const pathname=()=>location.hash.slice(1).split('?')[0]||'/universe';
function go(view,id,params=''){const target=`#/${view}${id&&id!=='universe'?'/'+encodeURIComponent(id):''}${params}`;if(location.hash===target)route();else location.hash=target}
function openNode(id,locate=false){const node=knowledge.nodes.get(id);if(!node)return;if(canEnter(node)){go('universe',id);return}const base=locate?`/universe/${node.parent}`:pathname();const target=`#${base}?node=${encodeURIComponent(id)}`;if(location.hash===target)route();else location.hash=target}
function clearReaderRoute(){if(location.hash.includes('?node=')){history.replaceState(null,'',location.pathname+location.search+'#'+pathname());readerId=null}}
function mini(node){const children=knowledge.children(node.id);return node.kind==='discipline'?`${children.length} 个分支 · ${node.en}`:node.kind==='branch'?(children.length?`${children.length} 个知识节点`:'方向索引 · 等待继续生长'):(node.legacyId?'个人技术档案':'概念起点')}
function nodeCard(node){const field=fieldOf(node),progress=store.get(node);const meta=knowledge.ancestors(node.id).slice(1,-1).map(n=>n.title).join(' / ')||KIND[node.kind];return `<button class="index-card" data-open="${escape(node.id)}" style="--node-color:${colorOf(node)}"><span class="index-meta"><i></i>${escape(meta)}</span><h3>${escape(node.title)}</h3><p>${escape(node.summary)}</p><span class="index-arrow" aria-hidden="true">↗</span>${progress.bookmarked?'<span class="index-tag">✧ 已收藏</span>':progress.note?'<span class="index-tag">有个人笔记</span>':node.outline?'<span class="index-tag">方向索引</span>':''}</button>`}
function bindNodes(host){host.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openNode(b.dataset.open)));}
let scene;
try{scene=new KnowledgeSpace($('#spaceViewport'),$('#spaceLabels'),id=>openNode(id),ready=>{if(!ready){$('#sceneHint').textContent='使用学科入口继续探索';$('#sceneZoomIn').disabled=true;$('#sceneZoomOut').disabled=true}})}catch(error){$('#sceneHint').textContent='使用下方学科入口探索';console.warn('Spatial renderer unavailable; directory remains available.',error)}
function renderScope(){const node=knowledge.nodes.get(scope)||knowledge.nodes.get('universe'),children=knowledge.children(node.id);const isRoot=node.id==='universe';
 $('#scopeEyebrow').textContent=isRoot?'A HOME FOR HUMAN CURIOSITY':node.en||`${fieldOf(node).en} / EXPLORING`;
 if(isRoot)$('#universeTitle').innerHTML='世界很大，<br><em>好奇心有坐标。</em>';else $('#universeTitle').textContent=node.title;
 $('#scopeDescription').innerHTML=isRoot?'从一个问题出发，走向彼此相连的知识。<br>在这里，慢慢建立你对世界的理解。':escape(node.summary);
 $('#scopeCount').textContent=isRoot?'七个学科入口，更多联系正在生长':`${children.length} 个${children.some(n=>n.kind==='concept')?'知识节点':'分支入口'} · ${knowledge.descendants(node.id).length} 个已收录条目`;
 $('#heroAction').textContent=isRoot?'从数学开始探索 ↗':children.some(n=>n.kind==='concept')?'打开第一个概念 ↗':'继续深入探索 ↗';
 $('#heroAction').onclick=()=>openNode(isRoot?'mathematics':children[0]?.id||node.id);
 $('#fieldsTitle').innerHTML=(isRoot?'世界的不同切面':`${escape(node.title)}，继续展开`)+`<span>✦</span>`;
 $('#fieldsEyebrow').textContent=isRoot?'THE FIELDS OF KNOWLEDGE':'GO A LITTLE DEEPER';
 $('#fieldsDescription').textContent=isRoot?'选择一个方向，让好奇心继续深入。':'选择分支或概念，在自己的节奏里继续。';
 $('#fieldGrid').innerHTML=children.map((n,i)=>`<button class="field-card ${n.kind==='concept'?'concept-card':''}" style="--node-color:${colorOf(n)}" data-open="${n.id}"><span class="field-glyph" aria-hidden="true">${escape(n.glyph||(n.kind==='concept'?'✧':String(i+1).padStart(2,'0')))}</span><span class="field-copy"><strong>${escape(n.title)}</strong><small>${escape(n.kind==='discipline'?n.en:mini(n))}</small></span><span class="field-arrow" aria-hidden="true">↗</span></button>`).join('')+(isRoot?'<div class="invitation-card"><span aria-hidden="true">＋</span><p>世界仍在展开<br>为下一份好奇留白</p></div>':'');bindNodes($('#fieldGrid'));
 const trail=knowledge.ancestors(node.id);$('#spaceBreadcrumb').innerHTML=trail.map((n,i)=>`${i?'<span class="crumb-divider" aria-hidden="true">/</span>':''}${i===trail.length-1?`<span ${i===0?'class="crumb-home"':''}>${i===0?'✧ ':''}${escape(n.title)}</span>`:`<button data-crumb="${n.id}" ${i===0?'class="crumb-home"':''}>${i===0?'✧ ':''}${escape(n.title)}</button>`}`).join('');
 $$('[data-crumb]').forEach(b=>b.addEventListener('click',()=>go('universe',b.dataset.crumb)));
 if(renderedScope!==node.id){scene?.setScope(node.id,children.map(n=>({...n,color:colorOf(n),meta:mini(n)})));renderedScope=node.id}
 document.title=isRoot?'TECH ATLAS · 知识宇宙':`${node.title} · TECH ATLAS`;
}
function renderCatalog(){const q=catalogQuery.trim().toLocaleLowerCase();const list=[...knowledge.nodes.values()].filter(n=>n.kind!=='universe'&&(catalogField==='all'||fieldOf(n).id===catalogField)&&(n.title+' '+(n.en||'')+' '+n.summary+' '+knowledge.ancestors(n.id).map(x=>x.title).join(' ')).toLocaleLowerCase().includes(q));
 $('#catalogGrid').innerHTML=list.map(nodeCard).join('');$('#catalogSummary').textContent=`${list.length} 个已收录条目 · 包括学科、分支与概念`;
 $('#catalogEmpty').hidden=list.length>0;bindNodes($('#catalogGrid'));
}
function renderPersonal(){const nodes=[...knowledge.nodes.values()].filter(n=>n.kind!=='universe');const bookmarks=nodes.filter(n=>store.get(n).bookmarked),notes=nodes.filter(n=>store.get(n).note),active=nodes.filter(n=>store.get(n).state==='active');
 $('#personalStats').innerHTML=[['收藏的知识',bookmarks.length,'个'],['正在探索',active.length,'个'],['留下的笔记',notes.length,'篇']].map(([title,count,unit])=>`<div class="personal-stat"><span>${title}</span><strong>${count}<small>${unit}</small></strong></div>`).join('');
 const list=personalFilter==='bookmarked'?bookmarks:personalFilter==='active'?active:notes;
 $('#personalGrid').innerHTML=list.map(nodeCard).join('');bindNodes($('#personalGrid'));$('#personalEmpty').hidden=list.length>0;
 $('#personalEmpty').querySelector('h2').textContent=personalFilter==='notes'?'把现在的理解，留给未来的自己':personalFilter==='active'?'选择一个想深入的问题':'给下一次好奇，留一个位置';
 $('#personalEmpty').querySelector('p').innerHTML=personalFilter==='notes'?'在任意知识条目中写下笔记并保存。<br>你的理解可以随着学习不断修订。':personalFilter==='active'?'在知识条目中把状态设为“正在探索”。<br>每次专注于一点，也会慢慢连成一片。':'打开任意知识条目，点击“收藏”。<br>它会出现在这里，等你有空时继续。';
}
function sourceFor(node){if(node.source)return knowledge.sources[node.source];const parent=knowledge.nodes.get(node.parent);return parent?.source?knowledge.sources[parent.source]:null}
function renderReader(id){const node=knowledge.nodes.get(id);if(!node)return;readerId=id;const p=store.get(node),field=fieldOf(node),source=sourceFor(node),children=knowledge.children(id);const related=knowledge.relations.filter(r=>r.type!=='contains'&&(r.from===id||r.to===id)).map(r=>({node:knowledge.nodes.get(r.from===id?r.to:r.from),relation:r}));
 $('#readerBreadcrumb').textContent=knowledge.ancestors(id).slice(1,-1).map(n=>n.title).join(' / ')||'知识宇宙';
 const formula={'linear-map':'T(au + bv) = aT(u) + bT(v)',rank:'rank(A) = dim Col(A)',svd:'A = UΣVᵀ',eigenvalues:'Av = λv,  v ≠ 0',derivative:"f′(x) = limₕ→₀ [f(x+h) − f(x)] / h",'conditional-probability':'P(A|B) = P(A ∩ B) / P(B)'}[id];
 const summarySections=node.paragraphs?`<section class="reader-section"><h3><span class="article-number">01</span>理解这个概念</h3>${node.paragraphs.map(t=>`<p>${escape(t)}</p>`).join('')}${formula?`<div class="reader-formula">${escape(formula)}</div>`:''}</section>`:node.outline?'<section class="reader-section"><h3>一个可以继续生长的方向</h3><p>这里先建立学科的位置与连接。后续会逐步补充概念、解释、原始资料和可以亲手完成的练习。</p><p>你现在可以收藏这个方向，或者先记录想要解决的问题。</p></section>':'';
 $('#readerContent').innerHTML=`<span class="reader-kicker">${escape(field.en||'THE ATLAS')} / ${KIND[node.kind]||'KNOWLEDGE'}</span><div class="reader-header"><h2 id="readerTitle">${escape(node.title)}</h2><button class="bookmark-button" id="bookmarkNode" aria-pressed="${!!p.bookmarked}">${p.bookmarked?'✧ 已收藏':'＋ 收藏'}</button></div><p class="reader-summary">${escape(node.summary)}</p>${summarySections}${node.exercise?`<section class="reader-section"><h3><span class="article-number">02</span>亲手验证一次</h3><p>${escape(node.exercise)}</p></section>`:''}${children.length?`<section class="reader-section"><h3>继续深入</h3><div class="reader-subnodes">${children.map(n=>`<button data-reader-open="${n.id}">${escape(n.title)} <span>↗</span></button>`).join('')}</div></section>`:''}${related.length?`<section class="reader-section"><h3>知识的另一端</h3><div class="reader-chips">${related.map(({node:n,relation:r})=>`<button data-reader-open="${n.id}" title="${escape(r.label||'相关概念')}">${escape(n.title)} ↗</button>`).join('')}</div><p class="editorial-note">这些联系帮助探索，不表示固定的必修顺序。</p></section>`:''}${source?`<section class="reader-section"><h3>继续阅读</h3><a class="reader-source" href="${escape(source.url)}" target="_blank" rel="noreferrer">${escape(source.title)} <span>↗</span></a><p class="editorial-note">链接通往原始资料。本站概念起点为独立整理，后续持续修订；不替代完整课程。</p></section>`:node.legacyId?`<section class="reader-section"><h3>技术成长档案</h3><p>等级沿用原版技术星图的自评示例及本地修改，可继续修订。</p><a class="reader-source" href="./legacy.html#node=${encodeURIComponent(id)}">打开原有技术档案与成长航线 <span>↗</span></a></section>`:''}<section class="reader-section"><h3>留下自己的理解</h3><form class="note-form" id="recordForm"><div class="note-row"><label>掌握程度<select id="recordRating" aria-label="掌握程度">${(node.legacyId?[]:[['','尚未评价']]).concat([[0,'L0 · 尚未学习'],[1,'L1 · 初步认知'],[2,'L2 · 实践入门'],[3,'L3 · 独立应用'],[4,'L4 · 深入掌握'],[5,'L5 · 专业深耕']]).map(([v,title])=>`<option value="${v}" ${p.rating===null&&v===''||p.rating!==null&&Number(v)===p.rating&&v!==''?'selected':''}>${title}</option>`).join('')}</select></label><label>探索状态<select id="recordState" aria-label="探索状态">${Object.entries(STATE).filter(([v])=>!node.legacyId||v!=='unrated').map(([v,title])=>`<option value="${v}" ${p.state===v?'selected':''}>${title}</option>`).join('')}</select></label></div><label for="recordNote">我的笔记</label><textarea id="recordNote" maxlength="3000" placeholder="用自己的话解释，写下还没有理解的问题…">${escape(p.note)}</textarea><label for="recordEvidence" style="margin-top:16px">实践证据 · 每行一条</label><textarea id="recordEvidence" maxlength="3000" style="min-height:76px" placeholder="实验结果、项目记录，或者一次亲手验证…">${escape(p.evidence.join('\n'))}</textarea><button class="soft-button" type="submit">保存我的记录 <span>↗</span></button><p class="note-help">保存在当前浏览器。阅读与收藏不会自动提升掌握度；换设备前可导出备份。</p></form></section>`;
 $('#bookmarkNode').addEventListener('click',()=>{const okay=store.bookmark(node);const active=store.get(node).bookmarked;$('#bookmarkNode').setAttribute('aria-pressed',String(active));$('#bookmarkNode').textContent=active?'✧ 已收藏':'＋ 收藏';toast(okay?(active?'已收藏，等待下一次好奇':'已移出收藏'):store.warning)});
 $$('[data-reader-open]').forEach(b=>b.addEventListener('click',()=>openNode(b.dataset.readerOpen,true)));
 $('#recordForm').addEventListener('submit',e=>{e.preventDefault();const rating=$('#recordRating').value;const okay=store.save(node,{...store.get(node),rating:rating===''?null:Number(rating),state:$('#recordState').value,note:$('#recordNote').value.slice(0,3000),evidence:$('#recordEvidence').value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,30)});toast(okay?'已保存，理解可以继续生长':store.warning)});
 $('#readerContent').scrollTop=0;
 if(!$('#readerDialog').open){returnFocus=document.activeElement;$('#readerDialog').showModal()}
}
function route(){const previousScope=scope;const raw=location.hash.slice(1)||'/universe';const [path,query='']=raw.split('?');const parts=path.split('/').filter(Boolean);const view=['universe','catalog','personal'].includes(parts[0])?parts[0]:'universe';let id;try{id=decodeURIComponent(parts[1]||'universe')}catch{id='universe'}
 if(!knowledge.nodes.has(id)||id!=='universe'&&!canEnter(knowledge.nodes.get(id)))id='universe';
 previousView=currentView;currentView=view;scope=id;
 ['universe','catalog','personal'].forEach(v=>$('#'+v+'Page').hidden=v!==view);
 $$('.primary-nav a').forEach(a=>{if(a.dataset.view===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 if(view==='universe')renderScope();if(view==='catalog'){renderCatalog();document.title='知识目录 · TECH ATLAS'}if(view==='personal'){renderPersonal();document.title='我的探索 · TECH ATLAS'}
 const selected=new URLSearchParams(query).get('node');if(selected&&knowledge.nodes.has(selected)){renderReader(selected)}else if($('#readerDialog').open){$('#readerDialog').close();readerId=null}
 if(previousView!==view||(view==='universe'&&previousScope!==scope))window.scrollTo({top:0,behavior:'instant'});
}
function renderSearch(){const q=searchQuery.trim().toLocaleLowerCase();let list;if(!q)list=['mathematics','linear-algebra','rank','life','transformer','lora'].map(id=>knowledge.nodes.get(id));else list=[...knowledge.nodes.values()].filter(n=>n.kind!=='universe'&&(n.title+' '+n.summary+' '+(n.en||'')).toLocaleLowerCase().includes(q)).sort((a,b)=>Number(b.title.toLocaleLowerCase().includes(q))-Number(a.title.toLocaleLowerCase().includes(q))).slice(0,20);
 $('#searchResults').innerHTML=`<p class="search-result-note">${q?`找到 ${list.length}${list.length===20?'+':''} 个结果`:'从这些地方开始'}</p>`+(list.length?list.map(n=>`<button class="search-result" data-search-node="${n.id}"><span><strong>${escape(n.title)}</strong><small>${escape(knowledge.ancestors(n.id).slice(1,-1).map(x=>x.title).join(' / ')||KIND[n.kind])}</small></span><span>↗</span></button>`).join(''):'<p class="search-no-results">还没有收录这个知识，试试另一个关键词。</p>');
 $$('[data-search-node]').forEach(b=>b.addEventListener('click',()=>{$('#searchDialog').close();openNode(b.dataset.searchNode,true)}));
}
function openSearch(){searchQuery='';$('#universalSearch').value='';renderSearch();$('#searchDialog').showModal();$('#universalSearch').focus()}
function applyMotion(){motionEnabled=!systemMotion.matches&&motionPreference!=='off';document.documentElement.dataset.motion=motionEnabled?'on':'off';$('#universeMotion').textContent=motionEnabled?'Ⅱ':'▷';$('#universeMotion').setAttribute('aria-pressed',String(motionEnabled));$('#universeMotion').setAttribute('aria-label',motionEnabled?'暂停动效':'开启动效');$('#universeMotion').title=systemMotion.matches?'遵循系统减少动态效果':motionEnabled?'暂停动效':'开启动效';$('#universeMotion').disabled=systemMotion.matches;scene?.setMotion(motionEnabled)}
$('#universeMotion').addEventListener('click',()=>{motionPreference=motionEnabled?'off':'on';try{localStorage.setItem('tech-atlas-motion',motionPreference)}catch{}applyMotion()});systemMotion.addEventListener('change',applyMotion);
$('#openSearch').addEventListener('click',openSearch);$('#universalSearch').addEventListener('input',e=>{searchQuery=e.target.value;renderSearch()});$('#universalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#searchResults [data-search-node]')?.click()}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!$('#searchDialog').open&&!$('#readerDialog').open)openSearch()}});
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
for(const dialog of [$('#searchDialog'),$('#readerDialog')])dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
$('#readerDialog').addEventListener('close',()=>{clearReaderRoute();if(returnFocus?.isConnected)returnFocus.focus();renderPersonal()});
$('#sceneZoomOut').addEventListener('click',()=>scene?.zoom(1.15));$('#sceneZoomIn').addEventListener('click',()=>scene?.zoom(.87));$('#sceneReset').addEventListener('click',()=>scene?.reset());
$$('[data-route]').forEach(b=>b.addEventListener('click',()=>{go('universe',b.dataset.route);window.scrollTo({top:0,behavior:motionEnabled?'smooth':'instant'})}));$$('[data-personal]').forEach(b=>b.addEventListener('click',()=>go('personal')));
knowledge.children('universe').forEach(n=>{const option=document.createElement('option');option.value=n.id;option.textContent=n.title;$('#catalogField').append(option)});
$('#catalogSearch').addEventListener('input',e=>{catalogQuery=e.target.value;renderCatalog()});$('#catalogField').addEventListener('change',e=>{catalogField=e.target.value;renderCatalog()});$('#clearCatalog').addEventListener('click',()=>{catalogQuery='';catalogField='all';$('#catalogSearch').value='';$('#catalogField').value='all';renderCatalog()});
$$('[data-personal-filter]').forEach(b=>b.addEventListener('click',()=>{personalFilter=b.dataset.personalFilter;$$('[data-personal-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});renderPersonal()}));
$('#newExport').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(store.export(),null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`atlas-universe-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('已导出知识宇宙备份，包含原有技术档案')});
$('#newImport').addEventListener('click',()=>$('#personalImport').click());$('#personalImport').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>3e6)throw new Error('文件超过 3 MB');const payload=JSON.parse(await file.text());if(!confirm('导入将替换备份对应的本地记录。建议先导出当前备份，是否继续？'))return;const okay=store.import(payload,new Set(knowledge.nodes.keys()));toast(okay?'已恢复备份记录':store.warning);renderPersonal();if(readerId)renderReader(readerId)}catch(error){toast(`导入失败：${error.message}`)}finally{e.target.value=''}});
store.listeners.add(()=>{if(currentView==='personal')renderPersonal();if(currentView==='catalog')renderCatalog()});
window.addEventListener('storage',e=>{if(['tech-atlas-v2','atlas-personal-v1'].includes(e.key)){store.read();if(currentView==='personal')renderPersonal();if(currentView==='catalog')renderCatalog()}});
document.addEventListener('visibilitychange',()=>{document.documentElement.toggleAttribute('data-page-hidden',document.hidden)});
window.addEventListener('hashchange',route);applyMotion();route();
