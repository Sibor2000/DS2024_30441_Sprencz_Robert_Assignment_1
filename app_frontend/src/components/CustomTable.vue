<template>
    <table>
        <thead>
            <tr>
                <th v-for="column in tableColumns" :key="column.field"> {{ column.label }}</th>
                <th v-if="monitored">Consumption Chart</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="(row,rowIndex) in displayData" :key="rowIndex">
                <td v-for="column in tableColumns" :key="column.field">
                    <slot :row="row" :column="column">
                        {{ row[column.field] }}
                    </slot>
                </td>

                <td v-if="monitored">
                    <RouterLink :to="baseMonitorLink+'/monitor_chart/'+row.monitor" v-slot=" {navigate}">
                        <button @click="navigate">
                            Chart
                        </button>
                    </RouterLink>
                </td>

                <td>
                    <RouterLink :to="baseEditLink+'/edit/'+row.edit" v-slot=" {navigate}">
                        <button @click="navigate">
                            Edit
                        </button>
                    </RouterLink>
                </td>
                <td>

                    <button @click="deleteCall(baseDeleteLink+'/'+row.delete)">
                        Delete
                    </button>
                </td>

            </tr>
        </tbody>
    </table>
</template>

<script>

import axios from 'axios';

export default{
    name: "CustomTable",
    props: {
        tableData: Array,
        tableColumns: Array,
        baseMonitorLink: String,
        baseEditLink: String,  // /user/edit
        baseDeleteLink: String,
        monitored: Boolean
    },
    setup(props){
        console.log(props)
    },
    computed: {
        displayData(){
            if(!this.tableData){
                return []
            }

            return  this.tableData.map((f)=>({
                    ...f,
                    monitor: f.id,
                    edit: f.id,
                    delete: f.id,
        }))
        }
    },
    methods:{
        async editCall(link){
            console.log(link)
        },
        async deleteCall(link){
            await axios.delete(link, { headers: {
                    'authorization': `Bearer ${this.$cookies.get("token")}`
                }})
            window.location.reload()
        }
    }
}
</script>

<style scoped>

table{
    width: 100%;
}

</style>