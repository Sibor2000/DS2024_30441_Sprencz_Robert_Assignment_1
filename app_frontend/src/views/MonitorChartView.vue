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

                /*
                This logic has been moved to the monitor,
                also I consider the measurements to be the already cumulative ones

                const extractedData = res.data
                const newLabels = []
                const newData = []

                let cumulativeConsumption = 0

                extractedData.sort((a,b)=>a.time - b.time)
                extractedData.forEach(element => {
                    newLabels.push(new Date(element.time * 1).toLocaleString())
                    //newData.push(element.measurement_value)
                    cumulativeConsumption+=element.measurement_value
                    newData.push(cumulativeConsumption)
                });

                this.chartData = {
                    ...this.chartData,
                    labels: newLabels,
                    datasets: [
                        {
                            ...this.chartData.datasets[0],
                            data: newData
                        }

                    ]
                }
                */
            } catch (error) {
                console.log(error)
            }
        }
    }
}

</script>