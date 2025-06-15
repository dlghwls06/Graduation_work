const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const router = express.Router();
require('dotenv').config();


//확장자 포함 저장을 위한 multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // .jpg, .png 등
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

router.post('/upload', upload.single('image'), async (req, res) => {
    const file = req.file;
    const { width, height } = req.body;
    const imageWidth = parseInt(width, 10);
    const imageHeight = parseInt(height, 10);

    console.log('!!클라이언트 전달 해상도:', imageWidth, imageHeight);

    if (!file) {
        return res.status(400).json({ message: '이미지를 업로드해야 합니다.' });
    }

    try {
        // 이미지 base64로 인코딩
        const imagePath = path.join(__dirname, '..', file.path);
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        // OCR API 호출
        const ocrResponse = await axios.post(
            process.env.OCR_URL,
            {
                images: [
                    {
                        format: 'jpg',
                        name: 'ocr_image',
                        data: base64Image,
                    },
                ],
                requestId: Date.now().toString(),
                version: 'V1',
                timestamp: Date.now(),
            },
            {
                headers: {
                    'X-OCR-SECRET': process.env.OCR_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        const fields = ocrResponse.data.images[0].fields;
        const text = fields.map((f) => f.inferText).join('\n');
        // console.log("OCR 추출 결과", text)

        // 특약사항 문장 추출
        let inSpecialClause = false;
        let currentClause = '';
        let clauseList = [];
        let endDetected = false;
        let currentStart = null;
        let currentEnd = null;

        fields.forEach((field) => {
            const word = field.inferText.trim();
            const coords = field.boundingPoly?.vertices;

            if (!inSpecialClause && word.includes('특약사항')) {
                inSpecialClause = true;
                return;
            }
            if (!inSpecialClause || endDetected) return;

            if (word.includes('본') && word.includes('계약')) {
                if (currentClause) {
                    clauseList.push({
                        text: currentClause.trim(),
                        coordStart: currentStart,
                        coordEnd: currentEnd,
                    });
                }
                endDetected = true;
                return;
            }

            const match = word.match(/^(\d+)\.(.*)/);
            if (match) {
                if (currentClause) {
                    clauseList.push({
                        text: currentClause.trim(),
                        coordStart: currentStart,
                        coordEnd: currentEnd,
                    });
                }
                currentClause = `${match[1]}. ${match[2]} `;
                currentStart = coords?.[0] && coords?.[3] ? [coords[0], coords[3]] : null;
                currentEnd = coords?.[1] && coords?.[2] ? [coords[1], coords[2]] : null;
                return;
            }

            if (!currentStart && coords?.[0] && coords?.[3]) {
                currentStart = [coords[0], coords[3]];
            }
            if (coords?.[1] && coords?.[2]) {
                currentEnd = [coords[1], coords[2]];
            }

            currentClause += word + ' ';
        });

        if (currentClause && !endDetected) {
            clauseList.push({
                text: currentClause.trim(),
                coordStart: currentStart,
                coordEnd: currentEnd,
            });
        }

        // DB 저장
        const fileUrl = `/uploads/${file.filename}`;
        const [insertResult] = await req.db.execute(
            `INSERT INTO user_contract_progress (users_contracts_id, file_url, image_width, image_height) VALUES (?, ?, ?, ?)`,
            [1, fileUrl, imageWidth, imageHeight]
        );
        const situationId = insertResult.insertId;

        
        for (let i = 0; i < clauseList.length; i++) {
            const clause = clauseList[i];
            await req.db.execute(
                `INSERT INTO ocr_result (
          situation_id,
          risk_message,
          one_coordinate,
          two_coordinate,
          three_coordinate,
          four_coordinate
        ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    situationId,
                    clause.text,
                    clause.coordStart?.[0] ? `${clause.coordStart[0].x},${clause.coordStart[0].y}` : null,
                    clause.coordEnd?.[0] ? `${clause.coordEnd[0].x},${clause.coordEnd[0].y}` : null,
                    clause.coordEnd?.[1] ? `${clause.coordEnd[1].x},${clause.coordEnd[1].y}` : null,
                    clause.coordStart?.[1] ? `${clause.coordStart[1].x},${clause.coordStart[1].y}` : null,
                ]
            );
        }

        // FastAPI로 문장 전송
        const clauseTexts = clauseList.map((clause) => clause.text);
        try {
            const fastApiResponse = await axios.post(`http://192.168.1.243:5050/analyze`, {
                situation_id: situationId,
                sentences: clauseTexts,
            });
            console.log('FastAPI 응답 결과:', fastApiResponse.data);
        } catch (err) {
            console.error('FastAPI 통신 실패:', err.message);
        }

        // 클라이언트 응답
        res.json({
            text,
            filename: file.filename,
            path: fileUrl,
        });
    } catch (error) {
        console.error('OCR 실패:', error.response?.data || error.message);
        res.status(500).json({ message: 'OCR 처리 실패' });
    }
});

module.exports = router;

// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const multer = require('multer');
// const router = express.Router();
// require('dotenv').config();

// const upload = multer({ dest: 'public/uploads/' });

// router.post('/upload', upload.single('image'), async (req, res) => {
//   const file = req.file;

//   if (!file) {
//     return res.status(400).json({ message: '이미지를 업로드해야 합니다.' });
//   }

//   try {
//     // 이미지 파일을 base64로 인코딩
//     const imagePath = path.join(__dirname, '..', file.path);
//     const imageBuffer = fs.readFileSync(imagePath);
//     const base64Image = imageBuffer.toString('base64');

//     console.log("asdda",process.env.OCR_KEY)
//     console.log("URL",process.env.OCR_URL)

//     // OCR API 요청
//     const ocrResponse = await axios.post(
//       process.env.OCR_URL,
//       {
//         images: [
//           {
//             format: 'jpg',
//             name: 'ocr_image',
//             data: base64Image,
//           },
//         ],
//         requestId: Date.now().toString(),
//         version: 'V1',
//         timestamp: Date.now(),
//       },
//       {
//         headers: {
//           'X-OCR-SECRET': process.env.OCR_KEY,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     // OCR 결과에서 텍스트 추출
//     const fields = ocrResponse.data.images[0].fields;
//     const text = fields.map(f => f.inferText).join('\n');

//     let inSpecialClause = false;
//     let currentClause = '';
//     let clauseList = [];
//     let endDetected = false;
//     let currentStart = null;
//     let currentEnd = null;

//     fields.forEach((field, idx) => {
//       const word = field.inferText.trim();
//       const coords = field.boundingPoly?.vertices;

//       // 1단계: "[특약사항]" 포함 여부 확인
//       if (!inSpecialClause && word.includes('특약사항')) {
//         inSpecialClause = true;
//         return;
//       }
//       if (!inSpecialClause || endDetected) return;

//       // 2단계: "본 계약을" 등장 시 종료
//       if (word.includes('본') && word.includes('계약')) {
//         if (currentClause) {
//           clauseList.push({
//             text: currentClause.trim(),
//             coordStart: currentStart,  // 꼭짓점 1,4
//             coordEnd: currentEnd       // 꼭짓점 2,3
//           });
//         }
//         endDetected = true;
//         return;
//       }

//       // 3단계: 숫자. 혹은 숫자.다음단어 패턴 감지 (예: "1.현", "2.등기부")
//       const match = word.match(/^(\d+)\.(.*)/);
//       if (match) {
//         // 이전 문장 저장
//         if (currentClause) {
//           clauseList.push({
//             text: currentClause.trim(),
//             coordStart: currentStart,
//             coordEnd: currentEnd
//           });
//         }

//         // 새 문장 시작
//         currentClause = `${match[1]}. ${match[2]} `;
//         currentStart = coords?.[0] && coords?.[3] ? [coords[0], coords[3]] : null;
//         currentEnd = coords?.[1] && coords?.[2] ? [coords[1], coords[2]] : null;
//         return;
//       }

//       // 일반 단어는 이어붙이고 좌표 갱신
//       if (!currentStart && coords?.[0] && coords?.[3]) {
//         currentStart = [coords[0], coords[3]];
//       }
//       if (coords?.[1] && coords?.[2]) {
//         currentEnd = [coords[1], coords[2]];
//       }

//       currentClause += word + ' ';
//     });

//     // 마지막 문장 추가
//     if (currentClause && !endDetected) {
//       clauseList.push({
//         text: currentClause.trim(),
//         coordStart: currentStart,
//         coordEnd: currentEnd
//       });
//     }

//     // // 위험조항 문장 좌표출력
//     // console.log('✅ 추출된 특약사항 문장들:');
//     // clauseList.forEach((sentence, index) => {
//     //   console.log(`[${index + 1}] ${sentence.text}`);
//     //   console.log(`   - 시작 좌표 (1,4):`, sentence.coordStart);
//     //   console.log(`   - 끝 좌표 (2,3):`, sentence.coordEnd);
//     // });

//     //DB에 저장
//     const [insertResult] = await req.db.execute(
//       `INSERT INTO user_contract_progress (users_contracts_id, file_url) VALUES (?, ?)`,
//       [1, `/uploads/${file.filename}`]
//     );
//     const situationId = insertResult.insertId;
//     for (let i = 1; i < clauseList.length; i++) {
//       const clause = clauseList[i];

//       const startX = clause.coordStart?.[0]?.x ?? null;
//       const startY = clause.coordStart?.[0]?.y ?? null;
//       const endX = clause.coordEnd?.[0]?.x ?? null;
//       const endY = clause.coordEnd?.[0]?.y ?? null;

//       await req.db.execute(
//       `INSERT INTO ocr_result (
//         situation_id,
//         risk_message,
//         one_coordinate,
//         two_coordinate,
//         three_coordinate,
//         four_coordinate
//       ) VALUES (?, ?, ?, ?, ?, ?)`,
//       [
//         situationId,
//         clause.text,
//         clause.coordStart?.[0]?.x != null && clause.coordStart?.[0]?.y != null
//           ? `${clause.coordStart[0].x},${clause.coordStart[0].y}`
//           : null,
//         clause.coordEnd?.[0]?.x != null && clause.coordEnd?.[0]?.y != null
//           ? `${clause.coordEnd[0].x},${clause.coordEnd[0].y}`
//           : null,
//         clause.coordEnd?.[1]?.x != null && clause.coordEnd?.[1]?.y != null
//           ? `${clause.coordEnd[1].x},${clause.coordEnd[1].y}`
//           : null,
//         clause.coordStart?.[1]?.x != null && clause.coordStart?.[1]?.y != null
//           ? `${clause.coordStart[1].x},${clause.coordStart[1].y}`
//           : null,
//       ]
//     );

//     }
//         // FastAPI로 문장들만 전송
// const clauseTexts = clauseList.map(clause => clause.text);

// try {
//   const fastApiResponse = await axios.post('http://192.168.1.176:5050/analyze', {
//     situation_id: situationId,
//     sentences: clauseTexts
//   });

//   console.log("✅ FastAPI 응답 결과:", fastApiResponse.data);
// } catch (err) {
//   console.error("❌ FastAPI 통신 실패:", err.message);
// }

//     res.json({
//       text,
//       filename: file.filename,
//       path: `/uploads/${file.filename}`,
//     });
//   } catch (error) {
//     console.error('OCR 실패:', error.response?.data || error.message);
//     res.status(500).json({ message: 'OCR 처리 실패' });
//   }
// });

// module.exports = router;
