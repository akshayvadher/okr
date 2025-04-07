create table objectives
(
    id          varchar(255) not null
        primary key,
    created_at  timestamp with time zone,
    updated_at  timestamp with time zone,
    title       varchar(255) not null,
    description text
);

