<template>

    <RouterLink to="/nav" v-slot="{ navigate }">
        <button @click="navigate">
            Nav
        </button>
    </RouterLink>

    <div v-if="notification">
        {{ notification }}
    </div>

    <div v-if="isAdmin">
        <p>
            <label>Type your message:</label>
            <input type="text" id="name" v-model="announcement_message_box">
        </p>
        <p>
            <button @click="announceUsers()">Announce users</button>
        </p>
    </div>

    <select v-model="selected_user_id">
        <option v-for="user in users" :key="user.id" :value="user.id">{{ user.id }}</option>
    </select>

    <button type="submit" v-on:click.prevent="createNewConversation">
        New chat
    </button>

    <ul>
        <li v-for="conversation in conversations" :key="conversation.id" @click="goToConversation(conversation.id)">
            <button>
                {{ conversation }}
            </button>
        </li>
    </ul>
</template>

<script>
import router from '@/router';
import { chat_instance, user_instance } from '@/utilities/request';
import { connectChatWebSocket, getWebSocket } from '@/utilities/websocket';


export default {
    data() {
        return {
            users: [],
            selected_user_id: null,
            conversations: [],
            socket: null,
            isAdmin: false,
            announcement_message_box: "",
            notification: ""
        }
    },
    created() {
        this.getUsers()
        this.getConversations()
        this.socketSetup()
        this.getRole()
    },
    methods: {
        goToConversation(cid) {
            router.push("/conversation/" + cid)
        },
        async getUsers() {
            try {
                const res = await user_instance.get('/users_id', {
                    headers: {
                        'authorization': `Bearer ${this.$cookies.get("token")}`
                    }
                })

                this.users = res.data.rows
            } catch (error) {
                console.error(error)
            }
        },
        async getConversations() {
            try {
                const res = await chat_instance.get('/conversations', {
                    headers: {
                        'authorization': `Bearer ${this.$cookies.get("token")}`
                    }
                })

                this.conversations = res.data.rows
            } catch (error) {
                console.log(error)
            }
        },
        async createNewConversation() {
            try {
                if (!this.selected_user_id) {
                    console.log("please no null")
                    return
                }
                await chat_instance.post(
                    '/conversation',
                    { "user_id": this.selected_user_id },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': `Bearer ${this.$cookies.get("token")}`
                        }
                    })
                    .then(response => {
                        console.log(response)
                        router.push('/conversation/' + response.data.id)
                    })
                    .catch(error => {
                        //this.message = error.response.data.message
                        console.log(error)
                    });
            } catch (error) {
                console.log(error)
            }
        },
        socketSetup() {
            connectChatWebSocket(`${import.meta.env.VITE_CHAT_WEBSOCKET_URL}?token=${this.$cookies.get("token")}`)
            this.socket = getWebSocket()
            this.socket.onmessage = async (event) => {
                const incomingRaw = JSON.parse(event.data)

                if (incomingRaw.type == "newConversation") {
                    this.handleNewConversation(incomingRaw)
                    return
                }

                if (incomingRaw.type == "userNotification") {
                    this.handleUserNotification(incomingRaw)
                    return
                }
            }
        },
        async handleNewConversation(incomingRaw) {
            const incoming = incomingRaw.data
            this.conversations.push({ id: incoming.conversationId })
        },
        async handleUserNotification(incomingRaw) {
            const incoming = incomingRaw.data
            this.notification = incoming.message
        },
        getRole() {
            if (this.$cookies.get("role") == "admin") {
                this.isAdmin = true
            }
        },
        async announceUsers() {
            await chat_instance.post(
                '/user_announcement',
                { "message": this.announcement_message_box },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${this.$cookies.get("token")}`
                    }
                })
                .then(response => {
                    this.announcement_message_box = ""
                })
                .catch(error => {
                    //this.message = error.response.data.message
                    console.log(error)
                });
        }
    },
}

</script>