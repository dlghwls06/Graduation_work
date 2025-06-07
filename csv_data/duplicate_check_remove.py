import pandas as pd

# 중복 체크
# # CSV 파일 불러오기
# df = pd.read_csv('/Users/jeongjaeyoon/hojin/Graduation_work_hojin/csv_data/risk_keywords_text_only.csv', encoding='utf-8-sig')

# # text 열만 선택
# df_text_only = df['text'].value_counts()
# duplicates = df_text_only[df_text_only > 1]  # 2번 이상 등장한 경우만 추출

# # 결과 출력
# if duplicates.empty:
#     print("중복된 문장이 없습니다.")
# else:
#     print("중복된 문장이 발견되었습니다:")
#     print(duplicates)

#중복 삭제
# 원본 CSV 불러오기
df = pd.read_csv('/Users/jeongjaeyoon/hojin/Graduation_work_hojin/csv_data/risk_keywords_text_only.csv', encoding='utf-8-sig')

# 중복 제거: 'text' 열 기준으로 중복 제거 (첫 번째 항목만 남김)
df_deduplicated = df.drop_duplicates(subset='text', keep='first')

# 결과 확인
print(f"중복 제거 완료: {len(df)} → {len(df_deduplicated)}개 문장")

# 새로운 파일로 저장
df_deduplicated.to_csv('/Users/jeongjaeyoon/hojin/Graduation_work_hojin/csv_data/risk_keywords_unique.csv', index=False, encoding='utf-8-sig')
print("저장 완료: risk_keywords_unique.csv")
