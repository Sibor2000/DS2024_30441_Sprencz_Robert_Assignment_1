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

            <p>
                <label>Role</label>
                <select v-model="input.role">
                    <option v-for="role in roleOptions">{{ role }}</option>
                </select>
            </p>
            
            <button type="submit" v-on:click.prevent="editUser"> Edit User</button>

            <p> {{ message }}</p>
    </form>
</template>

<script>
import router from '@/router';
import { validatePassword } from '@/utilities/regexes'; 
import { user_instance } from '@/utilities/request';
import { RoleOptions } from '@/utilities/role_options';
import axios from 'axios';

export default {
    data(){
        return{
            input:{
                name: "",
                password: "",
                role: ""
            },
            message:"",
            roleOptions: RoleOptions
        }
    },
    methods:{
        async editUser(){
            if(this.input.name == "" || this.input.password=="" || this.input.role ==""){
                this.message = "Can not be empty"
                return
            }

            const req_input = this.input
            
            await user_instance.put(
                "/user/"+this.$route.params.id, 
                req_input, 
                { headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${this.$cookies.get("token")}`
                }})
            .then(response => {
                console.log(response)
                this.message = "Edit successfull\n"
                
                setTimeout(()=>{
                    router.push('/users')
                }, 1000)
                
            })
            .catch(error => {
                this.message = error.response.data.message
            });
            
        }
    }
    //could add loading values with a get, but won't
}
</script>