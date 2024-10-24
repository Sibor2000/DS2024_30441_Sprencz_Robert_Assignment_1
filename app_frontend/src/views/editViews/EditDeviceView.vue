<template>
    <form>
            <p>
                <label>Description</label>
                <input type="text" id="description" v-model="input.description">
            </p>

            <p>
                <label>Address</label>
                <input type="text" id="address" v-model="input.address">
            </p>

            <p>
                <label>Max energy consumption per hour</label>
                <input type="text" id="max_nrg_con_per_hour" v-model="input.max_nrg_con_per_hour">
            </p>

            <p>
                <label>Owner</label>
                <select v-model="input.owner_id">
                    <option v-for="owner in ownerOptions" :key="owner.id" :value="owner.id">{{ owner.name }}</option>
                </select>
            </p>
            
            <button type="submit" v-on:click.prevent="editDevice"> Edit Device</button>

            <p> {{ message }}</p>
    </form>
</template>

<script>
import router from '@/router'; 
import { device_instance, user_instance } from '@/utilities/request';

export default {
    data(){
        return{
            input:{
                description: "",
                address: "",
                max_nrg_con_per_hour: "",
                owner_id: ""
            },
            message:"",
            ownerOptions: []
        }
    },
    methods:{
        
        async editDevice(){
            
            if(this.input.description == "" || this.input.address=="" || this.input.max_nrg_con_per_hour =="" || this.input.owner_id ==""){
                this.message = "Can not be empty"
                return
            }

            const req_input = this.input
            await device_instance.put(
                "/device/"+this.$route.params.id, 
                req_input, 
                { headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${this.$cookies.get("token")}`
                }})
            .then(response => {
                console.log(response)
                this.message = "Edit successfull\n"
                
                setTimeout(()=>{
                    router.push('/devices')
                }, 1000)
                
            })
            .catch(error => {
                this.message = error.response.data.message
            });
            
        },

        async fetchOwners(){
            user_instance.get("/users",{ headers: {
                    'Authorization': `Bearer ${this.$cookies.get("token")}`
                }})
            .then(res => {
                this.ownerOptions = res.data.rows;
            })
            .catch(error => {
                this.message = error.response.data.message
            });
        }
    },
    mounted() {
        this.fetchOwners()
    }
}
</script>