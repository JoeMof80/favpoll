-- SUBSETS, step 5: the per-charity label list retires (favpoll-topic-rules
-- §1). It was the first step, before subsets were objects: a charity's
-- corner of a topic, by label, on the charity's own row. A charity's
-- perfect topic now points at a SUBSET (perfect_subset_id / suggested),
-- shared with everyone who uses it; the suggester writes a proposed
-- subset instead of a private list. Nothing reads this column any more.
ALTER TABLE charities DROP COLUMN IF EXISTS perfect_topic_items;
