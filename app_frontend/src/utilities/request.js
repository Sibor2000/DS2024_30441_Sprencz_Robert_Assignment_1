import axios from "axios";

export const device_instance = axios.create({
    //baseURL: 'http://'+import.meta.env.USER_HOST+":"+import.meta.env.USER_PORT,
    baseURL: 'http://localhost:3001',
})

export const user_instance = axios.create({
    baseURL: 'http://localhost:3000',
})