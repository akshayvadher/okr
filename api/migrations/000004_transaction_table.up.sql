create table transactions
(
    id                varchar(255) not null
        primary key,
    created_at        timestamp with time zone,
    server_created_at timestamp with time zone,
    client_id         varchar(255),
    session_id        varchar(255),
    entity            text         not null,
    action            text         not null,
    payload           json         not null,
    objective_id      varchar(255)
);
