import axios from "axios";

export const user_instance = axios.create({
    baseURL: import.meta.env.VITE_USER_URL,
    //baseURL: "http://localhost/api/user"
})

export const device_instance = axios.create({
    baseURL: import.meta.env.VITE_DEVICE_URL,
})

export const monitor_instance = axios.create({
    baseURL: import.meta.env.VITE_MONITOR_URL,
})

export const chat_instance = axios.create({
    baseURL: import.meta.env.VITE_CHAT_URL
})