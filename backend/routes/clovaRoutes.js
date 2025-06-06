const express = require('express');
const axios = require('axios');
const router = express.Router();

require('dotenv').config();

router.post('/generate', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      process.env.CLOVA_URL,
      {
        messages: [
          {
            role: 'system',
            content: `당신은 부동산 계약서의 위험 조항을 정확히 식별하고 설명하는 AI입니다.
조건이 불공정하거나, 임차인에게 불리한 조항을 중심으로 판단하세요.
위험 조항이 있다면 그 문장을 그대로 반환하고, 이유도 작성하세요.
위험하지 않은 문장은 반환하지 마세요.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        topP: 0.8,
        topK: 0,
        maxTokens: 500,
        temperature: 0.6,
        repetitionPenalty: 1.1,
        includeAiFilters: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CLOVA_TEST_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('❌ CLOVA API 오류:', error.response?.data || error.message);
    res.status(500).json({ message: 'CLOVA 호출 실패' });
  }
});

module.exports = router;
