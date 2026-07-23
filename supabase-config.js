/*
  Supabase 프로젝트 공통 설정 (모든 페이지 공용)
  -------------------------------------------------
  index.html, ledger.html, review.html, task.html 등 로그인이 필요한
  모든 페이지가 이 파일 "하나"만 보고 Supabase에 접속하고 세션을 확인합니다.

  ⚠️ 실제 배포할 때는 아래 두 값만 본인의 Supabase 프로젝트 값으로 채우세요.
     (Supabase 대시보드 → Project Settings → API 에서 확인)
     다른 파일(index.html, auth-gate.js)에는 더 이상 이 값들이 없으니
     건드릴 필요가 없습니다.

  ※ 이전에는 index.html과 auth-gate.js가 이 값을 각자 따로 갖고 있었는데,
     둘이 한 글자라도 다르면(오타 등) 세션 저장 위치가 서로 달라져서
     로그인한 뒤 다른 페이지로 이동할 때마다 로그인창이 다시 뜨는 문제가
     생깁니다. 이제는 값이 한 군데만 있으므로 그런 불일치가 원천적으로
     발생할 수 없습니다.
*/
window.SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
window.SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
window.COUPLE_EMAIL_DOMAIN = "internal.local";
