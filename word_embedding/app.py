from fastapi import FastAPI, Request
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import pymysql
import torch
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


load_dotenv()

# FastAPI 초기화
app = FastAPI()

# CORS 허용 (배포 전 설정 해야함)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")


# 모델 로딩
model = SentenceTransformer("snunlp/KR-SBERT-V40K-klueNLI-augSTS")

# 위험 문장 DB에서 가져오기 및 벡터화 (서버 시작 시 1회 실행)
def load_risky_sentences():
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            db=DB_NAME,
            charset='utf8'
        )
        print("DB 연결 성공")

        cursor = conn.cursor()
        cursor.execute("SELECT risk_keyword FROM risk_keywords")
        results = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()

        print(f"불러온 위험 문장 수: {len(results)}")
        return results

    except Exception as e:
        print("DB 연결 또는 쿼리 실행 실패:", e)
        return []


risky_sentences = load_risky_sentences()
risky_vectors = model.encode(risky_sentences, convert_to_tensor=True)

# 요청 스키마
class AnalyzeRequest(BaseModel):
    sentences: list[str]

# 분석 API
@app.post("/analyze")
async def analyze(input: AnalyzeRequest):
    results = []

    for sentence in input.sentences:
        user_vector = model.encode(sentence, convert_to_tensor=True)
        similarities = util.cos_sim(user_vector, risky_vectors)[0]

        # 유사도 top-1 문장 찾기
        top_k_score, top_k_idx = torch.topk(similarities, k=1)
        top_score = top_k_score.item()
        top_clause = risky_sentences[top_k_idx.item()]

        results.append({
            "sentence": sentence,
            "score": round(top_score, 4),
            "risky": top_score >= 0.75,
            "most_similar_clause": top_clause
        })

    return { "results": results }

