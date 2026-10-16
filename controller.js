let client=null, channel=null, room='', player=1, connected=false;
const statusEl=document.getElementById('status');
const codeEl=document.getElementById('code');
const qs=new URLSearchParams(location.search);
if(qs.get('player')==='2') player=2;
function setStatus(t){if(statusEl)statusEl.textContent=t}
let koState=null,koTimer=null,submissionState=null,groundState=null,controlMode='pro',ultimateCharge=0;
function showKO(payload){koState={hits:0,total:10,difficulty:Math.max(.28,Math.min(1,payload.difficulty||.3)),active:true};const el=document.getElementById('koGame');el.style.display='flex';nextKOButton();}
function nextKOButton(){if(!koState||!koState.active)return;const b=document.getElementById('koTarget');b.style.left=(8+Math.random()*74)+'%';b.style.top=(12+Math.random()*68)+'%';b.textContent=['TAP!','HIT!','GO!','WAKE!'][Math.floor(Math.random()*4)];const life=Math.max(360,1450*(1-koState.difficulty));clearTimeout(koTimer);koTimer=setTimeout(()=>{if(koState&&koState.active)nextKOButton()},life);}
function tapKO(){if(!koState||!koState.active)return;koState.hits++;document.getElementById('koCount').textContent=koState.hits+' / 10';if(koState.hits>=10){koState.active=false;clearTimeout(koTimer);document.getElementById('koGame').style.display='none';send({type:'koescape'});setStatus('YOU GOT UP!');}else nextKOButton();}
function showGroundPound(payload){groundState={active:true,attacker:payload.attacker,defender:payload.defender};document.getElementById('groundPoundGame').style.display='flex';updateGroundPound(payload);}
function updateGroundPound(payload){const attack=payload.hits||payload.attack||0,defend=payload.defend||0;document.getElementById('groundRole').textContent=payload.attacker===player?'YOU ARE ATTACKING':'ESCAPE THE GROUND ATTACK';document.getElementById('groundButton').textContent=payload.attacker===player?'STRIKE':'ESCAPE';document.getElementById('groundProgress').textContent=attack+' / 5 strikes · '+defend+' / 3 escape taps';}
function hideGroundPound(payload){groundState=null;document.getElementById('groundPoundGame').style.display='none';setStatus(payload.escaped?'GROUND ESCAPED':'GROUND AND POUND ENDED');}
function showSubmission(payload){koState=null;clearTimeout(koTimer);document.getElementById('koGame').style.display='none';submissionState={active:true};const el=document.getElementById('submissionGame');el.style.display='flex';document.getElementById('submissionTitle').textContent=payload.attacker===player?'FINISH THE SUBMISSION!':'ESCAPE! TAP FAST!';document.getElementById('submissionRole').textContent=payload.attacker===player?'YOU ARE THE ATTACKER':'YOU ARE DEFENDING';document.getElementById('submissionButton').textContent='TAP!';}
function hideSubmission(payload){submissionState=null;document.getElementById('submissionGame').style.display='none';setStatus(payload.attackerWins?(payload.attacker===player?'SUBMISSION WIN':'SUBMISSION LOST'):(payload.defender===player?'ESCAPED!':'SUBMISSION FAILED'));}
function configValue(){return window.CAGE_CONFIG||window.GAME_CONFIG||window.CONFIG||{}}
function setupClient(){
 const c=configValue();
 const url=c.supabaseUrl||c.SUPABASE_URL||c.url;
 const key=c.supabaseKey||c.SUPABASE_PUBLISHABLE_KEY||c.SUPABASE_ANON_KEY||c.key;
 if(!window.supabase||!url||!key)return false;
 client=window.supabase.createClient(url,key); return true;
}
function send(payload){
 if(!channel||!connected)return;
 channel.send({type:'broadcast',event:player===2?'controller2':'controller',payload:{...payload,player,ts:Date.now()}});
}
async function connectRoom(){
 room=(codeEl.value||'').trim().toUpperCase();
 if(!room){setStatus('ENTER ROOM CODE');return}
 if(!client&&!setupClient()){setStatus('CONFIG ERROR');return}
 if(channel){try{await client.removeChannel(channel)}catch(e){} channel=null}
 connected=false;setStatus('CONNECTING…');
 channel=client.channel('cage-room-'+room);
 channel.on('broadcast',{event:'fighterInfo'},({payload})=>{if(!payload||payload.player!==player)return;const card=document.getElementById('fighterCard');const name=document.getElementById('fighterName');const rec=document.getElementById('fighterRecord');const corner=document.getElementById('fighterCorner');if(name)name.textContent=payload.name||('PLAYER '+player);if(rec)rec.innerHTML='<span>'+Number(payload.wins||0)+'</span> - <span>'+Number(payload.losses||0)+'</span> - <span>'+Number(payload.draws||0)+'</span>';if(corner){corner.textContent=player===1?'RED CORNER':'BLUE CORNER';corner.style.color=player===1?'#ff6675':'#73b8ff';}if(card)card.style.display='flex';});
 channel.on('broadcast',{event:'ko'},({payload})=>{if(payload&&payload.player===player)showKO(payload)});
 channel.on('broadcast',{event:'submission'},({payload})=>{if(payload&&[payload.attacker,payload.defender].includes(player))showSubmission(payload)});
 channel.on('broadcast',{event:'submissionEnd'},({payload})=>{if(payload&&[payload.attacker,payload.defender].includes(player))hideSubmission(payload)});
 channel.on('broadcast',{event:'groundPound'},({payload})=>{if(payload&&[payload.attacker,payload.defender].includes(player)){if(!groundState)showGroundPound(payload);else updateGroundPound(payload)}});
 channel.on('broadcast',{event:'groundPoundEnd'},({payload})=>{if(payload&&[payload.attacker,payload.defender].includes(player))hideGroundPound(payload)});
 channel.on('broadcast',{event:'ultimateCharge'},({payload})=>{if(payload&&payload.player===player){ultimateCharge=payload.charge||0;document.getElementById('chargeFill').style.width=ultimateCharge+'%';document.getElementById('chargeText').textContent=Math.floor(ultimateCharge)+'%';document.getElementById('ground').classList.toggle('ready',ultimateCharge>=100)}});
 channel.on('broadcast',{event:'koend'},({payload})=>{if(payload&&payload.player===player){if(koState)koState.active=false;document.getElementById('koGame').style.display='none';setStatus('KNOCKOUT · FIGHT OVER')}});
 channel.subscribe(s=>{
  if(s==='SUBSCRIBED'){connected=true;setStatus(player===2?'CONNECTED · P2':'CONNECTED · P1');send({type:'hello'});}
  else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'){connected=false;setStatus('CONNECTION ERROR')}
 });
}
document.getElementById('connect').addEventListener('click',connectRoom);
codeEl.addEventListener('keydown',e=>{if(e.key==='Enter')connectRoom()});
function actionDown(a){
 if(a==='blockHigh'||a==='blockLow')send({type:'block',down:true,level:a==='blockHigh'?'high':'low'});
 else if(controlMode==='easy'&&a==='jab')send({type:'action',action:'easyStrike'});else if(controlMode==='easy'&&a==='highKick')send({type:'action',action:'easyKick'});else if(controlMode==='easy'&&a==='ground')send({type:'action',action:'ultimate'});else send({type:'action',action:a});
}
function actionUp(a){
 if(a==='blockHigh'||a==='blockLow')send({type:'block',down:false,level:a==='blockHigh'?'high':'low'});
}
['jab','hook','upper','highkick','lowkick','ground','blockHigh','blockLow'].forEach(id=>{
 const el=document.getElementById(id),a=({upper:'uppercut',highkick:'highKick',lowkick:'lowKick',blockHigh:'blockHigh',blockLow:'blockLow'})[id]||id;
 el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture?.(e.pointerId);el.classList.add('active');actionDown(a)});
 const release=e=>{e.preventDefault();el.classList.remove('active');actionUp(a)};
 el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);
});
const joy=document.getElementById('joy'),nub=document.getElementById('nub');let joyActive=false,joyPointer=null,lastX=0,lastY=0;
function moveJoy(e){
 const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 let dx=(e.clientX-cx)/(r.width*.34),dy=(e.clientY-cy)/(r.height*.34);
 const mag=Math.hypot(dx,dy);if(mag>1){dx/=mag;dy/=mag}
 lastX=Math.round(dx*100)/100;lastY=Math.round(dy*100)/100;
 nub.style.transform=`translate(${dx*112}%,${dy*112}%)`;
 send({type:'move',x:lastX,y:lastY});
}
function stopJoy(){joyActive=false;nub.style.transform='';lastX=lastY=0;send({type:'move',x:0,y:0})}
joy.addEventListener('pointerdown',e=>{e.preventDefault();joyActive=true;joyPointer=e.pointerId;try{joy.setPointerCapture(e.pointerId)}catch(_){}moveJoy(e)});
joy.addEventListener('pointermove',e=>{if(joyActive&&e.pointerId===joyPointer){e.preventDefault();moveJoy(e)}});
joy.addEventListener('pointerup',e=>{if(e.pointerId===joyPointer){e.preventDefault();stopJoy();joyPointer=null}});
joy.addEventListener('pointercancel',()=>{stopJoy();joyPointer=null});
joy.addEventListener('lostpointercapture',()=>{if(joyActive){stopJoy();joyPointer=null}});

function applyControlMode(){const easy=controlMode==='easy';document.getElementById('modeToggle').textContent='MODE: '+controlMode.toUpperCase();document.getElementById('easyControls').style.display=easy?'block':'none';document.getElementById('art').style.opacity=easy?'.16':'1';['jab','hook','upper','highkick','lowkick','ground','blockHigh','blockLow'].forEach(id=>document.getElementById(id).style.display=easy?'none':'');document.getElementById('joy').style.left=easy?'4%':'73.8%';document.getElementById('joy').style.top=easy?'34%':'50%';document.getElementById('joy').style.width=easy?'34%':'25.2%';document.getElementById('joy').style.height=easy?'58%':'45%';document.getElementById('ground').setAttribute('aria-label',easy?'Submission ultimate':'Ground and pound');document.getElementById('statusline').textContent=easy?'EASY MODE · MOVE · PUNCH · KICK · ULTIMATE':'PRO MODE · FULL CONTROLS';}
document.getElementById('modeToggle').addEventListener('click',()=>{controlMode=controlMode==='pro'?'easy':'pro';applyControlMode();});
document.getElementById('easyStrike').addEventListener('pointerdown',e=>{e.preventDefault();send({type:'action',action:'easyStrike'});});
document.getElementById('easyKick').addEventListener('pointerdown',e=>{e.preventDefault();send({type:'action',action:'easyKick'});});
document.getElementById('easyUltimate').addEventListener('pointerdown',e=>{e.preventDefault();if(ultimateCharge>=100)send({type:'action',action:'ultimate'});else setStatus('ULTIMATE '+Math.floor(ultimateCharge)+'%');});
const easyBlock=document.getElementById('easyBlock');
easyBlock.addEventListener('pointerdown',e=>{e.preventDefault();try{easyBlock.setPointerCapture(e.pointerId)}catch(_){}easyBlock.classList.add('active');send({type:'block',down:true,level:'high'});send({type:'block',down:true,level:'low'});});
function releaseEasyBlock(e){if(e)e.preventDefault();easyBlock.classList.remove('active');send({type:'block',down:false,level:'high'});send({type:'block',down:false,level:'low'});}
easyBlock.addEventListener('pointerup',releaseEasyBlock);easyBlock.addEventListener('pointercancel',releaseEasyBlock);easyBlock.addEventListener('lostpointercapture',releaseEasyBlock);
applyControlMode();
document.getElementById('groundButton').addEventListener('pointerdown',e=>{e.preventDefault();if(groundState&&groundState.active)send({type:'groundTap'});});
document.getElementById('koTarget').addEventListener('pointerdown',e=>{e.preventDefault();tapKO()});document.getElementById('submissionButton').addEventListener('pointerdown',e=>{e.preventDefault();if(submissionState&&submissionState.active)send({type:'submitTap'});});
window.addEventListener('blur',()=>{send({type:'block',down:false,level:'high'});send({type:'block',down:false,level:'low'});send({type:'move',x:0,y:0});});
document.addEventListener('visibilitychange',()=>{if(document.hidden){send({type:'block',down:false,level:'high'});send({type:'block',down:false,level:'low'});send({type:'move',x:0,y:0});}});
