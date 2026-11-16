const reduce=matchMedia('(prefers-reduced-motion: reduce)');
if(!reduce.matches){document.documentElement.classList.add('motion');const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}
const progress=document.querySelector('.progress');let pending=false;function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;pending=false}addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(updateProgress)}},{passive:true});updateProgress();
const viewer=document.querySelector('#viewer'),content=document.querySelector('#viewer-content'),title=document.querySelector('#viewer-title');let previous;
function appendText(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;content.append(el);return el}
function appendMedia(src,label,poster){const video=/\.mp4$/.test(src);const media=document.createElement(video?'video':'img');media.src=src;if(video){media.controls=true;media.playsInline=true;media.preload='metadata';if(poster)media.poster=poster}else{media.alt=label;media.loading='lazy'}return media}
document.querySelectorAll('[data-image],[data-video],[data-case]').forEach(button=>button.addEventListener('click',()=>{
previous=button;const project=window.portfolioCases?.[button.dataset.case];title.textContent=project?.title||button.dataset.title;content.replaceChildren();viewer.classList.toggle('case-view',!!project);
if(project){
const cover=project.images?.[0];
function addFigure(pair,className){const figure=document.createElement('figure'),caption=document.createElement('figcaption');if(className)figure.className=className;figure.append(appendMedia(pair[0],pair[1]));caption.textContent=pair[1];figure.append(caption);content.append(figure)}
if(cover)addFigure(cover,'case-cover');
appendText('p',project.intro,'case-intro');
if(project.metrics){const stats=document.createElement('dl');stats.className='case-metrics';project.metrics.forEach(([value,label])=>{const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;group.append(dt,dd);stats.append(group)});content.append(stats)}
if(project.challenge){appendText('h3','O desafio','case-step');appendText('p',project.challenge)}
appendText('h3','Minha participação','case-step');appendText('p',project.role);
if(project.decision){appendText('h3','Como o trabalho foi desenvolvido','case-step');appendText('p',project.decision)}
if(project.outcome){appendText('h3','Resultados e contexto');appendText('p',project.outcome)}
if(project.video){appendText('h3','O vídeo');content.append(appendMedia(project.video,project.title,project.poster))}
if(project.images?.length>1){appendText('h3','Mais imagens do projeto');project.images.slice(1).forEach(pair=>addFigure(pair))}
project.links?.forEach(([href,label])=>{const a=appendText('a',label+' ↗','text-link');a.href=href;a.target='_blank';a.rel='noreferrer'});
const contact=appendText('a','Conversar sobre um projeto no WhatsApp ↗','button case-cta');contact.href='https://wa.me/5511962780643?text='+encodeURIComponent('Oi, Caio! Vi o case '+project.title+' no seu portfólio e queria conversar sobre um projeto.');contact.target='_blank';contact.rel='noreferrer';
}else content.append(appendMedia(button.dataset.video||button.dataset.image,button.dataset.title,button.dataset.poster));
viewer.showModal();viewer.scrollTop=0;document.body.style.overflow='hidden';document.querySelector('#close-viewer').focus();
}));
document.querySelector('#close-viewer').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',event=>{if(event.target===viewer){const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)viewer.close()}});viewer.addEventListener('close',()=>{content.querySelector('video')?.pause();content.replaceChildren();document.body.style.overflow='';previous?.focus()});
