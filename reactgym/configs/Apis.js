import axios from "axios";

const BASE_URL = 'http://192.168.1.7:8000/';

export const endpoints = {
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'member-profiles': (userId) => `/member-profiles/${userId}/`,
    'member-profile': '/member-profiles/',
    'register': '/users/',
    'pt-profiles': '/pt-profiles/',
    'pt-details': (ptId) => `/pt-profiles/${ptId}/`,
    'comments': (ptId) => `/pt-profiles/${ptId}/comments/`,
    'services': '/services/',
    'services-details': (svId) => `/services/${svId}/`,
    'comments-services': (svId) => `/services/${svId}/comments/`,
    'progress': '/progress/',
    'progress': (proId) => `/progress/${proId}/progress`,
    'member-packages': '/member-packages/',
    'personal-trainers': '/users/personal-trainers/',
    'schedules': '/schedules/',
    'packages': '/packages/',
    'member-packages': '/member-packages/'



};

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
});