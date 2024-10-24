<template>
    <RouterLink to="/users" v-slot=" {navigate}">
            <button @click="navigate">
                Users
            </button>
    </RouterLink>

    <RouterLink to="/devices" v-slot=" {navigate}">
            <button @click="navigate">
                Devices
            </button>
    </RouterLink>
</template>