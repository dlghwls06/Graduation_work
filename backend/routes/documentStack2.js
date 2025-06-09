// routes/documentStack2.js
const express = require('express');
const router = express.Router();

router.get('/detail_result/:situationId', async (req, res) => {
    const { situationId } = req.params;

    try {
        const [riskCases] = await req.db.execute('SELECT * FROM risk_analysis_cases WHERE situation_id = ?', [
            situationId,
        ]);

        const result = [];

        for (const risk of riskCases) {
            const [recommendRows] = await req.db.execute(
                'SELECT recommend_sentence FROM risk_recommend_sentences WHERE risk_analysis_id = ?',
                [risk.risk_analysis_id]
            );

            result.push({
                sentence: risk.sentence,
                explanation: risk.explanation,
                recommends: recommendRows.map((r) => r.recommend_sentence),
            });
        }

        res.json(result);
    } catch (err) {
        console.error('위험 분석 결과 불러오기 실패:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;
