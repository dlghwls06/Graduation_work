const input = `
6. ** " 계약 만기 전 임차인이 퇴실 시 새로운 임차인을 구하고 퇴실한다 (이때 관리비와 중개수수료를 부담한다) " **
- 이유: 이 조항은 임차인이 계약 기간 내에 나가게 될 경우, 새로운 임차인 모집과 관련된 비용까지 모두 부담하게 되어 있어 임차인에게 과도한 경제적 부담을 지우고 있습니다.
- 추천 문장 1: "계약 만기 전에 임차인이 퇴실할 경우, 양 당사자는 상호 협의하여 새로운 임차인을 찾도록 노력하며, 이에 따른 중개 수수료는 양측이 합의한 비율에 따라 분담한다."
- 추천 문장 2: "임차인이 계약 만기 전 퇴실을 원하는 경우, 새로운 임차인을 구하는 과정에서 발생하는 중개 수수료 및 기타 비용은 임대인과 임차인이 동등하게 부담한다."
- 추천 문장 3: "임차인이 계약 만기 이전에 퇴실하고자 할 때, 새로운 임차인 모집의 책임은 임대인과 임차인이 공동으로 하며, 관련 비용 또한 공정하게 나누어서 부담한다."

7. "임차인은 잔금 지급 후 입주하기로 한다."
- 이유: 해당 조항은 관행적인 조건으로 위험하지 않음.
- 추천 문장 1: "..."
- 추천 문장 2: "..."
- 추천 문장 3: "..."
`;

// ✅ 범용 정규표현식: **문장**, "문장", 그냥 문장 모두 지원
const regex =
  /(\d+)\.\s*(?:\*\*\s*"?(.+?)"?\s*\*\*|"(.+?)"|(.+?))\s*\n\s*- 이유:\s*(.*?)(\n\s*- 추천 문장 1:.*?)?(?=\n\d+\.|\n?$)/gs;

const recommendRegex =
  /- 추천 문장 1:\s*(.*?)\n\s*- 추천 문장 2:\s*(.*?)\n\s*- 추천 문장 3:\s*(.*?)(?:\n|$)/s;

const matches = [...input.matchAll(regex)];

console.log("✅ 추출된 위험 문장 개수:", matches.length);

matches.forEach((match, i) => {
  const sentence = (match[2] || match[3] || match[4] || "").trim();
  const explanation = match[5].trim();
  const restBlock = match[6] || "";

  const lowerExp = explanation.toLowerCase();
  if (
    lowerExp.includes("일반적인") ||
    lowerExp.includes("관행") ||
    lowerExp.includes("해당 내용을 언급하지") ||
    lowerExp.includes("위험 조항이 아닙니다") ||
    lowerExp.includes("수정할 필요가 없습니다")
  ) {
    console.log(`🚫 [${i + 1}] 위험 아님:`, sentence);
    return;
  }

  console.log(`\n[${i + 1}]`, sentence);
  console.log("📌 이유:", explanation);

  const recMatch = restBlock.match(recommendRegex);
  if (recMatch) {
    console.log("✅ 추천 문장 1:", recMatch[1]);
    console.log("✅ 추천 문장 2:", recMatch[2]);
    console.log("✅ 추천 문장 3:", recMatch[3]);
  } else {
    console.warn("❌ 추천 문장 파싱 실패:", restBlock);
  }
});
