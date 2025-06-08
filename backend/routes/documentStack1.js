const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/result/:situationId', async (req, res) => {
  const { situationId } = req.params;

  try {
    const [ocrRows] = await req.db.execute(
      'SELECT * FROM ocr_result WHERE situation_id = ?',
      [situationId]
    );

    if (ocrRows.length === 0) {
      return res.status(404).json({ message: '데이터 없음' });
    }

    const [fileRows] = await req.db.execute(
      'SELECT file_url, image_width, image_height FROM user_contract_progress WHERE situation_id = ?',
      [situationId]
    );

    if (fileRows.length === 0) {
      return res.status(404).json({ message: '이미지 없음' });
    }

    const coordinates = ocrRows.map(row => {
      const [x, y] = row.one_coordinate?.split(',') ?? [0, 0];
      const [x2, y2] = row.two_coordinate?.split(',') ?? [0, 0];

      return {
        x: parseFloat(x),
        y: parseFloat(y),
        width: Math.abs(parseFloat(x2) - parseFloat(x)),
        height: Math.abs(parseFloat(y2) - parseFloat(y)),
      };
    });

    const imageUrl = fileRows[0].file_url;
    const imageWidth = parseInt(fileRows[0].image_width, 10);
    const imageHeight = parseInt(fileRows[0].image_height, 10);

    return res.json({ imageUrl, coordinates, imageWidth, imageHeight });
  } catch (err) {
    console.error('OCR 결과 가져오기 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
