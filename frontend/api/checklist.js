import axios from 'axios';

const BASE_URL = 'http://192.168.1.193:4000';

export const getChecklistByContractId = async (contractId) => {
    try {
        const res = await axios.get(`${BASE_URL}/checklist/${contractId}`);
        return res.data;
    } catch (error) {
        console.error('체크리스트 불러오기 실패:', error);
        throw error;
    }
};
