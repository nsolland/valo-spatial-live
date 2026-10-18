import * as THREE from 'three';
const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0b1922);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,0.1,130);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'default'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
$('stage').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xc7eaff,0x52636e,2.5));
const sunlight=new THREE.DirectionalLight(0xffffff,2);sunlight.position.set(9,16,11);scene.add(sunlight);
const mat=(color,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness:.82,transparent:opacity<1,opacity,side:THREE.DoubleSide});
const wallMat=mat(0xdbe7e8,.78),floorMat=[mat(0x9a948a),mat(0xb2a18a),mat(0xb5a38b)];
const accent=mat(0x436676);
const roomSpecs=[
{level:0,id:'parking',name:'Parkering',x:-2.9,z:0,w:5.8,d:7.7,color:0x677981,photo:'IMG_3446.webp'},
{level:0,id:'storage',name:'Sportsbod',x:1.1,z:2.65,w:2.1,d:2.2,color:0x627b8a,photo:'IMG_3447.webp'},
{level:0,id:'hall0',name:'Gang',x:2.25,z:-1.1,w:1.4,d:5.2,color:0x8eaaab,photo:'IMG_3469.webp'},
{level:1,id:'kitchen',name:'Kjøkken / stue',x:-1.3,z:1.65,w:5.3,d:5.3,color:0x5d9990,photo:'IMG_3448.webp'},
{level:1,id:'bed1',name:'Soverom',x:-2.8,z:-2.6,w:2.55,d:2.55,color:0x6989aa,photo:'IMG_3455.webp'},
{level:1,id:'bath1',name:'Bad / WC',x:2.0,z:-2.4,w:2.2,d:2.5,color:0x7ca8bc,photo:'IMG_3457.webp'},
{level:1,id:'hall1',name:'Entré',x:0,z:-1.35,w:1.6,d:2.3,color:0xc2a477,photo:'IMG_3469.webp'},
{level:1,id:'terrace1',name:'Terrasse',x:-3.4,z:5.15,w:3.2,d:1.65,color:0x658974,photo:'IMG_3482.webp'},
{level:2,id:'living',name:'Stue',x:-.85,z:2.0,w:6.5,d:5.9,color:0x73a6aa,photo:'IMG_3460.webp'},
{level:2,id:'bed2',name:'Soverom A',x:-2.75,z:-2.3,w:2.7,d:2.7,color:0x7b89be,photo:'IMG_3477.webp'},
{level:2,id:'bed3',name:'Soverom B / kontor',x:1.75,z:-3,w:3,d:2.2,color:0x8b97af,photo:'IMG_3478.webp'},
{level:2,id:'bath2',name:'Bad / WC',x:2.55,z:-1.0,w:1.3,d:1.45,color:0x83b5c2,photo:'IMG_3474.webp'},
{level:2,id:'hall2',name:'Gang',x:.25,z:-1.2,w:1.6,d:1.6,color:0xc2a477,photo:'IMG_3471.webp'},
{level:2,id:'terrace2',name:'Altan',x:-2.9,z:-5.0,w:2.8,d:1.45,color:0x658974,photo:'IMG_3482.webp'},
{level:2,id:'terrace3',name:'Terrasse',x:2.9,z:5.4,w:3,d:1.65,color:0x658974,photo:'IMG_3481.webp'}
];
const levels=[new THREE.Group(),new THREE.Group(),new THREE.Group()];levels.forEach((g,i)=>{g.position.y=i*3.25;scene.add(g)});
const clickable=[];
function rectMesh(width,depth,color,y=.03){const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,.13,depth),mat(color));mesh.position.y=y;return mesh}
function wall(group,x,z,w,d,y=1.2){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,2.32,d),wallMat);mesh.position.set(x,y,z);group.add(mesh);}
for(const r of roomSpecs){
 const group=levels[r.level];
 const slab=rectMesh(r.w,r.d,r.color);slab.position.set(r.x,0,r.z);slab.userData=r;group.add(slab);clickable.push(slab);
 const edging=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(r.w,.12,r.d)),new THREE.LineBasicMaterial({color:0xe9e1cd}));
 edging.position.copy(slab.position);group.add(edging);
 // Perimeter wall segments deliberately interrupted (schematic openings, not verified doors).
 const x1=r.x-r.w/2,x2=r.x+r.w/2,z1=r.z-r.d/2,z2=r.z+r.d/2;
 wall(group,x1,z1,r.w*.3,.10);wall(group,x2-r.w*.15,z1,r.w*.3,.10);
 wall(group,x1,z2,r.w*.3,.10);wall(group,x2-r.w*.15,z2,r.w*.3,.10);
 wall(group,x1,z1+r.d*.2,.1,r.d*.4);wall(group,x1,z2-r.d*.2,.1,r.d*.4);
 wall(group,x2,z1+r.d*.2,.1,r.d*.4);wall(group,x2,z2-r.d*.2,.1,r.d*.4);
}
const grid=new THREE.GridHelper(20,20,0x3f6270,0x27404a);grid.position.y=-.3;scene.add(grid);
let yaw=.62,pitch=.92,dist=22,targetY=3.4;
function moveCamera(){pitch=Math.min(1.49,Math.max(.16,pitch));dist=Math.min(48,Math.max(7,dist));camera.position.set(dist*Math.sin(pitch)*Math.sin(yaw),targetY+dist*Math.cos(pitch),dist*Math.sin(pitch)*Math.cos(yaw));camera.lookAt(0,targetY,0);}
moveCamera();
function setLevel(level){levels.forEach((g,i)=>g.visible=level==='all'||i===Number(level));targetY=level==='all'?3.1:Number(level)*3.25;yaw=.6;pitch=.9;moveCamera();showRooms(level);}
function showRooms(level){$('rooms').replaceChildren();for(const r of roomSpecs.filter(r=>level==='all'||r.level===Number(level))){const b=document.createElement('button');b.textContent=r.name;b.onclick=()=>focusRoom(r);$('rooms').append(b)}}
function focusRoom(r){$('info').textContent=r.name+' – foreløpig 3D-plassering fra plantegning.';$('preview').src='assets/'+r.photo;$('preview').hidden=false;$('status').textContent='Referansefoto: '+r.photo+'. Mål/romplassering må valideres.';targetY=r.level*3.25;moveCamera();}
$('level').addEventListener('change',e=>setLevel(e.target.value));setLevel('2');
let touching=false,lastX=0,lastY=0,moved=false,prevTouchDist=0;
const canvas=renderer.domElement;
canvas.addEventListener('pointerdown',e=>{touching=true;lastX=e.clientX;lastY=e.clientY;moved=false;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!touching)return;let dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;yaw-=dx*.007;pitch-=dy*.006;lastX=e.clientX;lastY=e.clientY;moveCamera()});
canvas.addEventListener('pointerup',e=>{touching=false;if(moved)return;const point=new THREE.Vector2(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(point,camera);const hit=ray.intersectObjects(clickable).find(x=>x.object.parent.visible);if(hit)focusRoom(hit.object.userData)});
canvas.addEventListener('wheel',e=>{e.preventDefault();dist*=e.deltaY>0?1.09:.91;moveCamera()},{passive:false});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
renderer.setAnimationLoop(()=>renderer.render(scene,camera));
$('status').textContent='3D-motor aktiv. Velg rom eller etasje.';
window.__VALO_3D_READY=true;
