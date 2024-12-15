<template>

    <select v-model="selected_user_id">
        <option v-for="user in users" :key="user.id" :value="user.id">{{ user.id }}</option>
    </select>

    <button type="submit" v-on:click.prevent="createNewConversation">
        New chat
    </button>

    <ul>
        <li
        v-for="conversation in conversations"
        :key="conversation.id"
        @click="goToConversation(conversation.id)"
        >
            <button>
                {{ conversation }}
            </button>
        </li>
    </ul>
</template>

<script>
import router from '@/router';
import { chat_instance, user_instance } from '@/utilities/request';


export default {
    data() {
        return {
           users:[],
           selected_user_id:null,
           conversations:[],
        }
    },
    created(){
        this.getUsers()
        this.getConversations()
    },
    methods:{
        goToConversation(cid){
            router.push("/conversation/"+cid)
        },
        async getUsers(){
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
        async getConversations(){
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
        async createNewConversation(){
            try {
                if(!this.selected_user_id){
                    console.log("please no null")
                    return
                }
                await chat_instance.post(
                    '/conversation',
                    {"user_id":this.selected_user_id},
                    {
                    headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${this.$cookies.get("token")}`
                }
                })
                .then(response => {
                    console.log(response)
                    router.push('/conversation/'+response.data.id)
                })
                .catch(error => {
                    //this.message = error.response.data.message
                    console.log(error)
                });
            } catch (error) {
                console.log(error)
            }
        }
    },
}

</script>