<template>
    <form>
            <p>
                <label>Name</label>
                <input type="text" id="name" v-model="input.name">
            </p>

            <p>
                <label>Password</label>
                <input type="password" id="password" v-model="input.password">

            </p>
            
            <button type="submit" v-on:click.prevent="login"> Login</button>

            <p> {{ verified }}</p>
    </form>
</template>

<script>
import { validatePassword } from '@/utilities/regexes'; 
import {user_instance} from '@/utilities/request';
import axios from 'axios';

export default {
    data(){
        return{
            input:{
                name: "",
                password: ""
            },
            verified:""
        }
    },
    methods:{
        async login(){
            if(this.input.name == "" || this.input.password==""){
                this.verified = "Can not be empty"
                return
            }

            /*
            if(!validatePassword(this.input.password)){
                this.verified = "Incorrect password"
                return
            }
            */

            //this.verified = "OK"

            let res = await user_instance.get('/users')
                
            console.log(res)
            this.verified = res.data
                
            
        }
    }
}
</script>