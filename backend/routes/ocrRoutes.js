const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const router = express.Router();
require('dotenv').config();

const upload = multer({ dest: 'public/uploads/' });

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
