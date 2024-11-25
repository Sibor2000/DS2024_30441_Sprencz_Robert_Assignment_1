<template>
    <vue-cal
        hide-view-selector
        :time="false"
        :disable-views="['years','year','week','day']"
        active-view="month"
        xsmall
        @cell-click="onDayClick"
        />
</template>

<script>
import VueCal from "vue-cal"
import 'vue-cal/dist/vuecal.css'
import router from "@/router";

export default {
    components: { VueCal},
    methods: {
        onDayClick(day) {

            const startOfDay = new Date(day)
            const endOfDay = new Date(day)

            startOfDay.setHours(0,0,0,0);
            endOfDay.setHours(23,59,59,999);

            const startTimestamp = startOfDay.getTime()
            const endTimestamp = endOfDay.getTime()

            console.log(`${startOfDay} == ${startTimestamp}`)
            console.log(`${endOfDay} == ${endTimestamp}`)

            router.push(`/user_consumption`)
        }
    }
}

</script>