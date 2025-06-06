const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:contractId', async (req, res) => {
  const { contractId } = req.params;

  try {
    // 1. 계약 대제목 단계들 조회 (ex. 계약 전, 계약 체결 시 ...)
    const [phases] = await db.query(
      `SELECT * FROM contract_title_step 
       WHERE contracts_id = ? 
       ORDER BY contract_title_step_id`,
      [contractId]
    );

    const result = [];

    for (const [phaseIdx, phase] of phases.entries()) {
      // 2. 각 대제목 안의 소제목들 (checklist sections)
      const [sections] = await db.query(
        `SELECT * FROM contract_checklist_step 
         WHERE contract_title_step_id = ? 
         ORDER BY contract_checklist_step_id`,
        [phase.contract_title_step_id]
      );

      const sectionItems = [];

      for (const section of sections) {
        // 3. 각 소제목 안의 실제 항목들
        const [items] = await db.query(
          `SELECT * FROM contract_checklist_content 
           WHERE contract_checklist_step_id = ? 
           ORDER BY step_content_id`,
          [section.contract_checklist_step_id]
        );

        sectionItems.push({
          title: section.contracts_step_title,
          details: items.map(i => i.contracts_step_content)
        });
      }

      result.push({
        section: `${phaseIdx + 1}. ${phase.contract_title}`,
        items: sectionItems
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB 조회 실패' });
  }
});

module.exports = router;
