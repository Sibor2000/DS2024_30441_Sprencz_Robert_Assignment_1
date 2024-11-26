import axios from "axios";

export const device_instance = axios.create({
    //baseURL: 'http://'+import.meta.env.VITE_DEVICE_HOST+':'+import.meta.env.VITE_DEVICE_PORT,
    baseURL: import.meta.env.VITE_DEVICE_URL,
})

export const user_instance = axios.create({
    //baseURL: 'http://'+import.meta.env.VITE_USER_HOST+':'+import.meta.env.VITE_USER_PORT,
    baseURL: import.meta.env.VITE_USER_URL,
})

export const monitor_instance = axios.create({
    //baseURL: 'http://'+import.meta.env.VITE_MONITOR_HOST+':'+import.meta.env.VITE_MONITOR_PORT,
    baseURL: import.meta.env.VITE_MONITOR_URL,
})