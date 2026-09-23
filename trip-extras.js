// Trip extras: bundled OpenStreetMap maps, local clocks with the next milestone,
// emergency contacts, and a cash & exchange helper. Decorators are idempotent (see visual.js).
(()=>{
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ic=(name,cls='')=>`<i data-icon="${name}"${cls?` class="${cls}"`:''}></i>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const gmaps=q=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/* ---------- Maps: tiles live in tiles/<map>-<z>-<x>-<y>.png ---------- */
const HINTON=[53.4051,-117.5850];
const MAPS={
  route:{z:7,x0:20,y0:41,cols:4,rows:4,pad:34,title:'여행 전체 동선',caption:'정차 지점을 직선으로 이었습니다 · 점선은 비행 구간',
    line:[[51.1215,-114.0076],[51.2455,-115.8397],[51.7255,-116.5117],[52.6645,-117.8836],HINTON,[52.8737,-118.0814],[52.7270,-117.6390],HINTON,[52.2200,-117.2240],[51.4166,-116.2177],[51.3217,-116.1860],[51.1784,-115.5708]],
    flights:[[[47.4502,-122.3088],[51.1215,-114.0076]]],
    pins:[
      {n:'시애틀',q:'Seattle-Tacoma International Airport',lat:47.4502,lon:-122.3088,day:'9/24–26 · 10/1 밤',region:'seattle'},
      {n:'캘거리 공항',q:'Calgary International Airport',lat:51.1215,lon:-114.0076,day:'9/26 픽업 · 10/1 출국',region:'calgary'},
      {n:'존스턴 캐년',q:'Johnston Canyon',lat:51.2455,lon:-115.8397,day:'9/27',region:'tour'},
      {n:'페이토 호수',q:'Peyto Lake',lat:51.7255,lon:-116.5117,day:'9/27',region:'tour'},
      {n:'아싸바스카 폭포',q:'Athabasca Falls',lat:52.6645,lon:-117.8836,day:'9/27',region:'tour'},
      {n:'힌튼',q:'Hinton, Alberta',lat:HINTON[0],lon:HINTON[1],day:'9/27–28 숙박',region:'tour'},
      {n:'재스퍼',q:'Jasper, Alberta',lat:52.8737,lon:-118.0814,day:'9/28',region:'tour'},
      {n:'멀린 호수',q:'Maligne Lake',lat:52.7270,lon:-117.6390,day:'9/28',region:'tour'},
      {n:'콜롬비아 대빙원',q:'Columbia Icefield Glacier Discovery Centre',lat:52.2200,lon:-117.2240,day:'9/29',region:'tour'},
      {n:'레이크 루이스',q:'Lake Louise',lat:51.4166,lon:-116.2177,day:'9/29',region:'tour'},
      {n:'모레인 호수',q:'Moraine Lake',lat:51.3217,lon:-116.1860,day:'9/29',region:'tour'},
      {n:'밴프',q:'Banff, Alberta',lat:51.1784,lon:-115.5708,day:'9/29–10/1',region:'calgary'}
    ]},
  seattle:{z:15,x0:5246,y0:11441,cols:4,rows:4,pad:70,title:'파이크 플레이스 먹거리 지도',caption:'숙소에서 시장까지 걸어서 약 10분 · 아래 가게들은 서로 1~3분 거리',
    pins:[
      {n:'The Westin Seattle',q:'The Westin Seattle, 1900 5th Avenue',lat:47.6138,lon:-122.3375,day:'숙소 9/24–26',region:'seattle'},
      {n:'Le Panier (빵)',q:'Le Panier, 1902 Pike Place, Seattle',lat:47.60983,lon:-122.34228,day:'9/25 아침',region:'calgary'},
      {n:'원조 스타벅스 1호점',q:'Starbucks 1912 Pike Place, Seattle',lat:47.61001,lon:-122.34258,day:'9/25 아침',region:'calgary'},
      {n:'파이크 플레이스 마켓',q:'Pike Place Market',lat:47.6094,lon:-122.3414,day:'9/25 오전',region:'seattle'},
      {n:'Storyville Coffee',q:'Storyville Coffee Pike Place, Seattle',lat:47.60897,lon:-122.34060,day:'9/25 오전 커피',region:'calgary'},
      {n:'Pike Place Chowder',q:'Pike Place Chowder, 1530 Post Alley, Seattle',lat:47.60940,lon:-122.34123,day:'9/25 점심',region:'calgary'},
      {n:'The Pink Door',q:'The Pink Door, 1919 Post Alley, Seattle',lat:47.61039,lon:-122.34253,day:'9/25 저녁 · 예약 필수',region:'calgary'},
      {n:'워터프런트 Pier 62',q:'Pier 62 Seattle Waterfront',lat:47.6076,lon:-122.3440,day:'9/25 오후',region:'seattle'},
      {n:'스페이스 니들',q:'Space Needle',lat:47.6205,lon:-122.3493,day:'선택',region:'seattle'}
    ]},
  seawide:{z:13,x0:1310,y0:2856,cols:4,rows:7,pad:26,title:'시애틀 광역 · 전망대와 캠퍼스',
    caption:'해밀턴 뷰포인트는 서쪽(차 15–20분), UW와 가스웍스는 북쪽(경전철·차 10–20분)',
    pins:[
      {n:'The Westin Seattle',q:'The Westin Seattle, 1900 5th Avenue',lat:47.6138,lon:-122.3375,day:'숙소',region:'seattle'},
      {n:'파이크 플레이스 마켓',q:'Pike Place Market',lat:47.6094,lon:-122.3414,day:'9/25 오전',region:'seattle'},
      {n:'해밀턴 뷰포인트 파크',q:'Hamilton Viewpoint Park, Seattle',lat:47.59152,lon:-122.38379,day:'9/24 밤 야경',region:'calgary'},
      {n:'워싱턴 대학교',q:'Suzzallo Library, University of Washington, Seattle',lat:47.65581,lon:-122.30805,day:'9/25 오후',region:'tour'},
      {n:'가스웍스 파크',q:'Gas Works Park, Seattle',lat:47.64560,lon:-122.33493,day:'9/25 해질녘',region:'tour'},
      {n:'스페이스 니들',q:'Space Needle',lat:47.6205,lon:-122.3493,day:'선택',region:'seattle'}
    ]},
  calgary:{z:13,x0:1499,y0:2738,cols:4,rows:5,pad:24,title:'캘거리 · 9/26 저녁',
    caption:'투어 호텔은 공항 남쪽 · 다운타운까지 차로 20분 안팎 · 스티븐 애비뉴 일대가 저녁 산책 구간',
    pins:[
      {n:'YYC 캘거리 공항',q:'Calgary International Airport',lat:51.12226,lon:-114.01354,day:'13:10 도착 · 14:00 픽업',region:'calgary'},
      {n:'투어 호텔(후보)',q:'Best Western Premier Calgary Plaza Hotel',lat:51.06459,lon:-113.98527,day:'9/26 숙박',region:'seattle'},
      {n:'스티븐 애비뉴',q:'Stephen Avenue Walk, Calgary',lat:51.04558,lon:-114.06427,day:'저녁 산책·식사',region:'tour'},
      {n:'캘거리 타워',q:'Calgary Tower',lat:51.04430,lon:-114.06313,day:'전망대',region:'tour'},
      {n:'프린스 아일랜드 파크',q:'Prince\'s Island Park, Calgary',lat:51.05518,lon:-114.07065,day:'보우강 산책',region:'tour'},
      {n:'피스 브리지',q:'Peace Bridge, Calgary',lat:51.05391,lon:-114.07891,day:'해질녘 사진',region:'tour'}
    ]},
  banff:{z:14,x0:2931,y0:5470,cols:3,rows:5,pad:80,title:'밴프 타운',caption:'9/30 숙소(런들스톤 로지)에서 다운타운까지 약 5블록 · 온천은 버스·택시로 약 10–15분',
    pins:[
      {n:'Rundlestone Lodge',q:'Rundlestone Lodge, 537 Banff Avenue, Banff',lat:51.18498,lon:-115.55887,day:'9/30 숙소 · 체크인 16:00',region:'seattle'},
      {n:'밴프 시내 · Banff Ave',q:'Banff Avenue, Banff',lat:51.1780,lon:-115.5705,day:'9/30 저녁',region:'calgary'},
      {n:'캐스케이드 가든',q:'Cascade of Time Garden, Banff',lat:51.17068,lon:-115.57208,day:'10/1 오전',region:'tour'},
      {n:'서프라이즈 코너',q:'Surprise Corner Viewpoint, Banff',lat:51.16762,lon:-115.55983,day:'10/1 오전 전망',region:'tour'},
      {n:'보우 폭포',q:'Bow Falls, Banff',lat:51.1652,lon:-115.5624,day:'9/30 오전 · 10/1 산책',region:'tour'},
      {n:'어퍼 핫스프링스',q:'Banff Upper Hot Springs',lat:51.1527,lon:-115.5614,day:'9/30 15:00–17:00',region:'tour'},
      {n:'밴프 곤돌라',q:'Banff Gondola',lat:51.1487,lon:-115.5722,day:'9/30 선택관광',region:'tour'}
    ]}
};
function project(m,lat,lon){
  const n=2**m.z,r=lat*Math.PI/180;
  return [((lon+180)/360*n-m.x0)*256,((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n-m.y0)*256];
}
function mapHTML(key,{compact=false}={}){
  const m=MAPS[key],W=m.cols*256,H=m.rows*256;
  const pts=[...m.pins.map(p=>project(m,p.lat,p.lon)),...(m.line||[]).map(([a,b])=>project(m,a,b))];
  let x1=Math.min(...pts.map(p=>p[0]))-m.pad,x2=Math.max(...pts.map(p=>p[0]))+m.pad;
  let y1=Math.min(...pts.map(p=>p[1]))-m.pad,y2=Math.max(...pts.map(p=>p[1]))+m.pad;
  // Keep the crop between portrait 4:5 and 16:9 so a tight cluster of pins still reads as a map.
  if(x2-x1<(y2-y1)*.8){const d=(y2-y1)*.8-(x2-x1);x1-=d/2;x2+=d/2}
  if(x2-x1>(y2-y1)*1.78){const d=(x2-x1)/1.78-(y2-y1);y1-=d/2;y2+=d/2}
  x1=Math.max(0,x1);y1=Math.max(0,y1);x2=Math.min(W,x2);y2=Math.min(H,y2);
  const w=x2-x1,h=y2-y1,u=w/100;
  const tiles=[];
  for(let c=0;c<m.cols;c++)for(let r=0;r<m.rows;r++)tiles.push(`<image href="tiles/${key}-${m.z}-${m.x0+c}-${m.y0+r}.png" x="${c*256}" y="${r*256}" width="256.6" height="256.6" preserveAspectRatio="none"/>`);
  const f=v=>v.toFixed(1);
  const line=m.line?`<polyline class="map-route" fill="none" stroke-width="${f(u*.75)}" points="${m.line.map(([a,b])=>project(m,a,b).map(f).join(',')).join(' ')}"/>`:'';
  const flights=(m.flights||[]).map(([[a1,b1],[a2,b2]])=>{const [p,q]=project(m,a1,b1),[s,t]=project(m,a2,b2);const mx=(p+s)/2,my=(q+t)/2-Math.hypot(s-p,t-q)*.18;return `<path class="map-flight" fill="none" stroke-width="${f(u*.6)}" stroke-dasharray="${f(u*1.8)} ${f(u*1.3)}" d="M${f(p)} ${f(q)} Q${f(mx)} ${f(my)} ${f(s)} ${f(t)}"/>`}).join('');
  const pins=m.pins.map((p,i)=>{const [x,y]=project(m,p.lat,p.lon),r=u*2.4;return `<g class="map-pin" data-region="${p.region}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" stroke-width="${f(u*.5)}"/><text x="${f(x)}" y="${f(y)}" dy="0.36em" text-anchor="middle" font-size="${f(r*1.12)}">${i+1}</text></g>`}).join('');
  const legend=m.pins.map((p,i)=>`<li data-region="${p.region}"><span class="map-num">${i+1}</span><span class="map-name"><strong>${esc(p.n)}</strong><small>${esc(p.day)}</small></span><a href="${gmaps(p.q)}" target="_blank" rel="noreferrer" aria-label="${esc(p.n)} Google 지도에서 열기">${ic('navigation')}길찾기</a></li>`).join('');
  return `<figure class="trip-map${compact?' compact':''}" data-map="${key}"><div class="map-frame"><svg viewBox="${f(x1)} ${f(y1)} ${f(w)} ${f(h)}" role="img" aria-label="${esc(m.title)} 지도: ${esc(m.pins.map(p=>p.n).join(', '))}"><g class="map-tiles">${tiles.join('')}</g>${line}${flights}${pins}</svg><span class="map-attr">© OpenStreetMap contributors</span></div><figcaption><div class="map-head"><strong>${ic('map')}${esc(m.title)}</strong><small>${esc(m.caption)}</small></div><ol class="map-legend">${legend}</ol></figcaption></figure>`;
}
const dayMap={'9.24':['seawide'],'9.25':['seattle','seawide'],'9.26':['calgary','route'],'9.27':['route'],'9.28':['route'],'9.29':['route'],'9.30':['banff'],'10.1':['banff']};

function placeMaps(){
  const heading=$('#itinerary .section-heading');
  if(heading&&!$('#itinerary .trip-map'))heading.insertAdjacentHTML('afterend',mapHTML('route'));
  // Hotel dialogs: embedded Google Maps frames cannot load inside the Claude viewer, so swap in a bundled map.
  $$('#detailBody .hotel-location iframe').forEach(frame=>{const key=/Westin|Seattle/i.test(frame.title)?'seattle':'banff';frame.outerHTML=mapHTML(key,{compact:true})});
  const day=$('#detailBody .day-content:not(.has-map)');
  if(day){
    day.classList.add('has-map');
    const date=$('#detailKicker')?.textContent.match(/2026\.(\d+\.\d+)/)?.[1];
    (dayMap[date]||[]).forEach(key=>day.insertAdjacentHTML('beforeend',`<div class="day-map">${mapHTML(key,{compact:true})}</div>`));
  }
  const spring=$('.spring-details:not(.has-map)');
  if(spring){spring.classList.add('has-map');spring.querySelector('.spring-links')?.insertAdjacentHTML('beforebegin',mapHTML('banff',{compact:true}))}
}

/* ---------- Overview: clocks + next milestone ---------- */
const ZONES=[['서울','Asia/Seoul'],['시애틀','America/Los_Angeles'],['캘거리·밴프','America/Edmonton']];
const ZONE_NAME={'Asia/Seoul':'한국','America/Los_Angeles':'시애틀','America/Edmonton':'캘거리'};
const MILESTONES=[
  ['2026-09-24T21:20:00+09:00','Asia/Seoul','OZ272 인천 출발','인천공항 T2 · 출발 3시간 전 도착'],
  ['2026-09-24T15:15:00-07:00','America/Los_Angeles','시애틀 도착','입국심사 후 The Westin Seattle'],
  ['2026-09-26T10:30:00-07:00','America/Los_Angeles','WS1553 캘거리행','SEA 08:00 전후 도착'],
  ['2026-09-26T14:00:00-06:00','America/Edmonton','로얄투어 픽업','YYC 도착층 Door #13'],
  ['2026-09-30T14:00:00-06:00','America/Edmonton','투어 종료 · 밴프 온천','15:00–17:00 Upper Hot Springs'],
  ['2026-10-01T17:50:00-06:00','America/Edmonton','WS1552 시애틀행','YYC 15:00 전후 도착'],
  ['2026-10-02T00:10:00-07:00','America/Los_Angeles','OZ271 인천행','SEA에서 짐 찾아 다시 부치기'],
  ['2026-10-03T04:30:00+09:00','Asia/Seoul','인천 도착','여행 끝']
];
const tzOffsetMin=(tz,d)=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(d).map(x=>[x.type,x.value]));return Math.round((Date.UTC(+p.year,p.month-1,+p.day,+p.hour,+p.minute)-d.getTime())/60000)};
const fmt=(d,tz,opts)=>new Intl.DateTimeFormat('ko-KR',{timeZone:tz,...opts}).format(d);
function relative(ms){const m=Math.max(0,Math.round(ms/60000)),d=Math.floor(m/1440),h=Math.floor(m%1440/60),mm=m%60;return d?`${d}일 ${h}시간 후`:h?`${h}시간 ${mm}분 후`:`${mm}분 후`}
function tickClocks(){
  const card=$('.clock-card');if(!card)return;
  const now=new Date(),seoul=tzOffsetMin('Asia/Seoul',now);
  $$('.clock-rows>div',card).forEach(row=>{
    const tz=row.dataset.tz,diff=(tzOffsetMin(tz,now)-seoul)/60;
    row.querySelector('strong').textContent=fmt(now,tz,{hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
    row.querySelector('small').textContent=fmt(now,tz,{month:'numeric',day:'numeric',weekday:'short'})+(diff?` · 한국보다 ${Math.abs(diff)}시간 ${diff<0?'늦음':'빠름'}`:'');
  });
  const next=MILESTONES.find(m=>Date.parse(m[0])>now.getTime());
  const title=$('.next-up strong',card),when=$('.next-up span',card);
  if(!next){title.textContent='여행을 마쳤어요';when.textContent='수고하셨습니다!';return}
  const at=new Date(next[0]);
  title.textContent=`${next[2]} · ${relative(at-now)}`;
  when.textContent=`${fmt(at,next[1],{month:'numeric',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})} ${ZONE_NAME[next[1]]} 시각 · ${next[3]}`;
}

/* ---------- Overview: emergency contacts + cash helper ---------- */
const CONTACTS=[
  ['siren','긴급 신고','미국·캐나다 경찰·구급·소방','911','tel:911'],
  ['phone-call','로얄투어','북미 무료 전화','1-888-993-9298','tel:+18889939298'],
  ['landmark','주시애틀 총영사관','긴급 · 9/24–26, 10/1–2','+1-206-947-8293','tel:+12069478293'],
  ['landmark','주밴쿠버 총영사관','비상 · 캐나다(알버타) 체류 중','+1-604-313-0911','tel:+16043130911'],
  ['globe','영사콜센터','24시간 · 한국어','+82-2-3210-0404','tel:+82232100404']
];
function addOverviewCards(){
  const grid=$('#overview .dashboard-grid'),anchor=$('#overview .today-card');
  if(!grid||!anchor||$('.clock-card'))return;
  const fx=window.TRIP_FX;
  anchor.insertAdjacentHTML('afterend',`
<article class="clock-card"><div class="card-head"><h3>${ic('clock-3','card-ic')}지금 현지 시각</h3><span class="pill recommended">서머타임 적용</span></div>
  <div class="clock-rows">${ZONES.map(([name,tz])=>`<div data-tz="${tz}"><span>${name}</span><strong>--:--</strong><small></small></div>`).join('')}</div>
  <div class="next-up"><small>${ic('timer')}다음 일정</small><strong></strong><span></span></div>
</article>
<article class="contacts-card"><div class="card-head"><h3>${ic('phone','card-ic')}비상 연락처</h3><span class="pill urgent">휴대폰에 저장</span></div>
  <ul class="contacts-list">${CONTACTS.map(([icon,name,note,num,href])=>`<li><span class="contact-ic">${ic(icon)}</span><span><strong>${name}</strong><small>${note}</small></span><a href="${href}">${num}</a></li>`).join('')}</ul>
</article>
<article class="cash-card"><div class="card-head"><h3>${ic('banknote','card-ic')}현금·환율</h3><span class="pill">${fx?`${fx.date.slice(5).replace('-','/')} 기준`:'환율 없음'}</span></div>
  ${fx?`<div class="converter"><label class="sr-only" for="cashAmount">금액</label><input id="cashAmount" type="number" inputmode="decimal" min="0" step="1" value="100"><label class="sr-only" for="cashCur">통화</label><select id="cashCur"><option value="CAD">CAD 캐나다 달러</option><option value="USD">USD 미국 달러</option></select></div>
  <div class="converter-out" id="cashOut" aria-live="polite"></div>
  <div class="converter-rate">1 USD ≈ ${Math.round(fx.USD_KRW).toLocaleString('ko-KR')}원 · 1 CAD ≈ ${Math.round(fx.USD_KRW/fx.USD_CAD).toLocaleString('ko-KR')}원 · 카드 결제 시 수수료 별도</div>`:''}
  <ul class="cash-list">
    <li><span>가이드·기사 팁<small>1인 C$100 · 5인 이하 출발 시 팀당 하루 C$50</small></span><b>C$200–250</b></li>
    <li><span>선택관광 3종 (2인)<small>설상차 C$100 · 크루즈 C$115 · 곤돌라 C$80 (1인 기준)</small></span><b>C$590</b></li>
    <li><span>포함 식사 팁<small>끼니마다 15–18% · 가이드가 안내</small></span><b>별도</b></li>
  </ul>
  <div class="cash-total">캐나다 달러 현금 약 C$800 이상 준비 · 선택관광은 카드 불가, 현지 현금만</div>
</article>`);
  const amount=$('#cashAmount'),cur=$('#cashCur'),out=$('#cashOut');
  if(fx&&amount){
    const convert=()=>{const v=Number(amount.value)||0,rate=cur.value==='USD'?fx.USD_KRW:fx.USD_KRW/fx.USD_CAD;out.textContent=`${v.toLocaleString('ko-KR')} ${cur.value} ≈ ${Math.round(v*rate).toLocaleString('ko-KR')}원`};
    amount.addEventListener('input',convert);cur.addEventListener('change',convert);convert();
  }
  tickClocks();setInterval(tickClocks,30000);
}

/* ---------- Timeline: mark today ---------- */
function markToday(){
  const now=new Date(),key=`${now.getMonth()+1}.${now.getDate()}`;
  const row=$(`#timeline .scan-row[data-day="${key}"]:not(.is-today)`);
  if(row&&now.getFullYear()===2026){row.classList.add('is-today');row.querySelector('.scan-main strong')?.insertAdjacentHTML('beforeend','<span class="today-chip">오늘</span>')}
}

function addCredits(){
  const footer=$('footer');
  if(footer&&!$('footer .credits'))footer.querySelector('p')?.insertAdjacentHTML('afterend','<p class="credits">사진 Unsplash · 지도 © OpenStreetMap contributors · 날씨 Open-Meteo · 환율 ExchangeRate-API</p>');
}

function decorate(){addOverviewCards();placeMaps();markToday();addCredits()}
let queued=false;
new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;decorate()},16)}).observe(document.body,{childList:true,subtree:true});
decorate();
})();
