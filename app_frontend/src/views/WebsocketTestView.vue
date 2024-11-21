<template>
    <div>
        <p v-if="message">
            Message from server: {{ message }}
        </p>
    </div>
</template>

<script>
export default {
    data(){
        return {
            message:null
        }
    },
    created(){
        const socket = new WebSocket('ws:/localhost:4000');

        socket.addEventListener('message', (event)=>{
            console.log(event)
            this.message = JSON.parse(event.data).message
        })

        socket.addEventListener('close', () => {
            console.log("Connection closed")
        })
    }
}
</script>