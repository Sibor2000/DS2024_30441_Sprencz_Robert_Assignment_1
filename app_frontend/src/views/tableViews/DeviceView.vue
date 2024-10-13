<template>
    <CustomTable :data="tableData" :columns="tableColumns"/>
</template>


<script>
import { device_instance } from '@/utilities/request';
import CustomTable from '@/components/CustomTable.vue';

export default {
    components:{
        CustomTable,
    },
    data(){
        return{
            tableColumns: [],
            tableData: []
        }
    },
    
    created(){
        this.getDevices()
    },
    methods: {
        async getDevices() {
            try {
                const res = await device_instance.get('/devices')
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
