import axios from 'axios'

export class GenerateServices{
    async getAllGenerates(){
        const options = {
            method: "GET",
            url: `https://glowtube-b.onrender.com/api/v1/generates`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
        }
        try {
            const response = await axios(options);
            return response?.data?.data || null;
        } catch (error) {
            console.log('failed to get generates', error);
            return null;
        }
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
            }
        }
        try {
            const response = await axios(options);
            return response?.data?.data || null;
        } catch (error) {
            console.log('failed to create generates', error);
            return null;
        }
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
        }   
        try {
            const response = await axios(options);
            return response?.data?.data || null;
        } catch (error) {
            console.log('failed to get generates by id', error);
            return null;
        }
    }
}

const generateService = new GenerateServices()
export default generateService