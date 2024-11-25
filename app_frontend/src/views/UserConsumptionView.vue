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
    Filler,
    TimeScale
} from 'chart.js'
import 'chartjs-adapter-date-fns';
import { device_instance, monitor_instance } from '@/utilities/request';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
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
                scales:{
                    x: {
                        type: "time",
                        time:{
                            unit: "hour"
                        },
                        title: {
                            display: true,
                            text: "Time"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Consume"
                        }
                    }
                }
            },
            chartData: {
                datasets: []
            }
        }
    },
    mounted() {
        this.getMonitored()
    },
    methods: {
        async getMonitored() {

            try {
                const dev_res = await device_instance.get(
                    "/user/" + this.$route.params.id + "/devices",
                    {
                        headers: {
                            'authorization': `Bearer ${this.$cookies.get("token")}`
                        }
                    }
                )

                const device_ids = dev_res.data.map(e => e.id)

                const req_input = { ids: device_ids }

                const monitor_res = await monitor_instance.get(
                    "/devices",
                    {
                        params: req_input,
                        headers: {
                            'authorization': `Bearer ${this.$cookies.get("token")}`
                        }
                    }
                )

                let measurementTable = new Map();

                monitor_res.data.forEach(element => {
                    if (measurementTable.has(element.device_id)) {
                        let newArray = measurementTable.get(element.device_id)
                        newArray.push({x:Number(element.time), y:element.measurement_value})
                        measurementTable.set(element.device_id, newArray)
                    } else {
                        measurementTable.set(element.device_id, [{x:Number(element.time), y:element.measurement_value}])
                    }

                })

                console.log(measurementTable.entries())

                let newDataset = []
                const colors = ['#ff5733', '#33ff57', '#5733ff', '#f7dc6f', '#a569bd', '#58ade2'];
                for (const [key, value] of measurementTable) {
                    let randomColor = colors[Math.floor(Math.random() * colors.length)];
                    newDataset.push({
                        label: key,
                        backgroundColor: randomColor,
                        data: value
                    })
                }

                this.chartData = {
                    datasets: newDataset
                }

            } catch (error) {
                console.log(error)
            }
        }
    }
}

</script>