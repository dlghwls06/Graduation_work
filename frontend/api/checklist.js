import { BASE_URL } from '@env';
import axios from 'axios';


// export const getChecklistByContractId = async (contractId) => {
//     try {
//         const res = await axios.get(`${BASE_URL}/checklist/${contractId}`);
//         return res.data;
//     } catch (error) {
//         console.error('체크리스트 불러오기 실패:', error);
//         throw error;
//     }
// };

export const getChecklistByContractId = async (contractId) => {
    try {
        const res = await axios.get(`${BASE_URL}/checklist/${contractId}`);
        return res.data;
    } catch (error) {
        console.error('체크리스트 불러오기 실패:', error);
    }
};
