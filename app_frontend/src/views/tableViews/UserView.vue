<template>
    <CustomTable :data="tableData" :columns="tableColumns"/>
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
            tableColumns: [
                {label: "Name",field: "name"},
                {label: "Role",field: "role"},
            ],
            tableData: [
                {name: "George", role: "admin"}
            ]
        }
    },
    
    created(){
        this.getUsers()
    },
    methods: {
        async getUsers() {
            try {
                const res = await user_instance.get('/users')
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
