import axios from 'axios'

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

export class GenerateServices{
    async getAllGenerates(){
        const options = {
            method: "GET",
            url: `https://glowtube-b.onrender.com/api/v1/generates`,
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

    async createGenerates(type, inputData){
        const options = {
            method: "POST",
            url: `https://glowtube-b.onrender.com/api/v1/generates`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
            data: {
                type: type,
                input: inputData
            },
            timeout: 120000 // 2 minutes timeout for Render free tier
        }
        
        return retryRequest(async () => {
            const response = await axios(options);
            return response?.data?.data || null;
        });
    }

    // Helper method for thumbnail generation
    async generateThumbnail(thumbnailData){
        const inputData = {
            title: thumbnailData.title,
            prompt: `Create a YouTube thumbnail for: ${thumbnailData.title}. Style: ${thumbnailData.style}, Color scheme: ${thumbnailData.colorScheme}, Include text: ${thumbnailData.includeText}, Text position: ${thumbnailData.textPosition}`
        };
        return this.createGenerates('thumbnail', inputData);
    }

    // Helper method for description generation
    async generateDescription(descriptionData){
        const inputData = {
            title: descriptionData.title,
            prompt: `Create a YouTube video description for: ${descriptionData.title}. Topic: ${descriptionData.topic}, Duration: ${descriptionData.duration}, Target audience: ${descriptionData.targetAudience}, Tone: ${descriptionData.tone}, Include hashtags: ${descriptionData.includeHashtags}, Include CTA: ${descriptionData.includeCallToAction}, Length: ${descriptionData.maxLength}`
        };
        return this.createGenerates('description', inputData);
    }

    async getGeneratesById(id){
        const options = {
            method: "POST",
            url: `https://glowtube-b.onrender.com/api/v1/generates/${id}`,
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
}

const generateService = new GenerateServices()
export default generateService