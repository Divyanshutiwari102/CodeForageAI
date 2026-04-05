INSERT INTO plans (name, max_projects, max_tokens_per_month, max_concurrent_previews, stripe_price_id, razorpay_plan_id)
VALUES
    ('FREE', 3, 50000, 1, null, null),
    ('PRO', -1, -1, 5, null, null)
    ON CONFLICT (name) DO NOTHING;

UPDATE plans
SET max_projects = -1,
    max_tokens_per_month = -1
WHERE name = 'PRO'
  AND (max_projects = 2147483647 OR max_tokens_per_month = 2147483647);
