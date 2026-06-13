create table charity_topics (
  charity_id uuid references charities(id) on delete cascade,
  topic_id   uuid references topics(id) on delete cascade,
  primary key (charity_id, topic_id)
);
