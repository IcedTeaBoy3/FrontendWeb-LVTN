
import axiosInstance from '@/config/axiosInstance';

const AgoraService = {
    getAgoraToken: async (channelName, uid) => {
        try {
            const response = await axiosInstance.get('/agora/token',{
                params: {
                    channel: channelName,
                    uid: uid
                }
            });
            return response.data;
        }catch (error) {
            throw error;
        }
    }
}
export default AgoraService;