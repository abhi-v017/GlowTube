import axios from "axios";

// Helper function to retry requests with exponential backoff for Render free tier
const retryRequest = async (requestFn, maxRetries = 3, baseDelay = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            console.log(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Exponential backoff: 2s, 4s, 8s
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

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
            timeout: 120000 // 2 minutes timeout for Render free tier
        }

        return retryRequest(async () => {
            const response = await axios(options);
            return response?.data?.data || null;
        });
    }

    // Fast payment confirmation - call this immediately after payment
    async confirmPayment() {
        const options = {
            method: "POST",
            url: `https://glowtube-b.onrender.com/api/v1/payments/confirm-payment`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
            timeout: 30000 // 30 seconds timeout for payment confirmation
        }

        return retryRequest(async () => {
            const response = await axios(options);
            return response?.data?.data || null;
        });
    }
}

const userService = new UserServices();
export default userService;