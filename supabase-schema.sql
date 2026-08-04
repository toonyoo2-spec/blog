-- ============================================
-- 관's Log — Supabase 스키마
-- 새 프로젝트의 SQL Editor에서 그대로 실행하세요.
-- ============================================

-- 1. 글 테이블
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('IT','CAR','맛집')),
  content text not null,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 자동 갱신
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_set_updated_at
before update on posts
for each row execute function set_updated_at();

-- 글 RLS: 누구나 읽기 가능, 로그인한 사람만 쓰기/수정/삭제 가능
alter table posts enable row level security;

create policy "누구나 글 읽기"
  on posts for select
  using (true);

create policy "로그인한 사람만 글 작성"
  on posts for insert
  with check (auth.role() = 'authenticated');

create policy "로그인한 사람만 글 수정"
  on posts for update
  using (auth.role() = 'authenticated');

create policy "로그인한 사람만 글 삭제"
  on posts for delete
  using (auth.role() = 'authenticated');


-- 2. 방문자 로그 테이블 (페이지뷰 1건당 row 1개)
create table visits (
  id bigserial primary key,
  created_at timestamptz not null default now()
);

alter table visits enable row level security;

create policy "누구나 방문 기록 남기기"
  on visits for insert
  with check (true);

create policy "누구나 방문 기록 읽기"
  on visits for select
  using (true);

-- 최근 N일 방문자 수를 날짜별로 집계해주는 함수
create or replace function get_recent_visits(days_back int default 5)
returns table(visit_date date, visit_count bigint)
language sql
stable
as $$
  select
    date_trunc('day', created_at)::date as visit_date,
    count(*) as visit_count
  from visits
  where created_at >= now() - (days_back || ' days')::interval
  group by visit_date
  order by visit_date;
$$;


-- 3. 로그인 계정 만들기
-- Supabase 대시보드 → Authentication → Users → "Add user"에서
-- 본인 이메일/비밀번호로 직접 계정 하나만 만드세요.
-- (회원가입 UI는 따로 안 만들었습니다. 이 블로그는 관리자 1명 전용입니다.)
