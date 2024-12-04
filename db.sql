CREATE TABLE subscription_data(
    subscription_id SERIAL PRIMARY KEY,
    date_bought DATE,
    cost DECIMAL,
    receipt_info VARCHAR(32),
    expiration_date DATE,
    publication_name VARCHAR(128)
);

CREATE TABLE publication_data(
    subscription_id BIGINT PRIMARY KEY,
    website_login VARCHAR(128),
    program VARCHAR(128),
    FOREIGN KEY (subscription_id) REFERENCES subscription_data(subscription_id) ON DELETE CASCADE
);
CREATE TABLE account_data(
    account_number BIGINT PRIMARY KEY,
    subscription_id BIGINT,
    username VARCHAR(128),
    password_hash VARCHAR(128),
    FOREIGN KEY(subscription_id) REFERENCES subscription_data(subscription_id) ON DELETE CASCADE
);
