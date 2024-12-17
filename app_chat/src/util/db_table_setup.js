import client from "../server/client.js"

async function setUpMemberTable(){
    await client.query(`
        create table if not exists "member"
(
    id uuid not null
        constraint member_pk
            primary key
);

alter table "member"
    owner to postgres;
        `)
}

async function setUpConversationTable(){
    await client.query(`
        create table if not exists "conversation"
(
    id uuid not null
        constraint conversation_pk
            primary key
);

alter table "conversation"
    owner to postgres;
        `)
}

async function setUpConversationMembershipTable(){
    await client.query(`
        create table if not exists "conversation_membership"
(
    member_id       uuid
        constraint conversation_membership_member_null_fk
            references member
            on delete cascade,
    conversation_id uuid
        constraint conversation_membership_conversation_null_fk
            references conversation
            on delete cascade,
    id              uuid not null
        constraint conversation_membership_pk
            primary key
);

alter table "conversation_membership"
    owner to postgres;
        `)
}

async function setUpMessageTable(){
    await client.query(`
        create table if not exists "message"
(
    id              uuid not null
        constraint message_pk
            primary key,
    content         varchar(255),
    sender          uuid
        constraint message_member_null_fk
            references member,
    conversation_id uuid
        constraint message_conversation_null_fk
            references conversation,
    seen            boolean,
    time            bigint
);

alter table "message"
    owner to postgres;`)
}

export default async function setUpDb() {
    try {
        await client.connect()

        await client.query(`
        CREATE SCHEMA IF NOT EXISTS public;
        set search_path to public;
        `)

        await setUpMemberTable()
        await setUpConversationTable()
        await setUpConversationMembershipTable()
        await setUpMessageTable()

        console.log("Successful setup")

    } catch (error) {
        console.log(error)
    }
}