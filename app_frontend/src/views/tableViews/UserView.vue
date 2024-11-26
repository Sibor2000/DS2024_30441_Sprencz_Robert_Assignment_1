<template>

    <div>
        <p v-if="message">
            Message from server: {{ message }}
        </p>
    </div>

    <div>
        <RouterLink to="/devices" v-slot="{ navigate }">
            <button @click="navigate">
                Devices
            </button>
        </RouterLink>

        <RouterLink to="/user/add" v-slot="{ navigate }">
            <button @click="navigate">
                Add user
            </button>
        </RouterLink>
    </div>

    <CustomTable :tableData="tableData" :tableColumns="tableColumns" :baseMonitorLink="monitorLink" :baseEditLink="editLink"
        :baseDeleteLink="deleteLink" :monitored="true" />
</template>


<script>
import { user_instance } from '@/utilities/request';
import CustomTable from '@/components/CustomTable.vue';

export default {
    components: {
        CustomTable,
    },
    data() {
        return {
            message: null,
            tableColumns: [],
            tableData: [],
            monitorLink: `/user`,
            editLink: `/user`,
            deleteLink: `http://${import.meta.env.VITE_USER_HOST}:${import.meta.env.VITE_USER_PORT}/user`
        }
    },
    created() {
        this.getUsers()
        this.socketSetup()
    },
    methods: {
        async getUsers() {
            try {
                const res = await user_instance.get('/users', {
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
        },

        socketSetup() {
            const socket = new WebSocket(`ws:/${import.meta.env.VITE_WEBSOCKET1_HOST}:${import.meta.env.VITE_WEBSOCKET1_PORT}`);

            socket.addEventListener('message', (event) => {
                console.log(event)
                this.message = JSON.parse(event.data).message
            })

            socket.addEventListener('close', () => {
                console.log("Connection closed")
            })
        }
    }
}
</script>
