INSERT INTO plans (name, max_projects, max_tokens_per_month, max_concurrent_previews, stripe_price_id)
VALUES
    ('FREE', 3, 50000, 1, null),
    ('PRO', 2147483647, 2147483647, 5, 'price_YOUR_STRIPE_PRICE_ID')
    ON CONFLICT (name) DO NOTHING;