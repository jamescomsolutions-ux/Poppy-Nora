// Logo preview: places the visitor's logo on a set of product photos.
// Everything happens in the browser; the logo is never uploaded.
(function(){
  var tool=document.getElementById('lp-tool');
  var products=window.PN_MOCKUPS||[];
  if(!tool||!products.length)return;

  var S=620; // product photos are 620 x 620
  var input=document.getElementById('lp-file');
  var drop=tool.querySelector('.lp-drop');
  var controls=tool.querySelector('.lp-controls');
  var thumb=tool.querySelector('.lp-thumb');
  var fileName=tool.querySelector('.lp-filename');
  var errorEl=tool.querySelector('.lp-error');
  var bgBox=document.getElementById('lp-bg');
  var sizeEl=document.getElementById('lp-size');
  var grid=tool.querySelector('.lp-grid');
  var logo=null;       // trimmed logo canvas
  var source=null;     // decoded logo image, before background removal
  var photos={};       // product photos, loaded once

  var ICON_PLUS='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>';
  var ICON_CHECK='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"></path></svg>';
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function finishFor(p){
    var f=(tool.querySelector('[name=finish]:checked')||{}).value||'suggested';
    return f==='suggested'?p.finish:f;
  }
  var FINISH_NAMES={full:'full colour print',white:'white print',black:'black print',tone:'tone on tone'};

  // Product cards
  grid.innerHTML=products.map(function(p,i){
    return '<div class="lp-card" id="'+esc(p.id)+'" data-i="'+i+'">'+
      '<button type="button" class="lp-view" aria-haspopup="dialog"><canvas width="'+S+'" height="'+S+'" role="img" aria-label="'+esc(p.name)+'"></canvas><span class="sr-only">View large: '+esc(p.name)+'</span></button>'+
      '<div class="card-body"><div class="sup">'+esc(p.label)+' · '+esc(p.sup)+'</div><div class="name">'+esc(p.name)+'</div><div class="lp-finish muted small"></div>'+
      '<div class="card-actions"><button type="button" class="more lp-more" data-large>View large</button><button type="button" class="sl-toggle" data-id="'+esc(p.id)+'"></button></div></div></div>';
  }).join('');
  var cards=[].slice.call(grid.querySelectorAll('.lp-card'));

  products.forEach(function(p,i){
    var img=new Image();
    img.onload=function(){photos[p.id]=img;drawCard(i);};
    img.src=p.img;
  });

  // Draw one product with the logo in its print area
  function render(ctx,p,opts){
    opts=opts||{};
    var img=photos[p.id];
    ctx.clearRect(0,0,S,S);
    ctx.fillStyle='#fff';ctx.fillRect(0,0,S,S);
    if(img)ctx.drawImage(img,0,0,S,S);
    var a=p.area,cx=a.x/100*S,cy=a.y/100*S,bw=a.w/100*S,bh=a.h/100*S;
    ctx.save();ctx.translate(cx,cy);ctx.rotate((a.r||0)*Math.PI/180);
    if(!logo){
      if(opts.hint){
        ctx.setLineDash([6,5]);ctx.lineWidth=2;
        ctx.strokeStyle=p.surface==='dark'?'rgba(255,255,255,.85)':'rgba(199,64,92,.9)';
        ctx.strokeRect(-bw/2,-bh/2,bw,bh);
        if(bw>70){
          ctx.fillStyle=ctx.strokeStyle;ctx.font='700 '+Math.max(12,Math.min(20,bw/7))+'px "Nunito Sans",sans-serif';
          ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Your logo',0,0);
        }
      }
      ctx.restore();return;
    }
    var scale=(+sizeEl.value||85)/100;
    var k=Math.min(bw/logo.width,bh/logo.height)*scale,w=logo.width*k,h=logo.height*k;
    var f=finishFor(p),art=logo;
    if(f!=='full'){
      art=document.createElement('canvas');art.width=logo.width;art.height=logo.height;
      var t=art.getContext('2d');t.drawImage(logo,0,0);t.globalCompositeOperation='source-in';
      t.fillStyle=f==='white'?'#fff':f==='black'?'#1c1a1b':(p.surface==='dark'?'rgba(255,255,255,.3)':'rgba(0,0,0,.28)');
      t.fillRect(0,0,art.width,art.height);
    }
    // A multiply blend lets fabric and card texture show through on light surfaces
    ctx.globalCompositeOperation=(f==='full'||f==='black')&&p.surface==='light'?'multiply':'source-over';
    ctx.globalAlpha=f==='white'?0.94:1;
    ctx.drawImage(art,-w/2,-h/2,w,h);
    ctx.restore();
    if(opts.stamp){
      ctx.save();ctx.font='600 13px "Nunito Sans",sans-serif';ctx.textAlign='right';ctx.textBaseline='bottom';
      ctx.fillStyle='rgba(55,53,53,.75)';ctx.fillText('Rough preview · Poppy and Nora',S-14,S-12);ctx.restore();
    }
  }
  function drawCard(i){
    var p=products[i],card=cards[i];
    render(card.querySelector('canvas').getContext('2d'),p,{hint:true});
    card.querySelector('canvas').setAttribute('aria-label',logo?'Your logo on the '+p.name+', '+FINISH_NAMES[finishFor(p)]:p.name+', with the print area marked');
    card.querySelector('.lp-finish').textContent=logo?'Shown as '+FINISH_NAMES[finishFor(p)]:'';
  }
  var queued=false;
  function drawAll(){
    if(queued)return;queued=true;
    requestAnimationFrame(function(){queued=false;products.forEach(function(p,i){drawCard(i);});if(dlg.open)drawLarge();});
  }

  // Read the uploaded file
  function loadFile(file){
    errorEl.hidden=true;
    if(!file)return;
    var isSVG=/svg/.test(file.type)||/\.svg$/i.test(file.name);
    if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)&&!isSVG){showError('That file type will not work here. Please use a PNG, JPG or SVG.');return;}
    if(file.size>10*1024*1024){showError('That file is over 10 MB. Please use a smaller version of your logo.');return;}
    if(isSVG){
      var r=new FileReader();
      r.onload=function(){
        var txt=String(r.result),vb=txt.match(/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
        // Give the SVG a pixel size so it draws sharply and keeps its shape
        if(vb){var w=+vb[1],h=+vb[2],k=1200/Math.max(w,h);
          txt=txt.replace(/<svg\b([^>]*)>/,function(m,attrs){return '<svg'+attrs.replace(/\s(width|height)=["'][^"']*["']/g,'')+' width="'+Math.round(w*k)+'" height="'+Math.round(h*k)+'">';});}
        decode(URL.createObjectURL(new Blob([txt],{type:'image/svg+xml'})),file.name,false);
      };
      r.readAsText(file);
    }else decode(URL.createObjectURL(file),file.name,true);
  }
  function decode(url,name,raster){
    var img=new Image();
    img.onload=function(){
      URL.revokeObjectURL(url);
      var w=img.naturalWidth||1200,h=img.naturalHeight||1200,k=Math.min(1,1200/Math.max(w,h));
      var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      source=c;
      bgBox.checked=raster&&hasWhiteCorners(c);
      fileName.textContent=name;
      prepare();
      controls.hidden=false;drop.classList.add('has-logo');
      tool.querySelector('.lp-status').textContent='Your logo is on all '+products.length+' products.';
    };
    img.onerror=function(){URL.revokeObjectURL(url);showError('We could not read that file. Please try another copy of your logo.');};
    img.src=url;
  }
  function showError(msg){errorEl.textContent=msg;errorEl.hidden=false;}
  function hasWhiteCorners(c){
    var d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,W=c.width,H=c.height,n=0;
    [[0,0],[W-1,0],[0,H-1],[W-1,H-1]].forEach(function(pt){var i=(pt[1]*W+pt[0])*4;if(d[i+3]>200&&d[i]>225&&d[i+1]>225&&d[i+2]>225)n++;});
    return n>=3;
  }
  // Remove a white background if asked, then trim empty edges so sizing is true to the artwork
  function prepare(){
    if(!source)return;
    var c=document.createElement('canvas');c.width=source.width;c.height=source.height;
    var x=c.getContext('2d');x.drawImage(source,0,0);
    var id=x.getImageData(0,0,c.width,c.height),d=id.data,W=c.width,H=c.height;
    if(bgBox.checked){
      for(var i=0;i<d.length;i+=4){
        var m=Math.min(d[i],d[i+1],d[i+2]);
        if(m>=240)d[i+3]=0;else if(m>215)d[i+3]=Math.round(d[i+3]*(240-m)/25);
      }
      x.putImageData(id,0,0);
    }
    var minX=W,minY=H,maxX=-1,maxY=-1;
    for(var y=0;y<H;y++)for(var xx=0;xx<W;xx++){
      if(d[(y*W+xx)*4+3]>12){if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;if(y<minY)minY=y;if(y>maxY)maxY=y;}
    }
    if(maxX<0){showError('Your logo looks empty once the white background is removed. Try unticking "Remove white background".');logo=null;drawAll();return;}
    errorEl.hidden=true;
    var t=document.createElement('canvas');t.width=maxX-minX+1;t.height=maxY-minY+1;
    t.getContext('2d').drawImage(c,minX,minY,t.width,t.height,0,0,t.width,t.height);
    logo=t;
    var tc=thumb.getContext('2d'),k=Math.min(thumb.width/t.width,thumb.height/t.height)*0.9;
    tc.clearRect(0,0,thumb.width,thumb.height);
    tc.drawImage(t,(thumb.width-t.width*k)/2,(thumb.height-t.height*k)/2,t.width*k,t.height*k);
    drawAll();
  }

  input.addEventListener('change',function(){loadFile(input.files[0]);});
  ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('over');});});
  ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('over');});});
  drop.addEventListener('drop',function(e){if(e.dataTransfer.files[0])loadFile(e.dataTransfer.files[0]);});
  bgBox.addEventListener('change',prepare);
  sizeEl.addEventListener('input',drawAll);
  [].forEach.call(tool.querySelectorAll('[name=finish]'),function(r){r.addEventListener('change',drawAll);});
  tool.querySelector('[data-reset]').addEventListener('click',function(){
    logo=null;source=null;input.value='';controls.hidden=true;drop.classList.remove('has-logo');
    tool.querySelector('.lp-status').textContent='Logo removed.';drawAll();input.focus();
  });

  // Large view
  var dlg=document.getElementById('lp-dialog'),big=dlg.querySelector('canvas'),current=0,opener=null;
  function drawLarge(){
    var p=products[current];
    render(big.getContext('2d'),p,{hint:true});
    big.setAttribute('aria-label',logo?'Your logo on the '+p.name:p.name);
    dlg.querySelector('#lp-title').textContent=p.name;
    dlg.querySelector('.sup').textContent=p.label+' · '+p.sup;
    dlg.querySelector('.qv-code').textContent=p.code!==p.name?'Code '+p.code:'';
    dlg.querySelector('.lp-dfinish').textContent=logo?'Shown as '+FINISH_NAMES[finishFor(p)]+'.':'Add your logo to see it here.';
    dlg.querySelector('[data-ask]').href=p.ask;
    dlg.querySelector('[data-download]').disabled=!logo;
    syncToggle();
  }
  function syncToggle(){
    var sl=window.pnShortlist,p=products[current],b=dlg.querySelector('[data-toggle]');
    if(!sl){b.hidden=true;return;}
    var on=sl.has(p.id);
    b.textContent=on?'On your shortlist':'Add to shortlist';
    b.className='btn '+(on?'btn-ghost is-on':'btn-primary');b.setAttribute('aria-pressed',on?'true':'false');
  }
  function openLarge(i,from){current=i;opener=from;drawLarge();dlg.showModal();}
  grid.addEventListener('click',function(e){
    var card=e.target.closest('.lp-card');if(!card)return;
    if(e.target.closest('.lp-view,[data-large]'))openLarge(+card.getAttribute('data-i'),e.target.closest('button'));
    var t=e.target.closest('.sl-toggle');
    if(t&&window.pnShortlist){var p=products[+card.getAttribute('data-i')];window.pnShortlist.toggle({id:p.id,code:p.code,name:p.name,sup:p.sup,img:p.img,ask:p.ask});}
  });
  dlg.addEventListener('click',function(e){
    if(e.target===dlg||e.target.closest('[data-close]')){dlg.close();return;}
    var p=products[current];
    if(e.target.closest('[data-toggle]')&&window.pnShortlist)window.pnShortlist.toggle({id:p.id,code:p.code,name:p.name,sup:p.sup,img:p.img,ask:p.ask});
    if(e.target.closest('[data-download]')&&logo){
      var c=document.createElement('canvas');c.width=S;c.height=S;render(c.getContext('2d'),p,{stamp:true});
      var a=document.createElement('a');a.download='logo-preview-'+p.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.png';
      a.href=c.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();
    }
    var nav=e.target.closest('[data-step]');
    if(nav){current=(current+(+nav.getAttribute('data-step'))+products.length)%products.length;drawLarge();}
  });
  dlg.addEventListener('keydown',function(e){
    if(e.target.closest('input,select,textarea'))return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){current=(current+(e.key==='ArrowRight'?1:-1)+products.length)%products.length;drawLarge();}
  });
  dlg.addEventListener('close',function(){if(opener&&document.contains(opener))opener.focus();});

  function syncCards(){
    var sl=window.pnShortlist;
    cards.forEach(function(card,i){
      var b=card.querySelector('.sl-toggle');
      if(!sl){b.hidden=true;return;}
      var on=sl.has(products[i].id);
      b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label','Shortlist '+products[i].name);
      b.innerHTML=on?ICON_CHECK+'<span>Shortlisted</span>':ICON_PLUS+'<span>Shortlist</span>';
    });
    if(dlg.open)syncToggle();
  }
  if(window.pnShortlist)window.pnShortlist.onChange(syncCards);
  syncCards();

  // Arriving from a product link: point at that product
  function fromHash(){
    var id=decodeURIComponent(location.hash.slice(1)),card=id&&document.getElementById(id);
    if(!card||!card.classList.contains('lp-card'))return;
    cards.forEach(function(c){c.classList.remove('picked');});card.classList.add('picked');
  }
  fromHash();window.addEventListener('hashchange',fromHash);
})();
