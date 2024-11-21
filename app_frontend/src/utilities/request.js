import axios from "axios";

export const device_instance = axios.create({
    baseURL: 'http://'+import.meta.env.VITE_DEVICE_HOST+':'+import.meta.env.VITE_DEVICE_PORT,
})

export const user_instance = axios.create({
    baseURL: 'http://'+import.meta.env.VITE_USER_HOST+':'+import.meta.env.VITE_USER_PORT,
})

export const monitor_instance = axios.create({
    baseURL: 'http://'+import.meta.env.VITE_MONITOR_HOST+':'+import.meta.env.VITE_MONITOR_PORT,
})