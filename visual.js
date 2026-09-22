// Visual layer: Lucide line icons, destination photos and a boarding-pass flight board.
// Every decorator is idempotent so the MutationObserver can re-run them after any re-render.
(()=>{
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ic=(name,cls='')=>`<i data-icon="${name}"${cls?` class="${cls}"`:''}></i>`;
const pascal=n=>n.replace(/(^|-)([a-z0-9])/g,(_,__,c)=>c.toUpperCase());

// Own painter instead of lucide.createIcons(): its SVGs keep data-lucide and would re-trigger the observer.
function paintIcons(){
  if(!window.lucide)return;
  $$('i[data-icon]').forEach(el=>{
    const node=lucide.icons[pascal(el.dataset.icon)];
    if(!node){el.removeAttribute('data-icon');return}
    const svg=lucide.createElement(node);
    svg.setAttribute('class',['ic',el.getAttribute('class')].filter(Boolean).join(' '));
    svg.setAttribute('aria-hidden','true');
    el.replaceWith(svg);
  });
}

const P=(file,caption)=>({src:'img/'+file,caption});
const photos={
  seattle:P('seattle-skyline.jpg','시애틀 스카이라인'),
  pike:P('pike-place.jpg','파이크 플레이스 마켓'),
  calgary:P('calgary-skyline.jpg','캘거리 다운타운'),
  johnston:P('johnston-canyon.jpg','존스턴 캐년'),
  peyto:P('peyto-lake.jpg','페이토 호수'),
  maligne:P('maligne-lake.jpg','멀린 호수'),
  glacier:P('athabasca-glacier.jpg','콜롬비아 대빙원'),
  louise:P('hero-lake-louise.jpg','레이크 루이스'),
  moraine:P('moraine-lake.jpg','모레인 호수'),
  springs:P('hot-springs.jpg','온천 · 분위기 참고 사진'),
  banff:P('banff-avenue.jpg','밴프 타운'),
  bow:P('bow-river.jpg','밴프 보우 강'),
  wing:P('plane-wing.jpg','귀국 비행')
};
const days={
  '9.24':{icon:'plane-landing',photos:['seattle']},
  '9.25':{icon:'camera',photos:['pike','seattle']},
  '9.26':{icon:'plane-takeoff',photos:['calgary']},
  '9.27':{icon:'footprints',photos:['peyto','johnston']},
  '9.28':{icon:'ship',photos:['maligne']},
  '9.29':{icon:'snowflake',photos:['moraine','glacier','louise']},
  '9.30':{icon:'waves',photos:['springs','banff']},
  '10.1':{icon:'luggage',photos:['bow','banff']},
  '10.2':{icon:'plane-takeoff',photos:['wing']}
};
const hideOnError=`onerror="this.style.visibility='hidden'"`;

const viewIcons={overview:'compass',itinerary:'calendar-days',flights:'plane',hotels:'bed-double',checklist:'backpack',budget:'wallet',weather:'cloud-sun',shopping:'shopping-bag'};
function iconizeChrome(){
  $$('.nav-item[data-target]>span:not(.nav-ic)').forEach(s=>{s.className='nav-ic';s.innerHTML=ic(viewIcons[s.parentElement.dataset.target])});
  $$('.mobile-nav button[data-target]>.mobile-emoji').forEach(s=>{s.className='mobile-ic';s.innerHTML=ic(viewIcons[s.parentElement.dataset.target])});
  Object.entries(viewIcons).forEach(([id,name])=>{const h=$(`#${id} .section-heading h2`);if(h&&!h.querySelector('.sec-badge'))h.insertAdjacentHTML('afterbegin',`<span class="sec-badge">${ic(name)}</span>`)});

  ['building-2','mountain-snow','waves','plane-takeoff'].forEach((name,i)=>{const p=$$('.route-point')[i];if(p&&!p.querySelector('.rp-ic'))p.insertAdjacentHTML('afterbegin',ic(name,'rp-ic'))});
  $$('.route-line:not(.has-ic)').forEach((l,i)=>{l.classList.add('has-ic');l.innerHTML=ic(['plane','bus','plane'][i]||'arrow-right')});

  [['.status-card .card-head h3','backpack'],['.decision-card .card-head h3','hourglass'],['.today-card h3','list-checks'],['.note-card label strong','notebook-pen']].forEach(([sel,name])=>{const h=$(sel);if(h&&!h.querySelector('.card-ic'))h.insertAdjacentHTML('afterbegin',ic(name,'card-ic'))});
  ['calendar-days','plane','users'].forEach((name,i)=>{const d=$$('.mini-stats>div')[i];if(d&&!d.querySelector('.stat-ic'))d.insertAdjacentHTML('afterbegin',`<span class="stat-ic">${ic(name)}</span>`)});
  $$('.decision-card .flight-mini>div').forEach((d,i)=>{const s=d.querySelector('span');if(s&&!s.querySelector('i,svg'))s.insertAdjacentHTML('afterbegin',ic(i?'luggage':'map-pin'))});
  $$('.action-list li>span:not(.act-ic)').forEach(s=>{const t=s.parentElement.textContent;s.className='act-ic';s.innerHTML=ic(/호텔/.test(t)?'hotel':/ticket/.test(t)?'ticket':'circle-check')});

  const groupIcons={'서류·예약':'file-text','건강·안전':'shield-check','로키 복장':'shirt','전자·통신':'smartphone','기내·수면':'plane','돈·생활':'wallet','직접 추가':'plus'};
  $$('.checklist-fold>summary:not(.has-ic)').forEach(s=>{const key=Object.keys(groupIcons).find(k=>s.textContent.startsWith(k));s.classList.add('has-ic');s.insertAdjacentHTML('afterbegin',ic(groupIcons[key]||'circle-check'))});
  $$('#hotels .hotel-rules span:not(.has-ic)').forEach(s=>{s.classList.add('has-ic');s.insertAdjacentHTML('afterbegin',ic('calendar-days'))});
}

const gallery=[['9/24','seattle','seattle'],['9/25','pike','seattle'],['9/26','calgary','calgary'],['9/27','johnston','tour'],['9/27','peyto','tour'],['9/28','maligne','tour'],['9/29','glacier','tour'],['9/29','louise','tour'],['9/29','moraine','tour'],['9/30','springs','tour'],['10/1','bow','calgary']];
function addGallery(){
  const strip=$('#overview .route-strip');if(!strip||$('.trip-gallery'))return;
  strip.insertAdjacentHTML('afterend',`<section class="trip-gallery" aria-label="여행지 사진"><div class="trip-gallery-head"><h3>${ic('images')}이번 여행에서 만날 풍경</h3><small>사진을 누르면 그날 상세 일정이 열려요 · 사진 Unsplash</small></div><div class="gallery-track">${gallery.map(([d,k,region])=>{const p=photos[k];return `<button type="button" class="gallery-card" data-region="${region}" data-go="itinerary" data-day="${d.replace('/','.')}" aria-label="${d} ${p.caption} · 그날 상세 일정 열기"><img src="${p.src}" alt="" loading="lazy" onerror="this.closest('.gallery-card').hidden=true"><span class="g-day">${d}</span><span class="g-cap">${p.caption}<small>상세 일정 보기 →</small></span></button>`}).join('')}</div></section>`);
}

const legs=[
  {no:'OZ272',air:'oz',airline:'아시아나항공',date:'9/24 목',from:['ICN','인천 T2','21:20'],to:['SEA','시애틀','15:15'],dur:'9시간 55분',note:['bed-double','도착 후 The Westin Seattle 체크인']},
  {no:'WS1553',air:'ws',airline:'웨스트젯',date:'9/26 토',from:['SEA','시애틀','10:30'],to:['YYC','캘거리','13:10'],dur:'1시간 40분',note:['map-pin','14:00 로얄투어 픽업 · Arrival Door #13']},
  {no:'WS1552',air:'ws',airline:'웨스트젯',date:'10/1 목',from:['YYC','캘거리','17:50'],to:['SEA','시애틀','18:45'],dur:'1시간 55분',note:['shield-check','미국 입국심사는 캘거리 공항에서']},
  {no:'OZ271',air:'oz',airline:'아시아나항공',date:'10/2 금',from:['SEA','시애틀','00:10'],to:['ICN','인천 T2','04:30'],plus:'+1',dur:'12시간 20분',note:['luggage','SEA에서 짐 찾아 다시 부치기']}
];
function addFlightBoard(){
  const heading=$('#flights .section-heading');if(!heading||$('.flight-board'))return;
  heading.insertAdjacentHTML('afterend',`<div class="flight-board">${legs.map(l=>`<article class="bp" data-air="${l.air}"><div class="bp-top"><strong>${ic('plane')}${l.no}</strong><span>${l.airline} · ${l.date}</span></div><div class="bp-mid"><div class="bp-end"><em>${l.from[0]}</em><b>${l.from[2]}</b><small>${l.from[1]}</small></div><div class="bp-path"><span class="line">${ic('plane')}</span><small>${l.dur}</small></div><div class="bp-end to"><em>${l.to[0]}</em><b>${l.to[2]}${l.plus?`<sup>${l.plus}</sup>`:''}</b><small>${l.to[1]}</small></div></div><div class="bp-foot">${ic(l.note[0])}<span>${l.note[1]}</span></div></article>`).join('')}</div><h3 class="board-sub">${ic('route')}구간별 안내</h3>`);
}

function decorateTimeline(){
  $$('#timeline .scan-row[data-day]:not(.thumb-row)').forEach(row=>{
    const d=days[row.dataset.day];if(!d)return;
    row.classList.add('thumb-row');
    row.querySelector('.scan-date')?.insertAdjacentHTML('afterend',`<img class="day-thumb" src="${photos[d.photos[0]].src}" alt="" loading="lazy" ${hideOnError}>`);
    const emoji=row.querySelector('.row-emoji');if(emoji){emoji.className='row-ic';emoji.innerHTML=ic(d.icon)}
  });
}

function decorateDayDialog(){
  const content=$('#detailBody .day-content:not(.has-hero)');if(!content)return;
  content.classList.add('has-hero');
  const m=$('#detailKicker')?.textContent.match(/2026\.(\d+\.\d+)/);const d=m&&days[m[1]];if(!d)return;
  const [first,...rest]=d.photos.map(k=>photos[k]);
  const strip=rest.length?`<div class="day-strip">${rest.map(p=>`<button type="button" data-photo="${p.src}" data-caption="${p.caption}"><img src="${p.src}" alt="${p.caption}" loading="lazy" onerror="this.parentElement.hidden=true"><span>${p.caption}</span></button>`).join('')}</div>`:'';
  content.insertAdjacentHTML('afterbegin',`<figure class="day-hero"><button type="button" data-photo="${first.src}" data-caption="${first.caption}"><img src="${first.src}" alt="${first.caption}" onerror="this.closest('figure').hidden=true"></button><figcaption>${ic('map-pin')}${first.caption}</figcaption></figure>${strip}`);
  content.querySelectorAll('.event time').forEach(t=>t.insertAdjacentHTML('afterbegin',ic('clock')));
  content.querySelector('.meal-line')?.insertAdjacentHTML('afterbegin',ic('utensils'));
  content.querySelector('.day-stay')?.insertAdjacentHTML('afterbegin',ic('bed-double'));
  content.querySelector('.day-tips h4')?.insertAdjacentHTML('afterbegin',ic('info'));
}

function decorateRows(){
  const addThumb=(row,html)=>{row.classList.add('thumb-row');row.insertAdjacentHTML('afterbegin',html)};
  const photoThumb=p=>`<img class="row-thumb" src="${p.src}" alt="" loading="lazy" ${hideOnError}>`;
  const tile=name=>`<span class="thumb-tile">${ic(name)}</span>`;
  $$('#shopping .scan-row:not(.thumb-row)').forEach(r=>{const t=r.querySelector('strong')?.textContent||'';addThumb(r,/Pike/.test(t)?photoThumb(photos.pike):/Banff Avenue/.test(t)?photoThumb(photos.banff):tile(/REI/.test(t)?'backpack':/Monod/.test(t)?'mountain-snow':'shopping-bag'))});
  $$('#itinerary > .scan-row:not(.thumb-row)').forEach(r=>addThumb(r,photoThumb(photos.springs)));
  $$('#flights .flight-options > .scan-row:not(.thumb-row)').forEach(r=>addThumb(r,tile('plane')));
  $$('#budget .scan-row:not(.thumb-row)').forEach(r=>addThumb(r,tile('calculator')));

  const hotelTile=$('[data-detail="hotel-tour-banff"] .hotel-icon-tile');
  if(hotelTile)hotelTile.outerHTML=`<img src="${photos.banff.src}" alt="밴프 타운" loading="lazy" width="86" height="72" ${hideOnError}>`;
  const tpl=$('#hotel-tour-banff');
  if(tpl&&!tpl.dataset.visual){
    tpl.dataset.visual='1';
    tpl.content.querySelector('.hotel-area')?.insertAdjacentHTML('afterend',`<div class="hotel-gallery">${[photos.banff,photos.springs].map(p=>`<figure><button type="button" class="hotel-photo-link" data-photo="${p.src}" data-caption="${p.caption}"><img src="${p.src}" alt="${p.caption}" loading="lazy"><span>사진 확대</span></button><figcaption><strong>${p.caption}</strong>주변 풍경 · 투어 호텔 사진 아님</figcaption></figure>`).join('')}</div>`);
  }
}

function decorate(){addGallery();addFlightBoard();iconizeChrome();decorateTimeline();decorateDayDialog();decorateRows();paintIcons()}
let queued=false;
new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;decorate()},16)}).observe(document.body,{childList:true,subtree:true});
decorate();
})();
