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
  var sl=window.pnShortlistItems?window.pnShortlistItems():[];
  if(sl.length){
    lines.push('','Shortlist ('+sl.length+(sl.length===1?' item':' items')+'):');
    sl.forEach(function(p){lines.push('- '+p.name+(p.code&&p.code!==p.name?' ('+p.code+')':'')+(p.sup?', '+p.sup:''));});
  }
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

// Shortlist, quick view and range filters
(function(){
  var KEY='pn-shortlist';
  var store=null,memory=[];
  try{store=window.localStorage;store.setItem('__pn','1');store.removeItem('__pn');}catch(e){store=null;}
  function read(){
    if(!store)return memory.slice();
    try{var v=JSON.parse(store.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch(e){return memory.slice();}
  }
  function write(list){
    memory=list.slice();
    if(store){try{store.setItem(KEY,JSON.stringify(list));}catch(e){}}
    refresh();
  }
  function has(id){return read().some(function(p){return p.id===id;});}
  function items(n){return n+(n===1?' item':' items');}
  function add(p){
    var l=read();if(has(p.id))return;
    l.push({id:p.id,code:p.code,name:p.name,sup:p.sup,img:p.img,ask:p.ask});write(l);
    announce(p.name+' added to your shortlist. '+items(l.length)+' saved.');bump();
  }
  function remove(id){
    var l=read(),gone=null;
    l=l.filter(function(p){if(p.id===id){gone=p;return false;}return true;});
    write(l);if(gone)announce(gone.name+' removed from your shortlist. '+items(l.length)+' saved.');
  }
  function toggle(p){if(has(p.id))remove(p.id);else add(p);}
  window.pnShortlistItems=read;

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  var ICON={
    bag:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 8h13l-1 12h-11z"></path><path d="M9 8V7a3 3 0 0 1 6 0v1"></path></svg>',
    plus:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>',
    check:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"></path></svg>',
    search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>',
    close:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>',
    wa:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z"></path></svg>'
  };

  // Screen reader announcements
  var live=document.createElement('div');live.className='sr-only';live.setAttribute('aria-live','polite');document.body.appendChild(live);
  function announce(msg){live.textContent='';setTimeout(function(){live.textContent=msg;},50);}

  // Read a product from its card
  function product(card){
    if(card._p)return card._p;
    var ask=card.querySelector('.ask'),img=card.querySelector('img'),n=card.querySelector('.name'),s=card.querySelector('.sup');
    var name=n?n.textContent.trim():'',code='';
    if(ask){
      var t='';try{t=decodeURIComponent(ask.getAttribute('href').split('text=')[1]||'');}catch(e){}
      var m=t.match(/\(([^()]+)\)\.?\s*$/);if(m)code=m[1];
    }
    card._p={id:code||name,code:code,name:name,sup:s?s.textContent.trim():'',img:img?img.getAttribute('src'):'',alt:img?img.getAttribute('alt'):'',ask:ask?ask.getAttribute('href'):'',isNew:!!card.querySelector('.badge'),catName:''};
    return card._p;
  }

  var dialogOK=typeof HTMLDialogElement==='function';

  // Header shortlist button
  var header=document.querySelector('.site-header');
  var slBtn=document.createElement('button');
  slBtn.type='button';slBtn.className='sl-btn';slBtn.setAttribute('aria-haspopup','dialog');
  slBtn.innerHTML=ICON.bag+'<span class="sl-label">Shortlist</span><span class="sl-count" aria-hidden="true">0</span>';
  if(header&&dialogOK)header.insertBefore(slBtn,header.querySelector('.burger'));
  function bump(){
    slBtn.classList.remove('bump');void slBtn.offsetWidth;slBtn.classList.add('bump');
  }

  // Shortlist drawer
  var onBrief=!!document.getElementById('brief');
  var drawer=document.createElement('dialog');
  drawer.className='drawer';drawer.setAttribute('aria-labelledby','sl-title');
  drawer.innerHTML='<div class="drawer-head"><h2 id="sl-title">Your shortlist</h2><button type="button" class="icon-btn" data-close aria-label="Close shortlist">'+ICON.close+'</button></div>'+
    '<div class="drawer-body"><p class="sl-intro muted small">Everything you save here goes into your brief, so we can price and brand it.</p><ul class="sl-list"></ul>'+
    '<div class="sl-empty"><p>Nothing saved yet.</p><p class="muted small">Tap <strong>Shortlist</strong> on any product and it will wait for you here, even if you leave the site and come back.</p><a class="more" href="range.html">Browse the range</a></div></div>'+
    '<div class="drawer-foot"><a class="btn btn-primary" href="brief.html" data-send>Send as a brief</a><button type="button" class="link-btn" data-clear>Clear the shortlist</button></div>';
  if(dialogOK)document.body.appendChild(drawer);
  function listHTML(l){
    return l.map(function(p){
      return '<li class="sl-item"><img src="'+esc(p.img)+'" alt="" loading="lazy"><div><div class="name">'+esc(p.name)+'</div><div class="code">'+esc(p.sup)+(p.code&&p.code!==p.name?' · '+esc(p.code):'')+'</div></div>'+
        '<button type="button" class="icon-btn sl-remove" data-remove="'+esc(p.id)+'" aria-label="Remove '+esc(p.name)+'">'+ICON.close+'</button></li>';
    }).join('');
  }
  drawer.addEventListener('click',function(e){
    if(e.target===drawer||e.target.closest('[data-close]')){drawer.close();return;}
    var r=e.target.closest('[data-remove]');
    if(r){
      var li=r.closest('li'),next=li&&(li.nextElementSibling||li.previousElementSibling);
      var nextId=next&&next.querySelector('[data-remove]')&&next.querySelector('[data-remove]').getAttribute('data-remove');
      remove(r.getAttribute('data-remove'));
      var f=nextId&&drawer.querySelector('[data-remove="'+nextId.replace(/"/g,'\\"')+'"]');
      (f||drawer.querySelector('[data-close]')).focus();
      return;
    }
    if(e.target.closest('[data-clear]')){
      if(window.confirm('Remove everything from your shortlist?')){write([]);announce('Shortlist cleared.');drawer.querySelector('[data-close]').focus();}
      return;
    }
    if(onBrief&&e.target.closest('[data-send]')){
      e.preventDefault();drawer.close();
      var first=document.querySelector('#brief input');if(first)first.focus();
    }
  });
  slBtn.addEventListener('click',function(){drawer.showModal();});

  // Quick view
  var qv=document.createElement('dialog');
  qv.className='qv';qv.setAttribute('aria-labelledby','qv-title');
  qv.innerHTML='<button type="button" class="icon-btn qv-close" data-close aria-label="Close">'+ICON.close+'</button>'+
    '<div class="qv-grid"><div class="qv-media"><img alt=""></div><div class="qv-info">'+
    '<div class="qv-tags"></div><div class="sup"></div><h2 id="qv-title"></h2><p class="qv-code muted small"></p>'+
    '<p class="qv-note">Prices on request. Every item can be branded.</p>'+
    '<div class="actions"><button type="button" class="btn btn-primary" data-toggle></button><a class="btn btn-ghost" data-ask target="_blank" rel="noopener">'+ICON.wa+' Ask on WhatsApp</a></div>'+
    '</div></div>';
  if(dialogOK)document.body.appendChild(qv);
  var qvProduct=null,qvOpener=null;
  function openQV(p,opener){
    qvProduct=p;qvOpener=opener;
    var img=qv.querySelector('.qv-media img');img.src=p.img;img.alt=p.alt||p.name;
    qv.querySelector('.sup').textContent=p.sup;
    qv.querySelector('h2').textContent=p.name;
    qv.querySelector('.qv-code').textContent=p.code&&p.code!==p.name?'Code '+p.code:'';
    qv.querySelector('.qv-tags').innerHTML=(p.isNew?'<span class="tag new">New</span>':'')+(p.catName?'<span class="tag">'+esc(p.catName)+'</span>':'');
    qv.querySelector('[data-ask]').href=p.ask;
    syncQV();qv.showModal();
  }
  function syncQV(){
    if(!qvProduct)return;
    var b=qv.querySelector('[data-toggle]'),on=has(qvProduct.id);
    b.innerHTML=on?ICON.check+' On your shortlist':ICON.plus+' Add to shortlist';
    b.className='btn '+(on?'btn-ghost is-on':'btn-primary');
    b.setAttribute('aria-pressed',on?'true':'false');
  }
  qv.addEventListener('click',function(e){
    if(e.target===qv||e.target.closest('[data-close]')){qv.close();return;}
    if(e.target.closest('[data-toggle]')&&qvProduct)toggle(qvProduct);
  });
  qv.addEventListener('close',function(){if(qvOpener&&document.contains(qvOpener))qvOpener.focus();});

  // Enhance every product card
  var cards=[].slice.call(document.querySelectorAll('article.card'));
  cards.forEach(function(card){
    var p=product(card);if(!p.name||!dialogOK)return;
    var n=card.querySelector('.name'),img=card.querySelector('img'),ask=card.querySelector('.ask');
    var open=document.createElement('button');open.type='button';open.className='qv-open';open.textContent=p.name;
    open.setAttribute('aria-haspopup','dialog');
    n.textContent='';n.appendChild(open);
    open.addEventListener('click',function(){openQV(p,open);});
    if(img){img.classList.add('qv-img');img.addEventListener('click',function(){openQV(p,open);});}
    var row=document.createElement('div');row.className='card-actions';
    if(ask)row.appendChild(ask);
    var t=document.createElement('button');t.type='button';t.className='sl-toggle';t.setAttribute('data-id',p.id);
    t.setAttribute('aria-label','Shortlist '+p.name);
    t.addEventListener('click',function(){toggle(p);});
    row.appendChild(t);
    card.querySelector('.card-body').appendChild(row);
  });

  // Shortlist on the brief page
  var briefList=null;
  if(onBrief){
    briefList=document.createElement('div');briefList.className='brief-list';
    var form=document.getElementById('brief');form.parentNode.insertBefore(briefList,form);
    briefList.addEventListener('click',function(e){
      var r=e.target.closest('[data-remove]');if(r)remove(r.getAttribute('data-remove'));
    });
  }

  function refresh(){
    var l=read(),n=l.length;
    var c=slBtn.querySelector('.sl-count');c.textContent=n;c.hidden=n===0;
    slBtn.setAttribute('aria-label','Shortlist, '+items(n));
    drawer.querySelector('.sl-list').innerHTML=listHTML(l);
    drawer.querySelector('.sl-empty').hidden=n>0;
    drawer.querySelector('.sl-intro').hidden=n===0;
    drawer.querySelector('.drawer-foot').hidden=n===0;
    var send=drawer.querySelector('[data-send]');send.textContent=onBrief?'Continue your brief':'Send as a brief';
    [].forEach.call(document.querySelectorAll('.sl-toggle'),function(b){
      var on=l.some(function(p){return p.id===b.getAttribute('data-id');});
      b.setAttribute('aria-pressed',on?'true':'false');
      b.innerHTML=on?ICON.check+'<span>Shortlisted</span>':ICON.plus+'<span>Shortlist</span>';
    });
    syncQV();
    if(briefList){
      if(n){
        briefList.className='brief-list';
        briefList.innerHTML='<div class="bl-head"><h3>Your shortlist <span class="count">'+items(n)+'</span></h3><a class="more" href="range.html">Add more</a></div>'+
          '<p class="muted small">These go into your brief automatically.</p><ul class="sl-list">'+listHTML(l)+'</ul>';
      }else{
        briefList.className='brief-list empty';
        briefList.innerHTML='<p class="muted small">Seen something you like? Tap <strong>Shortlist</strong> on any product in <a href="range.html">the range</a> and it will be added to this brief.</p>';
      }
    }
  }
  refresh();
  window.addEventListener('storage',function(e){if(e.key===KEY)refresh();});

  // Range page: search and filters
  var main=document.querySelector('main[data-range]');
  if(!main)return;
  var secs=[],groups=[],all=[];
  [].forEach.call(main.querySelectorAll('section.occasion[id]'),function(sec){
    var h2=sec.querySelector('h2'),catName=h2?h2.textContent.trim():sec.id;
    var chip=main.querySelector('.page-head .chip[href="#'+sec.id+'"]');
    var s={el:sec,id:sec.id,name:catName,cards:[],chip:chip,chipCount:chip&&chip.querySelector('.count')};
    [].forEach.call(sec.querySelectorAll('.grid-4'),function(grid){
      var head=grid.previousElementSibling;if(!head||!head.classList.contains('subhead'))head=null;
      var g={grid:grid,head:head,cards:[],countEl:head&&head.querySelector('.count'),
        chip:head&&head.id?sec.querySelector('.subchips .chip[href="#'+head.id+'"]'):null};
      [].forEach.call(grid.querySelectorAll('article.card'),function(el){
        var p=product(el);p.catName=catName;
        var c={el:el,p:p,cat:sec.id,supplier:p.sup.split('·').pop().trim(),hay:(p.name+' '+p.sup+' '+p.code).toLowerCase()};
        g.cards.push(c);s.cards.push(c);all.push(c);
      });
      groups.push(g);
    });
    secs.push(s);
  });
  if(!all.length)return;
  var supCounts={};all.forEach(function(c){supCounts[c.supplier]=(supCounts[c.supplier]||0)+1;});
  var sups=Object.keys(supCounts).sort();
  var newCount=all.filter(function(c){return c.p.isNew;}).length;

  var tools=document.createElement('div');tools.className='range-tools';
  tools.innerHTML='<div class="wrap rt-inner" role="search" aria-label="Search and filter the range">'+
    '<label class="rt-search">'+ICON.search+'<span class="sr-only">Search the range</span><input type="search" name="q" placeholder="Search by name, brand or code" autocomplete="off" enterkeyhint="search"></label>'+
    '<button type="button" class="rt-toggle" aria-expanded="false" aria-controls="rt-filters">Filters<span class="rt-badge" hidden></span></button>'+
    '<div class="rt-filters" id="rt-filters">'+
      '<label><span class="sr-only">Category</span><select name="cat"><option value="">All categories</option>'+secs.map(function(s){return '<option value="'+s.id+'">'+esc(s.name)+' ('+s.cards.length+')</option>';}).join('')+'</select></label>'+
      '<label><span class="sr-only">Supplier</span><select name="sup"><option value="">All suppliers</option>'+sups.map(function(s){return '<option value="'+esc(s)+'">'+esc(s)+' ('+supCounts[s]+')</option>';}).join('')+'</select></label>'+
      '<label class="rt-check"><input type="checkbox" name="new"> New only <span class="muted">('+newCount+')</span></label>'+
    '</div>'+
    '<div class="rt-status"><span class="rt-count" aria-live="polite" aria-atomic="true"></span><button type="button" class="rt-clear" hidden>Clear all</button></div>'+
  '</div>';
  var empty=document.createElement('section');empty.className='wrap rt-empty';empty.hidden=true;
  empty.innerHTML='<h2>Nothing matches that yet</h2><p class="muted">Try fewer words, or clear the filters. If you want something you cannot see here, ask: the full supplier catalogues run to thousands of items.</p><div class="actions"><button type="button" class="btn btn-ghost" data-clear>Clear the filters</button><a class="btn btn-primary" href="brief.html">Brief us</a></div>';
  var headSec=main.querySelector('.page-head');
  headSec.parentNode.insertBefore(tools,headSec.nextSibling);
  tools.parentNode.insertBefore(empty,tools.nextSibling);

  var q=tools.querySelector('[name=q]'),cat=tools.querySelector('[name=cat]'),sup=tools.querySelector('[name=sup]'),nw=tools.querySelector('[name=new]');
  var countEl=tools.querySelector('.rt-count'),clearBtn=tools.querySelector('.rt-clear'),badge=tools.querySelector('.rt-badge'),tog=tools.querySelector('.rt-toggle');

  // Keep sticky offsets in step with the real header and toolbar heights
  function measure(){
    var r=document.documentElement.style;
    r.setProperty('--hh',(header?header.offsetHeight:0)+'px');
    r.setProperty('--th',tools.offsetHeight+'px');
  }
  measure();window.addEventListener('resize',measure);

  var params=new URLSearchParams(location.search);
  q.value=params.get('q')||'';
  if(params.get('cat')&&secs.some(function(s){return s.id===params.get('cat');}))cat.value=params.get('cat');
  if(params.get('sup')&&supCounts[params.get('sup')])sup.value=params.get('sup');
  nw.checked=params.get('new')==='1';

  function apply(fromUser){
    var words=q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var fc=cat.value,fs=sup.value,fn=nw.checked,shown=0;
    all.forEach(function(c){
      var ok=(!fc||c.cat===fc)&&(!fs||c.supplier===fs)&&(!fn||c.p.isNew)&&words.every(function(w){return c.hay.indexOf(w)>-1;});
      c.el.hidden=!ok;if(ok)shown++;
    });
    groups.forEach(function(g){
      var n=g.cards.filter(function(c){return !c.el.hidden;}).length;
      g.grid.hidden=!n;if(g.head)g.head.hidden=!n;if(g.chip)g.chip.hidden=!n;if(g.countEl)g.countEl.textContent=n;
    });
    secs.forEach(function(s){
      var n=s.cards.filter(function(c){return !c.el.hidden;}).length;
      s.el.hidden=!n;if(s.chip)s.chip.hidden=!n;if(s.chipCount)s.chipCount.textContent=n;
    });
    var active=(words.length?1:0)+(fc?1:0)+(fs?1:0)+(fn?1:0);
    var filters=(fc?1:0)+(fs?1:0)+(fn?1:0);
    countEl.textContent=active?'Showing '+shown+' of '+all.length:'Showing all '+all.length;
    clearBtn.hidden=!active;badge.hidden=!filters;badge.textContent=filters;
    empty.hidden=shown>0;
    var p=new URLSearchParams(location.search);
    [['q',q.value.trim()],['cat',fc],['sup',fs],['new',fn?'1':'']].forEach(function(kv){if(kv[1])p.set(kv[0],kv[1]);else p.delete(kv[0]);});
    var qs=p.toString();
    history.replaceState(null,'',location.pathname+(qs?'?'+qs:'')+location.hash);
    measure();
    // If the toolbar is stuck, jump back to the top of the results
    if(fromUser){
      var top=tools.getBoundingClientRect().top,stick=header?header.offsetHeight:0;
      if(top<=stick+1)window.scrollTo(0,headSec.offsetTop+headSec.offsetHeight);
    }
  }
  var timer;
  q.addEventListener('input',function(){clearTimeout(timer);timer=setTimeout(function(){apply(true);},150);});
  q.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();q.blur();}});
  [cat,sup,nw].forEach(function(el){el.addEventListener('change',function(){apply(true);});});
  function clearAll(){q.value='';cat.value='';sup.value='';nw.checked=false;apply(true);q.focus();}
  clearBtn.addEventListener('click',clearAll);
  empty.querySelector('[data-clear]').addEventListener('click',clearAll);
  tog.addEventListener('click',function(){
    var open=tools.classList.toggle('open');tog.setAttribute('aria-expanded',open?'true':'false');measure();
  });
  apply(false);
})();
