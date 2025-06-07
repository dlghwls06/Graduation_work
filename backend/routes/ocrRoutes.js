const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const router = express.Router();
require('dotenv').config();

const upload = multer({ dest: 'public/uploads/' });

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
  
//     //특약사항
//     let clauseSentences = [];
//     let currentClause = '';
//     let lastWordWasNumber = false;

//     fields.forEach((field) => {
//       const word = field.inferText.trim();

//       if (/^\d+$/.test(word)) {
//         // 숫자만 있을 경우 (예: "1")
//         lastWordWasNumber = word;
//       } else if (word === '.' && lastWordWasNumber) {
//         // 이전에 숫자가 있었고 이번에 "."이 오면 새로운 항목 시작
//         if (currentClause) {
//           clauseSentences.push(currentClause.trim());
//         }
//         currentClause = lastWordWasNumber + '.' + ' ';
//         lastWordWasNumber = false;
//         isInClause = true;
//       } else {
//         if (lastWordWasNumber) {
//           // "1" 다음에 "."이 아닌 다른 단어가 왔다면 그냥 이어 붙임
//           currentClause += lastWordWasNumber + ' ';
//           lastWordWasNumber = false;
//         }

//         currentClause += word + ' ';
//       }
//     });

//     // 마지막 문장 추가
//     if (currentClause) {
//       clauseSentences.push(currentClause.trim());
//     }

//     // 출력
//     console.log('✅ Numbered clauses with split dot handling:');
//     clauseSentences.forEach((sentence, index) => {
//       console.log(`[${index + 1}] ${sentence}`);
//     });

//     let fullText = clauseSentences.join(' ');

//     // "[ 특약사항 ]" 이후만 남기기
//     const specialClauseStart = fullText.indexOf('[ 특약사항 ]');
//     if (specialClauseStart === -1) {
//       console.log('❌ "[ 특약사항 ]" 항목을 찾을 수 없습니다.');
//       return;
//     }

//     // "[ 특약사항 ]" 이후 텍스트 추출
//     let specialClauseText = fullText.substring(specialClauseStart);

//     // "본 계약을 증명하기 위하여"가 있다면 해당 위치까지만 자르기
//     const endClauseIndex = specialClauseText.indexOf('본 계약을 증명하기 위하여');
//     if (endClauseIndex !== -1) {
//       specialClauseText = specialClauseText.substring(0, endClauseIndex);
//     }

//     // 숫자. 으로 시작하는 항목들 정규식 분리
//     const clauseSplitRegex = /(?=\d+\.\s?)/g;
//     const splitClauses = specialClauseText
//       .split(clauseSplitRegex)
//       .map(clause => clause.trim())
//       .filter(clause => /^\d+\./.test(clause));

//     // 출력
//     console.log('✅ [ 특약사항 ] 이후 번호 항목별 문장 리스트 (종료 문장 포함):');
//     splitClauses.forEach((sentence, index) => {
//       console.log(`[${index + 1}] ${sentence}`);
//     });

//     // 번호 제거된 문장 리스트 생성
//     const cleanedClauses = splitClauses.map((clause) => {
//       return clause.replace(/^\d+\.\s*/, '').trim();
//     });

//     // 결과 출력
//     console.log('✅ 번호 제거된 특약사항 문장 리스트:');
//     cleanedClauses.forEach((clause, index) => {
//       console.log(`${clause}`);
//     });


//   //   fields.forEach((field, index) => {
//   //     console.log(`[${index + 1}] 텍스트: ${field.inferText}`);
//   //     console.log(`좌표:`);
//   //     field.boundingPoly.vertices.forEach((vertex, i) => {
//   //       console.log(`   - 꼭짓점 ${i + 1}: x=${vertex.x}, y=${vertex.y}`);
//   //     });
//   //     console.log('--------------------------');
//   // });

//       // console.log(fields)
    
//     //----------------법률 조항 -> 제 2조-----------------
//     // let sentences = []; //제 x조 문항
//     // let currentSentence = '';
//     // let collecting = false;

//     // fields.forEach((field, index) => {
//     //   const word = field.inferText;

//     //   // '제1조', '제2조' 등의 문장 시작점 감지
//     //   if (word.startsWith('제') && word.endsWith('조')) {
//     //     if (currentSentence) {
//     //       sentences.push(currentSentence.trim());
//     //     }
//     //     currentSentence = word + ' ';
//     //     collecting = true;
//     //   } else if (collecting) {
//     //     currentSentence += word + ' ';

//     //     // 마침표가 나오면 문장 끝으로 간주
//     //     if (word.includes('.')) {
//     //       sentences.push(currentSentence.trim());
//     //       currentSentence = '';
//     //       collecting = false;
//     //         }
//     //       }
//     //     });

//     //     // 남은 문장이 있다면 추가
//     //     if (currentSentence) {
//     //       sentences.push(currentSentence.trim());
//     //     }

//     //     // 결과 출력
//     //     sentences.forEach((sentence, i) => {
//     //       console.log(`[문장 ${i + 1}] ${sentence}`);
//     // });
//     // ------------------------------------------------

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

router.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: '이미지를 업로드해야 합니다.' });
  }

  try {
    // 이미지 파일을 base64로 인코딩
    const imagePath = path.join(__dirname, '..', file.path);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    console.log("asdda",process.env.OCR_KEY)
    console.log("URL",process.env.OCR_URL)

    // OCR API 요청
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

    // OCR 결과에서 텍스트 추출
    const fields = ocrResponse.data.images[0].fields;
    const text = fields.map(f => f.inferText).join('\n');
    
    let inSpecialClause = false;
    let currentClause = '';
    let clauseList = [];
    let endDetected = false;
    let currentStart = null;
    let currentEnd = null;

    fields.forEach((field, idx) => {
      const word = field.inferText.trim();
      const coords = field.boundingPoly?.vertices;

      // 1단계: "[특약사항]" 포함 여부 확인
      if (!inSpecialClause && word.includes('특약사항')) {
        inSpecialClause = true;
        return;
      }
      if (!inSpecialClause || endDetected) return;

      // 2단계: "본 계약을" 등장 시 종료
      if (word.includes('본') && word.includes('계약')) {
        if (currentClause) {
          clauseList.push({
            text: currentClause.trim(),
            coordStart: currentStart,  // 꼭짓점 1,4
            coordEnd: currentEnd       // 꼭짓점 2,3
          });
        }
        endDetected = true;
        return;
      }

      // 3단계: 숫자. 혹은 숫자.다음단어 패턴 감지 (예: "1.현", "2.등기부")
      const match = word.match(/^(\d+)\.(.*)/);
      if (match) {
        // 이전 문장 저장
        if (currentClause) {
          clauseList.push({
            text: currentClause.trim(),
            coordStart: currentStart,
            coordEnd: currentEnd
          });
        }

        // 새 문장 시작
        currentClause = `${match[1]}. ${match[2]} `;
        currentStart = coords?.[0] && coords?.[3] ? [coords[0], coords[3]] : null;
        currentEnd = coords?.[1] && coords?.[2] ? [coords[1], coords[2]] : null;
        return;
      }

      // 일반 단어는 이어붙이고 좌표 갱신
      if (!currentStart && coords?.[0] && coords?.[3]) {
        currentStart = [coords[0], coords[3]];
      }
      if (coords?.[1] && coords?.[2]) {
        currentEnd = [coords[1], coords[2]];
      }

      currentClause += word + ' ';
    });

    // 마지막 문장 추가
    if (currentClause && !endDetected) {
      clauseList.push({
        text: currentClause.trim(),
        coordStart: currentStart,
        coordEnd: currentEnd
      });
    }

    // ✅ 출력
    console.log('✅ 추출된 특약사항 문장들:');
    clauseList.forEach((sentence, index) => {
      console.log(`[${index + 1}] ${sentence.text}`);
      console.log(`   - 시작 좌표 (1,4):`, sentence.coordStart);
      console.log(`   - 끝 좌표 (2,3):`, sentence.coordEnd);
    });

//     let inSpecialClause = false;
// let currentClause = '';
// let clauseList = [];
// let endDetected = false;
// let currentStart = null;
// let currentEnd = null;

// fields.forEach((field, idx) => {
//   const word = field.inferText.trim();
//   const coords = field.boundingPoly?.vertices;

//   // 1단계: "[특약사항]" 포함 여부 확인
//   if (!inSpecialClause && word.includes('특약사항')) {
//     inSpecialClause = true;
//     return;
//   }
//   if (!inSpecialClause || endDetected) return;

//   // 2단계: "본 계약을" 등장 시 종료
//   if (word.includes('본') && word.includes('계약')) {
//     if (currentClause) {
//       clauseList.push({
//         text: currentClause.trim(),
//         coordStart: currentStart,
//         coordEnd: currentEnd
//       });
//     }
//     endDetected = true;
//     return;
//   }

//   // 3단계: 숫자. 혹은 숫자.다음단어 패턴 감지 (예: "1.현", "2.등기부")
//   const match = word.match(/^(\d+)\.(.*)/);
//   if (match) {
//     // 기존 문장 저장
//     if (currentClause) {
//       clauseList.push({
//         text: currentClause.trim(),
//         coordStart: currentStart,
//         coordEnd: currentEnd
//       });
//     }

//     // 새 문장 시작
//     currentClause = `${match[1]}. ${match[2]} `;
//     currentStart = coords?.[0] && coords?.[1] ? [coords[0], coords[1]] : null;
//     currentEnd = coords?.[2] && coords?.[3] ? [coords[2], coords[3]] : null;
//     return;
//   }

//   // 일반 단어는 이어붙이고 좌표 갱신
//   if (!currentStart && coords?.[0] && coords?.[1]) {
//     currentStart = [coords[0], coords[1]];
//   }
//   if (coords?.[2] && coords?.[3]) {
//     currentEnd = [coords[2], coords[3]];
//   }

//   currentClause += word + ' ';
// });

// // 마지막 문장 추가
// if (currentClause && !endDetected) {
//   clauseList.push({
//     text: currentClause.trim(),
//     coordStart: currentStart,
//     coordEnd: currentEnd
//   });
// }

// // ✅ 출력
// console.log('✅ 추출된 특약사항 문장들:');
// clauseList.forEach((sentence, index) => {
//   console.log(`[${index + 1}] ${sentence.text}`);
//   console.log(`   - 시작 꼭짓점 1,2:`, sentence.coordStart);
//   console.log(`   - 끝 꼭짓점 3,4:`, sentence.coordEnd);
// });




    // 확인하고 싶은 단어 리스트
    // const targetWords = ['1.현', '한다 )', '2.등기부상', ')이다.'];

    // console.log('🔍 특정 단어 좌표 확인:');

    // fields.forEach((field) => {
    //   const word = field.inferText.trim();

    //   if (targetWords.includes(word)) {
    //     const vertices = field.boundingPoly?.vertices;
    //     console.log(`\n📌 단어: "${word}"`);
    //     if (vertices && vertices.length === 4) {
    //       console.log(` - 꼭짓점 1 (좌상단):`, vertices[0]);
    //       console.log(` - 꼭짓점 2 (우상단):`, vertices[1]);
    //       console.log(` - 꼭짓점 3 (우하단):`, vertices[2]);
    //       console.log(` - 꼭짓점 4 (좌하단):`, vertices[3]);
    //     } else {
    //       console.log(' → 좌표 정보 없음');
    //     }
    //   }
    // });
    
      
  //   fields.forEach((field, index) => {
  //     console.log(`[${index + 1}] 텍스트: ${field.inferText}`);
  //     console.log(`좌표:`);
  //     field.boundingPoly.vertices.forEach((vertex, i) => {
  //       console.log(`   - 꼭짓점 ${i + 1}: x=${vertex.x}, y=${vertex.y}`);
  //     });
  //     console.log('--------------------------');
  // });

      // console.log(fields)

    res.json({
      text,
      filename: file.filename,
      path: `/uploads/${file.filename}`,
    });
  } catch (error) {
    console.error('OCR 실패:', error.response?.data || error.message);
    res.status(500).json({ message: 'OCR 처리 실패' });
  }
});

module.exports = router;
