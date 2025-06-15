const express = require('express');
const router = express.Router();
require('dotenv').config();

// const BASE_URL = process.env.BASE_URL;
// console.log("백엔드 문서페이지유알엘", BASE_URL);

// 문서 목록 조회
router.get('/documents', async (req, res) => {
    try {
        const [rows] = await req.db.execute(`
      SELECT 
  p.situation_id AS id,
  DATE_FORMAT(p.created_at, '%Y-%m-%d') AS date,
  c.contracts_templates AS title,
  c.type AS type,
  p.file_url,
  p.risk_count AS riskCount  -- ✅ 변경된 부분
FROM user_contract_progress p
JOIN users_contracts uc ON p.users_contracts_id = uc.users_contracts_id
JOIN contracts c ON uc.contracts_id = c.contracts_id
ORDER BY p.created_at DESC

    `);

        const formatted = rows.map((row) => ({
            id: row.id,
            date: row.date,
            title: row.title,
            type: row.type,
            riskCount: row.riskCount,
            file_url: row.file_url ? `http://192.168.1.243:4000${row.file_url}` : null,
        }));

        res.json(formatted);
    } catch (err) {
        console.error('❌ 문서 목록 조회 실패:', err.message);
        res.status(500).json({ message: '문서 목록 조회 실패' });
    }
});

// 문서 삭제 API
router.delete('/delete/:id', async (req, res) => {
    const situationId = req.params.id;

    try {
        // 1. 위험 분석 ID들 먼저 가져오기
        const [riskRows] = await req.db.execute(
            `SELECT risk_analysis_id FROM risk_analysis_cases WHERE situation_id = ?`,
            [situationId]
        );

        const riskIds = riskRows.map(row => row.risk_analysis_id);

        // 2. 추천 문장 테이블 삭제 (여기에 situation_id 없음 → risk_analysis_id 기반 삭제)
        if (riskIds.length > 0) {
            await req.db.execute(
                `DELETE FROM risk_recommend_sentences WHERE risk_analysis_id IN (${riskIds.map(() => '?').join(',')})`,
                riskIds
            );
        }

        // 3. 위험 분석, OCR 결과 삭제
        await req.db.execute(`DELETE FROM risk_analysis_cases WHERE situation_id = ?`, [situationId]);
        await req.db.execute(`DELETE FROM ocr_result WHERE situation_id = ?`, [situationId]);

        // 4. 사용자 계약 진행 문서 삭제
        await req.db.execute(`DELETE FROM user_contract_progress WHERE situation_id = ?`, [situationId]);

        res.json({ message: '문서가 성공적으로 삭제되었습니다.' });
    } catch (err) {
        console.error('❌ 문서 삭제 실패:', err.message);
        res.status(500).json({ message: '문서 삭제 실패' });
    }
});


module.exports = router;


// const express = require('express');
// const router = express.Router();
// require('dotenv').config();


// const BASE_URL = process.env.BASE_URL;
// console.log("백엔드 문서페이지유알엘", BASE_URL);

// router.get('/documents', async (req, res) => {
//     try {
//         const [rows] = await req.db.execute(`
//       SELECT 
//         p.situation_id AS id,
//         DATE_FORMAT(p.created_at, '%Y-%m-%d') AS date,
//         c.contracts_templates AS title,
//         c.type AS type,
//         p.file_url,
//         COUNT(r.sentence) AS riskCount
//       FROM user_contract_progress p
//       JOIN users_contracts uc ON p.users_contracts_id = uc.users_contracts_id
//       JOIN contracts c ON uc.contracts_id = c.contracts_id
//       LEFT JOIN risk_analysis_cases r ON p.situation_id = r.situation_id
//       GROUP BY p.situation_id
//       ORDER BY p.created_at DESC
//     `);

//         const formatted = rows.map((row) => ({
//             id: row.id,
//             date: row.date,
//             title: row.title,
//             type: row.type,
//             riskCount: row.riskCount,
//             file_url: row.file_url ? `http://${BASE_URL}:4000${row.file_url}` : null, // 절대경로로 변경!
//         }));

//         res.json(formatted);
//         // console.log("row.file_url", row.file_url)
//     }  
//     catch (err) {
//         console.error('❌ 문서 목록 조회 실패:', err.message);
//         res.status(500).json({ message: '문서 목록 조회 실패' });
//     }
// });

// module.exports = router;
