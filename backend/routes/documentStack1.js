const express = require('express');
const router = express.Router();
const stringSimilarity = require('string-similarity');

// 정규화 함수: 공백, 특수문자 제거 + 영문 소문자 처리
function normalize(text) {
    return text
        .replace(/[^가-힣a-zA-Z0-9]/g, '') // 특수문자 제거 (.도 포함됨)
        .replace(/\s/g, '') // 공백 제거
        .toLowerCase(); // 영문 대비용
}

router.get('/result/:situationId', async (req, res) => {
    const { situationId } = req.params;

    try {
        // 1. 위험 문장 가져오기
        const [riskRows] = await req.db.execute('SELECT sentence FROM risk_analysis_cases WHERE situation_id = ?', [
            situationId,
        ]);
        console.log("riskRows",[riskRows])

        if (riskRows.length === 0) {
            // 위험 문장이 없지만 이미지 정보는 내려줘야 함
            const [fileRows] = await req.db.execute(
                'SELECT file_url, image_width, image_height FROM user_contract_progress WHERE situation_id = ?',
                [situationId]
            );

            if (fileRows.length === 0) {
                return res.status(404).json({ message: '이미지 정보 없음' });
            }

            const { file_url: imageUrl, image_width, image_height } = fileRows[0];

            return res.json({
                imageUrl,
                coordinates: [], // 강조 박스 없음
                imageWidth: parseInt(image_width, 10),
                imageHeight: parseInt(image_height, 10),
            });
        }

        // 위험 문장이 있는 경우 계속 진행
        const riskSentences = riskRows.map((row) => row.sentence.trim());
        const normalizedRiskSentences = riskSentences.map((s) => normalize(s));

        // 2. OCR 결과 중 위험 문장과 유사한 것만 좌표 추출
        const [ocrRows] = await req.db.execute(
            'SELECT risk_message, one_coordinate, two_coordinate FROM ocr_result WHERE situation_id = ?',
            [situationId]
        );

        const coordinates = ocrRows
            .filter((row) => {
                const normOcr = normalize(row.risk_message);
                return normalizedRiskSentences.some((normRisk) => {
                    const similarity = stringSimilarity.compareTwoStrings(normOcr, normRisk);
                    return similarity > 0.8;
                });
            })
            .map((row) => {
                const [x1, y1] = row.one_coordinate?.split(',') ?? [0, 0];
                const [x2, y2] = row.two_coordinate?.split(',') ?? [0, 0];

                return {
                    x: parseFloat(x1),
                    y: parseFloat(y1),
                    width: Math.abs(parseFloat(x2) - parseFloat(x1)),
                    height: Math.abs(parseFloat(y2) - parseFloat(y1)),
                };
            });

        // 3. 이미지 정보 가져오기
        const [fileRows] = await req.db.execute(
            'SELECT file_url, image_width, image_height FROM user_contract_progress WHERE situation_id = ?',
            [situationId]
        );

        if (fileRows.length === 0) {
            return res.status(404).json({ message: '이미지 정보 없음' });
        }

        const { file_url: imageUrl, image_width, image_height } = fileRows[0];

        return res.json({
            imageUrl,
            coordinates,
            imageWidth: parseInt(image_width, 10),
            imageHeight: parseInt(image_height, 10),
        });
    } catch (err) {
        console.error('OCR 위험 문장 좌표 로딩 실패:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const path = require('path');

// router.get('/result/:situationId', async (req, res) => {
//   const { situationId } = req.params;

//   try {
//     const [ocrRows] = await req.db.execute(
//       'SELECT * FROM ocr_result WHERE situation_id = ?',
//       [situationId]
//     );

//     if (ocrRows.length === 0) {
//       return res.status(404).json({ message: '데이터 없음' });
//     }

//     const [fileRows] = await req.db.execute(
//       'SELECT file_url, image_width, image_height FROM user_contract_progress WHERE situation_id = ?',
//       [situationId]
//     );

//     if (fileRows.length === 0) {
//       return res.status(404).json({ message: '이미지 없음' });
//     }

//     const coordinates = ocrRows.map(row => {
//       const [x, y] = row.one_coordinate?.split(',') ?? [0, 0];
//       const [x2, y2] = row.two_coordinate?.split(',') ?? [0, 0];

//       return {
//         x: parseFloat(x),
//         y: parseFloat(y),
//         width: Math.abs(parseFloat(x2) - parseFloat(x)),
//         height: Math.abs(parseFloat(y2) - parseFloat(y)),
//       };
//     });

//     const imageUrl = fileRows[0].file_url;
//     const imageWidth = parseInt(fileRows[0].image_width, 10);
//     const imageHeight = parseInt(fileRows[0].image_height, 10);

//     return res.json({ imageUrl, coordinates, imageWidth, imageHeight });
//   } catch (err) {
//     console.error('OCR 결과 가져오기 실패:', err);
//     res.status(500).json({ message: '서버 오류' });
//   }
// });

// module.exports = router;
