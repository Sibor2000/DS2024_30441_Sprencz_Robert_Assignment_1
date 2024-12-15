import client from "../server/client.js"

export default async function setUpDb() {

    try {
        await client.connect();
        await client.query(`
        CREATE SCHEMA IF NOT EXISTS public;
        set search_path to public;

        create table if not exists "user"
(
    id       uuid not null
        constraint user_pk
            primary key,
    name     varchar(255),
    role     varchar(256),
    password varchar(255)
);

alter table "user"
    owner to postgres;

    INSERT INTO "user" (id, name, role, password)
VALUES ('66ce1661-d6c6-41f7-ae3b-3d3dec23ff34', 'Maestro', 'admin', 'bf889cd06ba9762409e6aed391953e101f2922f9c4db08d1e94b328c52b87a7c') on conflict (id) do nothing;

    `);
    console.log("Successful setup")
    } catch (error) {
        console.log(error)
    }


};

