const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

router.post('/generate', async (req, res) => {
  const { risky_sentences, situation_id } = req.body;
  console.log('시츄에이션아이디', situation_id);

  if (!risky_sentences || !Array.isArray(risky_sentences)) {
    return res.status(400).json({ message: 'risky_sentences가 유효하지 않음' });
  }

  if (!situation_id) {
    return res.status(400).json({ message: 'situation_id가 필요합니다.' });
  }

  const message = risky_sentences.map((item) => item.sentence).join('\n\n');

  try {
    const response = await axios.post(
      process.env.CLOVA_URL,
      {
        messages: [
          {
            role: 'system',
            content: `
당신은 부동산 임대차 계약서의 위험 조항을 정확히 식별하고 해설하는 AI입니다.

아래 지침을 반드시 따르세요:

1. 위험 조항은 임차인에게 과도한 부담, 불공정한 책임, 일방적인 손해가 있는 조항을 의미합니다.
2. 아무리 위험해 보여도, 부동산 계약에서 일반적이고 관행적인 조건(예: 잔금 후 입주, 보증금 반환, 서명 등)은 절대 위험 조항으로 포함하지 마세요.
3. 위험하지 않은 조항은 어떤 이유로도 출력하지 마세요.
   ❌ "위험하지 않다"는 문장도 금지  
   ❌ 번호와 문장만 출력하는 것도 금지  
   ❌ 아무 말도 하지 마세요
4. 위험하다고 판단되면 아래 형식을 무조건 따르세요:
   - 조항 번호는 반드시 '숫자.' 형식으로 시작해야 합니다 (예: '1.', '2.', '3.' 등)
   - 추천 문장은 반드시 **3개**를 작성해야 합니다. (2개 이하 절대 금지)
5. 위험 문장 원문은 절대 수정하지 마세요. 그대로 출력하세요.

---

형식 예시:
***
1. "위험 문장 원문"
- 이유: 이 문장이 왜 위험한지 설명
- 추천 문장 1: 보다 공정한 문장 예시
- 추천 문장 2: 보다 공정한 문장 예시
- 추천 문장 3: 보다 공정한 문장 예시
***

위 형식 예시는 무조건 따르세요.
일반적 조건은 출력하지 마세요. 
위험하지 않은 문장은 절대 포함하지 마세요.
`
          },
          {
            role: 'user',
            content: message
          }
        ],
        topP: 0.8,
        topK: 0,
        maxTokens: 600,
        temperature: 0.6,
        repetitionPenalty: 1.1,
        includeAiFilters: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CLOVA_TEST_KEY}`,
          Accept: 'application/json'
        }
      }
    );

    const clovaContent = response.data?.result?.message?.content;
    console.log('클로바 응답내용', clovaContent);
    if (!clovaContent) {
      return res.status(500).json({ message: 'CLOVA 응답이 비어있습니다.' });
    }

    const db = req.db;
    console.log('디비연결 시작');
    const connection = await db.getConnection();
    const inserted = [];

    try {
  console.log('CLOVA 응답 파싱 시작');

  const regex =
    /(\d+)\.\s*(?:\*\*\s*"?(.+?)"?\s*\*\*|"(.+?)"|(.+?))\s*\n\s*- 이유:\s*(.*?)(\n\s*- 추천 문장 1:.*?)?(?=\n\d+\.|\n?$)/gs;

  const recommendRegex =
    /- 추천 문장 1:\s*(.*?)\n\s*- 추천 문장 2:\s*(.*?)\n\s*- 추천 문장 3:\s*(.*?)(?:\n|$)/s;

  const matches = [...clovaContent.matchAll(regex)];

  for (const match of matches) {
    const number = match[1]; // 조항 번호: '1', '2' 등
    const sentenceBody = (match[2] || match[3] || match[4] || '').trim(); // 실제 문장
    const fullSentence = `${number}. ${sentenceBody}`; // ✅ 번호 포함된 문장
    const explanation = match[5].trim();
    const restBlock = match[6] || '';

    const lowerExp = explanation.toLowerCase();
    if (
      lowerExp.includes('일반적인') ||
      lowerExp.includes('관행') ||
      lowerExp.includes('해당 내용을 언급하지') ||
      lowerExp.includes('위험 조항이 아닙니다') ||
      lowerExp.includes('문제가 없어') ||
      lowerExp.includes('문제없어') ||
      lowerExp.includes('해당 조항 자체') ||
      lowerExp.includes('문제 없어') ||
      lowerExp.includes('수정할 필요가 없습니다')
    ) {
      console.log(`🚫 필터링된 문장 (${number}): ${sentenceBody}`);
      continue;
    }

    const [result] = await connection.execute(
      `INSERT INTO risk_analysis_cases (situation_id, sentence, explanation) VALUES (?, ?, ?)`,
      [situation_id, fullSentence, explanation] // 번호 포함된 문장 저장
    );

    const riskId = result.insertId;
    inserted.push(riskId);

    const recMatch = restBlock.match(recommendRegex);
    if (recMatch) {
      const recs = [recMatch[1], recMatch[2], recMatch[3]];
      for (const r of recs) {
        await connection.execute(
          `INSERT INTO risk_recommend_sentences (risk_analysis_id, recommend_sentence) VALUES (?, ?)`,
          [riskId, r.trim()]
        );
      }
    } else {
      console.warn(`❌ 추천 문장 파싱 실패 (${number}):`, restBlock);
    }
  }

  res.json({
    message: '위험 조항 저장 완료',
    savedCount: inserted.length,
    savedIds: inserted
  });
} finally {
  connection.release();
}

  } catch (error) {
    console.error('❌ CLOVA API 오류:', error.response?.data || error.message);
    res.status(500).json({ message: 'CLOVA 호출 또는 저장 실패' });
  }
});

module.exports = router;


// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// require('dotenv').config();

// router.post('/generate', async (req, res) => {
//   const { risky_sentences } = req.body;

//   if (!risky_sentences || !Array.isArray(risky_sentences)) {
//     return res.status(400).json({ message: 'risky_sentences가 유효하지 않음' });
//   }

//   // 위험 문장만 추출해서 하나의 문자열로 합치기
//   const message = risky_sentences.map(item => item.sentence).join('\n\n');

//   try {
//     const response = await axios.post(
//       process.env.CLOVA_URL,
//       {
//         messages: [
//           {
//             role: 'system',
//             content: `당신은 부동산 계약서의 위험 조항을 정확히 식별하고 설명하는 AI입니다.
// 조건이 불공정하거나, 임차인에게 불리한 조항을 중심으로 판단하세요.
// 위험 조항이 있다면 그 문장을 그대로 반환하고, 이유도 작성하세요.
// 위험하지 않은 문장은 반환하지 마세요.`
//           },
//           {
//             role: 'user',
//             content: message
//           }
//         ],
//         topP: 0.8,
//         topK: 0,
//         maxTokens: 500,
//         temperature: 0.6,
//         repetitionPenalty: 1.1,
//         includeAiFilters: true
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${process.env.CLOVA_TEST_KEY}`,
//           'Accept': 'application/json'
//         }
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error('❌ CLOVA API 오류:', error.response?.data || error.message);
//     res.status(500).json({ message: 'CLOVA 호출 실패' });
//   }
// });

// module.exports = router;
