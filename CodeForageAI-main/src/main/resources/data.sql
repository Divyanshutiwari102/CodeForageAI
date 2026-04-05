INSERT INTO plans (name, max_projects, max_tokens_per_month, max_concurrent_previews, stripe_price_id, razorpay_plan_id)
VALUES
    ('FREE', 3, 50000, 1, null, null),
    ('PRO', 2147483647, 2147483647, 5, null, null)
    ON CONFLICT (name) DO NOTHING;
