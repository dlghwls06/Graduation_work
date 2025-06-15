from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import pymysql
import torch
import os
import httpx
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

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

model = SentenceTransformer("snunlp/KR-SBERT-V40K-klueNLI-augSTS")

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

class AnalyzeRequest(BaseModel):
    situation_id: int
    sentences: list[str]

@app.post("/analyze")
async def analyze(input: AnalyzeRequest):
    results = []
    risky_only = []

    for sentence in input.sentences:
        user_vector = model.encode(sentence, convert_to_tensor=True)
        similarities = util.cos_sim(user_vector, risky_vectors)[0]

        top_k_score, top_k_idx = torch.topk(similarities, k=1)
        top_score = top_k_score.item()
        top_clause = risky_sentences[top_k_idx.item()]
        is_risky = top_score >= 0.75

        result = {
            "sentence": sentence,
            "score": round(top_score, 4),
            "risky": is_risky,
            "most_similar_clause": top_clause
        }

        results.append(result)

        if is_risky:
            risky_only.append(result)

    # risky 문장들만 Node.js 서버로 POST 전송 (CLOVA LLM)
    if risky_only:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "http://192.168.1.243:4000/clova/generate",
                    json={
                        "situation_id": input.situation_id,  # 여기에 포함!
                        "risky_sentences": risky_only
                        }
                )
                
                print("Node.js 응답 상태:", response.status_code)
                print("Node.js 응답 내용:", response.text)
            except httpx.HTTPError as e:
                print("시츄에이션아읻이", input.situation_id)

            except Exception as e:
                print("Node.js 서버 통신 실패 (기타 오류):", e)

    return {
        "message": "모든 분석이 완료되었습니다.",
        "results": results
        }
