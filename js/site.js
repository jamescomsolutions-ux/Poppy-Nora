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
  var m=(location.search||location.hash).match(/occasion=([a-z-]+)/);
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
    'Occasion: '+(d.get('occasion')||''),
    'People: '+(d.get('qty')||''),
    'Budget per person: '+(d.get('budget')||''),
    'Needed by: '+(d.get('date')||''),
    'Branding: '+(d.get('branding')||''),
    'Notes: '+(d.get('notes')||'')];
  return lines.join('\n');
}
function sendBrief(e,byEmail){
  if(e)e.preventDefault();
  var f=document.getElementById('brief');
  if(f&&!f.reportValidity())return false;
  var text=briefText();
  if(byEmail){
    location.href='mailto:[BRIEF EMAIL ADDRESS]?subject='+encodeURIComponent('Gifting brief')+'&body='+encodeURIComponent(text);
  }else{
    window.open('https://wa.me/27827239248?text='+encodeURIComponent(text),'_blank','noopener');
  }
  return false;
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
