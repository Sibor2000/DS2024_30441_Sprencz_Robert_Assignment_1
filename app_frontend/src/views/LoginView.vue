<template>
    <form>
            <p>
                <label>UName</label>
                <input type="text" id="name" v-model="input.name">
            </p>

            <p>
                <label>Password</label>
                <input type="password" id="password" v-model="input.password">

            </p>

            <button type="submit" v-on:click.prevent="login"> Login</button>

            <p> {{ message }}</p>
    </form>
</template>

<script>
import {user_instance} from '@/utilities/request';
import router from '@/router';
import axios from 'axios';

export default {
    data(){
        return{
            input:{
                name: "",
                password: ""
            },
            message:""
        }
    },
    methods:{
        async login(){
            if(this.input.name == "" || this.input.password==""){
                this.message = "Can not be empty"
                return
            }

            const req_input = this.input

            await user_instance.post('/login',
                req_input,
                { headers: {
                    'Content-Type': 'application/json'
            }})
            .then(response => {
                this.message = `login successful\n`

                this.$cookies.set("token", response.data.token)
                this.$cookies.set("role", response.data.role)

                setTimeout(()=>{
                    router.push('/nav')
                }, 1000)

            })
            .catch(error => {
                console.log(error)
                this.message = error.response.data.message
            });
        }
    }
}
</script>