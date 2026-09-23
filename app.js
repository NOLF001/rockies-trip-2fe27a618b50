// Day-by-day data lives in itinerary-data.js (loaded before this file).
const itinerary = window.TRIP_ITINERARY || [];

const checklistSeed = {
  '서류·예약':['여권 유효기간 확인','캐나다 eTA 확인','미국 ESTA 확인','아시아나 e-ticket 저장','웨스트젯 e-ticket 저장','로얄투어 바우처 저장','여행자보험 가입·증서 저장','네이버 해외 로그인 차단 해제'],
  '건강·안전':['아빠 복용약과 처방전','상비약(타이레놀·해열제·지사제·알러지약·소화제·파스)','무릎 보호대 또는 등산 스틱','보온병·물통','비상 연락처 종이 사본'],
  '로키 복장':['방수 재킷(레인자켓)','바람막이','경량 패딩','기능성 내의','후드·긴소매 옷 여러 겹','미끄럼 적은 트레킹화(방수)','장갑·비니','모자(햇빛용)','선글라스·선크림 SPF30+'],
  '전자·통신':['미국/캐나다 eSIM','보조배터리','폰 충전기','카메라와 충전기·어댑터','멀티 충전기','110V 변환 돼지코','노트북','비행기용 헤드셋(3.5mm 어댑터)','오프라인 지도·음악 다운로드'],
  '기내·수면':['안대','이어플러그','목베개','기내용 가벼운 겉옷'],
  '돈·생활':['해외결제 카드 2장','트래블월렛 카드 충전','CAD 현금(팁·선택관광용)','수하물 무게 확인','데이 백팩','접이식 우산·우비','간단한 한국 간식','수영복·슬리퍼·방수 봉투(온천·호텔 핫텁)']
};

const budgetSeed = [
  ["WS1552 · YYC—SEA","10/1 17:50 · 실제 결제액 입력","KRW",600000],
  ["WS1553 · SEA—YYC","9/26 · 실제 결제액 입력","KRW",600000],
  ["The Westin Seattle 2박","9/24–26 · 침대 2개 객실 · 실제 결제액 입력","USD",600],
  ["로얄투어 밴프 호텔 추가 1박","9/30–10/1 · 투어 제공 호텔 연박 · 실제 결제액 입력","CAD",380],
  ["시애틀 식사","2인 · 9/24 저녁·9/25 하루·9/26 아침·10/1 SEA 공항 저녁·간식","USD",400],
  ["캐나다 자유식","9/26 C$120 + 9/30 C$120 + 10/1 공항 식사·간편 조식 C$80","CAD",320],
  ["시애틀 대중교통","공항 4회·시내 이동 · 2인 계획액(모노레일 여유 포함)","USD",90],
  ["시애틀 택시 예비비","야간·피로 시 사용 · 운임 견적 아닌 확보액","USD",100],
  ["캐나다 현지 교통","지역버스·예비 택시 · 전용차 별도","CAD",100],
  ["밴프→YYC 편도 셔틀","10/1 YYC 14:30 이전 도착 목표 · 2인 계획액","CAD",190],
  ["9.30 밴프 온천","성인 2인 참고액 · 실제 요금 재확인","CAD",39.5],
  ["밴프 공원 입장 예비비","2인 계획액 · 투어 포함 여부 확인 후 조정","CAD",50],
  ["시애틀 관광","Space Needle 2인 최대 기본 US$110 + 추가요금 여유 · 추정","USD",130],
  ["멀린호수 크루즈","투어 선택관광 2인","CAD",230],
  ["콜롬비아 설상차","투어 선택관광 2인","CAD",200],
  ["밴프 곤돌라","투어 선택관광 2인","CAD",160],
  ["미국 기타 예비비","소액 비용·요금 변동 대비","USD",160],
  ["캐나다 기타 예비비","소액 비용·요금 변동 대비","CAD",120]
];

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const storage = {
  get(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}},
  set(key, value){localStorage.setItem(key, JSON.stringify(value))}
};

function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),1800)}

function showView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('[data-target]').forEach(b=>b.classList.toggle('active',b.dataset.target===id));window.scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'',`#${id}`)}
$$('[data-target]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.target)));
// Delegated so buttons re-rendered later (e.g. the overview decision card) still navigate.
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)showView(b.dataset.go)});

const itineraryLabels={"9.24":"OZ272 15:15 도착 · 해밀턴 뷰포인트 야경","9.25":"파이크 플레이스 · UW 캠퍼스 · 가스웍스 야경","9.26":"WS1553 10:30 출발 · 14:00 투어 합류","9.27":"존스턴 캐년과 아이스필드 파크웨이","9.28":"재스퍼 5대 호수와 멀린 호수","9.29":"빙하 위를 걷고 두 호수를 만나는 날","9.30":"14:00 투어 종료 · 밴프 온천","10.1":"밴프 오전 · WS1552 17:50 출발","10.2":"OZ271 00:10 출발 · 10/3 04:30 인천"};
function renderTimeline(filter='all'){
  const days=itinerary.filter(d=>filter==='all'||d.tag===filter);
  $('#timeline').innerHTML=days.map(d=>`<button type="button" class="scan-row" data-region="${d.tag}" data-day="${d.date}" aria-haspopup="dialog"><span class="scan-date">${d.date}<small>${d.dow}요일</small></span><span class="scan-main"><strong><span class="row-emoji" aria-hidden="true">${d.level==='이동일'||d.level==='귀국'?'✈️':d.tag==='tour'?'🏔️':d.date==='9.30'?'♨️':'📍'}</span>${itineraryLabels[d.date]||d.title}</strong><small>${d.city}</small></span><span class="scan-end">일정·식사 보기</span></button>`).join('');
}
renderTimeline();
$$('.filter').forEach(b=>b.addEventListener('click',()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderTimeline(b.dataset.filter)}));

let checked=storage.get('trip-checked',{});let customItems=storage.get('trip-custom-items',[]);
// Confirmed done by the traveller: eTA·ESTA (9/15), e-tickets and the tour voucher (9/22).
for(const item of ['캐나다 eTA 확인','미국 ESTA 확인','아시아나 e-ticket 저장','웨스트젯 e-ticket 저장','로얄투어 바우처 저장'])if(checked[item]===undefined)checked[item]=true;
function allChecklistItems(){return [...Object.values(checklistSeed).flat(),...customItems]}
function renderChecklist(){
  const groups={...checklistSeed};if(customItems.length)groups['직접 추가']=customItems;
  $('#checklistGroups').innerHTML=Object.entries(groups).map(([name,items])=>`<article class="check-group"><h3>${name}</h3>${items.map((item,i)=>{const id=`check-${name}-${i}`.replace(/\s/g,'-');return `<div class="check-item"><input type="checkbox" id="${id}" data-item="${item.replace(/"/g,'&quot;')}" ${checked[item]?'checked':''}><label for="${id}">${item}</label></div>`}).join('')}</article>`).join('');
  $$('#checklistGroups input').forEach(input=>input.addEventListener('change',()=>{checked[input.dataset.item]=input.checked;storage.set('trip-checked',checked);updateProgress()}));updateProgress();
}
function updateProgress(){const items=allChecklistItems();const done=items.filter(x=>checked[x]).length;const pct=items.length?Math.round(done/items.length*100):0;$('#progressPercent').textContent=`${pct}%`;$('#progressBar').style.width=`${pct}%`;$('#progressCopy').textContent=`${items.length}개 중 ${done}개 준비 완료`;}
renderChecklist();
$('#addItemForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#newItem');const value=input.value.trim();if(!value)return;customItems.push(value);storage.set('trip-custom-items',customItems);input.value='';renderChecklist();showToast('준비물을 추가했습니다.')});
$('#resetChecklist').addEventListener('click',()=>{if(confirm('모든 체크 상태를 초기화할까요?')){checked={};storage.set('trip-checked',checked);renderChecklist();showToast('체크 상태를 초기화했습니다.')}});

function renderBudget(){let saved=storage.get('trip-budget-confirmed-v9',null);if(!saved){const old=storage.get('trip-budget-brewster-westjet-v8',[]);const aliases={"WS1552 · YYC—SEA":"웨스트젯 YYC—SEA 10월 1일 17:50","WS1553 · SEA—YYC":"SEA—YYC 9월 26일 직항","The Westin Seattle 2박":"Hyatt Regency Seattle 2박","로얄투어 밴프 호텔 추가 1박":"Brewster Mountain Lodge 1박"};const oldDefaults={"웨스트젯 YYC—SEA 10월 1일 17:50":600000,"SEA—YYC 9월 26일 직항":600000,"Hyatt Regency Seattle 2박":600,"Brewster Mountain Lodge 1박":380,"시애틀 식사":400,"캐나다 자유식":320,"시애틀 대중교통":90,"시애틀 택시 예비비":100,"캐나다 현지 교통":100,"밴프→YYC 편도 셔틀":190,"9.30 밴프 온천":39.5,"밴프 공원 입장 예비비":50,"시애틀 관광":130,"멀린호수 크루즈":230,"콜롬비아 설상차":200,"밴프 곤돌라":160,"미국 기타 예비비":160,"캐나다 기타 예비비":120};saved=budgetSeed.map(row=>{const oldName=aliases[row[0]]||row[0];const prior=old.find(r=>r[0]===oldName);const customized=prior&&oldDefaults[oldName]!==undefined&&Number(prior[3])!==Number(oldDefaults[oldName]);return customized?[row[0],row[1]+' · 기존 직접 입력액 유지',row[2],prior[3]]:[...row]});storage.set('trip-budget-confirmed-v9',saved);}$('#budgetRows').innerHTML=saved.map((row,i)=>`<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td><input class="budget-input" type="number" min="0" step="0.01" data-index="${i}" value="${row[3]}" aria-label="${row[0]} 2인 결제·예상액"></td></tr>`).join('');$$('.budget-input').forEach(input=>input.addEventListener('input',()=>{saved[+input.dataset.index][3]=Number(input.value)||0;storage.set('trip-budget-confirmed-v9',saved);updateBudget(saved)}));updateBudget(saved)}

function updateBudget(rows){const totals={KRW:0,USD:0,CAD:0};rows.forEach(r=>totals[r[2]]+=Number(r[3])||0);$('#krwTotal').textContent=new Intl.NumberFormat('ko-KR',{style:'currency',currency:'KRW',maximumFractionDigits:0}).format(totals.KRW);$('#usdTotal').textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(totals.USD);$('#cadTotal').textContent=new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(totals.CAD)}
renderBudget();

function applyLatestPlan(){
  const nextAction=$('.action-list li:nth-child(3)');
  if(nextAction){
    nextAction.querySelector('strong').textContent='10/1 웨스트젯·환승 확정';
    nextAction.querySelector('small').textContent='YYC 17:50 출발 예정 · SEA 공항 대기 · 수하물 재수속 확인';
  }

  const flights=$$('.flight-options .flight-option');
  if(flights[1])flights[1].innerHTML=`<h3>10/1 · 캘거리 → 시애틀 → 인천</h3><p>웨스트젯 직항으로 YYC 17:50 출발 예정입니다. 편명·SEA 도착 시각·운임·수하물 조건은 아직 예약표에서 확인해야 합니다.</p><p>17:50 출발 기준 YYC에는 14:30 이전 도착을 목표로 합니다. 밴프 오전 자유시간 뒤, 이 시각에 맞는 공항 셔틀을 예약하세요.</p><p>SEA 도착 후에는 시내로 나가지 않고 공항에서 대기합니다. 별도 발권을 기준으로 수하물 수취와 아시아나 재수속 시간을 확보하고, 연결 수하물 가능 여부와 카운터 마감 시각을 두 항공사에 확인하세요.</p><a href="https://www.westjet.com/" target="_blank" rel="noreferrer">웨스트젯 예약 확인 ↗</a>`;
  const flightIntro=$('#flights .section-heading p');
  if(flightIntro)flightIntro.textContent='9/26 SEA→YYC는 미발권, 10/1 YYC→SEA는 웨스트젯 17:50 출발 예정입니다.';

  const reservations=$('.reservation-grid');
  if(reservations&&!$('[data-key="banff-brewster-sep30"]')){
    reservations.insertAdjacentHTML('beforeend',`<article class="reservation-card"><span>06</span><div><small>숙소 · 예약 예정</small><h3>Brewster Mountain Lodge</h3><p>9/30–10/1 1박 · Deluxe Queen · 2 Queen Beds</p><label>호텔 메모<input class="save-field" data-key="banff-brewster-sep30" placeholder="예약번호 · 총액 · 취소기한"></label></div></article><article class="reservation-card"><span>07</span><div><small>항공 · 예약 예정</small><h3>웨스트젯 캘거리 → 시애틀</h3><p>10월 1일 17:50 YYC 출발 · 편명·도착 시각 확인</p><label>편명 / 시간<input class="save-field" data-key="yyc-sea-oct1-westjet" value="WestJet · YYC 10/1 17:50 출발 예정"></label></div></article>`);
  }

  const mountainRow=$('[data-detail="hotel-aspen"]');
  if(mountainRow){
    mountainRow.dataset.detail='hotel-brewster';
    mountainRow.dataset.title='Brewster Mountain Lodge';
    mountainRow.dataset.kicker='예약 예정 · Deluxe Queen';
    mountainRow.querySelector('img').src='https://brewstermountainlodge.com/wp-content/uploads/2025/12/Hotel-Front.png';
    mountainRow.querySelector('img').alt='Brewster Mountain Lodge 외관';
    const copy=mountainRow.querySelector('.scan-main');
    copy.querySelector('small:first-child').textContent='예약 예정 · 9/30–10/1';
    copy.querySelector('strong').textContent='Brewster Mountain Lodge';
    copy.querySelector('small:last-child').textContent='208 Caribou Street · Deluxe Queen · 퀸 침대 2개';
    mountainRow.querySelector('.scan-price').innerHTML='예약 예정<small>최종 결제액 확인</small>';
  }
  const mountainHeading=$$('.hotel-section-label h3')[1];
  if(mountainHeading)mountainHeading.textContent='밴프 · Brewster Mountain Lodge 예약 예정';

  const oldTemplate=$('#hotel-aspen');
  if(oldTemplate){
    oldTemplate.id='hotel-brewster';
    oldTemplate.innerHTML=`<article class="hotel-card"><span class="pill recommended">예약 예정 · 9/30–10/1 · 1박</span><h3>Brewster Mountain Lodge</h3><p class="hotel-area">밴프 도심 · 208 Caribou Street</p><div class="hotel-gallery"><figure><button type="button" class="hotel-photo-link" data-photo="https://brewstermountainlodge.com/wp-content/uploads/2025/12/Hotel-Front.png" data-caption="Brewster Mountain Lodge · 호텔 외관" aria-label="Brewster Mountain Lodge 호텔 외관 확대"><img src="https://brewstermountainlodge.com/wp-content/uploads/2025/12/Hotel-Front.png" alt="Brewster Mountain Lodge 호텔 외관" loading="lazy" decoding="async" width="800" height="560"><span>사진 확대</span></button><figcaption><strong>호텔 외관</strong><a href="https://brewstermountainlodge.com/" target="_blank" rel="noreferrer">공식 호텔 정보 ↗</a></figcaption></figure><figure><button type="button" class="hotel-photo-link" data-photo="https://brewstermountainlodge.com/wp-content/uploads/2025/12/two-beds.webp" data-caption="Brewster Mountain Lodge · Deluxe Queen · 퀸 침대 2개" aria-label="Brewster Mountain Lodge Deluxe Queen 객실 확대"><img src="https://brewstermountainlodge.com/wp-content/uploads/2025/12/two-beds.webp" alt="Brewster Mountain Lodge Deluxe Queen 퀸 침대 2개 객실" loading="lazy" decoding="async" width="800" height="560"><span>사진 확대</span></button><figcaption><strong>Deluxe Queen · 2 Queen Beds</strong><a href="https://brewstermountainlodge.com/room-type/deluxe-queen/" target="_blank" rel="noreferrer">공식 객실 정보 ↗</a></figcaption></figure></div><p class="hotel-photo-note">공식 사진입니다. 객실마다 구조와 인테리어가 다를 수 있으므로 예약 화면에서 Deluxe Queen과 퀸 침대 2개를 확인하세요.</p><div class="hotel-detail-grid"><div class="hotel-detail"><p>Banff Avenue에서 가까운 도심 숙소입니다. 9월 30일 투어 종료 후 체크인하고 Upper Hot Springs에 다녀온 뒤, 10월 1일 오전 밴프 자유시간을 보내기 좋은 위치입니다.</p><div class="hotel-price"><strong>예약 예정 · 최종 총액 확인</strong><span>세금·필수요금 포함 1박 50만 원 이하 조건 · 취소기한 확인</span></div><p><strong>선택 객실: Deluxe Queen · 2 Queen Beds</strong>. 공식 안내에는 미니 냉장고, 휴식 공간, 커피·차 도구와 욕실이 포함된 것으로 표시됩니다.</p><div class="hotel-links"><a href="https://www.google.com/maps/search/?api=1&query=Brewster%20Mountain%20Lodge%20208%20Caribou%20Street%20Banff" target="_blank" rel="noreferrer">Google 지도 앱 · 위치·길찾기 ↗</a><a href="https://brewstermountainlodge.com/room-type/deluxe-queen/" target="_blank" rel="noreferrer">공식 객실·예약 확인 ↗</a></div></div><div class="hotel-location"><h4>지도에서 위치 확인</h4><iframe data-src="https://maps.google.com/maps?q=Brewster%20Mountain%20Lodge%20208%20Caribou%20Street%20Banff&output=embed" title="Brewster Mountain Lodge Google 지도" width="600" height="300" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><p>투어 하차 장소에서 호텔까지 이동, Upper Hot Springs 왕복, 10월 1일 공항 셔틀 픽업 위치를 함께 확인하세요.</p></div></div></article>`;
  }

  const transfer=$('#transfer-details');
  if(transfer){
    const headings=transfer.content.querySelectorAll('h3');
    const paragraphs=transfer.content.querySelectorAll('p');
    if(headings[2])headings[2].textContent='10/1 · 밴프 오전과 공항 이동';
    if(paragraphs[2])paragraphs[2].textContent='오전에는 밴프 시내를 짧게 둘러보고 공항까지 직접 이동합니다. WS1552는 캘거리에서 미국 입국심사를 받으므로 15:00 전후 YYC 도착을 목표로 합니다. SEA 18:45 도착 후 짐을 찾아 아시아나 카운터에서 다시 부칩니다.';
  }

  const assumptions=$$('.budget-assumptions p');
  if(assumptions[1])assumptions[1].textContent='밴프→YYC 이동비 C$190은 10/1 두 사람 계획액입니다. 이동 수단은 직접 정하고, SEA 도착 후 시내 교통비는 잡지 않습니다.';
  const footer=$('footer > p');
  if(footer)footer.textContent='로얄투어 첨부 일정표 기반 · 2026.9.14 개인 일정 변경 · 일부 항공·호텔 예약 예정';
}
applyLatestPlan();

function applyConfirmedPlan(){
  const topActions=$('.top-actions');
  if(topActions&&!$('#tourPdfShortcut')){
    topActions.insertAdjacentHTML('afterbegin','');
  }

  const decision=$('.decision-card');
  if(decision)decision.innerHTML=`<div class="card-head"><h3>✅ 항공·숙소 예약 완료</h3><span class="pill recommended">확정</span></div><div class="flight-mini"><div><span>출국·캐나다 이동</span><strong>OZ272 · WS1553</strong><small>9/24 · 9/26</small></div><div><span>귀국 연결</span><strong>WS1552 · OZ271</strong><small>10/1 · 10/2</small></div></div><p>비교 단계는 끝났습니다. 이제 e-ticket 현지 시각, 수하물 규정, 터미널과 투어 미팅 시간을 출발 전에 다시 확인하면 됩니다.</p><button class="text-button" data-go="flights">확정 항공편 보기 →</button>`;
  const actions=$$('.action-list li');
  const confirmedActions=[
    ['e-ticket 오프라인 저장','OZ272 · WS1553 · WS1552 · OZ271'],
    ['투어 밴프 호텔명 확인','9/30 연박 연결 · 같은 객실 유지 여부'],
    ['SEA 환승 수하물 확인','WS1552 도착 후 OZ271 재수속 기준']
  ];
  actions.forEach((item,i)=>{if(!confirmedActions[i])return;item.querySelector('strong').textContent=confirmedActions[i][0];item.querySelector('small').textContent=confirmedActions[i][1]});

  const flightSection=$('#flights');
  if(flightSection){
    flightSection.querySelector('.section-heading h2').textContent='확정 항공편 · 탑승 가이드';
    flightSection.querySelector('.section-heading p').textContent='비교가 끝난 네 항공편을 날짜 순서대로 확인하세요.';
    const banner=flightSection.querySelector('.recommend-banner');
    if(banner)banner.innerHTML='<div><span class="pill recommended">예약 완료</span><h3>OZ272 → WS1553 → WS1552 → OZ271</h3><p>편명·날짜 확정 · 정확한 출발/도착 시각과 터미널은 e-ticket 우선</p></div>';
    const options=flightSection.querySelector('.flight-options');
    if(options)options.innerHTML=`
      <article class="flight-option"><h3>9/24 · OZ272 · 인천 → 시애틀</h3><p>아시아나항공 예약 완료. 시애틀 도착 후 미국 입국심사와 수하물 수취를 거쳐 The Westin Seattle로 이동합니다.</p><p>여권·ESTA·e-ticket을 오프라인 저장하고, 체크인 카운터와 수하물 허용량은 예약 화면에서 확인하세요.</p></article>
      <article class="flight-option"><h3>9/26 · WS1553 · 시애틀 → 캘거리</h3><p>웨스트젯 직항 예약 완료. 캘거리 도착 후 캐나다 입국심사와 수하물 수취를 진행합니다.</p><p>로얄투어 집결지는 YYC 도착층 Door #13, 메리어트 호텔 로비 근처입니다. e-ticket 도착 시각에 맞춰 14:00 또는 17:30 미팅을 선택해 여행사에 전달하세요.</p></article>
      <article class="flight-option"><h3>10/1 · WS1552 · 캘거리 → 시애틀</h3><p>웨스트젯 17:50 YYC 출발편 예약 완료. 14:30 이전 공항 도착을 목표로 밴프 공항 셔틀을 확정하세요.</p><p>SEA 도착 뒤 시내로 이동하지 않고 OZ271 탑승 준비를 진행합니다.</p></article>
      <article class="flight-option"><h3>10/2 · OZ271 · 시애틀 → 인천</h3><p>아시아나항공 00:10 SEA 출발편 예약 완료. WS1552와 별도 발권이라면 수하물을 찾아 다시 부치는 시간을 확보합니다.</p><p>아시아나 카운터 마감, 탑승구, 연결 수하물 가능 여부는 출발 전에 항공사에 확인하세요.</p></article>`;
    const reservations=flightSection.querySelector('.reservation-grid');
    if(reservations)reservations.innerHTML=`
      <article class="reservation-card"><span>01</span><div><small>예약 완료 · 아시아나</small><h3>OZ272</h3><p>9/24 · 인천 → 시애틀</p></div></article>
      <article class="reservation-card"><span>02</span><div><small>예약 완료 · 호텔</small><h3>The Westin Seattle</h3><p>9/24–26 · 2박 · 침대 2개 객실</p></div></article>
      <article class="reservation-card"><span>03</span><div><small>예약 완료 · 웨스트젯</small><h3>WS1553</h3><p>9/26 · 시애틀 → 캘거리</p></div></article>
      <article class="reservation-card"><span>04</span><div><small>예약 완료 · 로얄투어</small><h3>항공록키 4박 5일</h3><p>9/26–30 · 9/30 밴프 호텔 추가 1박</p></div></article>
      <article class="reservation-card"><span>05</span><div><small>예약 완료 · 웨스트젯</small><h3>WS1552</h3><p>10/1 17:50 · 캘거리 → 시애틀</p></div></article>
      <article class="reservation-card"><span>06</span><div><small>예약 완료 · 아시아나</small><h3>OZ271</h3><p>10/2 00:10 · 시애틀 → 인천</p></div></article>`;
    const hotelButton=flightSection.querySelector('[data-go="hotels"]');
    if(hotelButton)hotelButton.textContent='🛏️ 예약 숙소 가이드 보기';
  }

  const hotels=$('#hotels');
  if(hotels)hotels.innerHTML=`
    <div class="section-heading"><div><p class="eyebrow">CONFIRMED STAYS</p><h2 id="hotels-title">예약 숙소 · 사진과 주변 가이드</h2><p>숙소를 누르면 사진, 시설, 지도와 주변에서 할 일을 확인할 수 있습니다.</p></div></div>
    <div class="hotel-rules"><span>✅ 예약 완료</span><span>성인 2명</span><span>시애틀 2박</span><span>투어 4박 (캘거리 1 · 힌튼 2 · 밴프 1)</span><span>밴프 연박 1박</span></div>
    <div class="scan-list">
      <button type="button" class="scan-row" data-detail="hotel-westin" data-title="The Westin Seattle" data-kicker="예약 완료 · 9/24–26" aria-haspopup="dialog"><img src="https://igx.4sqi.net/img/general/width960/5565492_3HMwMpsNi98eTzngYMtY35Vn5pZgfJagfNAlQuBQYHk.jpg" alt="The Westin Seattle 외관" loading="lazy" width="86" height="72"><span class="scan-main"><small>시애틀 · 2박</small><strong>The Westin Seattle</strong><small>1900 5th Avenue · 침대 2개 · Westlake 중심</small></span><span class="scan-price">예약 완료<small>사진·주변 보기</small></span><span class="scan-end">상세 보기</span></button>
      <button type="button" class="scan-row" data-detail="hotel-tour-banff" data-title="로얄투어 제공 밴프 호텔" data-kicker="예약 완료 · 9/30 연박" aria-haspopup="dialog"><span class="hotel-icon-tile" aria-hidden="true">🏔️</span><span class="scan-main"><small>밴프 · 추가 1박</small><strong>Rundlestone Lodge · 9/30</strong><small>537 Banff Avenue · 예약 완료(Expedia) · 체크인 16:00</small></span><span class="scan-price">예약 완료<small>연박 연결 확인</small></span><span class="scan-end">상세 보기</span></button>
    </div>
    <div class="stay-plan"><h3>투어 숙소 4박 (프라임투어 안내서 기준)</h3><ol class="stay-nights">
      <li><span class="stay-date">9/26</span><span class="stay-city">캘거리 1박</span><span class="stay-hotel">Best Western Premier Calgary Plaza Hotel &amp; Conference Centre 또는 Holiday Inn Express &amp; Suites Calgary Airport <em>등 동급</em></span></li>
      <li><span class="stay-date">9/27–28</span><span class="stay-city">힌튼 2박</span><span class="stay-hotel">Crestwood Hotel 또는 Coast Hotel Hinton <em>등 동급</em></span></li>
      <li><span class="stay-date">9/29</span><span class="stay-city">밴프 1박</span><span class="stay-hotel">Rundlestone Lodge · Irwin's Mountain Inn · Red Carpet Inn <em>등 동급 · 밴프 타운 숙박 100% 보장</em></span></li>
      <li><span class="stay-date">9/30</span><span class="stay-city">밴프 · 개인 예약</span><span class="stay-hotel">Rundlestone Lodge · 537 Banff Avenue · 스탠다드룸 퀸 2 <em>· 체크인 16:00 / 체크아웃 11:00</em></span></li>
    </ol><p class="stay-note">밴프 호텔은 국립공원 안 롯지 스타일 2–3층 건물이라 엘리베이터가 없을 수 있습니다. 호텔 핫텁은 무료로 쓸 수 있어 수영복을 챙기면 좋습니다. 조식은 뷔페가 아닌 간단한 컨티넨털이며, 지역에 따라 외부 식당에서 진행됩니다.</p></div>
    <div class="transfer-note"><strong>9/30은 호텔이 바뀔 수 있습니다</strong><p>9/30 숙소는 투어와 별도로 예약한 <strong>Rundlestone Lodge</strong>입니다. 9/29 투어 호텔과 다른 곳일 수 있으니 9/30 아침에 짐을 모두 챙겨 나오고, 투어가 끝나는 14:00 이후 로지에 짐을 맡긴 뒤 온천에 다녀와 16시 이후 체크인하세요.</p> </div>
    <template id="hotel-westin"><article class="hotel-card"><span class="pill recommended">예약 완료 · 9/24–26 · 2박</span><h3>The Westin Seattle</h3><p class="hotel-area">시애틀 도심 · 1900 5th Avenue</p><div class="hotel-gallery"><figure><button type="button" class="hotel-photo-link" data-photo="https://igx.4sqi.net/img/general/width960/5565492_3HMwMpsNi98eTzngYMtY35Vn5pZgfJagfNAlQuBQYHk.jpg" data-caption="The Westin Seattle · 호텔 외관" aria-label="The Westin Seattle 호텔 외관 확대"><img src="https://igx.4sqi.net/img/general/width960/5565492_3HMwMpsNi98eTzngYMtY35Vn5pZgfJagfNAlQuBQYHk.jpg" alt="The Westin Seattle 외관" loading="lazy" decoding="async" width="800" height="560"><span>사진 확대</span></button><figcaption><strong>도심의 원형 트윈 타워 외관</strong><a href="https://www.marriott.com/en-us/hotels/seawi-the-westin-seattle/photos/" target="_blank" rel="noreferrer">Marriott 공식 갤러리 ↗</a></figcaption></figure><figure><button type="button" class="hotel-photo-link" data-photo="https://pix10.agoda.net/hotelImages/5105350/1154008400/b44de56893d78ce2d6aa04bf7bf5a3c2.jpeg?ce=3&s=800x600" data-caption="The Westin Seattle · 침대 2개 객실 예시" aria-label="The Westin Seattle 침대 2개 객실 예시 확대"><img src="https://pix10.agoda.net/hotelImages/5105350/1154008400/b44de56893d78ce2d6aa04bf7bf5a3c2.jpeg?ce=3&s=800x600" alt="The Westin Seattle 침대 2개 객실 예시" loading="lazy" decoding="async" width="800" height="560"><span>사진 확대</span></button><figcaption><strong>침대 2개 객실 예시 · 대형 창문</strong><a href="https://www.marriott.com/en-us/hotels/seawi-the-westin-seattle/rooms/" target="_blank" rel="noreferrer">공식 객실 안내 ↗</a></figcaption></figure></div><p class="hotel-photo-note">객실 예시 사진입니다. 실제 층·전망·침대 규격은 예약 확인서와 배정 객실에 따릅니다.</p><div class="detail-facts"><div><small>객실</small><strong>침대 2개 · Heavenly Bed</strong></div><div><small>시설</small><strong>실내 수영장 · 피트니스</strong></div><div><small>교통</small><strong>Westlake Station·모노레일 인접</strong></div></div><div class="hotel-detail-grid"><div class="hotel-detail"><h4>숙소 특징</h4><p>천장부터 바닥까지 이어지는 창으로 도심·Puget Sound 방향 전망을 볼 수 있는 고층 호텔입니다. 실내 수영장, 피트니스센터, Relish Bistro와 간편식 매장이 있어 도착일 휴식에도 편리합니다.</p><h4>주변에서 할 일</h4><p>Westlake 모노레일로 Seattle Center·Space Needle에 이동하고, Pike Place Market·워터프런트·Nordstrom·Pacific Place를 시내 동선으로 묶기 좋습니다.</p><div class="hotel-links"><a href="https://www.google.com/maps/search/?api=1&query=The%20Westin%20Seattle%201900%205th%20Avenue" target="_blank" rel="noreferrer">Google 지도·길찾기 ↗</a><a href="https://www.marriott.com/en-us/hotels/seawi-the-westin-seattle/overview/" target="_blank" rel="noreferrer">호텔 공식 안내 ↗</a></div></div><div class="hotel-location"><h4>호텔과 주변 지도</h4><iframe data-src="https://maps.google.com/maps?q=The%20Westin%20Seattle%201900%205th%20Avenue&output=embed" title="The Westin Seattle Google 지도" width="600" height="300" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><p>도착일에는 호텔 주변, 9월 25일에는 Pike Place–워터프런트–모노레일 동선으로 이용합니다.</p></div></div></article></template>
    <template id="hotel-tour-banff"><article class="hotel-card"><span class="pill recommended">예약 완료 · 9/30–10/1 · 1박</span><h3>Rundlestone Lodge (런들스톤 로지)</h3><p class="hotel-area">537 Banff Avenue, Banff · 다운타운에서 약 5블록</p><div class="priority-note"><strong>Expedia 예약 확정</strong><br>성인 2명 · 스탠다드룸, 퀸사이즈 침대 2개 · 무료 WiFi, 무료 셀프 주차 · 체크인 9/30 16:00 이후, 체크아웃 10/1 11:00까지.<br>9/29 투어 제공 호텔은 Irwin's Mountain Inn·Red Carpet Inn 등으로 배정될 수 있어 <strong>다른 호텔일 수 있습니다</strong>. 9/30 아침에 짐을 모두 챙겨 나오세요.</div><div class="detail-facts"><div><small>9/29</small><strong>투어 제공 호텔 (배정 대기)</strong></div><div><small>9/30</small><strong>런들스톤 로지 · 개인 예약</strong></div><div><small>10/1</small><strong>11:00 체크아웃 후 YYC</strong></div></div><div class="hotel-detail-grid"><div><h4>연박 체크</h4><p>투어 예약과 개인 추가 예약을 같은 투숙객 영문명으로 연결하고, 9월 30일 객실 이동이나 재체크인이 필요한지 확인하세요. 짐을 옮기지 않고 같은 객실을 유지할 수 있는지가 핵심입니다.</p><h4>주변에서 할 일</h4><p>투어 종료 뒤 Upper Hot Springs, Banff Avenue 저녁 식사와 가벼운 산책을 진행합니다. 10월 1일 오전에는 Bow River 또는 시내 카페처럼 셔틀 시간에 영향이 적은 일정만 잡습니다.</p><div class="hotel-links"><a href="https://www.google.com/maps/search/?api=1&query=Banff%20Town%20Alberta" target="_blank" rel="noreferrer">밴프 타운 지도 ↗</a></div></div><div class="hotel-location"><h4>밴프 타운 지도</h4><iframe data-src="https://maps.google.com/maps?q=Banff%20Town%20Alberta&output=embed" title="밴프 타운 Google 지도" width="600" height="300" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><p>호텔명이 확정되면 지도와 주변 동선을 해당 주소 기준으로 바꿉니다.</p></div></div></article></template>`;

  const transfer=$('#transfer-details');
  if(transfer){
    const first=transfer.content.querySelector('p');
    if(first)first.textContent='로얄투어 제공 밴프 호텔에서 개인 추가 1박을 이어서 숙박합니다. 같은 객실 유지 여부와 키 재발급 필요 여부를 프런트에서 확인한 뒤 Upper Hot Springs로 이동합니다.';
  }
  const footer=$('footer > p');
  if(footer)footer.textContent='로얄투어 일정표·영수증 기반 · 2026.9.15 항공 시각 반영 · 모든 시각은 현지 기준이며 e-ticket이 우선';
  renderTimeline();
}
applyConfirmedPlan();

function simplifyConfirmedUI(){
  const decision=$('.decision-card');
  if(decision)decision.innerHTML=`<div class="card-head"><h3>출발 전 마지막 점검</h3><span class="pill urgent">짐 싸기</span></div><div class="flight-mini"><div><span>9/26 투어 합류</span><strong>14:00 픽업</strong><small>WS1553 YYC 13:10 도착</small></div><div><span>10/1 귀국 연결</span><strong>SEA 18:45 도착</strong><small>짐 찾아 OZ271 재수속</small></div></div><p>항공권·바우처·eTA·ESTA는 모두 준비됐습니다. 이제 현금과 짐만 챙기면 됩니다.</p><button class="text-button" data-go="checklist">준비물 체크리스트 →</button>`;

  const list=$('.action-list');
  if(list)list.innerHTML=`
    <li><span>1</span><div><strong>The Pink Door 9/25 저녁 예약</strong><small>OpenTable · 20:15 전후 · 금요일 라이브 음악 · 일·월 휴무</small></div></li>
    <li><span>2</span><div><strong>Banff Airporter 10/1 12:30 예약</strong><small>2인 · 성인 C$88.90 + 65세 이상 C$80.01 · 호텔 앞 픽업 · YYC 14:30 도착</small></div></li>
    <li><span>3</span><div><strong>캐나다 달러 현금 준비</strong><small>가이드·기사 팁 C$200–250 + 선택관광 · 현지에서 현금만 받습니다</small></div></li>
    <li><span>4</span><div><strong>선택관광 신청 상태 확인</strong><small>설상차 C$100 · 멀린 크루즈 C$115 · 곤돌라 C$80 (1인)</small></div></li>
    <li><span>5</span><div><strong>9/29 투어 호텔명 확인</strong><small>바우처에서 확인 · 9/30은 런들스톤 로지로 옮깁니다</small></div></li>`;

  const flightSection=$('#flights');
  if(flightSection){
    const intro=flightSection.querySelector('.section-heading p');
    if(intro)intro.textContent='모든 시각은 출발·도착 도시의 현지 시각입니다. 2026.9.15 항공 스케줄 조회 기준이며, e-ticket과 다르면 e-ticket을 따릅니다.';
    const banner=flightSection.querySelector('.recommend-banner');
    if(banner)banner.remove();
    const options=flightSection.querySelector('.flight-options');
    if(options)options.innerHTML=`
      <article class="flight-option"><h3>9/24 · OZ272 · 인천 21:20 → 시애틀 15:15</h3><p>인천 T2 출발, 비행 약 9시간 55분. SEA 도착 후 입국심사와 수하물 수취를 마치고 The Westin Seattle로 이동합니다.</p><p>여권·ESTA·e-ticket·수하물 허용량을 출발 전에 확인합니다.</p></article>
      <article class="flight-option"><h3>9/26 · WS1553 · 시애틀 10:30 → 캘거리 13:10</h3><p>도착 후 캐나다 입국심사·수하물을 마치고 14:00 1차 픽업에 합류합니다. 장소는 YYC 도착층 Door #13, 메리어트 호텔 로비 근처입니다.</p><p>지연으로 14:00를 놓치면 같은 장소 17:30 2차 픽업에 집결하고 여행사에 연락합니다.</p></article>
      <article class="flight-option"><h3>10/1 · WS1552 · 캘거리 17:50 → 시애틀 18:45</h3><p>미국행이라 캘거리 공항에서 미국 입국심사까지 끝냅니다. YYC에는 15:00 전후 도착을 목표로 직접 이동합니다.</p><p>SEA에는 국내선처럼 도착하므로 바로 수하물 찾는 곳으로 갑니다.</p></article>
      <article class="flight-option"><h3>10/2 · OZ271 · 시애틀 00:10 → 인천 10/3 04:30</h3><p>SEA에서 WS1552 짐을 찾아 아시아나 카운터에서 다시 부칩니다. 카운터는 보통 출발 약 3시간 전(21:10 전후)에 열립니다.</p><p>비행 약 12시간 20분, 인천 T2 새벽 도착입니다. 귀가 교통을 미리 정해두세요.</p></article>`;
    const reservations=flightSection.querySelector('.reservation-grid');
    if(reservations)reservations.remove();
    const hotelButton=flightSection.querySelector('[data-go="hotels"]');
    if(hotelButton)hotelButton.closest('p')?.remove();
  }

  const hotelRules=$('#hotels .hotel-rules');
  if(hotelRules)hotelRules.innerHTML='<span>시애틀 9/24–26 · 2박</span><span>밴프 9/30–10/1 · 연박</span>';
  const westinRow=$('[data-detail="hotel-westin"]');
  if(westinRow)westinRow.querySelector('.scan-price').innerHTML='9/24–26<small>사진·지도·주변</small>';
  const tourRow=$('[data-detail="hotel-tour-banff"]');
  if(tourRow)tourRow.querySelector('.scan-price').innerHTML='9/30–10/1<small>연박 동선</small>';
  const westinPill=$('#hotel-westin')?.content.querySelector('.pill');
  if(westinPill)westinPill.textContent='9/24–26 · 2박 · 침대 2개';
  const tourPill=$('#hotel-tour-banff')?.content.querySelector('.pill');
  if(tourPill)tourPill.textContent='9/30–10/1 · 같은 호텔 추가 1박';
}
simplifyConfirmedUI();

const note=$('#tripNote');note.value=localStorage.getItem('trip-note')||'';note.addEventListener('input',()=>localStorage.setItem('trip-note',note.value));
$$('.save-field').forEach(input=>{const saved=localStorage.getItem(`trip-field-${input.dataset.key}`);if(saved!==null)input.value=saved;input.addEventListener('input',()=>localStorage.setItem(`trip-field-${input.dataset.key}`,input.value))});

function setFlightChoice(choice,notify=true){$$('.flight-option').forEach(card=>card.classList.toggle('selected',card.dataset.flightChoice===choice));storage.set('trip-flight-choice',choice);if(notify)showToast(choice==='safe'?'왕복 직항 추천안을 선택했습니다.':'최저가 경유안을 선택했습니다.')}
$$('.choose-flight').forEach(b=>b.addEventListener('click',()=>setFlightChoice(b.dataset.choice)));
setFlightChoice(storage.get('trip-flight-choice','safe'),false);

const departure=new Date('2026-09-24T00:00:00+09:00');const now=new Date();const days=Math.ceil((departure-now)/86400000);$('#countdown').textContent=days>0?`D-${days}`:days===0?'오늘 출발':now<new Date('2026-10-02T00:10:00-07:00')?'여행 중':'다녀왔어요';
$('#printButton').addEventListener('click',()=>window.print());
const initial=location.hash.slice(1);if(['overview','itinerary','flights','hotels','checklist','budget','weather','shopping'].includes(initial))showView(initial);

if(document.modelContext?.registerTool){
  try{document.modelContext.registerTool({name:'update_trip_checklist',title:'여행 준비물 상태 변경',description:'여행 준비물의 완료 상태를 변경하고 화면의 준비율을 갱신합니다.',inputSchema:{type:'object',properties:{item:{type:'string'},completed:{type:'boolean'}},required:['item','completed'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:({item,completed})=>{if(!allChecklistItems().includes(item))throw new Error('목록에 없는 준비물입니다.');checked[item]=completed;storage.set('trip-checked',checked);renderChecklist();return{item,completed,progress:$('#progressPercent').textContent}}});}catch(e){console.debug('WebMCP unavailable',e)}
}

function updateOutfit(){
 const temp=$('#outfitTemp').value;
 let text=temp==='mild'?'긴팔 또는 얇은 상의 + 가벼운 겉옷 + 긴바지.':temp==='cool'?'긴팔 속옷 + 플리스 + 경량 패딩 + 긴바지.':'보온 속옷 + 플리스 + 따뜻한 패딩 + 보온 바지 + 장갑·비니.';
 if($('#outfitRain').checked)text+=' 후드 방수 재킷과 방수 신발, 여벌 양말을 추가하세요.';
 if($('#outfitWind').checked)text+=' 방풍 겉옷·목 보온용품을 더하고 전망대에서는 오래 서 있지 마세요.';
 $('#outfitResult').textContent=text;
 $('#outfitBadge').textContent=temp==='mild'?'15°C 이상':temp==='cool'?'5–14°C':'5°C 미만';
 const layers=temp==='mild'?['👕 얇은 상의','🧥 가벼운 겉옷','👖 긴바지']:temp==='cool'?['👕 긴팔 속옷','🧥 플리스·경량 패딩','👖 긴바지']:['👕 보온 속옷','🧥 플리스·패딩','🧤 장갑·비니'];
 if($('#outfitRain').checked)layers.push('☔ 방수 재킷·신발');
 if($('#outfitWind').checked)layers.push('🧣 방풍·목 보온');
 $('#outfitLayers').replaceChildren(...layers.map(label=>{const el=document.createElement('span');el.textContent=label;return el;}));
}
['outfitTemp','outfitRain','outfitWind'].forEach(id=>$('#'+id).addEventListener('change',updateOutfit));updateOutfit();
