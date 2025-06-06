const express = require('express');
const cors = require('cors');
const checklistRoutes = require('./routes/checklist');
const ocrRoutes = require('./routes/ocrRoutes');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/checklist', checklistRoutes);
app.use('/ocr', ocrRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {

  //sadsad
  console.log(`✅ Server is running on port ${PORT}`);
});
