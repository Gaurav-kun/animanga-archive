// ═══════════════════════ SOUND ENGINE ═══════════════════════
var audioCtx=null;
var soundEnabled=false;
function initAudio(){
  if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended')audioCtx.resume();
}
function playSound(freq,type,dur,vol,slide){
  if(!soundEnabled||!audioCtx)return;
  var o=audioCtx.createOscillator();
  var g=audioCtx.createGain();
  o.type=type||'sine';
  o.frequency.setValueAtTime(freq,audioCtx.currentTime);
  if(slide)o.frequency.linearRampToValueAtTime(slide,audioCtx.currentTime+dur);
  g.gain.setValueAtTime(vol||0.08,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+dur);
  o.connect(g);g.connect(audioCtx.destination);
  o.start();o.stop(audioCtx.currentTime+dur);
}
function sfxClick(){playSound(800,'sine',0.08,0.04);playSound(1200,'sine',0.06,0.03,1600)}
function sfxHover(){playSound(600,'sine',0.05,0.02,900)}
function sfxHeart(){playSound(523,'sine',0.1,0.05);setTimeout(function(){playSound(659,'sine',0.1,0.05)},80);setTimeout(function(){playSound(784,'sine',0.15,0.06)},160)}
function sfxDojo(){playSound(200,'triangle',0.3,0.06);setTimeout(function(){playSound(300,'triangle',0.2,0.04)},150)}
function sfxSword(){playSound(80,'sawtooth',0.5,0.03);setTimeout(function(){playSound(200,'sawtooth',0.3,0.04,800)},100);setTimeout(function(){playSound(400,'triangle',0.4,0.05,1200)},200)}
function sfxError(){playSound(150,'square',0.2,0.04);setTimeout(function(){playSound(120,'square',0.25,0.05)},150)}
function toggleSound(){
  initAudio();
  soundEnabled=!soundEnabled;
  var btn=document.getElementById('soundToggle');
  if(btn){btn.textContent=soundEnabled?'🔊':'🔇';if(!soundEnabled)btn.classList.add('muted');else btn.classList.remove('muted')}
  if(soundEnabled)sfxClick();
}
(function initSoundState(){
  var btn=document.getElementById('soundToggle');
  if(btn){btn.textContent='🔇';btn.classList.add('muted')}
})();

// ═══════════════════════ THREE.JS 3D SCENE ═══════════════════════
function initThreeScene(){
  var canvas=document.getElementById('threeCanvas');
  if(!canvas||!window.THREE)return;
  var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.set(0,0,8);
  // Katana blade
  var bladeGeo=new THREE.BoxGeometry(0.06,3,0.04);
  var bladeMat=new THREE.MeshStandardMaterial({color:0xccddee,metalness:0.9,roughness:0.2});
  var blade=new THREE.Mesh(bladeGeo,bladeMat);
  // Tsuba (guard)
  var tsubaGeo=new THREE.CylinderGeometry(0.25,0.25,0.06,16);
  var tsubaMat=new THREE.MeshStandardMaterial({color:0xc8a032,metalness:0.8,roughness:0.3});
  var tsuba=new THREE.Mesh(tsubaGeo,tsubaMat);
  tsuba.position.y=-1.4;
  // Handle
  var handleGeo=new THREE.CylinderGeometry(0.07,0.08,1.2,8);
  var handleMat=new THREE.MeshStandardMaterial({color:0x1a0a0a,metalness:0.1,roughness:0.7});
  var handle=new THREE.Mesh(handleGeo,handleMat);
  handle.position.y=-2.1;
  // Group
  var katana=new THREE.Group();
  katana.add(blade);katana.add(tsuba);katana.add(handle);
  katana.rotation.x=0.3;katana.rotation.z=-0.2;
  katana.position.y=0.5;
  scene.add(katana);
  // Lighting
  var ambient=new THREE.AmbientLight(0x331111,0.6);
  scene.add(ambient);
  var point=new THREE.PointLight(0xcc1433,1.5,15);
  point.position.set(3,2,4);scene.add(point);
  var point2=new THREE.PointLight(0xc8a032,0.6,10);
  point2.position.set(-3,-1,3);scene.add(point2);
  // Particles
  var particlesGeo=new THREE.BufferGeometry();
  var particlesCount=80;
  var posArray=new Float32Array(particlesCount*3);
  for(var i=0;i<particlesCount*3;i++)posArray[i]=(Math.random()-0.5)*10;
  particlesGeo.setAttribute('position',new THREE.BufferAttribute(posArray,3));
  var particlesMat=new THREE.PointsMaterial({size:0.03,color:0xcc1433,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending});
  var particles=new THREE.Points(particlesGeo,particlesMat);
  scene.add(particles);
  // Animate
  function animate(){
    requestAnimationFrame(animate);
    katana.rotation.y+=0.003;
    katana.position.y=0.5+Math.sin(Date.now()*0.001)*0.2;
    particles.rotation.y+=0.0005;
    particles.rotation.x+=0.0003;
    point.intensity=1.5+Math.sin(Date.now()*0.002)*0.4;
    renderer.render(scene,camera);
  }
  animate();
  window.addEventListener('resize',function(){
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  });
}


// STATE
var state={
  af:[],mf:[],hwf:[],as:'',ms:'',hws:'',
  animeSort:'default',mangaSort:'default',manhwaSort:'default',
  animeView:'grid',mangaView:'grid',manhwaView:'grid',
  animePage:1,mangaPage:1,manhwaPage:1
};
var PER_PAGE=12;
var qIdx=0;
var favs=JSON.parse(localStorage.getItem('gaurav_favs')||'{}');
var progress=JSON.parse(localStorage.getItem('gaurav_progress')||'{}');
var toastTimer=null;

// HELPERS
var kanjiMap=['刀','剣','武','忍','道','侍','花','火','水','風','鬼','魂','天','神','夢','影','月','星','血','生','力','虎'];
function covClass(tags){
  var p=['psychological','horror','romance','scifi','darkfantasy','historical','thriller','sports','fantasy','adventure','action','seinen','comedy','drama','slice-of-life'];
  for(var i=0;i<p.length;i++)if(tags.indexOf(p[i])>-1)return'cov-'+p[i];
  return'cov-default';
}
function covChar(t){return kanjiMap[t.charCodeAt(0)%kanjiMap.length]}
function toast(msg){
  var t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){t.classList.remove('show');},2200);
}
function confetti(){
  var colors=['#cc1433','#c8a032','#ff2050','#4ade80','#f59e0b'];
  for(var i=0;i<60;i++){
    var p=document.createElement('div');p.className='confetti-piece';
    var c=colors[Math.floor(Math.random()*colors.length)];
    p.style.cssText='left:'+Math.random()*100+'%;width:'+(Math.random()*8+4)+'px;height:'+(Math.random()*12+6)+'px;background:'+c+';--cd:'+(Math.random()*1.5+1.5)+'s;--cdel:'+Math.random()*0.4+'s;--rx:'+(Math.random()*720-360)+'deg;';
    document.body.appendChild(p);setTimeout(function(){p.remove();},2500);
  }
}
function updateFavBadge(){
  var count=Object.keys(favs).length;
  var badge=document.getElementById('favCountBadge');
  if(badge){badge.textContent=count;if(count>0)badge.classList.add('visible');else badge.classList.remove('visible');}
}
function toggleFav(type,malId,e){
  e.stopPropagation();
  var key=type+'_'+malId;
  if(favs[key]){delete favs[key]}else{favs[key]=true}
  localStorage.setItem('gaurav_favs',JSON.stringify(favs));
  updateFavBadge();
  renderAll();
  if(favs[key]){sfxHeart();toast('❤️ ADDED TO FAVORITES')}else{toast('REMOVED FROM FAVORITES')}
}
function setProgress(type,malId,status,e){
  e.stopPropagation();
  var key=type+'_'+malId;
  if(progress[key]===status){delete progress[key]}else{progress[key]=status}
  localStorage.setItem('gaurav_progress',JSON.stringify(progress));
  sfxClick();renderAll();
}

// CARD HTML
function cardHTML(item,type){
  var lp=type==='anime'?'anime':'manga';
  var extraLink=type==='anime'?'<a href="https://animepahe.pw/" target="_blank" rel="noopener" class="clink">AnimePahe</a>':'<a href="https://comick.io/search?q='+encodeURIComponent(item.title)+'" target="_blank" rel="noopener" class="clink">Comick</a>';
  var isFav=favs[type+'_'+item.malId];
  var progKey=type+'_'+item.malId;
  var prog=progress[progKey]||'';
  var progLabel='',progClass='';
  if(prog==='want'){progLabel='WANT TO';progClass='prog-want'}
  else if(prog==='doing'){progLabel='WATCHING';progClass='prog-doing'}
  else if(prog==='done'){progLabel='COMPLETED';progClass='prog-done'}
  else if(prog==='dropped'){progLabel='DROPPED';progClass='prog-dropped'}
  var progBadge=progLabel?'<div class="prog-badge '+progClass+'">'+progLabel+'</div>':'';
  return'<div class="card rev fb" onmousemove="tilt(this,event)" onmouseleave="unTilt(this)" onmouseenter="sfxHover()">'+
    '<div class="cc '+covClass(item.tags)+'"><span class="cc-char">'+covChar(item.title)+'</span><div class="ct-badge">'+type.charAt(0).toUpperCase()+type.slice(1)+'</div><div class="cs '+(item.status==='airing'?'airing':'finished')+'">'+(item.status==='airing'?'AIRING':'FINISHED')+'</div>'+progBadge+'</div>'+
    '<button class="fav-btn'+(isFav?' faved':'')+'" onclick="toggleFav(\''+type+'\',\''+item.malId+'\',event)">'+(isFav?'❤️':'🤍')+'</button>'+
    '<div class="cb">'+
      '<div class="c-stars">'+'★'.repeat(item.rating)+'☆'.repeat(5-item.rating)+'</div>'+
      '<div class="c-title">'+item.title+'</div><div class="c-jp">'+item.jp+'</div>'+
      '<div class="c-meta"><span>📅 '+item.year+'</span><span>📺 '+item.episodes+'</span></div>'+
      '<div class="c-desc">'+item.desc+'</div>'+
      '<div class="c-tags">'+item.tags.slice(0,4).map(function(t){return'<span class="ctag" onclick="clickTag(\''+type+'\',\''+t+'\',event)">'+t+'</span>'}).join('')+'</div>'+
      '<div class="c-links"><a href="https://myanimelist.net/'+lp+'/'+item.malId+'" target="_blank" rel="noopener" class="clink pr">MAL</a>'+extraLink+'</div>'+
      '<div class="prog-bar">'+
        '<button class="prog-btn'+(prog==='want'?' active want':'')+'" onclick="setProgress(\''+type+'\',\''+item.malId+'\',\'want\',event)">Want</button>'+
        '<button class="prog-btn'+(prog==='doing'?' active doing':'')+'" onclick="setProgress(\''+type+'\',\''+item.malId+'\',\'doing\',event)">Doing</button>'+
        '<button class="prog-btn'+(prog==='done'?' active done':'')+'" onclick="setProgress(\''+type+'\',\''+item.malId+'\',\'done\',event)">Done</button>'+
        '<button class="prog-btn'+(prog==='dropped'?' active dropped':'')+'" onclick="setProgress(\''+type+'\',\''+item.malId+'\',\'dropped\',event)">Drop</button>'+
      '</div></div></div>';
}
function clickTag(type,tag,event){
  event.stopPropagation();sfxClick();
  var stateArr=type==='anime'?state.af:type==='manga'?state.mf:state.hwf;
  var allBtn=document.querySelector('#'+type+'Filters .fb2[data-filter="all"]');
  if(allBtn)allBtn.classList.remove('active');
  var idx=stateArr.indexOf(tag);
  if(idx===-1){stateArr.push(tag)}
  updateFilterButtons(type);
  if(type==='anime')renderAnime();else if(type==='manga')renderManga();else renderManhwa();
}

// SORT & FILTER
function sortDB(items,sort){
  var s=items.slice();
  if(sort==='rating-desc')s.sort(function(a,b){return b.rating-a.rating});
  else if(sort==='rating-asc')s.sort(function(a,b){return a.rating-b.rating});
  else if(sort==='year-desc')s.sort(function(a,b){return (parseInt(b.year)||0)-(parseInt(a.year)||0)});
  else if(sort==='year-asc')s.sort(function(a,b){return (parseInt(a.year)||0)-(parseInt(b.year)||0)});
  else if(sort==='title-az')s.sort(function(a,b){return a.title.localeCompare(b.title)});
  else if(sort==='title-za')s.sort(function(a,b){return b.title.localeCompare(a.title)});
  return s;
}
function setSort(type,val){
  state[type+'Sort']=val;
  if(type==='anime')state.animePage=1;else if(type==='manga')state.mangaPage=1;else state.manhwaPage=1;
  sfxClick();renderAll();
}
function filterDB(db,filters,search){
  var items=db.slice();
  if(filters.length>0&&filters.indexOf('all')===-1)items=items.filter(function(i){return filters.some(function(f){return i.tags.indexOf(f)>-1})});
  if(search.trim()){var t=search.toLowerCase();items=items.filter(function(i){return i.title.toLowerCase().indexOf(t)>-1||i.desc.toLowerCase().indexOf(t)>-1||i.tags.some(function(g){return g.indexOf(t)>-1})})}
  return items;
}

// RENDER
function renderSection(type,gridId,cntId,sortKey,pageKey){
  var db=type==='anime'?animeDB:type==='manga'?mangaDB:manhwaDB;
  var filters=type==='anime'?state.af:type==='manga'?state.mf:state.hwf;
  var search=type==='anime'?state.as:type==='manga'?state.ms:state.hws;
  var viewMode=type==='anime'?state.animeView:type==='manga'?state.mangaView:state.manhwaView;
  var items=sortDB(filterDB(db,filters,search),state[sortKey]);
  var total=items.length,page=state[pageKey],start=0,end=page*PER_PAGE;
  var paged=items.slice(start,end);
  var grid=document.getElementById(gridId);
  grid.innerHTML=paged.length?paged.map(function(i){return cardHTML(i,type)}).join(''):'<div class="no-res">NO RESULTS FOUND</div>';
  if(viewMode==='list')grid.classList.add('list-view');else grid.classList.remove('list-view');
  document.getElementById(cntId).textContent=total+' entries';
  if(end<total){
    var wrap=document.createElement('div');wrap.className='lm-wrap';
    wrap.innerHTML='<button class="lm-btn" onclick="loadMore(\''+type+'\')"><span>LOAD MORE</span><span class="lm-count">SHOWING '+end+' OF '+total+'</span></button>';
    grid.appendChild(wrap);
  }
  doReveal();
}
function loadMore(type){
  if(type==='anime')state.animePage++;else if(type==='manga')state.mangaPage++;else state.manhwaPage++;
  sfxClick();renderAll();
}
function renderAnime(){renderSection('anime','animeGrid','aCnt','animeSort','animePage')}
function renderManga(){renderSection('manga','mangaGrid','mCnt','mangaSort','mangaPage')}
function renderManhwa(){renderSection('manhwa','manhwaGrid','hwCnt','manhwaSort','manhwaPage')}
function renderAll(){renderAnime();renderManga();renderManhwa();renderFeatured()}
function setView(mode,gridId){
  var type=gridId==='animeGrid'?'anime':gridId==='mangaGrid'?'manga':'manhwa';
  state[type+'View']=mode;sfxClick();
  var grid=document.getElementById(gridId);
  if(mode==='list')grid.classList.add('list-view');else grid.classList.remove('list-view');
}
function dailyPick(db){var d=Math.floor(Date.now()/86400000);return db[d%db.length]}
function fcHTML(item,type){
  var lp=type==='anime'?'anime':'manga';
  var sl=type==='anime'?'<a href="https://animepahe.pw/" target="_blank" rel="noopener" class="flink flink-s">Watch Free</a>':'<a href="https://comick.io/search?q='+encodeURIComponent(item.title)+'" target="_blank" rel="noopener" class="flink flink-s">Read on Comick</a>';
  return'<div class="fc"><div class="fc-cover '+covClass(item.tags)+'"><span class="fc-char">'+covChar(item.title)+'</span><div class="fc-tbadge">'+type.toUpperCase()+'</div><div class="fc-daily">TODAY\'S PICK ⚡</div></div><div class="fc-body"><div class="fc-stars">'+'★'.repeat(item.rating)+'☆'.repeat(5-item.rating)+'</div><div class="fc-name">'+item.title+'</div><div class="fc-jp">'+item.jp+'</div><div class="fc-meta"><span>📅 '+item.year+'</span><span>📺 '+item.episodes+'</span><span>'+(item.status==='airing'?'🔴 Airing':'✅ Finished')+'</span></div><div class="fc-desc">'+item.desc+'</div><div class="fc-tags">'+item.tags.map(function(t){return'<span class="ftag">'+t+'</span>'}).join('')+'</div><div class="fc-links"><a href="https://myanimelist.net/'+lp+'/'+item.malId+'" target="_blank" rel="noopener" class="flink flink-p">View on MAL</a>'+sl+'</div></div></div>';
}
function renderFeatured(){
  document.getElementById('fcAnime').innerHTML=fcHTML(dailyPick(animeDB),'anime');
  document.getElementById('fcManga').innerHTML=fcHTML(dailyPick(mangaDB),'manga');
}
function mpHTML(item,type){
  var lp=type==='anime'?'anime':'manga';
  var sl=type==='anime'?'<a href="https://animepahe.pw/" target="_blank" rel="noopener" class="flink flink-s">Watch on AnimePahe</a>':'<a href="https://comick.io/search?q='+encodeURIComponent(item.title)+'" target="_blank" rel="noopener" class="flink flink-s">Read on Comick</a>';
  return'<div class="m-badge">'+type.toUpperCase()+' OF THE DAY</div><div class="m-title">'+item.title+'</div><div class="m-jp">'+item.jp+'</div><div class="m-stars">'+'★'.repeat(item.rating)+'☆'.repeat(5-item.rating)+'</div><div class="m-meta"><span>📅 '+item.year+'</span><span>📺 '+item.episodes+'</span><span>'+(item.status==='airing'?'🔴 Airing':'✅ Finished')+'</span></div><p class="m-desc">'+item.desc+'</p><div class="m-tags">'+item.tags.map(function(t){return'<span class="mtag2">'+t+'</span>'}).join('')+'</div><div class="m-actions"><a href="https://myanimelist.net/'+lp+'/'+item.malId+'" target="_blank" rel="noopener" class="flink flink-p">View on MAL</a>'+sl+'</div>';
}
function openModal(){sfxSword();document.getElementById('m-anime').innerHTML=mpHTML(dailyPick(animeDB),'anime');document.getElementById('m-manga').innerHTML=mpHTML(dailyPick(mangaDB),'manga');document.getElementById('m-manhwa').innerHTML=mpHTML(dailyPick(manhwaDB),'manhwa');document.getElementById('modal').classList.add('open')}
function closeModal(){document.getElementById('modal').classList.remove('open')}
function switchTab(btn,panelId){sfxClick();document.querySelectorAll('.mtab').forEach(function(b){b.classList.remove('on')});btn.classList.add('on');document.querySelectorAll('.mpanel').forEach(function(p){p.classList.remove('on')});document.getElementById(panelId).classList.add('on')}
function openFavsPanel(){
  var grid=document.getElementById('favsGrid');sfxClick();
  var entries=[];
  Object.keys(favs).forEach(function(k){
    var parts=k.split('_');var type=parts[0],malId=parts[1];
    var db=type==='anime'?animeDB:type==='manga'?mangaDB:manhwaDB;
    var item=db.find(function(i){return i.malId===malId});
    if(item)entries.push({item:item,type:type});
  });
  if(!entries.length){grid.innerHTML='<div class="favs-empty">NO FAVORITES YET — ❤️ SOME CARDS!</div>'}
  else{grid.innerHTML=entries.map(function(e){var lp=e.type==='anime'?'anime':'manga';return'<div class="fav-item"><div class="fav-item-type">'+e.type.toUpperCase()+'</div><div class="fav-item-title">'+e.item.title+'</div><div class="fav-item-jp">'+e.item.jp+'</div><div class="fav-item-stars">'+'★'.repeat(e.item.rating)+'☆'.repeat(5-e.item.rating)+'</div><div class="fav-item-desc">'+e.item.desc+'</div><a href="https://myanimelist.net/'+lp+'/'+e.item.malId+'" target="_blank" rel="noopener" class="fav-item-link">MAL →</a></div>'}).join('')}
  document.getElementById('favs-modal').classList.add('open');
}
function closeFavsPanel(){document.getElementById('favs-modal').classList.remove('open')}
function exportFavorites(){
  var lines=[];sfxClick();
  Object.keys(favs).forEach(function(k){
    var parts=k.split('_');var type=parts[0],malId=parts[1];
    var db=type==='anime'?animeDB:type==='manga'?mangaDB:manhwaDB;
    var item=db.find(function(i){return i.malId===malId});
    if(item)lines.push('['+type.toUpperCase()+'] '+item.title+' ('+item.year+') — ★'.repeat(item.rating)+'☆'.repeat(5-item.rating)+' | '+item.desc);
  });
  if(lines.length){navigator.clipboard.writeText(lines.join('\n')).then(function(){toast('📋 '+lines.length+' FAVORITES COPIED!')})}
  else{toast('NO FAVORITES TO EXPORT')}
}
function addEntry(){
  var title=document.getElementById('addTitle').value.trim();
  if(!title){sfxError();toast('ENTER A TITLE!');return}
  var type=document.getElementById('addType').value;
  var entry={title:title.toUpperCase(),jp:document.getElementById('addJp').value||title,rating:parseInt(document.getElementById('addRating').value)||5,desc:document.getElementById('addDesc').value||'Added by community.',tags:document.getElementById('addTags').value.split(',').map(function(t){return t.trim().toLowerCase()}).filter(Boolean),malId:document.getElementById('addMalId').value||Date.now().toString(),year:document.getElementById('addYear').value||'Unknown',episodes:document.getElementById('addEpisodes').value||'N/A',status:document.getElementById('addStatus').value};
  if(type==='anime'){animeDB.push(entry);saveEntry('anime',entry)}else if(type==='manga'){mangaDB.push(entry);saveEntry('manga',entry)}else{manhwaDB.push(entry);saveEntry('manhwa',entry)}
  ['addTitle','addJp','addDesc','addTags','addMalId','addYear','addEpisodes'].forEach(function(id){document.getElementById(id).value=''});
  updateStats();renderAll();confetti();sfxSword();toast('✅ "'+title+'" ADDED!');
}
function loadSaved(){
  var sa=localStorage.getItem('gaurav_anime'),sm=localStorage.getItem('gaurav_manga'),shw=localStorage.getItem('gaurav_manhwa');
  if(sa)JSON.parse(sa).forEach(function(e){animeDB.push(e)});
  if(sm)JSON.parse(sm).forEach(function(e){mangaDB.push(e)});
  if(shw)JSON.parse(shw).forEach(function(e){manhwaDB.push(e)});
}
function saveEntry(type,entry){var k='gaurav_'+type,ex=JSON.parse(localStorage.getItem(k)||'[]');ex.push(entry);localStorage.setItem(k,JSON.stringify(ex))}
function tilt(card,e){var r=card.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5;var y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(800px) rotateY('+(x*12)+'deg) rotateX('+(-y*12)+'deg) translateY(-8px) scale(1.02)'}
function unTilt(card){card.style.transform=''}
function randomPick(type){
  sfxClick();
  var db=type==='anime'?animeDB:type==='manga'?mangaDB:manhwaDB;
  var f=type==='anime'?state.af:type==='manga'?state.mf:state.hwf;
  var items=f.length===0||f.indexOf('all')>-1?db:db.filter(function(i){return f.some(function(tg){return i.tags.indexOf(tg)>-1})});
  if(!items.length)return;
  var pick=items[Math.floor(Math.random()*items.length)];
  if(type==='anime'){state.af=[];state.as='';state.animePage=1}else if(type==='manga'){state.mf=[];state.ms='';state.mangaPage=1}else{state.hwf=[];state.hws='';state.manhwaPage=1}
  updateFilterButtons(type);renderAll();
  setTimeout(function(){document.querySelectorAll('#'+type+'Grid .card').forEach(function(c){var te=c.querySelector('.c-title');if(te&&te.textContent===pick.title){c.classList.add('hl');c.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){c.classList.remove('hl')},6000)}})},100);
}
function toggleFilter(btn,type){
  sfxClick();
  var filter=btn.dataset.filter;
  var stateArr=type==='anime'?state.af:type==='manga'?state.mf:state.hwf;
  if(filter==='all'){stateArr.length=0;document.querySelectorAll('#'+type+'Filters .fb2').forEach(function(b){b.classList.remove('active')});btn.classList.add('active')}
  else{var allBtn=document.querySelector('#'+type+'Filters .fb2[data-filter="all"]');if(allBtn)allBtn.classList.remove('active');var idx=stateArr.indexOf(filter);if(idx>-1){stateArr.splice(idx,1);btn.classList.remove('active')}else{stateArr.push(filter);btn.classList.add('active')}if(stateArr.length===0&&allBtn)allBtn.classList.add('active')}
  if(type==='anime'){state.animePage=1;renderAnime()}else if(type==='manga'){state.mangaPage=1;renderManga()}else{state.manhwaPage=1;renderManhwa()}
}
function updateFilterButtons(type){
  var stateArr=type==='anime'?state.af:type==='manga'?state.mf:state.hwf;
  var container=document.getElementById(type+'Filters');if(!container)return;
  container.querySelectorAll('.fb2').forEach(function(b){if(b.dataset.filter==='all')b.classList.toggle('active',stateArr.length===0);else b.classList.toggle('active',stateArr.indexOf(b.dataset.filter)>-1)});
}
function toggleDojo(){document.body.classList.toggle('dawn');localStorage.setItem('gaurav_dojo',document.body.classList.contains('dawn')?'dawn':'night');sfxDojo();toast(document.body.classList.contains('dawn')?'🌅 DAWN DOJO':'🌙 NIGHT DOJO')}
(function initDojo(){if(localStorage.getItem('gaurav_dojo')==='dawn')document.body.classList.add('dawn')})();
function rotateQuote(){
  var mqText=document.getElementById('mqText');if(!mqText)return;mqText.style.opacity='0';
  setTimeout(function(){qIdx=(qIdx+1)%musashiQ.length;document.getElementById('mqText').innerHTML='"'+musashiQ[qIdx].t+'"';document.getElementById('mqSrc').innerHTML=musashiQ[qIdx].s;mqText.style.opacity='1';document.querySelectorAll('.qd').forEach(function(d,i){d.classList.toggle('on',i===qIdx)})},300);
}
function initQuotes(){
  document.getElementById('mqText').innerHTML='"'+musashiQ[0].t+'"';document.getElementById('mqSrc').innerHTML=musashiQ[0].s;
  var dotsDiv=document.getElementById('qdots');if(dotsDiv){for(var i=0;i<musashiQ.length;i++){var dot=document.createElement('div');dot.className='qd'+(i===0?' on':'');dot.onclick=(function(idx){return function(){qIdx=idx;rotateQuote()}})(i);dotsDiv.appendChild(dot)}}
  setInterval(rotateQuote,8000);
}
function shareQuote(){sfxClick();var text=document.getElementById('mqText').textContent+' '+document.getElementById('mqSrc').textContent;navigator.clipboard.writeText(text).then(function(){toast('📋 QUOTE COPIED!')})}
function toggleMobileMenu(){
  document.getElementById('mobileMenu').classList.toggle('open');
  document.getElementById('mobOverlay').classList.toggle('show');
  document.getElementById('hamBtn').classList.toggle('open');
  sfxClick();
}
function toggleKeyGuide(){document.getElementById('key-guide').classList.toggle('open');sfxClick()}

// CANVASES
function initCanvas(){
  var c=document.getElementById('bgCanvas');if(!c)return;var ctx=c.getContext('2d');c.width=window.innerWidth;c.height=window.innerHeight;
  var p=[];for(var i=0;i<70;i++)p.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*2+.5,alpha:Math.random()*.5+.25,vx:(Math.random()-.5)*.3,vy:-(Math.random()*.3+.15),w:Math.random()*Math.PI*2,ws:(Math.random()-.5)*.02});
  function draw(){if(!c||!ctx)return;ctx.clearRect(0,0,c.width,c.height);var dawn=document.body.classList.contains('dawn');
    p.forEach(function(a){a.x+=a.vx+Math.sin(a.w)*.4;a.y+=a.vy;a.w+=a.ws;if(a.y<-10)a.y=c.height+10;if(a.x<-10)a.x=c.width+10;if(a.x>c.width+10)a.x=-10;
      var g=ctx.createRadialGradient(a.x,a.y,0,a.x,a.y,a.r*3);g.addColorStop(0,dawn?'rgba(180,120,60,'+a.alpha+')':'rgba(255,100,40,'+a.alpha+')');g.addColorStop(.4,dawn?'rgba(160,100,40,'+(a.alpha*.5)+')':'rgba(204,20,51,'+(a.alpha*.6)+')');g.addColorStop(1,dawn?'rgba(160,100,40,0)':'rgba(204,20,51,0)');
      ctx.beginPath();ctx.arc(a.x,a.y,a.r*3,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fillStyle=dawn?'rgba(200,140,60,'+(a.alpha*.8)+')':'rgba(255,180,80,'+(a.alpha*1.2)+')';ctx.fill();
    });requestAnimationFrame(draw);}
  draw();window.addEventListener('resize',function(){c.width=window.innerWidth;c.height=window.innerHeight});
}
function initKanjiFog(){
  var c=document.getElementById('kanjiCanvas');if(!c)return;var ctx=c.getContext('2d');c.width=window.innerWidth;c.height=window.innerHeight;
  var fog=['武','侍','道','剣','魂','忍','鬼'];var items=[];for(var i=0;i<8;i++)items.push({x:Math.random()*c.width,y:Math.random()*c.height,text:fog[Math.floor(Math.random()*fog.length)],size:Math.random()*120+60,alpha:Math.random()*.06+.02,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.2});
  function draw(){if(!c||!ctx||document.body.classList.contains('dawn')){ctx&&ctx.clearRect(0,0,c.width,c.height);requestAnimationFrame(draw);return}
    ctx.clearRect(0,0,c.width,c.height);items.forEach(function(f){f.x+=f.vx;f.y+=f.vy;if(f.x>c.width+200)f.x=-200;if(f.x<-200)f.x=c.width+200;if(f.y>c.height+200)f.y=-200;if(f.y<-200)f.y=c.height+200;ctx.save();ctx.translate(f.x,f.y);ctx.font='bold '+f.size+'px "Noto Serif JP",serif';ctx.fillStyle='rgba(204,20,51,'+f.alpha+')';ctx.fillText(f.text,0,0);ctx.restore()});requestAnimationFrame(draw);}
  draw();window.addEventListener('resize',function(){c.width=window.innerWidth;c.height=window.innerHeight});
}
function initRain(){
  var c=document.getElementById('rainCanvas');if(!c)return;var ctx=c.getContext('2d');c.width=window.innerWidth;c.height=window.innerHeight;
  var drops=[];for(var i=0;i<120;i++)drops.push({x:Math.random()*c.width,y:Math.random()*c.height,l:Math.random()*12+8,s:Math.random()*8+6,o:Math.random()*.12+.04});
  function draw(){if(!c||!ctx)return;ctx.clearRect(0,0,c.width,c.height);if(document.body.classList.contains('dawn')){requestAnimationFrame(draw);return}
    ctx.lineWidth=1;drops.forEach(function(d){ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-1,d.y+d.l);ctx.strokeStyle='rgba(200,180,160,'+d.o+')';ctx.stroke();d.y+=d.s;if(d.y>c.height){d.y=-d.l;d.x=Math.random()*c.width}});requestAnimationFrame(draw);}
  draw();window.addEventListener('resize',function(){c.width=window.innerWidth;c.height=window.innerHeight});
}
function initClickParticles(){
  document.addEventListener('click',function(e){for(var i=0;i<14;i++){var p=document.createElement('div');p.className='cpx';var ang=(-Math.PI/3)+(Math.PI*1.6)*(i/14),sp=Math.random()*70+40;p.style.setProperty('--tx',Math.cos(ang)*sp+'px');p.style.setProperty('--ty',Math.sin(ang)*sp+'px');p.style.setProperty('--dur',(Math.random()*.7+.5)+'s');p.style.left=e.clientX+'px';p.style.top=e.clientY+'px';document.body.appendChild(p);setTimeout(function(){p.remove()},1000)}});
}
var lastSplat=0;
function initScrollSplatter(){
  window.addEventListener('scroll',function(){var now=Date.now();if(now-lastSplat<800)return;lastSplat=now;if(Math.random()>0.4)return;var s=document.createElement('div');s.className='ink-splatter';s.style.left=(Math.random()*80+10)+'%';s.style.top=(Math.random()*70+15)+'%';document.body.appendChild(s);setTimeout(function(){s.remove()},1000)});
}
function initMoonParallax(){
  var moon=document.querySelector('.hero-moon');if(!moon)return;window.addEventListener('mousemove',function(e){var x=(e.clientX/window.innerWidth-.5)*20,y=(e.clientY/window.innerHeight-.5)*20;if(moon)moon.style.transform='translate('+x+'px,'+y+'px)'});
}

// SCROLL
window.addEventListener('scroll',function(){
  var s=document.documentElement.scrollTop,h=document.documentElement.scrollHeight-window.innerHeight,pct=Math.min(s/h*100,100);
  var pbar=document.getElementById('pbar');if(pbar)pbar.style.width=pct+'%';
  var btt=document.getElementById('btt');if(btt){if(window.scrollY>300)btt.classList.add('show');else btt.classList.remove('show')}
  var nav=document.getElementById('nav');if(nav){if(window.scrollY>50)nav.classList.add('scrolled');else nav.classList.remove('scrolled')}
  var bttProg=document.getElementById('bttProg');if(bttProg){var circ=150.8,offset=circ-(pct/100*circ);bttProg.style.strokeDashoffset=offset}
  doReveal();updateActiveDot();
});
function doReveal(){document.querySelectorAll('.rev').forEach(function(el){if(el.getBoundingClientRect().top<window.innerHeight-100)el.classList.add('vis')})}
function updateActiveDot(){
  var sections=[{id:'',el:null},{id:'featured',el:document.getElementById('featured')},{id:'anime',el:document.getElementById('anime')},{id:'manga',el:document.getElementById('manga')},{id:'manhwa',el:document.getElementById('manhwa')},{id:'add',el:document.getElementById('add')},{id:'about',el:document.getElementById('about')}];
  var current='';sections.forEach(function(sec){if(!sec.el||sec.el.getBoundingClientRect().top<=window.innerHeight/2)current=sec.id});
  document.querySelectorAll('.sdot').forEach(function(dot){dot.classList.toggle('active',dot.dataset.targetId===current)});
}
document.querySelectorAll('.sdot').forEach(function(dot){dot.addEventListener('click',function(){sfxClick();var id=this.dataset.targetId;if(!id)window.scrollTo({top:0,behavior:'smooth'});else{var el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'})}})});
function updateStats(){
  var targets=[{el:document.getElementById('statAnime'),val:animeDB.length},{el:document.getElementById('statManga'),val:mangaDB.length},{el:document.getElementById('statManhwa'),val:manhwaDB.length},{el:document.getElementById('statTotal'),val:animeDB.length+mangaDB.length+manhwaDB.length}];
  targets.forEach(function(t){if(t.el)t.el.textContent=t.val});
}
function initSearchAndFilters(){
  document.getElementById('animeSearch').addEventListener('input',function(e){state.as=e.target.value;state.animePage=1;renderAnime()});
  document.getElementById('mangaSearch').addEventListener('input',function(e){state.ms=e.target.value;state.mangaPage=1;renderManga()});
  document.getElementById('manhwaSearch').addEventListener('input',function(e){state.hws=e.target.value;state.manhwaPage=1;renderManhwa()});
  document.querySelectorAll('#animeFilters .fb2').forEach(function(b){b.onclick=function(){toggleFilter(this,'anime')}});
  document.querySelectorAll('#mangaFilters .fb2').forEach(function(b){b.onclick=function(){toggleFilter(this,'manga')}});
  document.querySelectorAll('#manhwaFilters .fb2').forEach(function(b){b.onclick=function(){toggleFilter(this,'manhwa')}});
}
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;
  if(e.key==='Escape'){closeModal();closeFavsPanel();if(document.getElementById('key-guide').classList.contains('open'))toggleKeyGuide();if(document.getElementById('mobileMenu').classList.contains('open'))toggleMobileMenu()}
  if(e.key==='ArrowLeft'){qIdx=(qIdx-1+musashiQ.length)%musashiQ.length;rotateQuote()}
  if(e.key==='ArrowRight')rotateQuote();
  if(e.key==='1')document.getElementById('anime').scrollIntoView({behavior:'smooth'});
  if(e.key==='2')document.getElementById('manga').scrollIntoView({behavior:'smooth'});
  if(e.key==='3')document.getElementById('manhwa').scrollIntoView({behavior:'smooth'});
  if(e.key==='d'||e.key==='D')toggleDojo();
  if(e.key==='f'||e.key==='F'){e.preventDefault();openFavsPanel()}
  if(e.key==='m'||e.key==='M'){e.preventDefault();toggleSound()}
  if(e.key==='?')toggleKeyGuide();
});

// INIT
setTimeout(function(){
  var l=document.getElementById('loader');if(l){l.classList.add('exit');setTimeout(function(){l.style.display='none'},1000)}
  sfxSword();
},500);
loadSaved();updateStats();updateFavBadge();renderAll();
initSearchAndFilters();initThreeScene();initCanvas();initKanjiFog();initRain();
initClickParticles();initScrollSplatter();initQuotes();initMoonParallax();doReveal();
