/*
  Supabase 로그인(ID+비밀번호) 기반 공용 게이트
  -------------------------------------------------
  사용법: 보호하고 싶은 페이지의 </body> 직전에
    <script src="./auth-gate.js"></script>
  한 줄만 추가하고, 페이지의 실제 내용을 감싸는 최상위 요소에
    id="appContent"
  를 넣어주세요.

  index.html의 "부부 일정" 로그인과 완전히 동일한 Supabase 계정/세션을 사용합니다.
  (index.html에서 로그인한 상태로 같은 탭에서 이동하면 자동으로 통과되고,
   새 탭/새 창에서 직접 접속하거나 로그아웃 상태면 이 페이지에서도 로그인 창이 뜹니다.)

  ⚠️ 아래 SUPABASE_URL / SUPABASE_ANON_KEY 값은 index.html과 반드시 동일해야 합니다.
*/
(function(){
  const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
  const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
  const COUPLE_EMAIL_DOMAIN = "internal.local"; // index.html과 동일해야 함

  function idToEmail(id){
    return `${id.trim().toLowerCase()}@${COUPLE_EMAIL_DOMAIN}`;
  }

  function unlock(){
    const el = document.getElementById('appContent');
    if(el) el.style.display = 'block';
    const gate = document.getElementById('authGate');
    if(gate) gate.remove();
  }

  function lock(){
    const el = document.getElementById('appContent');
    if(el) el.style.display = 'none';
  }

  function loadSupabaseLib(){
    return new Promise((resolve, reject) => {
      if(window.supabase){ resolve(); return; }
      const s = document.createElement('script');
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function showGate(sb){
    if(document.getElementById('authGate')) return; // 이미 떠 있으면 중복 생성 방지
    lock();
    const gate = document.createElement('div');
    gate.id = 'authGate';
    gate.innerHTML = `
      <style>
        #authGate{position:fixed;inset:0;background:#f6f5f1;display:flex;align-items:center;justify-content:center;z-index:9999;font-family:"Pretendard","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif;}
        #authGate .box{background:#fff;border:1px solid #e1dfd6;border-radius:14px;padding:36px 32px;width:300px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.06);}
        #authGate h2{font-size:16px;margin:0 0 6px;color:#22221f;}
        #authGate p{font-size:12.5px;color:#6b6a63;margin:0 0 18px;}
        #authGate input{width:100%;padding:10px 12px;border:1px solid #e1dfd6;border-radius:8px;font-size:14px;margin-bottom:10px;box-sizing:border-box;text-align:center;font-family:inherit;}
        #authGate button{width:100%;padding:10px;border:none;border-radius:8px;background:#3a5a52;color:#fff;font-weight:600;font-size:13.5px;cursor:pointer;font-family:inherit;}
        #authGate button:hover{opacity:0.9;}
        #authGate button:disabled{opacity:0.5;cursor:not-allowed;}
        #authGate .err{color:#b3452f;font-size:12px;margin-top:8px;min-height:16px;}
      </style>
      <div class="box">
        <h2>🔒 로그인</h2>
        <p>등록된 사용자만 접속할 수 있습니다</p>
        <input type="text" id="authId" placeholder="아이디" autocomplete="username">
        <input type="password" id="authPw" placeholder="비밀번호" autocomplete="current-password">
        <button id="authBtn">로그인</button>
        <div class="err" id="authErr"></div>
      </div>
    `;
    document.body.prepend(gate);

    async function tryLogin(){
      const id = document.getElementById('authId').value.trim();
      const pw = document.getElementById('authPw').value;
      const errEl = document.getElementById('authErr');
      const btn = document.getElementById('authBtn');
      if(!id || !pw){ errEl.textContent = '아이디와 비밀번호를 입력해주세요.'; return; }
      btn.disabled = true;
      errEl.textContent = '';
      const { error } = await sb.auth.signInWithPassword({
        email: idToEmail(id),
        password: pw
      });
      btn.disabled = false;
      if(error){
        errEl.textContent = '로그인 실패: 아이디 또는 비밀번호를 확인해주세요.';
        document.getElementById('authPw').value = '';
      }
      // 성공 시엔 onAuthStateChange가 unlock()을 호출합니다.
    }

    document.getElementById('authBtn').addEventListener('click', tryLogin);
    gate.addEventListener('keydown', function(e){
      if(e.key === 'Enter') tryLogin();
    });
    document.getElementById('authId').focus();
  }

  async function init(){
    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { storage: window.sessionStorage, persistSession: true, autoRefreshToken: true }
    });

    // 탭이 백그라운드로 갔다가 다시 보일 때 자동 토큰 갱신을 확실히 재개시킴.
    // (모바일 브라우저는 백그라운드에서 타이머를 멈추기 때문에, 이걸 안 해주면
    //  한동안 안 보다가 돌아왔을 때 토큰이 만료되어 로그인이 풀릴 수 있음)
    document.addEventListener('visibilitychange', () => {
      if(document.visibilityState === 'visible'){
        sb.auth.startAutoRefresh();
      } else {
        sb.auth.stopAutoRefresh();
      }
    });

    const { data: { session } } = await sb.auth.getSession();
    if(session) unlock(); else showGate(sb);

    sb.auth.onAuthStateChange((event, session) => {
      if(session) unlock(); else showGate(sb);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    lock(); // 라이브러리/세션 확인 끝날 때까지는 우선 가려둠
    loadSupabaseLib().then(init).catch(() => {
      const el = document.getElementById('appContent');
      if(el) el.innerHTML = '<p style="text-align:center;padding:60px 20px;color:#b3452f;">로그인 시스템을 불러오지 못했습니다. 네트워크를 확인해주세요.</p>';
      if(el) el.style.display = 'block';
    });
  });
})();
