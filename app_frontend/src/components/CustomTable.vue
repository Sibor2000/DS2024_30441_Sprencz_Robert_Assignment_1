<template>
    <table>
        <thead>
            <tr>
                <th v-for="column in columns" :key="column.field"> {{ column.label }}</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="(row,rowIndex) in data" :key="rowIndex">
                <td v-for="column in columns" :key="column.field">
                    <slot :row="row" :column="column">
                        {{ row[column.field] }}
                    </slot>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
export default{
    name: "CustomTable",
    props: {
        data: Array,
        columns: Array
    },
    setup(props){
        console.log(props)
    }
}
</script>

<style scoped>

table{
    width: 100%;
}

</style>