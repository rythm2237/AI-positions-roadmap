alter table public.user_preferences
  add column if not exists journey_mode text not null default 'learn_and_build';

alter table public.user_preferences
  drop constraint if exists user_preferences_journey_mode_check;

alter table public.user_preferences
  add constraint user_preferences_journey_mode_check
  check (journey_mode in ('learn_and_build', 'ready_to_apply'));

comment on column public.user_preferences.journey_mode is
  'Primary AI Role Path experience: full learning journey or job-ready fast track. Users can switch at any time.';
