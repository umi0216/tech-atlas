import {CanvasSpace} from './canvas-space.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
/** Replaceable spatial view. Knowledge and learning records never depend on Three objects. */
export class KnowledgeSpace {
 constructor(host,labels,onSelect,onReady){
  this.host=host;this.labels=labels;this.onSelect=onSelect;this.enabled=true;this.visible=true;this.time=0;this.last=0;this.frame=0;this.items=[];this.travel=null;this.manual=false;this.scope='universe';
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{return new CanvasSpace(host,labels,onSelect,onReady)}
  this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));this.renderer.setClearColor(0x050811,0);host.prepend(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-hidden','true');
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(42,1,.1,1000);this.camera.position.set(0,46,140);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.07;this.controls.enablePan=false;this.controls.minDistance=60;this.controls.maxDistance=205;this.controls.minPolarAngle=.3;this.controls.maxPolarAngle=1.4;this.controls.rotateSpeed=.45;this.controls.zoomSpeed=.65;
  this.renderer.domElement.addEventListener('wheel',e=>{this.controls.enableZoom=e.ctrlKey||document.activeElement===host},{capture:true,passive:true});
  this.controls.addEventListener('start',()=>{this.travel=null;this.manual=true;host.classList.add('is-orbiting');this.request()});this.controls.addEventListener('end',()=>{host.classList.remove('is-orbiting');this.request()});this.controls.addEventListener('change',()=>this.request());
  this.scene.add(new THREE.AmbientLight(0xcbd5ff,2.1));const light=new THREE.DirectionalLight(0xdcd0ff,4);light.position.set(-20,40,45);this.scene.add(light);
  const glow=document.createElement('canvas');glow.width=128;glow.height=128;const ctx=glow.getContext('2d');const grad=ctx.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(255,255,255,1)');grad.addColorStop(.12,'rgba(255,255,255,.7)');grad.addColorStop(.38,'rgba(255,255,255,.16)');grad.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);this.glow=new THREE.CanvasTexture(glow);
  this.cosmos=new THREE.Group();this.scene.add(this.cosmos);this.layer=new THREE.Group();this.scene.add(this.layer);
  this.stars=this.makePoints(2200,(i,r)=>{const a=r()*Math.PI*2,z=(r()-.5)*380,t=Math.sqrt(1-(z/200)**2);return [Math.cos(a)*210*t,Math.sin(a)*210*t,z]},'#b1bbdb',1.4,.6,12);this.scene.add(this.stars);
  const spiral=this.makePoints(7200,(i,r)=>{const radius=Math.pow(r(),.67)*70;const a=radius*.14+(i%4)*Math.PI/2+(r()-.5)*.8;return [Math.cos(a)*radius,(r()-.5)*(6-radius*.05),Math.sin(a)*radius*.62]},'#b4a0ec',1.2,.46,9);
  spiral.rotation.z=-.17;this.cosmos.add(spiral);
  const mist=this.makePoints(1600,(i,r)=>{const radius=r()*43,a=r()*Math.PI*2;return [Math.cos(a)*radius,(r()-.5)*4,Math.sin(a)*radius*.6]},'#7ca9c6',3.8,.09,27);this.cosmos.add(mist);
  const center=new THREE.Sprite(new THREE.SpriteMaterial({map:this.glow,color:0xbca1ff,opacity:.23,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));center.scale.set(30,30,1);this.cosmos.add(center);
  this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();let down=null;
  this.renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
  this.renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const rect=this.host.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const hit=this.raycaster.intersectObjects(this.items.map(i=>i.hit),false)[0];if(hit)this.onSelect(hit.object.userData.id)});
  this.host.addEventListener('keydown',e=>{if(e.target!==host)return;if(e.key==='+'||e.key==='='){e.preventDefault();this.zoom(.88)}else if(e.key==='-'){e.preventDefault();this.zoom(1.12)}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();this.travel=null;const offset=this.camera.position.clone().sub(this.controls.target);const spherical=new THREE.Spherical().setFromVector3(offset);spherical.theta+=e.key==='ArrowLeft'?.12:e.key==='ArrowRight'?-.12:0;spherical.phi=THREE.MathUtils.clamp(spherical.phi+(e.key==='ArrowUp'?-.07:e.key==='ArrowDown'?.07:0),.3,1.4);this.camera.position.copy(new THREE.Vector3().setFromSpherical(spherical).add(this.controls.target));this.controls.update();this.request()}});
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);
  this.intersection=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.sync()});this.intersection.observe(host);
  document.addEventListener('visibilitychange',()=>this.sync());
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(this.frame);this.frame=0;this.renderer=null;this.host.dataset.renderer='fallback';this.positionFallback();onReady(false)});
  host.dataset.renderer='webgl';this.resize();onReady(true);
 }
 makePoints(count,position,color,size,opacity,seed){let v=seed;const r=()=>{v=(v*1664525+1013904223)>>>0;return v/4294967296};const p=[],phases=[];for(let i=0;i<count;i++){p.push(...position(i,r));phases.push(r()*6.28)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('phase',new THREE.Float32BufferAttribute(phases,1));const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},color:{value:new THREE.Color(color)},size:{value:size},opacity:{value:opacity}},vertexShader:`attribute float phase;uniform float time;uniform float size;varying float glow;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(size*170./max(-mv.z,1.),.7,12.);glow=.65+.35*sin(time*.6+phase);}`,fragmentShader:`uniform vec3 color;uniform float opacity;varying float glow;void main(){float d=distance(gl_PointCoord,vec2(.5));float a=pow(max(0.,1.-d*2.),2.);gl_FragColor=vec4(color,a*opacity*glow);}`});return new THREE.Points(geo,mat)}
 resize(){if(!this.renderer)return;const {width,height}=this.host.getBoundingClientRect();if(!width||!height)return;this.width=width;this.height=height;this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height);if(this.children)this.setLabels(this.children);this.request()}
 setLabels(children){this.labels.replaceChildren();for(const item of this.items){const node=children.find(n=>n.id===item.id);if(!node)continue;const button=document.createElement('button');button.className='space-label';button.dataset.node=node.id;button.style.setProperty('--node-color',node.color);const title=document.createElement('span');title.textContent=node.title;const meta=document.createElement('small');meta.textContent=node.meta;button.append(title,meta);button.setAttribute('aria-label',`探索${node.title}`);button.addEventListener('click',()=>this.onSelect(node.id));this.labels.append(button);item.label=button}}
 setScope(scope,children){this.scope=scope;this.children=children;if(!this.renderer){this.items=children.map(n=>({id:n.id}));this.setLabels(children);this.positionFallback();return}
  this.travel=null;this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=true;
  this.layer.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});this.layer.clear();this.items=[];
  const isRoot=scope==='universe',n=children.length;
  children.forEach((node,i)=>{const angle=i/n*Math.PI*2+.1;const radius=isRoot?(innerWidth<650?34:43):n>5?34:29;const base=new THREE.Vector3(Math.cos(angle)*radius*1.08,Math.sin(angle)*radius*.6,Math.sin(angle*2+.7)*radius*.25);const group=new THREE.Group();group.position.copy(base);this.layer.add(group);const color=new THREE.Color(node.color);const r=isRoot?1.7:node.kind==='concept'?.82:1.25;
   const hit=new THREE.Mesh(new THREE.SphereGeometry(r,24,18),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.3,roughness:.48,metalness:.18}));hit.userData.id=node.id;group.add(hit);
   const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:this.glow,color,opacity:.48,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.set(r*10,r*10,1);group.add(halo);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(r*2.1,.025,4,80),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.35}));ring.rotation.set(.65+i*.21,i*.3,.4);group.add(ring);
   const orbit=new THREE.Group();orbit.rotation.copy(ring.rotation);const dot=new THREE.Mesh(new THREE.SphereGeometry(.13,8,8),new THREE.MeshBasicMaterial({color}));dot.position.x=r*2.1;orbit.add(dot);group.add(orbit);
   const cloud=this.makePoints(isRoot?190:100,(j,random)=>{const a=random()*6.28,rad=(1+random()*3.8)*r;return [Math.cos(a)*rad,(random()-.5)*r*1.5,Math.sin(a)*rad*.7]},node.color,1.5,.58,36+i*17);group.add(cloud);
   this.items.push({id:node.id,group,hit,base,orbit,halo,phase:i*1.4,label:null});
  });
  this.setLabels(children);this.cosmos.visible=true;this.cosmos.scale.setScalar(isRoot?1:.7);
  const distance=innerWidth<650?190:isRoot?145:117;const dest=new THREE.Vector3(0,distance*.32,distance);this.controls.target.set(0,0,0);
  if(this.enabled){this.travel={from:this.camera.position.clone(),to:dest,begin:performance.now()}}else this.camera.position.copy(dest);
  this.manual=false;this.request();
 }
 positionFallback(){this.host.dataset.renderer='fallback';this.labels.classList.add('fallback-labels');this.items.forEach((item,i)=>{const a=i/this.items.length*Math.PI*2;item.label.style.left=`${50+Math.cos(a)*31}%`;item.label.style.top=`${52+Math.sin(a)*29}%`;item.label.hidden=false;item.label.style.opacity='1'});}
 zoom(factor){if(!this.renderer)return;this.travel=null;const offset=this.camera.position.clone().sub(this.controls.target);offset.multiplyScalar(factor);offset.clampLength(this.controls.minDistance,this.controls.maxDistance);this.camera.position.copy(offset.add(this.controls.target));this.controls.update();this.request()}
 reset(){if(this.children)this.setScope(this.scope,this.children)}
 setMotion(enabled){this.enabled=enabled;if(!enabled&&this.travel){this.camera.position.copy(this.travel.to);this.travel=null}this.sync()}
 sync(){cancelAnimationFrame(this.frame);this.frame=0;this.last=0;if(this.renderer&&this.visible&&!document.hidden)this.request()}
 request(){if(this.renderer&&!this.frame&&this.visible&&!document.hidden)this.frame=requestAnimationFrame(t=>this.draw(t))}
 draw(now){this.frame=0;if(!this.renderer||!this.visible||document.hidden)return;const delta=this.last?Math.min(now-this.last,60)/1000:0;this.last=now;
  if(this.enabled)this.time+=delta;const t=this.time;
  if(this.travel){const f=Math.min((now-this.travel.begin)/1000,1),ease=1-Math.pow(1-f,3);this.camera.position.lerpVectors(this.travel.from,this.travel.to,ease);if(f>=1)this.travel=null}
  if(this.enabled){this.cosmos.rotation.y=t*.009;this.stars.rotation.y=t*.0015;for(const item of this.items){item.group.position.y=item.base.y+Math.sin(t*.4+item.phase)*.5;item.orbit.rotation.z=t*.24+item.phase;item.halo.material.opacity=.39+Math.sin(t*.8+item.phase)*.07}}
  this.scene.traverse(o=>{if(o.material?.uniforms?.time)o.material.uniforms.time.value=t});this.controls.update();this.scene.updateMatrixWorld();
  const projected=new THREE.Vector3();for(const item of this.items){item.group.getWorldPosition(projected);projected.project(this.camera);const x=(projected.x+1)*this.width/2,y=(-projected.y+1)*this.height/2;item.label.style.left=`${Math.max(innerWidth<650?65:110,Math.min(this.width-(innerWidth<650?65:110),x))}px`;item.label.style.top=`${y+25}px`;item.label.hidden=projected.z>1||projected.z< -1||x<20||x>this.width-20||y<0||y>this.height-40;item.label.style.opacity='1'}
  this.renderer.render(this.scene,this.camera);if(this.enabled||this.travel)this.request();
 }
}
