export default function calculateConsumption(array){
    if(array==null || array.length == 0){
        return null
    }

    if(array.length == 1){
        return array[0].measurement_value
    }


    const first_value = array[0].measurement_value
    const last_value = array[array.length - 1].measurement_value
    const consumption_in_cycle = last_value - first_value
    return consumption_in_cycle
}