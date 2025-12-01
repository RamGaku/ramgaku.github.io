// Firebase 방문자 카운터
(function() {
    const firebaseConfig = {
        apiKey: "demo-api-key-for-github-pages",
        authDomain: "ramgaku-playgrnd-rankdb.firebaseapp.com",
        databaseURL: "https://ramgaku-playgrnd-rankdb-default-rtdb.asia-southeast1.firebasedatabase.app/",
        projectId: "ramgaku-playgrnd-rankdb",
        storageBucket: "ramgaku-playgrnd-rankdb.appspot.com",
        messagingSenderId: "123456789",
        appId: "demo-app-id-for-public-access"
    };

    // Firebase 초기화 (이미 초기화된 경우 기존 앱 사용)
    let app;
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.apps[0];
        }
    }

    const STORAGE_KEY = 'ramgaku_visit_date';

    // 오늘 날짜 (YYYY-MM-DD)
    function getTodayString() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    // 오늘 이미 방문했는지 확인
    function hasVisitedToday() {
        const lastVisit = localStorage.getItem(STORAGE_KEY);
        return lastVisit === getTodayString();
    }

    // 방문 기록 저장
    function markVisited() {
        localStorage.setItem(STORAGE_KEY, getTodayString());
    }

    // 방문자 수 증가 및 표시
    function initVisitorCounter() {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase not loaded');
            return;
        }

        const db = firebase.database();
        const visitorsRef = db.ref('visitors');
        const todayRef = db.ref('visitors/daily/' + getTodayString());

        // 오늘 첫 방문이면 카운터 증가
        if (!hasVisitedToday()) {
            // 총 방문자 수 증가
            visitorsRef.child('total').transaction(function(current) {
                return (current || 0) + 1;
            });

            // 오늘 방문자 수 증가
            todayRef.transaction(function(current) {
                return (current || 0) + 1;
            });

            markVisited();
        }

        // 총 방문자 수 표시
        visitorsRef.child('total').on('value', function(snapshot) {
            const total = snapshot.val() || 0;
            const totalEl = document.getElementById('visitor-total');
            if (totalEl) {
                totalEl.textContent = total.toLocaleString();
            }
        });

        // 오늘 방문자 수 표시
        todayRef.on('value', function(snapshot) {
            const today = snapshot.val() || 0;
            const todayEl = document.getElementById('visitor-today');
            if (todayEl) {
                todayEl.textContent = today.toLocaleString();
            }
        });
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVisitorCounter);
    } else {
        initVisitorCounter();
    }
})();
