const express = require('express');
const router = express.Router();
require('dotenv').config();


const BASE_URL = process.env.BASE_URL;
console.log("백엔드 문서페이지유알엘", BASE_URL);

router.get('/documents', async (req, res) => {
    try {
        const [rows] = await req.db.execute(`
      SELECT 
        p.situation_id AS id,
        DATE_FORMAT(p.created_at, '%Y-%m-%d') AS date,
        c.contracts_templates AS title,
        c.type AS type,
        p.file_url,
        COUNT(r.sentence) AS riskCount
      FROM user_contract_progress p
      JOIN users_contracts uc ON p.users_contracts_id = uc.users_contracts_id
      JOIN contracts c ON uc.contracts_id = c.contracts_id
      LEFT JOIN risk_analysis_cases r ON p.situation_id = r.situation_id
      GROUP BY p.situation_id
      ORDER BY p.created_at DESC
    `);

        const formatted = rows.map((row) => ({
            id: row.id,
            date: row.date,
            title: row.title,
            type: row.type,
            riskCount: row.riskCount,
            file_url: row.file_url ? `http://${BASE_URL}:4000${row.file_url}` : null, // 절대경로로 변경!
        }));

        res.json(formatted);
        // console.log("row.file_url", row.file_url)
    }  
    catch (err) {
        console.error('❌ 문서 목록 조회 실패:', err.message);
        res.status(500).json({ message: '문서 목록 조회 실패' });
    }
});

module.exports = router;
