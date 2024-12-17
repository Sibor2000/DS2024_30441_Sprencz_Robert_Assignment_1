<template>
    <div>
        <div id="messages" class="message">
            <div v-for="message in messages">
                <p>{{ message.sender }}</p>
                <p>{{ message.content }}</p>
                <p>Seen: {{ message.seen }}</p>
            </div>
        </div>

        <div v-if="typing">
            Someone is typing...
        </div>

        <div>
            <p>
                <label>Type your message:</label>
                <input type="text" id="name" v-model="own_message" @input="sendTypingNotice">
            </p>
            <p>
                <button @click="sendMessage()">Send</button>
            </p>
        </div>
    </div>
</template>


<script>
import { chat_instance } from '@/utilities/request';
import { connectChatWebSocket, getWebSocket } from '@/utilities/websocket';

export default {
    data() {
        return {
            messages: [],
            own_message: "",
            typing: false,
            typingTimeout: false,
            socket: null
        }
    },
    created() {
        this.socketSetup()
        this.getMessages()
    },
    methods: {
        async getMessages() {
            try {
                const res = await chat_instance.get(`conversation/${this.$route.params.id}/messages`, {
                    headers: {
                        'authorization': `Bearer ${this.$cookies.get("token")}`
                    }
                })
                this.messages = res.data.rows
            } catch (error) {
                console.log(error)
            }
        },
        async sendMessage() {
            try {
                const res = await chat_instance.post("/message", { conversation_id: this.$route.params.id, message: this.own_message },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': `Bearer ${this.$cookies.get("token")}`
                        }
                    })
            } catch (error) {
                console.log(error)
            }

            this.own_message = ""
        },
        socketSetup() {
            connectChatWebSocket(`${import.meta.env.VITE_CHAT_WEBSOCKET_URL}?token=${this.$cookies.get("token")}`)
            this.socket = getWebSocket()
            this.socket.onmessage = async (event) => {
                const incomingRaw = JSON.parse(event.data)

                if (incomingRaw.type == "chatMessage") {
                    this.handleIncomingChatMessage(incomingRaw)
                    return
                }

                if (incomingRaw.type == "seenNotification") {
                    this.handleIncomingSeenNotice(incomingRaw)
                    return
                }

                if (incomingRaw.type == "typingNoticeB2F") {
                    this.handleIncomingTypingNotice()
                    return
                }
            }
        },
        async handleIncomingChatMessage(incomingRaw) {
            const incoming = incomingRaw.data

            if (incoming.conversationId != this.$route.params.id) {
                return
            }

            this.messages.push({
                sender: incoming.sender,
                content: incoming.content,
                seen: incoming.seen
            })

            const result = await chat_instance.put(`/conversation/${this.$route.params.id}/messages/read`, null, {
                headers: {
                    'authorization': `Bearer ${this.$cookies.get("token")}`
                }
            })
        },
        async handleIncomingSeenNotice(incomingRaw) {
            const incoming = incomingRaw.data

            if (incoming.conversationId != this.$route.params.id) {
                return
            }

            this.messages = this.messages.map(e => {
                e.seen = true
                return e
            })
        },
        async handleIncomingTypingNotice() {
            this.typing = true

            if (this.typingTimeout) {
                clearTimeout(this.typingTimeout)
            }

            this.typingTimeout = setTimeout(() => {
                this.typing = false
            }, 2000)

        },
        sendTypingNotice() {
            if (this.socket == "") {
                console.log("Socket has not been setup yet")
                return
            }

            this.socket.send(JSON.stringify({
                type: "typingNoticeF2B",
                data: {
                    conversationId: this.$route.params.id
                }
            }))
        }
    }
}
</script>

<style scoped>
.message>* {
    border: 2px solid white;
    padding: 10px;
    margin: 10px;
}
</style>