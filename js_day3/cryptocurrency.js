const cryptoList = document.getElementById('cryptoList');
const searchInput = document.getElementById('searchInput');
const loading = document.getElementById('loading');
const cryptoTable = document.getElementById('cryptoTable');
const allTab = document.getElementById('allTab');
const favoritesTab = document.getElementById('favoritesTab');
const sortableHeaders = document.querySelectorAll('th.sortable');

let allCryptoData = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentTab = 'all'; // 'all' 또는 'favorites'
let currentSortKey = null;
let currentSortDirection = 'asc';

// API에서 데이터를 불러오는 함수
async function fetchCryptoData() {
    try {
        const response = await fetch('https://api4.binance.com/api/v3/ticker/24hr');
        if (!response.ok) {
            throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        
        // USDT 마켓 데이터만 필터링하고 현재가가 0인 항목 제외
        allCryptoData = data.filter(item => item.symbol.endsWith('USDT') && parseFloat(item.lastPrice) !== 0);
        
        filterAndRender();
        loading.classList.add('hidden');
        cryptoTable.classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        loading.textContent = '데이터를 불러오는 중 오류가 발생했습니다.';
    }
}

// 탭 및 검색어에 따라 데이터를 필터링하고 렌더링하는 함수
function filterAndRender() {
    const searchTerm = searchInput.value.toUpperCase();
    let filteredData = allCryptoData.filter(item => item.symbol.includes(searchTerm));

    if (currentTab === 'favorites') {
        filteredData = filteredData.filter(item => favorites.includes(item.symbol));
    }

    if (currentSortKey) {
        filteredData.sort((a, b) => compareBySortKey(a, b, currentSortKey, currentSortDirection));
    }

    renderData(filteredData);
}

function compareBySortKey(a, b, key, direction) {
    const multiplier = direction === 'asc' ? 1 : -1;

    if (key === 'symbol') {
        return a.symbol.localeCompare(b.symbol) * multiplier;
    }

    const aValue = parseFloat(a[key]);
    const bValue = parseFloat(b[key]);

    if (Number.isNaN(aValue) && Number.isNaN(bValue)) {
        return 0;
    }
    if (Number.isNaN(aValue)) {
        return 1 * multiplier;
    }
    if (Number.isNaN(bValue)) {
        return -1 * multiplier;
    }

    return (aValue - bValue) * multiplier;
}

function updateSortIndicators() {
    sortableHeaders.forEach(header => {
        const indicator = header.querySelector('.sort-indicator');
        const isActive = header.dataset.sort === currentSortKey;

        if (!indicator) {
            return;
        }

        if (!isActive || !currentSortKey) {
            indicator.textContent = '▲▼';
            header.classList.remove('sorted-asc', 'sorted-desc');
            return;
        }

        indicator.textContent = currentSortDirection === 'asc' ? '▲' : '▼';
        header.classList.toggle('sorted-asc', currentSortDirection === 'asc');
        header.classList.toggle('sorted-desc', currentSortDirection === 'desc');
    });
}

// 데이터를 화면에 렌더링하는 함수
function renderData(data) {
    cryptoList.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        
        const priceChange = parseFloat(item.priceChangePercent);
        const changeClass = priceChange >= 0 ? 'up' : 'down';
        const sign = priceChange >= 0 ? '+' : '';
        const isFavorite = favorites.includes(item.symbol);

        row.innerHTML = `
            <td>
                <button class="fav-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${item.symbol}')">
                    ${isFavorite ? '★' : '☆'}
                </button>
            </td>
            <td class="symbol">${item.symbol}</td>
            <td>${parseFloat(item.lastPrice).toLocaleString()}</td>
            <td class="${changeClass}">${sign}${priceChange.toFixed(2)}%</td>
            <td>${parseFloat(item.highPrice).toLocaleString()}</td>
            <td>${parseFloat(item.lowPrice).toLocaleString()}</td>
        `;
        
        cryptoList.appendChild(row);
    });
}

// 관심항목 토글 함수
window.toggleFavorite = function(symbol) {
    const index = favorites.indexOf(symbol);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(symbol);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    filterAndRender();
};

// 검색 기능 구현
searchInput.addEventListener('input', () => {
    filterAndRender();
});

sortableHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const sortKey = header.dataset.sort;

        if (currentSortKey === sortKey) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortKey = sortKey;
            currentSortDirection = 'asc';
        }

        updateSortIndicators();
        filterAndRender();
    });
});

// 탭 전환 기능 구현
allTab.addEventListener('click', () => {
    currentTab = 'all';
    allTab.classList.add('active');
    favoritesTab.classList.remove('active');
    filterAndRender();
});

favoritesTab.addEventListener('click', () => {
    currentTab = 'favorites';
    favoritesTab.classList.add('active');
    allTab.classList.remove('active');
    filterAndRender();
});

// 초기 데이터 로드
fetchCryptoData();
updateSortIndicators();

// 60초마다 데이터 갱신
setInterval(fetchCryptoData, 60 * 1000);
