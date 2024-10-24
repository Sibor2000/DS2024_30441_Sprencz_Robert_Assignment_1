<template>
    <main>
        <div>Welcome to the device manager application</div>
        
        <RouterLink to="/login" v-slot=" {navigate}">
            <button @click="navigate">
                Login
            </button>
        </RouterLink>

    </main>
</template>