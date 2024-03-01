
// 통신을 위한 함수
function searchAnimal() {
  // 검색어 가져오기
  var searchType = document.getElementById('searchType').value;
  var searchQuery = document.getElementById('searchQuery').value;

  // 백엔드 API 엔드포인트
  // 백엔드 API 엔드포인트
  var apiUrl = '';

  // POST 요청을 위한 데이터
  var postData = {};

  if (searchType === 'animal') {
    // 동물 이름으로 검색
    apiUrl = 'http://localhost:8080/api/species/speciesnameall';

    postData = {
      speciesName: searchQuery,
    };
  } else if (searchType === 'country') {
    // 국가 이름으로 검색
    apiUrl = 'http://localhost:8080/api/species/countryall';
    postData = {
      countryName: searchQuery,
    };
  }


  // POST 요청 보내기
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  })
    .then(response => response.json())
    .then(data => {
      // API 응답 결과를 처리
      console.log('Success:', data);
      displayResult(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


// 결과를 화면에 표시하는 함수
function displayResult(data) {
  const resultContainer = document.getElementById('resultContainer');
  console.log(data.result);
  resultContainer.innerHTML = '';

  // 데이터 검증 및 처리
  if (data.result) {
    // 검색된 나라 이름을 기반으로 지구본 상의 나라 찾기
    const countryName = data.result[0].country; // 예시로, 검색 결과에서 나라 이름 가져오기
    console.log(countryName);
    highlightCountryOnGlobe(countryName);
  } else {
    resultContainer.innerHTML = '<p>동물을 찾을 수 없습니다.</p>';
  }

  if (data.result) {
    const speciesInfo = data.result.map(item => {
      return {
        country: `국가 명: ${item.country_en}(${item.country})`,
        scientificName: `학명: ${item.scientific_name_korean}(${item.scientific_name})`,
        imgUrl: `<img src="${item.img_url}" />`
      };
    });

    const resultText = speciesInfo.map((info, index) => {
      if (index % 5 === 0) {
        return `
          <div class="result-row">
            <div class="result-item">
              <div>${info.imgUrl}</div>
              <div class="result-container">
                <div>${info.country}</div>
                <div>${info.scientificName}</div>
              </div>
            </div>`;
      } else if (index % 5 === 4 || index === speciesInfo.length - 1) {
        return `
            <div class="result-item">
              <div>${info.imgUrl}</div>
              <div class="result-container">
                <div>${info.country}</div>
                <div>${info.scientificName}</div>
              </div>
            </div>
          </div>`;
      } else {
        return `
            <div class="result-item">
              <div>${info.imgUrl}</div>
              <div class="result-container">
                <div>${info.country}</div>
                <div>${info.scientificName}</div>
              </div>
            </div>`;
      }
    });

    resultContainer.innerHTML = `<div class="result-container">${resultText.join('')}</div>`;
  } else {
    resultContainer.innerHTML = '<p >동물을 찾을 수 없습니다.</p>';
  }
}




// Path: public/globe3.js
// 지구본 전역 변수 및 함수

let lastClickedCountry = null;      // Last Clicked Country
let lastCountryCenter = null;

let world = null;

function createGlobe() {
  fetch('../datasets/ne_110m_admin_0_countries.geojson').then(res => res.json()).then(countries => {

    world = Globe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .lineHoverPrecision(0)
      .polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== ''))
      .polygonAltitude(0.06)
      .polygonCapColor(() => 'rgba(255, 255, 200,0.7)')
      .polygonSideColor(() => 'rgba(0, 100, 0, 0)')// 기둥 색상 그냐 투명으로
      .polygonStrokeColor(() => 'rgba(0, 0, 0, 0.6)')
      .polygonLabel(({ properties: d }) => `
      <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
    `)
      .onPolygonHover(hoverD => world
        .polygonAltitude(d => d === hoverD ? 0.12 : 0.06)
        .polygonCapColor(d => d === hoverD ? 'steelblue' : 'rgba(255, 255, 200,0.7)')
      ).onPolygonClick(d => {
        const countryCenter = d3.geoCentroid(d);
        lastClickedCountry = d;
        lastCountryCenter = countryCenter;
        world.pointOfView({ lat: countryCenter[1], lng: countryCenter[0], altitude: 1.2 }, 2000);
        setTimeout(() => {
          showPopup(d.properties.ADMIN);
          console.log(countryCenter)
        }, 2000);
      })
      .polygonsTransitionDuration(300)

      (document.getElementById('globeViz'))
    a();
    window.addEventListener('resize', () => {
      a();
    });

  });
}


function highlightCountryOnGlobe(countryName) {
  console.log(countryName);
  //const countryFeature = world.polygonsData().find(d => d.properties.ADMIN.toLowerCase() === countryName.toLowerCase()); // 국가 이름으로 검색
  const countryFeature = world.polygonsData().find(d => d.properties.ISO_A2.toLowerCase() === countryName.toLowerCase()); // 국가 코드로 검색
  console.log(world.polygonsData());
  if (countryFeature) {
    const countryCenter = d3.geoCentroid(countryFeature);
    world.pointOfView({ lat: countryCenter[1], lng: countryCenter[0], altitude: 1.2 }, 2000); // 지구본 카메라를 해당 나라 중심으로 이동
    // 해당 나라를 노란색으로 highlight
    world.polygonCapColor(d => d === countryFeature ? 'yellow' : 'rgba(255, 255, 200, 0.7)');
  }
}




//렌더링 크기 조정
function a() {
  const globeContainer = document.getElementById('globeContainer');
  const currentWindowSize = new THREE.Vector2(globeContainer.offsetWidth, globeContainer.offsetHeight);
  //window.innerWidth와 window.innerHeight를 사용하면 전체 창 크기를 가져오기 때문에, 부모 요소의 크기를 가져오기 위해 offsetWidth와 offsetHeight를 사용
  world.width(currentWindowSize.x).height(currentWindowSize.y);
}
function showPopup(countryName) {
  var popupText = document.getElementById('popupText');
  popupText.textContent = `Selected Country: ${countryName}`;
  document.getElementById('species-by-country').style.display = 'block';
}
// 1/26 추가 : 팝업창 닫는 F
function closePopup() {
  if (lastCountryCenter && lastClickedCountry) {
    world.pointOfView({ lat: lastCountryCenter[1], lng: lastCountryCenter[0], altitude: 2.0 }, 2000);
    setTimeout(() => {
      console.log(lastClickedCountry.properties.ADMIN)
    }, 2000);
    document.getElementById('species-by-country').style.display = 'none';
  }
}
createGlobe();
