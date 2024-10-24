<template>

    <RouterLink to="/devices" v-slot=" {navigate}">
            <button @click="navigate">
                Devices
            </button>
    </RouterLink>

    <RouterLink to="/user/add" v-slot=" {navigate}">
            <button @click="navigate">
                Add user
            </button>
    </RouterLink>

    
    <CustomTable 
    :tableData="tableData" 
    :tableColumns="tableColumns" 
    :baseEditLink="editLink" 
    :baseDeleteLink="deleteLink"/>
</template>


<script>
import { user_instance } from '@/utilities/request';
import CustomTable from '@/components/CustomTable.vue';

export default {
    components:{
        CustomTable,
    },
    data(){
        return{
            tableColumns: [],
            tableData: [],
            editLink: `/user`,
            deleteLink: `http://${import.meta.env.VITE_USER_HOST}:${import.meta.env.VITE_USER_PORT}/user`
        }
    },
    created(){
        this.getUsers()
    },
    methods: {
        async getUsers() {
            try {
                const res = await user_instance.get('/users',{ headers: {
                    'authorization': `Bearer ${this.$cookies.get("token")}`
                }})
                this.tableColumns = res.data.fields.map((f)=>({
                    label: f,
                    field: f
                }));
                this.tableData = res.data.rows;
                
                console.log(res)
            } catch (error) {
                console.error(error)
            }
        }
    }
}
</script>
