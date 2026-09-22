// Native dialogs keep keyboard focus inside the active detail and return it on close.
const detailDialog=document.createElement('dialog');
detailDialog.className='trip-dialog';
detailDialog.setAttribute('aria-labelledby','detailTitle');
detailDialog.innerHTML='<header class="dialog-header"><div><p class="eyebrow" id="detailKicker"></p><h2 id="detailTitle"></h2></div><button type="button" class="dialog-close" autofocus>닫기 ✕</button></header><div class="dialog-body" id="detailBody"></div>';
document.body.append(detailDialog);
const photoDialog=document.createElement('dialog');
photoDialog.className='trip-dialog photo-dialog';
photoDialog.setAttribute('aria-labelledby','photoTitle');
photoDialog.innerHTML='<header class="dialog-header"><h2 id="photoTitle">호텔 사진</h2><button type="button" class="dialog-close" autofocus>닫기 ✕</button></header><div class="dialog-body"><img alt=""></div>';
document.body.append(photoDialog);
const panelStore=document.createElement('div');panelStore.className='dialog-store';document.body.append(panelStore);
let activePanel=null,returnFocus=null,photoFocus=null;
const condensedPanels=[];
function restorePanel(){if(activePanel){activePanel.marker.replaceWith(activePanel.node);activePanel=null}}
function openTripDetail({title,kicker='',content,move=false,trigger=document.activeElement}){
 if(detailDialog.open)detailDialog.close();
 restorePanel();
 returnFocus=trigger;
 $('#detailTitle').textContent=title;$('#detailKicker').textContent=kicker;
 const body=$('#detailBody');body.replaceChildren();
 if(move){const marker=document.createComment('Detail returns here');content.before(marker);activePanel={node:content,marker};body.append(content)}
 else body.append(content.cloneNode(true));
 $$('iframe[data-src]',body).forEach(frame=>{frame.src=frame.dataset.src});
 detailDialog.showModal();document.body.classList.add('dialog-open');
 detailDialog.scrollTop=0;
}
detailDialog.addEventListener('close',()=>{restorePanel();$('#detailBody').replaceChildren();document.body.classList.remove('dialog-open');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true})});
photoDialog.addEventListener('close',()=>{photoDialog.querySelector('img').removeAttribute('src');if(photoFocus?.isConnected)photoFocus.focus({preventScroll:true})});
for(const dialog of [detailDialog,photoDialog]){
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
}
function dayContent(day){
 const content=document.createElement('div');content.className='day-content';
 const sub=document.createElement('p');sub.textContent=day.subtitle;content.append(sub);
 const events=document.createElement('div');events.className='day-events';
 day.events.forEach(([time,title,note])=>{const item=document.createElement('div');item.className='event';for(const [tag,text] of [['time',time],['strong',title],['small',note]]){const el=document.createElement(tag);el.textContent=text;item.append(el)}events.append(item)});
 content.append(events);const meal=document.createElement('p');meal.className='meal-line';meal.textContent='식사 루트 · '+day.meal;content.append(meal);
 if(day.stay){const stay=document.createElement('p');stay.className='day-stay';stay.textContent='숙소 · '+day.stay;content.append(stay)}
 if(day.tips?.length){const box=document.createElement('div');box.className='day-tips';const h=document.createElement('h4');h.textContent='알아두면 좋아요';const ul=document.createElement('ul');day.tips.forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.append(li)});box.append(h,ul);content.append(box)}
 return content;
}
document.addEventListener('click',event=>{
 const photo=event.target.closest('[data-photo]');
 if(photo){photoFocus=photo;$('#photoTitle').textContent=photo.dataset.caption;const img=photoDialog.querySelector('img');img.src=photo.dataset.photo;img.alt=photo.dataset.caption;photoDialog.showModal();return}
 const hotel=event.target.closest('[data-detail]');
 if(hotel){const tpl=document.getElementById(hotel.dataset.detail);if(tpl?.content)openTripDetail({title:hotel.dataset.title,kicker:hotel.dataset.kicker,content:tpl.content,trigger:hotel});return}
 const dayButton=event.target.closest('[data-day]');
 if(dayButton){const day=itinerary.find(d=>d.date===dayButton.dataset.day);if(day)openTripDetail({title:day.title,kicker:`2026.${day.date} · ${day.dow}요일 · ${day.city}`,content:dayContent(day),trigger:dayButton});}
});

// Preserve actual form nodes and their saved input handlers when opening reservation details.
function condensePanel(node,{title,kicker='',summary=''}){
 if(!node)return;
 condensedPanels.push({node,section:node.closest('.view')});
 const button=document.createElement('button');button.type='button';button.className='scan-row';button.setAttribute('aria-haspopup','dialog');
 const main=document.createElement('span');main.className='scan-main';
 for(const [tag,text] of [['small',kicker],['strong',title],['small',summary]]){if(!text)continue;const el=document.createElement(tag);el.textContent=text;main.append(el)}
 const more=document.createElement('span');more.className='scan-end';more.textContent='상세 보기';button.append(main,more);node.before(button);panelStore.append(node);
 button.addEventListener('click',()=>openTripDetail({title,kicker,content:node,move:true,trigger:button}));
}
$$('#shopping .check-group').forEach(node=>condensePanel(node,{title:node.querySelector('h3').textContent,kicker:node.querySelector('.pill')?.textContent||'쇼핑',summary:node.querySelector('p').textContent.split('.')[0]+'.'}));
condensePanel($('.spring-details'),{title:'9/30 밴프 온천 · 이동·준비물',kicker:'투어 종료 후 개인 일정',summary:'14:00 투어 종료 · 15:00–17:00 온천'});
$$('.flight-options .flight-option').forEach(node=>condensePanel(node,{title:node.querySelector('h3').textContent,kicker:'구간별 안내',summary:node.querySelector('p').textContent}));
$$('#flights > .check-group').forEach(node=>condensePanel(node,{title:node.querySelector('h3').textContent,kicker:'9/24 환승',summary:'입국·수하물·연결편 계획과 지연 대안'}));
$$('.reservation-grid .reservation-card').forEach(node=>condensePanel(node,{title:node.querySelector('h3').textContent,kicker:node.querySelector('small').textContent,summary:node.querySelector('p').textContent+' · 클릭해서 예약 메모 수정'}));
condensePanel($('.budget-assumptions'),{title:'식비·교통비 계산 기준',kicker:'예산 산식',summary:'식사·버스·공항 이동의 계획액과 공식 운임 출처'});

// Checklist stays directly editable; groups can collapse without hiding progress.
function condenseChecklist(){
 $$('#checklistGroups .check-group').forEach(group=>{
  const title=group.querySelector('h3');if(!title)return;
  const details=document.createElement('details');details.className='compact-details checklist-fold';
  const summary=document.createElement('summary');summary.textContent=title.textContent+' · '+group.querySelectorAll('input').length+'개';
  details.append(summary);title.remove();while(group.firstChild)details.append(group.firstChild);group.append(details);
 });
}
condenseChecklist();
new MutationObserver(()=>condenseChecklist()).observe($('#checklistGroups'),{childList:true});
// The full itinerary remains printable even though its screen view is compact.
window.addEventListener('beforeprint',()=>{
 document.querySelectorAll('.print-details').forEach(n=>n.remove());
 const print=document.createElement('div');print.className='print-details';
 itinerary.forEach(day=>{const section=document.createElement('section');const heading=document.createElement('h3');heading.textContent=day.date+' · '+day.title;section.append(heading,dayContent(day));print.append(section)});$('#itinerary').append(print);
 condensedPanels.forEach(({node,section})=>{if(!section)return;const wrapper=document.createElement('div');wrapper.className='print-details';wrapper.append(node.cloneNode(true));section.append(wrapper)});
 $$('details').forEach(el=>{el.dataset.printOpen=String(el.open);el.open=true});
});
window.addEventListener('afterprint',()=>{document.querySelectorAll('.print-details').forEach(n=>n.remove());$$('details[data-print-open]').forEach(el=>{el.open=el.dataset.printOpen==='true';delete el.dataset.printOpen})});
