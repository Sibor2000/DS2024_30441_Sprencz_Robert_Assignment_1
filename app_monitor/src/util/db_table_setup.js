import client from "../server/client.js"

export default async function setUpDb() {

    try {
        await client.connect();
        console.log(await client.query(`
    CREATE SCHEMA IF NOT EXISTS public;
    set search_path to public;
    create table if not exists "energy_consumption"
    (
    id                uuid not null
        constraint energy_consumption_pk
            primary key,
    device_id         uuid,
    measurement_value double precision,
    time              bigint
    );

    alter table "energy_consumption"
    owner to postgres;

    create table if not exists "max_consumption"
(
    id                   uuid not null
        constraint max_consumption_pk
            primary key,
    device_id            uuid,
    max_nrg_con_per_hour integer
);

alter table "max_consumption"
    owner to postgres;
    `));
    console.log("Successful setup")
    } catch (error) {
        console.log(error)
    }


};

