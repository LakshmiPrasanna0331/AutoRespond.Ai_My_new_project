const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

const uploadDir = path.join(__dirname, 'uploads');
const productsDir = path.join(__dirname, 'products');

// Create directories if they don't exist
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function sanitizeFileName(name) {
  return name.trim().replace(/[^a-z0-9-_]/gi, '_');
}

app.post(
  '/save-product',
  upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'docs', maxCount: 20 },
    { name: 'labels', maxCount: 1 }
  ]),
  (req, res) => {
    console.log('✅ RECEIVED REQUEST');
    console.log('✅ Body:', req.body);
    console.log('✅ Files:', req.files);
    
    try {
      const productName = req.body.name || 'unnamed-product';
      const safeName = sanitizeFileName(productName);

      const productData = {
        name: productName,
        description: req.body.description || '',
        banner: req.files?.banner?.[0]?.filename || null,
        logo: req.files?.logo?.[0]?.filename || null,
        docs: (req.files?.docs || []).map(file => file.filename),
        labels: req.files?.labels?.[0]?.filename || null,
        createdAt: new Date().toISOString()
      };

      const productFilePath = path.join(productsDir, `${safeName}.json`);
      fs.writeFileSync(productFilePath, JSON.stringify(productData, null, 2));

      console.log('✅ Product saved to:', productFilePath);

      res.status(200).json({
        success: true,
        message: 'Product saved successfully',
        data: productData
      });
    } catch (error) {
      console.error('❌ ERROR:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to save product',
        error: error.message
      });
    }
  }
);

app.listen(8051, () => {
  console.log('Server running at http://localhost:8051');
});