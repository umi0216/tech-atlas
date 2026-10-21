(() => {
  'use strict';
  const KEY = 'tech-atlas-v2';
  const DATA = ATLAS_DATA;
  const LEVELS = [
    ['L0 · 未涉足','尚未系统学习；仍在技术地图的远方。'],
    ['L1 · 初步认知','能解释用途、原理轮廓和常见应用场景。'],
    ['L2 · 实践入门','能参考文档跑通最小示例和基础操作。'],
    ['L3 · 独立应用','能独立用于真实项目，并排查常见故障。'],
    ['L4 · 深入掌握','理解内部机制，能处理复杂问题与架构取舍。'],
    ['L5 · 专业深耕','能进行深度优化、机制改进与技术创新。']
  ];
  const STATUS = {explored:'已涉足',active:'正在攻占',future:'尚未涉足'};
  const PRI = {now:'当下重点',parallel:'并行积累',later:'后续探索'};
  const domainById = Object.fromEntries(DATA.domains.map(d=>[d.id,d]));
  const baseById = Object.fromEntries(DATA.skills.map(s=>[s.id,s]));
  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  let saved = {version:2,overrides:{},milestones:{}};
  try {
    const existing = JSON.parse(localStorage.getItem(KEY)||'null');
    if(existing && existing.version===2 && typeof existing.overrides==='object') saved={...saved,...existing};
  } catch(e){ /* no local storage */ }
  let currentView='universe', selectedDomain='all', selectedStatus='all', catalogDomain='all', search='', selectedSkill=null, selectedMilestone=null;
  let camera={x:0,y:0,s:1}, dragging=null, toastTimer=null, showAllEdges=false, previousFocus=null;
  let cameraFrame=0, cameraGoal=null, cameraPositioned=false;
  const svgNS='http://www.w3.org/2000/svg';
  const svg = $('#cosmosSvg');
  const world = $('#universeWorld');
  const stage = $('#mapStage');
  const skillIds = new Set(DATA.skills.map(s=>s.id));
  const getSkill = id=>baseById[id] ? {...baseById[id], ...(saved.overrides[id] || {})} : null;
  const skills = ()=>DATA.skills.map(s=>getSkill(s.id));
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(saved));}catch(e){toast('本地存储不可用，请使用导出 JSON 备份。');}};
  const ns=(tag,attrs={},parent)=>{const e=document.createElementNS(svgNS,tag); for(const [k,v] of Object.entries(attrs)){if(v!==null && v!==undefined)e.setAttribute(k,String(v));} if(parent)parent.appendChild(e);return e;};
  const label=(x,y,t,attr={},parent=world)=>{const e=ns('text',{x,y,...attr},parent);e.textContent=t;return e;};
  const colorOf=(s)=>domainById[s.domain].color;
  function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2700)}

  // Coordinates encode fields, never proficiency or a mandatory learning order.
  const layout=[[-600,-205],[-190,-205],[220,-205],[-600,205],[-190,205],[220,205],[635,0]];
  const galaxyPos=Object.fromEntries(DATA.domains.map((d,i)=>[d.id,{x:layout[i][0],y:layout[i][1]}]));
  const nodePos={};
  DATA.domains.forEach(d=>{
    DATA.skills.filter(s=>s.domain===d.id).forEach((s,i)=>{
      const p=galaxyPos[d.id];
      nodePos[s.id]={x:p.x+[-169,24,-141,49,-173,10,-120,61][i%8],y:p.y+[-64,-39,-5,19,58,79,122,139][i%8]};
    });
  });
  const summaryWorld=ns('g',{id:'mobileOverview',style:'display:none'},svg);
  function renderMobileOverview(){
    const summary=stage.clientWidth<600&&selectedDomain==='all'&&!search&&camera.s<.35;
    world.style.display=summary?'none':'';summaryWorld.style.display=summary?'':'none';
    $('#zoomIn').disabled=summary;$('#zoomOut').disabled=summary;
    if(!summary)return;
    summaryWorld.replaceChildren();
    const w=stage.clientWidth,h=stage.clientHeight;
    const points=DATA.domains.map((d,i)=>({d,x:i===6?w*.5:w*(i%2===0?.26:.74),y:70+Math.floor(i/2)*(h-170)/3}));
    const spine=ns('path',{d:`M ${points[0].x} ${points[0].y} Q ${w*.5} ${h*.5} ${points[6].x} ${points[6].y}`,fill:'none',stroke:'#80a89d','stroke-opacity':'.14','stroke-width':1},summaryWorld);
    points.forEach(({d,x,y},i)=>{
      const g=ns('g',{role:'button',tabindex:0,'data-domain':d.id,'aria-label':`查看${d.name}星系`,class:'mobile-summary-domain'},summaryWorld);
      if(i%2===1)ns('path',{d:`M ${points[i-1].x} ${y} Q ${w*.5} ${y-20} ${x} ${y}`,fill:'none',stroke:d.color,'stroke-opacity':'.16'},summaryWorld);
      ns('circle',{cx:x,cy:y,r:22,fill:d.color,'fill-opacity':'.05',stroke:d.color,'stroke-opacity':'.2'},g);
      ns('circle',{cx:x,cy:y,r:22,fill:'none',stroke:d.color,class:'summary-pulse','aria-hidden':'true',style:`--pulse-delay:-${i*.7}s`},g);
      ns('circle',{cx:x,cy:y,r:6,fill:d.color,'fill-opacity':'.8'},g);
      label(x,y+43,d.name,{'text-anchor':'middle','font-size':12,fill:'#b7cbd1'},g);
      label(x,y+63,`${DATA.skills.filter(s=>s.domain===d.id).length} 个知识节点`,{'text-anchor':'middle','font-size':10,fill:'#718c9a'},g);
      ns('rect',{x:x-75,y:y-30,width:150,height:100,rx:10,fill:'transparent'},g);
      g.addEventListener('click',()=>selectDomain(d.id));
      g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectDomain(d.id)}});
    });
  }
  function stat(){const all=skills();return {count:all.length,explored:all.filter(s=>s.status==='explored').length,active:all.filter(s=>s.status==='active').length,future:all.filter(s=>s.status==='future').length,domains:DATA.domains.length}}
  function renderStats(){const s=stat();const items=[['已建立的知识节点',s.count,'颗星体','✧'],['已经涉足',s.explored,'学习或应用过','◈'],['正在攻占',s.active,'当前推进中的领域','⌁'],['尚未涉足',s.future,'下一程的目的地','◇']];$('#statsRow').innerHTML=items.map(x=>`<div class="stat-card"><div class="stat-top">${x[0]}<span class="stat-glyph">${x[3]}</span></div><div class="stat-number">${x[1]}<small>节点</small></div><div class="stat-sub">${x[2]}</div></div>`).join('');}
  function renderSidebar(){const s=skills();$('#allDomainsBtn').classList.toggle('active',selectedDomain==='all');$('#domainNav').innerHTML=DATA.domains.map(d=>`<button type="button" class="domain-btn ${selectedDomain===d.id?'active':''}" data-domain-nav="${d.id}" style="--domain-color:${d.color}"><span class="domain-dot"></span>${d.name}<span class="domain-count">${s.filter(x=>x.domain===d.id).length.toString().padStart(2,'0')}</span></button>`).join('');$$('[data-domain-nav]').forEach(btn=>btn.addEventListener('click',()=>{selectedDomain=btn.dataset.domainNav;selectedStatus='all';switchView('universe');renderAll();focusDomain(selectedDomain)}));}
  function setCamera(){
    world.setAttribute('transform',`translate(${camera.x.toFixed(2)} ${camera.y.toFixed(2)}) scale(${camera.s.toFixed(4)})`);
    // Keep text legible in the overview; avoid making it huge when zoomed in.
    const size=clamp(12.5/camera.s,14,24);
    world.querySelectorAll('.skill-label').forEach(t=>t.setAttribute('font-size',size));
    world.querySelectorAll('.galaxy-title').forEach(t=>t.setAttribute('font-size',clamp(15/camera.s,21,28)));
    world.querySelectorAll('.galaxy-kicker').forEach(t=>t.setAttribute('font-size',clamp(8/camera.s,10,14)));
    world.querySelectorAll('.galaxy-number').forEach(t=>t.setAttribute('font-size',clamp(10/camera.s,12,17)));
    renderMobileOverview();
  }
  // The camera always stores the currently drawn position, so a new drag can
  // interrupt a transition without jumping to its old destination.
  function stopCameraMotion(){cancelAnimationFrame(cameraFrame);cameraFrame=0;cameraGoal=null;stage.removeAttribute('data-camera-moving')}
  function moveCamera(next){
    stopCameraMotion();
    if(!cameraPositioned||document.documentElement.dataset.motion!=='on'||document.hidden){camera=next;cameraPositioned=true;setCamera();return}
    const from={...camera},begin=performance.now();cameraGoal=next;stage.dataset.cameraMoving='true';
    const frame=now=>{
      const t=Math.min((now-begin)/560,1),ease=1-Math.pow(1-t,3);
      camera={x:from.x+(next.x-from.x)*ease,y:from.y+(next.y-from.y)*ease,s:from.s+(next.s-from.s)*ease};setCamera();
      if(t<1)cameraFrame=requestAnimationFrame(frame);else{cameraFrame=0;cameraGoal=null;stage.removeAttribute('data-camera-moving')}
    };
    cameraFrame=requestAnimationFrame(frame);
  }
  function fitView(){const w=stage.clientWidth,h=stage.clientHeight;moveCamera({s:Math.min((w-66)/1650,(h-100)/810),x:w/2-25,y:h/2-8})}
  function focusDomain(id){const p=galaxyPos[id];if(!p)return;const w=stage.clientWidth,h=stage.clientHeight,s=clamp(Math.min((w-65)/420,(h-90)/370),.55,1.55);moveCamera({s,x:w/2-(p.x+17)*s,y:h/2-(p.y-12)*s})}
  function finishCameraMotion(){if(!cameraGoal)return;const next=cameraGoal;stopCameraMotion();camera=next;setCamera()}
  window.addEventListener('atlas:motionchange',e=>{if(!e.detail.enabled)finishCameraMotion()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finishCameraMotion()});
  function showRelated(a,b){return selectedSkill&&(a===selectedSkill||b===selectedSkill)}
  function eligible(s){return (selectedDomain==='all'||s.domain===selectedDomain)&&(selectedStatus==='all'||s.status===selectedStatus)&&(!search||(`${s.name} ${s.detail} ${domainById[s.domain].name}`).toLowerCase().includes(search.toLowerCase()))}
  function renderMap(){
    world.replaceChildren();
    DATA.domains.forEach((d,i)=>{
      const p=galaxyPos[d.id], c=d.color;
      const g=ns('g',{'data-galaxy':d.id,opacity:selectedDomain==='all'||selectedDomain===d.id?1:.18},world);
      const grad=ns('radialGradient',{id:`field-${d.id}`},g);ns('stop',{offset:0,'stop-color':c,'stop-opacity':'.07'},grad);ns('stop',{offset:1,'stop-color':c,'stop-opacity':0},grad);ns('ellipse',{cx:p.x,cy:p.y+8,rx:230,ry:200,fill:`url(#field-${d.id})`,class:'galaxy-haze'},g);
      const core=ns('g',{class:'galaxy-core','data-domain':d.id,role:'button',tabindex:'0','aria-label':`查看${d.name}星系`},g);
      ns('rect',{x:p.x-185,y:p.y-166,width:390,height:65,fill:'transparent',rx:8},core);
      label(p.x-169,p.y-142,`0${i+1}`,{class:'galaxy-number'},core);
      label(p.x-128,p.y-142,d.name,{class:'galaxy-title'},core);
      label(p.x-128,p.y-119,d.en,{class:'galaxy-kicker'},core);
      core.addEventListener('click',()=>selectDomain(d.id));
      core.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectDomain(d.id)}});
    });
    const laneCounts={};
    DATA.edges.forEach(([a,b],edgeIndex)=>{
      const pa=nodePos[a],pb=nodePos[b];if(!pa||!pb)return;
      const sa=getSkill(a),sb=getSkill(b),internal=sa.domain===sb.domain;
      const dx=pb.x-pa.x,dy=pb.y-pa.y;
      const curve=internal?16:Math.min(Math.abs(dx)*.1+Math.abs(dy)*.08,85);
      const path=`M ${pa.x} ${pa.y} C ${pa.x+dx*.35} ${pa.y+dy*.25-curve}, ${pb.x-dx*.35} ${pb.y-dy*.25-curve}, ${pb.x} ${pb.y}`;
      ns('path',{d:path,class:'edge',pathLength:1,'data-a':a,'data-b':b,'data-internal':internal?'1':'0'},world);
      // A few moving glints follow real, visible knowledge links; never invent routes.
      if(internal&&eligible(sa)&&eligible(sb)&&sa.status!=='future'&&sb.status!=='future'&&(laneCounts[sa.domain]||0)<2){
        laneCounts[sa.domain]=(laneCounts[sa.domain]||0)+1;
        ns('path',{d:path,class:'idle-lane',pathLength:1,stroke:domainById[sa.domain].color,'aria-hidden':'true','data-a':a,'data-b':b,style:`--lane-duration:${5+edgeIndex%4}s;--lane-delay:-${edgeIndex*.73}s`},world);
      }
    });
    // Small explorer coordinate, deliberately separate from scored skill nodes.
    const origin=ns('g',{opacity:'.7','aria-hidden':'true'},world);
    const orbit=ns('g',{transform:'translate(10 15)'},origin);
    ns('circle',{r:31,class:'explorer-orbit orbit-forward',pathLength:1},orbit);
    ns('circle',{r:39,class:'explorer-wave'},orbit);
    ns('circle',{cx:10,cy:15,r:21,fill:'#172e32','fill-opacity':'.7',stroke:'#7eaca1','stroke-opacity':'.28'},origin);
    ns('path',{d:'M 10 3 L 13 12 L 22 15 L 13 18 L 10 27 L 7 18 L -2 15 L 7 12 Z',fill:'#9dc5ba'},origin);
    label(10,58,'EXPLORER',{class:'main-core-sub','text-anchor':'middle'},origin);
    for(const s of skills()){
      const n=nodePos[s.id],c=colorOf(s),ok=eligible(s),radius=5+s.mastery*1.6;
      const nodeColor=s.status==='active'?'#dfb888':s.status==='future'?'#a89abf':'#8ac9b4';
      const g=ns('g',{class:`skill-group ${s.status==='future'?'future-node':''} ${!ok?'dimmed':''} ${selectedSkill===s.id?'selected':''}`,'data-skill':s.id,tabindex:ok?0:-1,role:'button','aria-label':`${s.name}，${STATUS[s.status]}，L${s.mastery}`},world);
      if(s.status==='active')ns('circle',{cx:n.x,cy:n.y,r:radius+5,fill:'none',stroke:nodeColor,'stroke-width':'.75','stroke-opacity':'.36',class:'node-halo idle-node-pulse',style:`--pulse-delay:-${Math.abs(n.x+n.y)*.017}s`},g);
      ns('circle',{cx:n.x,cy:n.y,r:radius,class:'skill-node',fill:s.status==='future'?'#171e2b':s.status==='active'?'#6c5540':'#355e54',stroke:nodeColor,'stroke-opacity':'.85'},g);
      ns('circle',{cx:n.x,cy:n.y,r:2,fill:nodeColor,'fill-opacity':s.status==='future'?'.45':'.9'},g);
      label(n.x+20,n.y+6,s.name,{class:'skill-label','text-anchor':'start'},g);
      // The whole text row is a usable pointer target, not just its tiny star.
      ns('rect',{x:n.x-15,y:n.y-19,width:191,height:39,rx:5,fill:'transparent'},g);
      g.addEventListener('click',()=>openSkill(s.id));
      g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openSkill(s.id)}});
      g.addEventListener('pointerenter',()=>highlightEdges(s.id));
      g.addEventListener('pointerleave',()=>highlightEdges(selectedSkill));
      g.addEventListener('focus',()=>highlightEdges(s.id));
      g.addEventListener('blur',()=>highlightEdges(selectedSkill));
    }
    $('#mapCaption').textContent=selectedDomain==='all'?'KNOWLEDGE CONSTELLATIONS':domainById[selectedDomain].en;
    const empty=search&&!skills().some(eligible);
    $('#mapEmpty').hidden=!empty;
    $('#mapEmpty').textContent=empty?'没有找到匹配的节点，试试其他关键词。':'';
    highlightEdges(selectedSkill);setCamera();
  }
  function highlightEdges(id){
    world.querySelectorAll('.idle-lane').forEach(e=>{e.style.opacity=id?(e.dataset.a===id||e.dataset.b===id?'.85':'.12'):''});
    world.querySelectorAll('.edge').forEach(e=>{
      const a=e.dataset.a,b=e.dataset.b,related=!!id&&(a===id||b===id),visible=eligible(getSkill(a))&&eligible(getSkill(b));
      e.classList.toggle('highlight',related);
      e.style.opacity=visible?(id?(related?1:.06):(showAllEdges?1:e.dataset.internal==='1'?.5:0)):.02;
    });
  }
  function selectDomain(id){selectedDomain=id;selectedStatus='all';switchView('universe');renderAll();if(id==='all')fitView();else focusDomain(id);$('#domainSelect').value=id;}

  function renderFilters(){ $$('.filter-pill').forEach(b=>{b.classList.toggle('active',b.dataset.status===selectedStatus);b.setAttribute('aria-pressed',String(b.dataset.status===selectedStatus))});$('#domainSelect').value=selectedDomain;}
  function clearDomain(){selectedDomain='all';selectedStatus='all';search='';$('#globalSearch').value='';$('#domainSelect').value='all';renderAll();fitView()}
  function switchView(view){currentView=view;$$('.view-section').forEach(s=>s.classList.toggle('active',s.id===`${view}View`));$$('.nav-item').forEach(n=>{n.classList.toggle('active',n.dataset.view===view);if(n.dataset.view===view)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current')});const names={universe:'宇宙星图',roadmap:'成长航线',catalog:'知识目录'};const titles={universe:'我的知识星图',roadmap:'成长航线',catalog:'知识星体目录'};const desc={universe:'七个知识星系，构成一张持续生长的地图。点击星体，留下你的探索记录。',roadmap:'用项目、实验和能力验收定义下一段探索旅程。',catalog:'七大知识星系的可检索档案，以及每一颗星体的真实进度。'};$('#pageBreadcrumb').textContent=names[view];$('#pageTitle').textContent=titles[view];$('#pageSubtitle').textContent=desc[view];$('#sectionKicker').textContent={universe:'THE CONSTELLATIONS / 知识版图',roadmap:'THE NEXT CHAPTER / 下一程',catalog:'THE KNOWLEDGE INDEX / 知识档案'}[view];$('#domainNav').parentElement.hidden=view!=='universe';$('.map-reading-guide').hidden=view!=='universe';if(view==='roadmap')renderRoadmap();if(view==='catalog')renderCatalog();if(view==='universe')setCamera();}

  function openSkill(id){const s=getSkill(id);if(!s)return;if(!selectedSkill)previousFocus=document.activeElement;$('#inspector').inert=false;selectedSkill=id;selectedMilestone=null;renderMap();renderInspector();$('#inspector').classList.add('open');$('#drawerScrim').classList.add('show');document.body.style.overflow='hidden';$('#closeInspector').focus()}
  function closeInspector(){const oldId=selectedSkill;selectedSkill=null;selectedMilestone=null;$('#inspector').classList.remove('open');$('#drawerScrim').classList.remove('show');$('#inspector').inert=true;document.body.style.overflow='';renderMap();const target=previousFocus?.isConnected?previousFocus:world.querySelector(`[data-skill="${oldId}"]`);target?.focus();}
  function renderInspector(){const s=getSkill(selectedSkill);if(!s)return;const d=domainById[s.domain];$('#inspectorTitle').textContent='星体档案';const rel=new Set();for(const [a,b] of DATA.edges){if(a===s.id)rel.add(b);else if(b===s.id)rel.add(a)};
    $('#inspectorContent').innerHTML=`
      <div class="detail-domain" style="color:${d.color}">✦ ${esc(d.name)} / ${esc(d.en)}</div>
      <div class="detail-heading">${esc(s.name)}</div><p class="detail-desc">${esc(s.detail)}</p>
      <div class="detail-sep"></div>
      <div class="mastery-line"><div class="detail-label">MASTERY / 当前掌握深度</div><div class="mastery-bignum" id="detailLevelNum">L${s.mastery}<small>/ 5</small></div></div>
      <div class="level-track" id="detailLevelTrack">${[1,2,3,4,5].map(i=>`<span class="level-segment ${i<=s.mastery?'done':''}"></span>`).join('')}</div>
      <input aria-label="掌握等级" type="range" class="detail-range" min="0" max="5" step="1" value="${s.mastery}" id="masteryInput"><div class="mastery-desc" id="masteryDesc">${esc(LEVELS[s.mastery][0])}：${esc(LEVELS[s.mastery][1])}</div>
      <label class="detail-input-label" for="statusInput">学习状态</label><select id="statusInput" class="detail-select">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${s.status===k?'selected':''}>${v}</option>`).join('')}</select>
      <label class="detail-input-label" for="priorityInput">当前优先级</label><select id="priorityInput" class="detail-select">${Object.entries(PRI).map(([k,v])=>`<option value="${k}" ${s.priority===k?'selected':''}>${v}</option>`).join('')}</select>
      <label class="detail-input-label" for="noteInput">我的学习记录</label><textarea id="noteInput" class="detail-textarea" maxlength="3000" placeholder="记录你目前学到的机制、真实遇到的问题...">${esc(s.note||'')}</textarea>
      <label class="detail-input-label" for="evidenceInput">项目 / 实验验收（每行一条）</label><textarea id="evidenceInput" class="detail-textarea" maxlength="3000" placeholder="例如：独立完成部署，并测试恢复...">${esc((s.evidence||[]).join('\n'))}</textarea>
      <p class="detail-hint">状态、等级和优先级彼此独立。等级是你的自评；尽量用项目或实验记录证明掌握深度。数据保存在当前浏览器。</p>
      ${rel.size?`<div class="detail-sep"></div><div class="detail-label">CONNECTED / 关联知识</div><div class="relation-tags">${[...rel].slice(0,12).map(id=>`<button class="relation-btn" data-open-skill="${id}">${esc(baseById[id].name)} ↗</button>`).join('')}</div>`:''}
      <button class="action-button" id="saveSkillBtn">保存这颗星体的状态 →</button><div class="inspector-status">修改后保存，星图将立即更新</div>`;
    $('#masteryInput').addEventListener('input',e=>{const n=Number(e.target.value);$('#detailLevelNum').innerHTML=`L${n}<small>/ 5</small>`;$('#masteryDesc').textContent=LEVELS[n].join('：');$$('#detailLevelTrack .level-segment').forEach((seg,i)=>seg.classList.toggle('done',i<n))});
    $('#saveSkillBtn').addEventListener('click',()=>{const next={mastery:Number($('#masteryInput').value),status:$('#statusInput').value,priority:$('#priorityInput').value,note:$('#noteInput').value.slice(0,3000),evidence:$('#evidenceInput').value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,30)};saved.overrides[s.id]=next;persist();renderAll();renderInspector();toast(`已保存 · ${s.name}`)});
    $$('[data-open-skill]').forEach(b=>b.addEventListener('click',()=>openSkill(b.dataset.openSkill)));
  }

  function renderRoadmap(){const checked=saved.milestones||{};
    $('#roadmapGrid').innerHTML=DATA.milestones.map((m,i)=>`<article class="milestone"><div class="milestone-tag">0${i+1} / ${esc(m.tag)}</div><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p><div class="milestone-line">关键知识节点</div><div class="milestone-skills">${m.skillIds.map(id=>`<button class="milestone-chip" data-open-skill="${id}">${esc(getSkill(id).name)}</button>`).join('')}</div><div class="milestone-line">能力验收 · ${m.checks.filter((_,j)=>checked[`${m.id}:${j}`]).length}/${m.checks.length}</div><ul class="milestone-checks">${m.checks.map((t,j)=>`<li><label><input type="checkbox" data-milestone="${m.id}:${j}" ${checked[`${m.id}:${j}`]?'checked':''}> ${esc(t)}</label></li>`).join('')}</ul></article>`).join('');
    $$('#roadmapGrid [data-open-skill]').forEach(b=>b.addEventListener('click',()=>openSkill(b.dataset.openSkill)));
    $$('#roadmapGrid [data-milestone]').forEach(b=>b.addEventListener('change',()=>{saved.milestones[b.dataset.milestone]=b.checked;persist();const m=b.closest('.milestone'),meta=m.querySelectorAll('.milestone-line')[1];const count=[...m.querySelectorAll('input[type=checkbox]')].filter(e=>e.checked).length;meta.textContent=`能力验收 · ${count}/${m.querySelectorAll('input[type=checkbox]').length}`;toast('已更新能力验收记录')}));
  }
  function renderCatalog(){const all=skills();let subset=all.filter(s=>(catalogDomain==='all'||s.domain===catalogDomain)&&(!search||(`${s.name} ${s.detail} ${domainById[s.domain].name}`).toLowerCase().includes(search.toLowerCase())));
    $('#catalogTabs').innerHTML=`<button class="catalog-tab ${catalogDomain==='all'?'active':''}" data-cat="all">全部星系</button>`+DATA.domains.map(d=>`<button class="catalog-tab ${catalogDomain===d.id?'active':''}" data-cat="${d.id}">${esc(d.name)}</button>`).join('');
    $('#catalogCount').textContent=`${subset.length} / ${all.length} STARS`;
    $('#catalogList').innerHTML=subset.length?subset.map(s=>`<button class="catalog-item" data-open-skill="${s.id}" style="--domain-color:${colorOf(s)}"><span class="catalog-glyph">${s.status==='explored'?'✦':s.status==='active'?'◈':'◇'}</span><span style="min-width:0;flex:1"><div class="catalog-name">${esc(s.name)}</div><div class="catalog-meta">${esc(domainById[s.domain].name)} · ${STATUS[s.status]} · ${PRI[s.priority]}</div></span><span class="catalog-level">L${s.mastery} / 5</span></button>`).join(''):'<div class="empty-state">没有匹配的星体。试试其他关键词或星系。</div>';
    $$('#catalogTabs [data-cat]').forEach(b=>b.addEventListener('click',()=>{catalogDomain=b.dataset.cat;renderCatalog()}));
    $$('#catalogList [data-open-skill]').forEach(b=>b.addEventListener('click',()=>openSkill(b.dataset.openSkill)));
  }
  function renderAll(){renderStats();renderSidebar();renderFilters();renderMap();if(currentView==='catalog')renderCatalog();if(currentView==='roadmap')renderRoadmap()}

  // navigation / search / filter
  $$('.nav-item').forEach(b=>b.addEventListener('click',()=>{selectedDomain='all';renderSidebar();switchView(b.dataset.view);if(currentView==='universe')fitView();$('#explore').scrollIntoView({behavior:document.documentElement.dataset.motion==='on'?'smooth':'instant',block:'start'})}));
  $$('.filter-pill').forEach(b=>b.addEventListener('click',()=>{selectedStatus=b.dataset.status;renderAll()}));
  $('#mapReset').addEventListener('click',clearDomain);$('#zoomReset').addEventListener('click',clearDomain);
  $('#closeInspector').addEventListener('click',closeInspector);$('#drawerScrim').addEventListener('click',closeInspector);
  window.addEventListener('keydown',e=>{if(e.key==='Escape')closeInspector();if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();$('#globalSearch').focus()}});
  const searchInput=document.createElement('input');searchInput.className='top-search';searchInput.id='globalSearch';searchInput.type='search';searchInput.placeholder='搜索知识节点  /  Ctrl K';searchInput.setAttribute('aria-label','搜索技能');$('#topSearchSlot')?.append(searchInput); // standalone index 可选搜索容器
  $('.topbar-left').append(searchInput);
  searchInput.addEventListener('input',()=>{search=searchInput.value.trim();if(search&&selectedDomain!=='all'){selectedDomain='all';selectedStatus='all';renderSidebar();renderFilters();if(currentView==='universe')fitView()}if(search&&(currentView==='roadmap'||innerWidth<700))switchView('catalog');renderMap();if(currentView==='catalog')renderCatalog()});
  $('#zoomIn').addEventListener('click',()=>zoomAt(stage.clientWidth*.5,stage.clientHeight*.5,1.3));
  $('#zoomOut').addEventListener('click',()=>zoomAt(stage.clientWidth*.5,stage.clientHeight*.5,1/1.3));
  function zoomAt(px,py,factor){stopCameraMotion();const next=clamp(camera.s*factor,.26,2.9),ratio=next/camera.s;camera.x=px-(px-camera.x)*ratio;camera.y=py-(py-camera.y)*ratio;camera.s=next;setCamera()}
  stage.addEventListener('wheel',e=>{e.preventDefault();const rect=stage.getBoundingClientRect();zoomAt(e.clientX-rect.left,e.clientY-rect.top,Math.exp(-e.deltaY*.001))},{passive:false});
  stage.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button,[data-skill],[data-domain]'))return;stopCameraMotion();dragging={x:e.clientX,y:e.clientY,tx:camera.x,ty:camera.y};stage.setPointerCapture(e.pointerId)});
  stage.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(Math.abs(dx)+Math.abs(dy)>4)dragging.moved=true;camera.x=dragging.tx+dx;camera.y=dragging.ty+dy;setCamera()});
  stage.addEventListener('pointerup',e=>{if(!dragging)return;const moved=dragging.moved;dragging=null;try{stage.releasePointerCapture(e.pointerId)}catch(_){};if(moved){ // 捕获阶段不应意外触发星体的 click
      stage.dataset.justDragged='1';setTimeout(()=>delete stage.dataset.justDragged,25);
    }});
  stage.addEventListener('pointercancel',()=>dragging=null);
  stage.addEventListener('click',e=>{if(stage.dataset.justDragged){e.stopPropagation();e.preventDefault()}},true);
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(currentView==='universe'&&selectedDomain==='all')fitView()},200)});

  function download(name,textContent,type){const blob=new Blob([textContent],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  $('#exportBtn').addEventListener('click',()=>{download(`tech-atlas-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({format:'tech-atlas',version:2,exportedAt:new Date().toISOString(),overrides:saved.overrides,milestones:saved.milestones},null,2),'application/json;charset=utf-8');toast('已导出 JSON 备份')});
  $('#importBtn').addEventListener('click',()=>$('#importInput').click());
  $('#importInput').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2e6)throw new Error('文件过大');const payload=JSON.parse(await file.text());if(payload.format!=='tech-atlas'||payload.version!==2||typeof payload.overrides!=='object'||!payload.overrides||Array.isArray(payload.overrides))throw new Error('不是此版本的技术宇宙备份');const fresh={};for(const [id,o] of Object.entries(payload.overrides)){if(!skillIds.has(id)||typeof o!=='object'||!o)continue;fresh[id]={mastery:clamp(Math.round(Number(o.mastery)||0),0,5),status:Object.hasOwn(STATUS,o.status)?o.status:'future',priority:Object.hasOwn(PRI,o.priority)?o.priority:'later',note:String(o.note||'').slice(0,3000),evidence:Array.isArray(o.evidence)?o.evidence.slice(0,30).map(x=>String(x).slice(0,160)):[]};}saved.overrides=fresh;saved.milestones={};if(payload.milestones&&typeof payload.milestones==='object') for(const m of DATA.milestones) m.checks.forEach((_,j)=>{const k=`${m.id}:${j}`;if(payload.milestones[k]===true)saved.milestones[k]=true});persist();renderAll();closeInspector();toast('已导入进度备份')}catch(err){toast(`导入失败：${err.message}`)}finally{e.target.value=''}});
  $('#resetData').addEventListener('click',()=>{if(confirm('恢复初始示例数据？所有未导出的本地修改将被覆盖。')){saved={version:2,overrides:{},milestones:{}};persist();renderAll();closeInspector();toast('已恢复初始示例数据')}});
  $$('[data-jump]').forEach(b=>b.addEventListener('click',()=>{selectedDomain='all';switchView(b.dataset.jump);renderAll();if(currentView==='universe')fitView();$('#explore').scrollIntoView({behavior:document.documentElement.dataset.motion==='on'?'smooth':'instant',block:'start'})}));
  $('#allDomainsBtn').addEventListener('click',clearDomain);
  // Accessible mobile field switcher and map controls.
  const domainSelect=document.createElement('select');domainSelect.id='domainSelect';domainSelect.className='mobile-domains';domainSelect.setAttribute('aria-label','选择知识星系');
  domainSelect.innerHTML='<option value="all">全景 · 七大知识星系</option>'+DATA.domains.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join('');
  $('.universe-topline').prepend(domainSelect);domainSelect.addEventListener('change',()=>selectDomain(domainSelect.value));
  const empty=document.createElement('div');empty.id='mapEmpty';empty.className='search-result-note';empty.hidden=true;stage.append(empty);
  $('#lineToggle').addEventListener('click',()=>{showAllEdges=!showAllEdges;$('#lineToggle').setAttribute('aria-pressed',String(showAllEdges));$('#lineMode').textContent=showAllEdges?'全部':'按需';highlightEdges(selectedSkill)});
  $('#fullscreenBtn').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.content-frame').requestFullscreen()}catch(_){toast('此浏览器不支持全屏；可用缩放按钮探索。')}});
  document.addEventListener('fullscreenchange',()=>{if(selectedDomain==='all')fitView();else focusDomain(selectedDomain)});
  $('#inspector').addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const controls=[...$('#inspector').querySelectorAll('button,input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled);
    const first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  svg.addEventListener('keydown',e=>{
    if(e.target!==svg)return;
    const offsets={ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]};
    if(offsets[e.key]){e.preventDefault();stopCameraMotion();camera.x+=offsets[e.key][0];camera.y+=offsets[e.key][1];setCamera()}
    if(e.key==='+'||e.key==='='){e.preventDefault();zoomAt(stage.clientWidth/2,stage.clientHeight/2,1.2)}
    if(e.key==='-'){e.preventDefault();zoomAt(stage.clientWidth/2,stage.clientHeight/2,1/1.2)}
  });
  new ResizeObserver(()=>{if(currentView==='universe'){if(selectedDomain==='all')fitView();else focusDomain(selectedDomain)}}).observe(stage);
  $('.nav-item[data-view=universe]').setAttribute('aria-current','page');
  renderAll();requestAnimationFrame(()=>{if(innerWidth<700)selectDomain('software');else fitView()});
})();
