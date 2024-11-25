<template>
        <Line :data="chartData" :options="chartOptions"></Line>
</template>

<script>
import { Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { monitor_instance } from '@/utilities/request';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export default {
    components: {
        Line
    },
    data() {
        return {
            chartOptions: {
                responsive: true,
                maintainAspectRatio: false,
            },
            chartData: {
                labels: [],
                datasets: [
                    {
                        label: 'Consumption for device: '+ this.$route.params.id,
                        backgroundColor: '#ffff00',
                        fill: 'origin',
                        data: []
                    }
                ]
            }
        }
    },
    created() {
        this.getMonitored()
    },
    methods: {
        async getMonitored() {
            try {
                const res = await monitor_instance.get(
                    "/device/" + this.$route.params.id,
                    {
                        headers: {
                            'authorization': `Bearer ${this.$cookies.get("token")}`
                        }
                    }
                )

                this.chartData = {
                    ...this.chartData,
                    labels: res.data.tableLabels,
                    datasets: [
                        {
                            ...this.chartData.datasets[0],
                            data: res.data.tableData
                        }

                    ]
                }
            } catch (error) {
                console.log(error)
            }
        }
    }
}

</script>