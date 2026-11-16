(() => {
const track=document.querySelector('.sports .originals');
if(track){
const originals=[...track.children],total=originals.length;
const wrapper=document.createElement('div');wrapper.className='sports-carousel';wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','Artes de futebol, carrossel circular');
track.before(wrapper);wrapper.append(track);
for(const position of ['before','after']){const fragment=document.createDocumentFragment();originals.forEach((original,i)=>{const copy=original.cloneNode(true);copy.dataset.clone=String(i);copy.tabIndex=-1;copy.setAttribute('aria-hidden','true');fragment.append(copy)});position==='before'?track.prepend(fragment):track.append(fragment)}
const toolbar=document.createElement('div');toolbar.className='carousel-toolbar';toolbar.innerHTML='<span aria-live="polite">6 artes / arraste para explorar</span><div class="carousel-arrows"><button type="button" aria-label="Artes anteriores">←</button><button type="button" aria-label="Próximas artes">→</button></div>';wrapper.append(toolbar);
const step=()=>track.children[1].offsetLeft-track.children[0].offsetLeft;
const center=()=>{track.scrollLeft=step()*total};center();
let timer,moving=false,startX=0,startScroll=0,dragged=false;
track.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(()=>{if(moving)return;const size=step()*total;if(track.scrollLeft<size*.5)track.scrollLeft+=size;else if(track.scrollLeft>size*1.5)track.scrollLeft-=size},140)},{passive:true});
toolbar.querySelectorAll('button').forEach((button,i)=>button.addEventListener('click',()=>track.scrollBy({left:step()*(i?1:-1),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})));
track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();track.scrollBy({left:step()*(e.key==='ArrowRight'?1:-1),behavior:'smooth'})}});
track.addEventListener('pointerdown',e=>{dragged=false;if(e.pointerType!=='mouse'||e.button!==0)return;moving=true;startX=e.clientX;startScroll=track.scrollLeft});
addEventListener('pointermove',e=>{if(!moving)return;const delta=e.clientX-startX;if(Math.abs(delta)>6){dragged=true;track.scrollLeft=startScroll-delta}});
addEventListener('pointerup',()=>{moving=false});
track.addEventListener('dragstart',e=>e.preventDefault());
track.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopImmediatePropagation();dragged=false;return}const clone=e.target.closest('[data-clone]');if(clone){e.preventDefault();e.stopImmediatePropagation();originals[Number(clone.dataset.clone)].click()}},true);
addEventListener('resize',center,{passive:true});
}
document.querySelector('.ambigram-turn')?.addEventListener('click',e=>{const button=e.currentTarget;const turned=button.classList.toggle('is-turned');button.setAttribute('aria-pressed',String(turned))});
})();
