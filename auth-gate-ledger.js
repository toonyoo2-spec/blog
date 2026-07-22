/*
  가계부(ledger.html) 전용 비밀번호 게이트
  -------------------------------------------------
  다른 페이지(index/review/task)는 auth-gate.js를 그대로 쓰고,
  ledger.html만 이 파일(auth-gate-ledger.js)을 따로 씁니다.

  ledger.html의 </body> 직전에
    <script src="./auth-gate-ledger.js"></script>
  로 연결되어 있고, 비밀번호는 아래 LEDGER_PASSWORD 값만 바꾸면 됩니다.
*/
(function(){
  const LEDGER_PASSWORD = "yb0702";

  function unlock(){
    const el = document.getElementById('appContent');
    if(el) el.style.display = 'block';
    const gate = document.getElementById('authGate');
    if(gate) gate.remove();
  }

  function showGate(){
    const gate = document.createElement('div');
    gate.id = 'authGate';
    gate.innerHTML = `
      <style>
        #authGate{position:fixed;inset:0;background:#f6f5f1;display:flex;align-items:center;justify-content:center;z-index:9999;font-family:"Pretendard","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif;}
        #authGate .box{background:#fff;border:1px solid #e1dfd6;border-radius:14px;padding:36px 32px;width:280px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.06);}
        #authGate h2{font-size:16px;margin:0 0 6px;color:#22221f;}
        #authGate p{font-size:12.5px;color:#6b6a63;margin:0 0 18px;}
        #authGate input{width:100%;padding:10px 12px;border:1px solid #e1dfd6;border-radius:8px;font-size:14px;margin-bottom:10px;box-sizing:border-box;text-align:center;}
        #authGate button{width:100%;padding:10px;border:none;border-radius:8px;background:#3a5a52;color:#fff;font-weight:600;font-size:13.5px;cursor:pointer;}
        #authGate button:hover{opacity:0.9;}
        #authGate .err{color:#b3452f;font-size:12px;margin-top:8px;min-height:16px;}
      </style>
      <div class="box">
        <h2>🔒 비밀번호 입력</h2>
        <p>등록된 사용자만 접속할 수 있습니다</p>
        <input type="password" id="authInput" placeholder="비밀번호">
        <button id="authBtn">입장</button>
        <div class="err" id="authErr"></div>
      </div>
    `;
    document.body.prepend(gate);

    function tryLogin(){
      const val = document.getElementById('authInput').value;
      if(val === LEDGER_PASSWORD){
        sessionStorage.setItem('ledgerAuth', 'ok');
        unlock();
      }else{
        document.getElementById('authErr').textContent = '비밀번호가 올바르지 않습니다.';
        document.getElementById('authInput').value = '';
        document.getElementById('authInput').focus();
      }
    }

    document.getElementById('authBtn').addEventListener('click', tryLogin);
    document.getElementById('authInput').addEventListener('keydown', function(e){
      if(e.key === 'Enter') tryLogin();
    });
    document.getElementById('authInput').focus();
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(sessionStorage.getItem('ledgerAuth') === 'ok'){
      unlock();
    }else{
      showGate();
    }
  });
})();
