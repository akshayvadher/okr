create table comments
(
    id            varchar(255) not null
        primary key,
    created_at    timestamp with time zone,
    updated_at    timestamp with time zone,
    content       text         not null,
    objective_id  varchar(255) not null
        constraint fk_objectives_comments
            references objectives,
    key_result_id varchar(255)
);
