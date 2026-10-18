import { Application, Asset, AssetListLoader, Entity, FILLMODE_FILL_WINDOW, RESOLUTION_AUTO, Vec3 } from 'playcanvas';
const params=new URLSearchParams(location.search);
const CONTENT='https://developer.playcanvas.com/assets/toy-cat.sog';
const content=params.get('content')||CONTENT;
if(content!==CONTENT) throw Error('Only approved scanned demo content permitted');
const status=document.getElementById('error');
const setStatus=(message,isError=false)=>{status.textContent=message;status.style.display='block';status.style.background=isError?'#8c2525':'#164b47';};
const notify=(type,data={})=>parent.postMessage({type,...data},location.origin);
let app;
try {
 const canvas=document.createElement('canvas');document.body.append(canvas);
 app=new Application(canvas,{graphicsDeviceOptions:{antialias:false}});
 app.setCanvasFillMode(FILLMODE_FILL_WINDOW);app.setCanvasResolution(RESOLUTION_AUTO);
 app.start();
 window.addEventListener('resize',()=>app.resizeCanvas());
 const assets=[
  new Asset('camera-controls','script',{url:'https://cdn.jsdelivr.net/npm/playcanvas@2.16.2/scripts/esm/camera-controls.mjs'}),
  new Asset('scene','gsplat',{url:content})
 ];
 await new Promise((resolve,reject)=>new AssetListLoader(assets,app.assets).load(error=>error?reject(error):resolve()));
 const camera=new Entity('Camera');camera.setPosition(0,0,2.5);camera.addComponent('camera');app.root.addChild(camera);
 camera.addComponent('script');camera.script.create('cameraControls');
 const splat=new Entity('Photogrammetric test capture');splat.setPosition(0,-0.7,0);splat.setEulerAngles(0,0,180);splat.addComponent('gsplat',{asset:assets[1]});app.root.addChild(splat);
 // Marker is a fixed WORLD-space position, projected each frame into viewport pixels.
 // It is for validating 3D anchoring, not a claim about a real property feature.
 const marker=document.createElement('button');marker.type='button';marker.textContent='1';marker.className='anchor';
 marker.title='Forankret testpunkt';marker.setAttribute('aria-label','3D-testpunkt');
 marker.onclick=()=>{setStatus('3D-testpunkt valgt: posisjon (0, −0.6, 0) i testscenen.');notify('valo-spatial-object-selected',{id:'sample-anchor'})};
 document.body.append(marker);
 const world=new Vec3(0,-0.6,0);
 app.on('update',()=>{
   const screen=camera.camera.worldToScreen(world);
   const viewW=app.graphicsDevice.width,viewH=app.graphicsDevice.height;
   const local=camera.getLocalPosition(),dist=local.distance(world);
   marker.hidden=screen.z<=0||screen.x<0||screen.y<0||screen.x>viewW||screen.y>viewH||!Number.isFinite(dist);
   marker.style.left=(screen.x/viewW*100)+'%';
   marker.style.top=(screen.y/viewH*100)+'%';
 });
 setStatus('Skannet 3D-testscene lastet. Berør/dra for å rotere, knip for å zoome.');
 notify('valo-spatial-viewer-ready',{asset:CONTENT,anchorCount:1});
} catch(error){setStatus('3D-visning feilet: '+error.message,true);notify('valo-spatial-viewer-error',{error:error.message});}
