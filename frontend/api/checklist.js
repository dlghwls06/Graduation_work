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
        const res = await axios.get(`http://192.168.1.243:4000/checklist/${contractId}`);
        // console.log("res",res)
        return res.data;
    } catch (error) {
        console.error('체크리스트 불러오기 실패:', error);
    }
};
