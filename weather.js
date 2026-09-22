(() => {
 const $ = s => document.querySelector(s);
 const cities = [
  {name:'시애틀',lat:47.6062,lon:-122.3321},
  {name:'캘거리',lat:51.0447,lon:-114.0719},
  {name:'밴프',lat:51.1784,lon:-115.5708},
  {name:'재스퍼',lat:52.8737,lon:-118.0814},
  {name:'콜롬비아 대빙원',lat:52.219,lon:-117.224}
 ];
 const trip=[['2026-09-24',0,'시애틀 도착'],['2026-09-25',0,'시애틀 관광'],['2026-09-26',1,'캘거리'],['2026-09-27',3,'재스퍼 지역 대표'],['2026-09-28',3,'재스퍼'],['2026-09-29',4,'대빙원 대표'],['2026-09-30',2,'밴프 온천'],['2026-10-01',2,'밴프 출발·SEA 귀환'],['2026-10-02',0,'00:10 귀국편']];
 const key='trip-weather-live-v1'; let cache=null,busy=false,lastAttempt=0;
 const dayKey=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
 const localDay=zone=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const stamp=t=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'short',timeStyle:'short'}).format(new Date(t))+' KST';
 const val=x=>Number.isFinite(x)?Math.round(x):'—';
 function condition(code){if(!Number.isFinite(code))return ['❔','자료 없음'];if(code===0)return ['☀️','맑음'];if(code<=2)return ['🌤️','구름 조금'];if(code===3)return ['☁️','흐림'];if(code<=48)return ['🌫️','안개'];if([71,73,75,77,85,86].includes(code))return ['❄️','눈'];if(code>=95)return ['⛈️','뇌우'];return ['🌧️','비'];}
 function daily(city,date){const d=cache?.data?.[city]?.daily;const i=d?.time?.indexOf(date)??-1;if(i<0)return null;return {high:d.temperature_2m_max[i],low:d.temperature_2m_min[i],feel:d.apparent_temperature_min[i],rain:d.precipitation_probability_max[i],wind:d.wind_speed_10m_max[i],code:d.weather_code[i],sunrise:d.sunrise?.[i],sunset:d.sunset?.[i]};}
 // Inside the Claude viewer network fetches are blocked: show the forecast bundled in weather-data.js instead.
 const inClaude=typeof window.claude?.use==='function'||location.protocol==='file:';
 function recommendation(d){if(!d)return '예보 제공 전 · 보온층과 방수 겉옷을 준비하세요.';let t=Number.isFinite(d.feel)?d.feel:d.low;let text=!Number.isFinite(t)?'보온층을 준비하세요.':t<5?'보온 속옷·패딩·장갑·비니':t<15?'긴팔·플리스·경량 패딩':'얇은 긴팔·가벼운 겉옷';if(d.rain>=40)text+=' + 방수 겉옷';if(d.wind>=25)text+=' + 방풍 겉옷';return text;}
 function draw(){
  const fresh=cache?.day===dayKey();
  $('#weatherUpdated').textContent=cache?`마지막 성공 조회 ${stamp(cache.at)}${fresh?'':' · 이전 자료'}`:'실제 예보 조회 중';
  $('#weatherStatus').textContent=inClaude?'Open-Meteo 예보를 대시보드에 담아 보여줍니다 · 다시 게시할 때 최신 예보로 바뀝니다.':cache?(fresh?'매일 자동 갱신 · 도시 카드는 현지 오늘 예보, 아래는 여행 날짜별 예보입니다.':'이전 조회 자료입니다. 최신 예보를 다시 불러오는 중입니다.'):'날씨 제공 서버에서 예보를 불러오는 중입니다.';
  const cityPhotos=[['img/seattle-skyline.jpg','시애틀 스카이라인'],['img/calgary-skyline.jpg','캘거리 다운타운'],['img/banff-avenue.jpg','밴프 타운']];
  $('#liveCities').innerHTML=cities.slice(0,3).map((city,i)=>{const date=cache?localDay(cache.data[i].timezone):'';const d=daily(i,date);const [icon,label]=condition(d?.code);return `<article><div class="weather-place-photo"><img src="${cityPhotos[i][0]}" alt="${cityPhotos[i][1]} 풍경" loading="lazy" width="600" height="300"><span>${cityPhotos[i][1]}</span></div><div class="city-weather-body"><span class="weather-label">${date||'현지 오늘'} · 오늘 예보</span><h3>${city.name}</h3><div class="weather-reading"><span class="current-weather-icon" aria-hidden="true">${icon}</span><strong>${val(d?.high)}<sup>°C</sup></strong><span class="weather-low">최고 기온 · 최저 ${val(d?.low)}°C</span></div><div class="weather-risk">${d?label:'조회 대기'}</div><p>💧 강수 ${val(d?.rain)}% · 🌬️ 바람 ${val(d?.wind)} km/h</p><p class="city-outfit">🧥 ${recommendation(d)}</p></div></article>`;}).join('');
  $('#tripForecast').innerHTML=trip.map(([date,city,label],index)=>{const d=daily(city,date);const available=d&&Number.isFinite(d.high)&&Number.isFinite(d.low);const [icon,desc]=condition(d?.code);const past=cache&&date<cache.data[city].daily.time[0];return `<article data-region="${city===0?'seattle':city===1?'calgary':'tour'}"><span>${date.slice(5).replace('-','/')}</span><strong>${label}</strong><div class="forecast-icon" aria-hidden="true">${available?icon:'🗓️'}</div><b>${val(d?.high)} / ${val(d?.low)}°</b><small>${available?desc:past?'지난 날짜 · 조회 범위 밖':cache?'예보 제공 대기':'연결 대기'}</small>${available?`<small>강수 ${val(d.rain)}%</small>${d.sunrise&&d.sunset?`<span class="sun-line"><span><i data-icon="sunrise"></i>${d.sunrise.slice(11,16)}</span><span><i data-icon="sunset"></i>${d.sunset.slice(11,16)}</span></span>`:''}<button type="button" data-weather-day="${index}">옷차림 적용</button>`:''}</article>`;}).join('');
  document.querySelectorAll('[data-weather-day]').forEach(b=>b.addEventListener('click',()=>{const [date,city,label]=trip[Number(b.dataset.weatherDay)];const d=daily(city,date);const t=Number.isFinite(d.feel)?d.feel:d.low;$('#outfitTemp').value=t<5?'cold':t<15?'cool':'mild';$('#outfitRain').checked=d.rain>=40;$('#outfitWind').checked=d.wind>=25||city===4;updateOutfit();$('#outfitWeatherSource').textContent=`${date} ${label} · 최저 체감 ${val(d.feel)}°C 기준 (없으면 최저 기온). 강수확률 40%·바람 25km/h 이상이면 방수·방풍 추가. 조회 ${stamp(cache.at)}`;$('#outfitBadge').scrollIntoView({behavior:'smooth',block:'center'});}));
 }
 async function refresh(force=false){
  if(inClaude)return;
  if(busy||(!force&&cache?.day===dayKey()))return;
  if(!force&&Date.now()-lastAttempt<15*60*1000)return;
  busy=true;lastAttempt=Date.now();$('#refreshWeather').disabled=true;$('#weatherStatus').textContent='최신 예보 조회 중…';
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
  try{
   const params=new URLSearchParams({latitude:cities.map(c=>c.lat).join(','),longitude:cities.map(c=>c.lon).join(','),daily:'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',timezone:'auto',forecast_days:'16'});
   const response=await fetch('https://api.open-meteo.com/v1/forecast?'+params,{signal:controller.signal});if(!response.ok)throw new Error('HTTP '+response.status);
   const data=await response.json();if(!Array.isArray(data)||data.length!==cities.length||data.some(c=>!c.daily?.time?.length||!c.timezone||!Array.isArray(c.daily.temperature_2m_max)))throw new Error('Invalid forecast');
   cache={day:dayKey(),at:Date.now(),data};try{localStorage.setItem(key,JSON.stringify(cache));}catch{}draw();
  }catch{draw();$('#weatherStatus').textContent=cache?'최신 조회 실패 · 아래는 마지막 성공 조회 자료입니다. 15분 후 자동 재시도합니다.':'날씨 연결에 실패했습니다. 15분 후 자동 재시도하거나 새로고침을 눌러주세요. 실제 기온을 임의로 채우지 않습니다.';if(!cache)$('#weatherUpdated').textContent='예보 연결 실패';}
  finally{clearTimeout(timeout);busy=false;$('#refreshWeather').disabled=false;}
 }
 try{const saved=JSON.parse(localStorage.getItem(key));if(saved?.data?.length===cities.length&&saved.data.every(c=>c.daily?.time?.length&&c.timezone)&&Number.isFinite(saved.at))cache=saved;}catch{}
 const bundled=window.TRIP_WEATHER;
 if(bundled?.data?.length===cities.length&&Number.isFinite(bundled.at)&&(!cache||bundled.at>cache.at))cache={day:dayKey(new Date(bundled.at)),at:bundled.at,data:bundled.data};
 if(inClaude)$('#refreshWeather').hidden=true;
 draw();refresh();$('#refreshWeather').addEventListener('click',()=>refresh(true));
 setInterval(()=>refresh(),60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});window.addEventListener('online',()=>refresh(true));
})();
