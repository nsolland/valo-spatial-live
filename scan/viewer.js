import {Application, Asset, Entity, Vec3, FILLMODE_FILL_WINDOW, RESOLUTION_AUTO} from 'playcanvas';
const status=document.querySelector('#status');
const canvas=document.createElement('canvas');document.body.appendChild(canvas);
let app;
try{
 app=new Application(canvas,{graphicsDeviceOptions:{antialias:false, preferWebGl2:false, powerPreference:'low-power'}});
 app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
 app.setCanvasResolution(RESOLUTION_AUTO);
 app.start();
 window.addEventListener('resize',()=>app.resizeCanvas());
 const scene=new Asset('Rustabakken 34 sparse photogrammetry','container',{url:'./rustabakken34-colmap.glb'});
 await new Promise((resolve,reject)=>{app.assets.add(scene);scene.once('load',resolve);scene.once('error',reject);app.assets.load(scene);});
 const model=scene.resource.instantiateRenderEntity();
 app.root.addChild(model);
 const box={min:new Vec3(Infinity,Infinity,Infinity),max:new Vec3(-Infinity,-Infinity,-Infinity)};
 let n=0;
 model.forEach(node=>{const render=node.render;if(!render)return;for(const mesh of render.meshInstances){const b=mesh.aabb;if(!b)continue;n++;for(const axis of ['x','y','z']){box.min[axis]=Math.min(box.min[axis],b.center[axis]-b.halfExtents[axis]);box.max[axis]=Math.max(box.max[axis],b.center[axis]+b.halfExtents[axis]);}}});
 const target=new Vec3();
 if(n){target.add2(box.min,box.max).mulScalar(.5);}
 const half=new Vec3().sub2(box.max,box.min).length()*.5;
 const radius=Number.isFinite(half)&&half>0?half:5;
 const camera=new Entity('Orbit camera');camera.addComponent('camera',{clearColor:[0.025,0.07,0.11,1],nearClip:Math.max(.001,radius/10000),farClip:radius*1000});app.root.addChild(camera);
 const light=new Entity('Directional light');light.addComponent('light',{type:'directional',intensity:2,castShadows:false});light.setEulerAngles(45,50,0);app.root.addChild(light);
 let azimuth=.6,elevation=.28,distance=radius*2.6;
 const update=()=>{const ce=Math.cos(elevation);camera.setPosition(target.x+distance*Math.sin(azimuth)*ce,target.y+distance*Math.sin(elevation),target.z+distance*Math.cos(azimuth)*ce);camera.lookAt(target);};
 update();
 const reset=()=>{azimuth=.6;elevation=.28;distance=radius*2.6;update();};
 document.querySelector('#reset').addEventListener('click',reset);
 let dragging=false,prevX=0,prevY=0;
 canvas.addEventListener('pointerdown',e=>{dragging=true;prevX=e.clientX;prevY=e.clientY;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointerup',()=>dragging=false);
 canvas.addEventListener('pointercancel',()=>dragging=false);
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;azimuth-=(e.clientX-prevX)*.008;elevation=Math.max(-1.45,Math.min(1.45,elevation+(e.clientY-prevY)*.008));prevX=e.clientX;prevY=e.clientY;update();});
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(radius*.08,Math.min(radius*30,distance*Math.exp(e.deltaY*.001)));update();},{passive:false});
 status.textContent='COLMAP GLB lastet. Interaktiv punktsky tilgjengelig.';
 }catch(err){const msg=err?.message||String(err);status.textContent='3D-visning utilgjengelig: '+msg+'. Bruk originalbildene eller prøv Chrome/Edge med maskinvareakselerasjon aktivert.';status.style.color='#ffa8a8';const a=document.createElement('a');a.href='../';a.textContent='Åpne fotovisningen';a.style.display='block';a.style.marginTop='8px';status.after(a);console.error(err);}
