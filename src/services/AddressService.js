import axios from 'axios';
const  AddressService = {
    // Lấy danh sách tỉnh
    getAllProvinces: async () => {
        try {
            const response = await axios.get('http://provinces.open-api.vn/api/p/');
            return response.data;
        } catch (error) {
            console.error(error);
        }
    },
    // Lây danh sách huyện theo tỉnh
    getDistrictsByProvince: async (provinceCode) => {
        try {
            const response = await axios.get(`http://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            return response.data.districts;
        } catch (error) {
            console.error(error);
        }
    },
    // Lấy danh sách xã theo huyện
    getWardsByDistrict: async (districtCode) => {
        try {
            const response = await axios.get(`http://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            return response.data.wards;
        } catch (error) {
            console.error(error);
        }
    },
}

export default AddressService;