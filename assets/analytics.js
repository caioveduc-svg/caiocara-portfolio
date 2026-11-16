(() => {
  'use strict';
  const GA_ID='G-54VJGG6QPE', CLARITY_ID='zecbny47m1';
  const STORAGE_KEY='caio_analytics_consent_v1';
  // Local previews render the banner on request but never load production tags.
  const production=['caiocaradesigner.com.br','www.caiocaradesigner.com.br'].includes(location.hostname)&&location.protocol==='https:';
  const previewOnly=!production&&['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('consent-preview');
  if(!production&&!previewOnly)return;
  let enabled=false,loaded=false,banner,returnFocus;
  function readChoice(){try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY));return value&&Date.now()-value.at<180*86400000?value.choice:null}catch{return null}}
  function remember(choice){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({choice,at:Date.now()}))}catch{}}
  function loadScript(src){const script=document.createElement('script');script.src=src;script.async=true;document.head.append(script)}
  function start(){
    enabled=true;
    if(loaded)return;
    loaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
    window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{analytics_storage:'granted'});
    window.gtag('js',new Date());
    window.gtag('config',GA_ID,{send_page_view:true,page_location:location.origin+location.pathname,allow_google_signals:false,allow_ad_personalization_signals:false});
    window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)};
    window.clarity('consentv2',{analytics_Storage:'granted',ad_Storage:'denied'});
    loadScript('https://www.googletagmanager.com/gtag/js?id='+GA_ID);
    loadScript('https://www.clarity.ms/tag/'+CLARITY_ID);
    observeSections();
  }
  function stop(){
    enabled=false;
    window['ga-disable-'+GA_ID]=true;
    window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.clarity?.('consentv2',{analytics_Storage:'denied',ad_Storage:'denied'});
    // Remove only the analytics cookies after a visitor withdraws their choice.
    for(const entry of document.cookie.split(';')){const name=entry.trim().split('=')[0];if(!/^(_ga(?:_|$)|_clck$|_clsk$)/.test(name))continue;for(const domain of ['',location.hostname,'.caiocaradesigner.com.br']){document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'')+'; SameSite=Lax; Secure'}}
  }
  function choose(choice){if(previewOnly){banner.hidden=true;return}remember(choice);banner.hidden=true;if(choice==='accepted'){window['ga-disable-'+GA_ID]=false;start()}else{const wasLoaded=loaded;stop();if(wasLoaded){location.reload();return}}returnFocus?.focus();}
  function showPreferences(){returnFocus=document.activeElement;banner.hidden=false;banner.querySelector('button').focus()}
  function event(name,params={}){if(!enabled)return;window.gtag?.('event',name,{...params,send_to:GA_ID});window.clarity?.('event',name)}
  function placement(el){if(el.closest('#viewer'))return 'case_dialog';if(el.closest('.floating-budget'))return 'floating_budget';return el.closest('section')?.id||'footer'}
  // Delegation also covers the case links rendered after the page loads.
  document.addEventListener('click',e=>{
    const el=e.target.closest?.('a,button');if(!el)return;
    const href=el.getAttribute('href')||'';
    if(/^https:\/\/wa\.me\//.test(href))event('whatsapp_click',{placement:placement(el),contact_intent:el.matches('.floating-budget')?'budget':'project',case_id:document.querySelector('#viewer[open]')?.dataset.analyticsCase||'none'});
    else if(el.dataset.case||el.dataset.video||el.dataset.image){
      // Ignore a carousel clone; it delegates to the original button once.
      if(el.hasAttribute('data-clone'))return;
      const id=el.dataset.case||el.dataset.title||'project';
      event('case_open',{case_id:id.slice(0,80),placement:placement(el)});
      const viewer=document.querySelector('#viewer');if(viewer)viewer.dataset.analyticsCase=id.slice(0,80);
    }
  });
  const viewed=new Set();
  function observeSections(){if(!('IntersectionObserver' in window))return;const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&!viewed.has(entry.target.id)){viewed.add(entry.target.id);event('section_view',{section_id:entry.target.id});observer.unobserve(entry.target)}}},{rootMargin:'0px 0px -25% 0px',threshold:0});document.querySelectorAll('main section[id]').forEach(el=>observer.observe(el))}
  document.addEventListener('play',e=>{if(e.target.tagName==='VIDEO')event('portfolio_video_play',{case_id:document.querySelector('#viewer')?.dataset.analyticsCase||'none'})},true);
  banner=document.createElement('aside');banner.className='analytics-choice';banner.setAttribute('aria-label','Preferências de cookies');
  banner.innerHTML='<p>Usamos cookies para melhorar sua experiência.</p><div><button type="button" data-choice="accepted">Aceitar cookies</button><button type="button" data-choice="denied">Recusar</button><a href="/privacidade.html">Privacidade</a></div>';
  banner.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.choice)));
  document.body.append(banner);
  document.querySelectorAll('[data-cookie-preferences]').forEach(button=>button.addEventListener('click',showPreferences));
  const choice=previewOnly?null:readChoice();banner.hidden=!!choice;
  if(choice==='accepted')start();
})();
