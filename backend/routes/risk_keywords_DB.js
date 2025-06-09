const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

// const filePath = path.join(__dirname, '/Users/jeongjaeyoon/hojin/Graduation_work_hojin/csv_data/risk_keywords_text_only.csv');
const filePath = '/Users/jeongjaeyoon/hojin/Graduation_work_hojin/csv_data/risk_keywords_text_only.csv';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

async function insertKeywords() {
    const keywords = [];

    // 1. CSV 읽기
    fs.createReadStream(filePath)
        .pipe(
            csv({
                mapHeaders: ({ header }) => header.trim().replace('\uFEFF', ''),
            })
        )
        .on('data', (row) => {
            const value = row.text;
            console.log('추출된 텍스트:', value); // 꼭 찍어보세요
            if (value && value.trim()) {
                keywords.push(value.trim());
            }
        })
        .on('end', async () => {
            console.log(`${keywords.length}개의 키워드를 불러왔습니다.`);

            const connection = await pool.getConnection();
            try {
                for (const keyword of keywords) {
                    await connection.query('INSERT INTO risk_keywords (risk_keyword) VALUES (?)', [keyword]);
                }
                console.log('DB에 키워드 삽입 완료!');
            } catch (err) {
                console.error('삽입 중 오류 발생:', err);
            } finally {
                connection.release();
            }
        });
}

insertKeywords();
