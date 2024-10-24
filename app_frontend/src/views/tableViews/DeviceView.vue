<template>

    <RouterLink to="users" v-slot="{ navigate }">
        <button @click="navigate">
            Users
        </button>
    </RouterLink>

    <RouterLink to="/device/add" v-slot="{ navigate }">
        <button @click="navigate">
            Add device
        </button>
    </RouterLink>


    <CustomTable :tableData="tableData" :tableColumns="tableColumns" :baseEditLink="editLink"
        :baseDeleteLink="deleteLink" />
</template>


<script>
import { device_instance } from '@/utilities/request';
import CustomTable from '@/components/CustomTable.vue';

export default {
    components: {
        CustomTable,
    },
    data() {
        return {
            tableColumns: [],
            tableData: [],
            editLink: `/device`,
            deleteLink: `http://${import.meta.env.VITE_DEVICE_HOST}:${import.meta.env.VITE_DEVICE_PORT}/device`
        }
    },
    created() {
        this.getDevices()
    },
    methods: {
        async getDevices() {
            try {
                const res = await device_instance.get('/devices', {
                    headers: {
                        'authorization': `Bearer ${this.$cookies.get("token")}`
                    }
                })
                this.tableColumns = res.data.fields.map((f) => ({
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
