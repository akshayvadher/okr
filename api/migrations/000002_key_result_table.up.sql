create table key_results
(
    id           varchar(255)              not null
        primary key,
    created_at   timestamp with time zone,
    updated_at   timestamp with time zone,
    objective_id varchar(255)              not null
        constraint fk_objectives_key_results
            references objectives,
    title        varchar(255)              not null,
    target       numeric                   not null,
    current      numeric default 0         not null,
    metrics      text    default '%'::text not null
);
