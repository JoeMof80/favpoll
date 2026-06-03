UPDATE topic_items
SET review_status = 'pending_review'
WHERE review_status = 'pending';
