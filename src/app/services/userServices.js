import axios from "axios";

export class UserServices {

    getApiBaseUrl() {
        return 'https://glowtube-b.onrender.com';
    }

    async register(email, password) {
        const options = {
            method: "POST",
            url: `https://glowtube-b.onrender.com/api/v1/users/register`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json'
            },
            data: { email, password }
        }
        try {
            const response = await axios(options);
            return response?.data?.data || null;
        } catch (error) {
            console.log('failed to register', error);
            return null;
        }

    }

    async login(email, password) {
        const options = {
            method: "POST",
            url: `https://glowtube-b.onrender.com/api/v1/users/login`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json'
            },
            data: { email, password }
        }
        try {
            const response = await axios(options);
            if (response?.data?.data?.accessToken) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
            }
            console.log(response.data.data)
            return response?.data?.data || null;
        } catch (error) {
            console.log('failed to login', error);
            return null;
        }
    }

    async logout() {
        const options = {
            method: "POST",
            url: `${this.getApiBaseUrl()}/api/v1/users/logout`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
        }

        try {
            const response = await axios(options);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return response?.data || null;
        } catch (error) {
            console.log('failed to logout', error);
            return null;
        }
    }

    async getCurrentUser() {
        const options = {
            method: "GET",
            url: `https://glowtube-b.onrender.com/api/v1/users/current`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
        }

        try {
            const response = await axios(options);
            return response?.data?.data || null;
        } catch (error) {
            console.log('failed to get current user', error);
            return null;
        }
    }
}

const userService = new UserServices();
export default userService;