INSERT INTO currency (currency_id, scale, fiat)
VALUES ('USD', 5, TRUE);

INSERT INTO account (currency_id, type)
VALUES ('USD', 'edge'), ('USD', 'fee');

INSERT INTO account (currency_id, type, user_id)
SELECT 'USD', 'current', user_id
FROM "user";

INSERT INTO market (base_currency_id, quote_currency_id, scale)
VALUES ('BTC', 'USD', 3);
