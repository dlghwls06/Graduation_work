const express = require('express');
const cors = require('cors');
const checklistRoutes = require('./routes/checklist');
const ocrRoutes = require('./routes/ocrRoutes');
const clovaRoutes = require('./routes/clovaRoutes');
const documentsRoutes = require('./routes/documents')
const path = require('path');

const mysql = require('mysql2/promise'); // ✅ 이 줄이 꼭 먼저 있어야 함
require('dotenv').config();



const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 반드시 있어야 함!


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// MySQL 연결을 모든 라우터에서 사용할 수 있도록 설정
app.use((req, res, next) => {
  req.db = pool;
  next();
});


app.use('/checklist', checklistRoutes);
app.use('/ocr', ocrRoutes);
app.use('/clova', clovaRoutes);
app.use('/document', documentsRoutes);




async function testDBConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log('✅ DB 연결 성공!');
  } catch (err) {
    console.error('❌ DB 연결 실패:', err.message);
    process.exit(1); // 실패 시 서버 종료
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {

  //sadsad
  console.log(`✅ Server is running on port ${PORT}`);
  await testDBConnection();
});
