<template>

    <div>
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
    </div>

    <CustomTable :tableData="tableData" :tableColumns="tableColumns" :baseMonitorLink="monitorLink" :baseEditLink="editLink"
        :baseDeleteLink="deleteLink" :monitored="true" />
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
            monitorLink: '/device',
            editLink: `/device`,
            deleteLink: `${import.meta.env.VITE_DEVICE_URL}/device`
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
