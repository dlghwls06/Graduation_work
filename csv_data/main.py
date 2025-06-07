import pandas as pd

# # 먼저 utf-8-sig로 시도
# df = pd.read_csv('/Users/jeongjaeyoon/hojin/Graduation_work_hojin/csv_data/risk_keywords.csv', encoding='utf-8-sig')

# print(df.head())

# save_path = '/Users/jeongjaeyoon/hojin/Graduation_work_hojin/csv_data/risk_keywords_clean.csv'

# # CSV 파일 저장
# df.to_csv(save_path, index=False, encoding='utf-8-sig')

import pandas as pd

# CSV 파일 불러오기
df = pd.read_csv('/Users/jeongjaeyoon/hojin/Graduation_work_hojin/csv_data/risk_keywords.csv', encoding='utf-8-sig')

# text 열만 선택
df_text_only = df[['text']]

# 새로운 CSV로 저장
df_text_only.to_csv('/Users/jeongjaeyoon/hojin/Graduation_work_hojin/csv_data/risk_keywords_text_only.csv', index=False, encoding='utf-8-sig')

print("✔️ 텍스트만 추출하여 저장 완료")
