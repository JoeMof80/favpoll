alter table events
  add column event_subject text not null default 'someone'
    check (event_subject in ('someone', 'cause')),
  add column cause_label text;

truncate generated_drafts;
