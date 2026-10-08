function toggleNav(){
  var nav=document.querySelector('.site-header .nav')||document.getElementById('nav');
  var b=document.querySelector('.burger');
  if(!nav)return;
  var open=nav.classList.toggle('open');
  if(b)b.setAttribute('aria-expanded',open?'true':'false');
}
document.addEventListener('click',function(e){
  var nav=document.querySelector('.nav.open');
  if(nav&&!e.target.closest('.site-header'))nav.classList.remove('open');
});
// Preselect the occasion pill from ?occasion=... on the brief page
(function(){
  var q=location.search+location.hash;
  if(/type=custom/.test(q)){var kr=document.querySelector('input[name=kind][value="Made to order"]');if(kr)kr.checked=true;}
  var m=q.match(/occasion=([a-z-]+)/);
  if(!m)return;
  var map={'year-end':'Year-end gifts','onboarding':'Onboarding packs','events':'Conferences and events','thank-you':'Client thank-yous','milestones':'Staff milestones','clothing':'Branded clothing'};
  var v=map[m[1]];if(!v)return;
  var r=document.querySelector('input[name=occasion][value="'+v+'"]');if(r)r.checked=true;
})();
function briefText(){
  var f=document.getElementById('brief');if(!f)return '';
  var d=new FormData(f);
  var lines=['Brief for Poppy and Nora',
    'Name: '+(d.get('name')||''),
    'Organisation: '+(d.get('org')||''),
    'Email: '+(d.get('email')||''),
    'Phone: '+(d.get('phone')||''),
    'Type of order: '+(d.get('kind')||''),
    'Occasion: '+(d.get('occasion')||''),
    'People: '+(d.get('qty')||''),
    'Budget per person: '+(d.get('budget')||''),
    'Needed by: '+(d.get('date')||''),
    'Branding: '+(d.get('branding')||''),
    'Branding method: '+(d.get('decoration')||''),
    'Notes: '+(d.get('notes')||'')];
  return lines.join('\n');
}
function goStep(n){
  var f=document.getElementById('brief');if(!f)return;
  if(n===2){
    var req=f.querySelectorAll('[data-step="1"] input[required]');
    for(var i=0;i<req.length;i++){if(!req[i].checkValidity()){req[i].reportValidity();return;}}
  }
  var steps=f.querySelectorAll('.step');
  for(var s=0;s<steps.length;s++){steps[s].hidden=steps[s].getAttribute('data-step')!==String(n);}
  var dots=f.querySelectorAll('.stepdot');
  for(var d=0;d<dots.length;d++){dots[d].classList.toggle('on',dots[d].getAttribute('data-dot')===String(n));}
  f.scrollIntoView({behavior:'smooth',block:'start'});
}
function sendBrief(e,byEmail){
  if(e)e.preventDefault();
  var f=document.getElementById('brief');if(!f)return false;
  var req=f.querySelectorAll('input[required]');
  for(var i=0;i<req.length;i++){if(!req[i].checkValidity()){goStep(1);req[i].reportValidity();return false;}}
  var text=briefText();
  if(byEmail){
    location.href='mailto:[BRIEF EMAIL ADDRESS]?subject='+encodeURIComponent('Brief for Poppy and Nora')+'&body='+encodeURIComponent(text);
  }else{
    window.open('https://wa.me/27827239248?text='+encodeURIComponent(text),'_blank','noopener');
  }
  var hide=f.querySelectorAll('.step,.steps-head');
  for(var s=0;s<hide.length;s++){hide[s].hidden=true;}
  var nm=(new FormData(f).get('name')||'').split(' ')[0];
  var nmEl=document.getElementById('brief-name');if(nmEl)nmEl.textContent=nm?', '+nm:'';
  var done=document.getElementById('brief-done');if(done)done.hidden=false;
  return false;
}
function resetBrief(){
  var f=document.getElementById('brief');if(!f)return;
  f.reset();
  var head=f.querySelector('.steps-head');if(head)head.hidden=false;
  var done=document.getElementById('brief-done');if(done)done.hidden=true;
  goStep(1);
}

// Floating poppies: slow drift upward, fade in, hold, fade out.
(function(){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var layer=document.createElement('div');layer.className='petals';layer.setAttribute('aria-hidden','true');
  var n=window.innerWidth<700?4:7;
  for(var i=0;i<n;i++){
    var img=document.createElement('img');img.src='img/poppy.webp';img.alt='';
    var size=140+Math.random()*220;
    var dur=55+Math.random()*40;
    img.style.width=size+'px';
    img.style.left=(Math.random()*90)+'vw';
    img.style.setProperty('--dx',((Math.random()*16)-8)+'vw');
    img.style.setProperty('--r0',((Math.random()*30)-15)+'deg');
    img.style.setProperty('--r1',((Math.random()*30)-15)+'deg');
    img.style.setProperty('--peak',(0.28+Math.random()*0.17).toFixed(2));
    img.style.animationDuration=dur+'s';
    img.style.animationDelay=(-Math.random()*dur)+'s';
    layer.appendChild(img);
  }
  document.body.appendChild(layer);
})();
