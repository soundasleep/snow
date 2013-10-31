ALTER TABLE "user"
    ADD COLUMN username varchar(50) CHECK (username ~* '^[a-z0-9](?:[\\._]?[a-z0-9]){2,24}$');

CREATE UNIQUE INDEX user_username_unique
ON "user" (username)
WHERE username IS NOT NULL;
