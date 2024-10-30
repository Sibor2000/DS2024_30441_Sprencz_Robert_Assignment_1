import client from "../server/client.js"

export default async function setUpDb() {

    try {
        await client.connect();
        console.log(await client.query(`
        CREATE SCHEMA IF NOT EXISTS public;
        set search_path to public;
        
        create table if not exists "device"
(
    id                   uuid,
    description          varchar(255),
    address              varchar(256),
    max_nrg_con_per_hour integer,
    owner_id             uuid
);

alter table "device"
    owner to postgres;
    `));
    console.log("Successful setup")
    } catch (error) {
        console.log(error)
    }


};

