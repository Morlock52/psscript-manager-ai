const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 7002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://127.0.0.1:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('uploads'));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('Multer file filter - Field name:', file.fieldname);
    console.log('Multer file filter - Original name:', file.originalname);
    cb(null, true);
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/scripts', (req, res) => {
  res.json({ 
    scripts: uploadedScripts, 
    total: uploadedScripts.length 
  });
});

// Handle both /api/scripts/upload and /api/scripts endpoints
const handleUpload = (req, res) => {
  console.log('File upload request received');
  console.log('Files:', req.files);
  console.log('File:', req.file);
  console.log('Body:', req.body);
  
  // Handle both single file and multiple files
  const uploadedFile = req.file || (req.files && req.files[0]);
  
  if (!uploadedFile) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const scriptData = {
    id: Date.now(),
    filename: uploadedFile.originalname,
    path: uploadedFile.path,
    size: uploadedFile.size,
    uploadedAt: new Date().toISOString(),
    name: req.body.title || req.body.name || uploadedFile.originalname,
    title: req.body.title || uploadedFile.originalname,
    description: req.body.description || '',
    category: req.body.category || 'General',
    content: req.body.content || '',
    is_public: req.body.is_public === 'true',
    analyze_with_ai: req.body.analyze_with_ai === 'true',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Store in memory
  uploadedScripts.push(scriptData);

  console.log('Script saved:', scriptData);
  res.json({ 
    message: 'Script uploaded successfully', 
    script: scriptData 
  });
};

// Support different field names that frontend might use
app.post('/api/scripts/upload', upload.any(), handleUpload);
app.post('/api/scripts', upload.any(), handleUpload);

// Store uploaded scripts in memory (in a real app, this would be a database)
let uploadedScripts = [];

app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'General', description: 'General scripts' },
    { id: 2, name: 'System Administration', description: 'System admin scripts' },
    { id: 3, name: 'Network', description: 'Network scripts' },
    { id: 4, name: 'Security', description: 'Security scripts' }
  ]);
});

app.get('/api/tags', (req, res) => {
  res.json([
    { id: 1, name: 'automation' },
    { id: 2, name: 'monitoring' },
    { id: 3, name: 'security' },
    { id: 4, name: 'networking' }
  ]);
});

// Clear cache endpoint (must be before /:id route)
app.get('/api/scripts/clear-cache', (req, res) => {
  res.json({ message: 'Cache cleared successfully' });
});

// Get specific script by ID
app.get('/api/scripts/:id', (req, res) => {
  const scriptId = parseInt(req.params.id);
  const script = uploadedScripts.find(s => s.id === scriptId);
  
  if (!script) {
    return res.status(404).json({ error: 'Script not found' });
  }
  
  res.json(script);
});

// Get script analysis (mock data)
app.get('/api/scripts/:id/analysis', (req, res) => {
  const scriptId = parseInt(req.params.id);
  const script = uploadedScripts.find(s => s.id === scriptId);
  
  if (!script) {
    return res.status(404).json({ error: 'Script not found' });
  }
  
  res.json({
    id: scriptId,
    security_score: 85,
    complexity_score: 72,
    best_practices_score: 90,
    issues: [
      { type: 'warning', message: 'Consider adding error handling for network operations', line: 15 }
    ],
    recommendations: [
      'Add try-catch blocks around network calls',
      'Consider using approved verbs for function names'
    ],
    analysis_date: new Date().toISOString()
  });
});

// Get similar scripts (mock data)
app.get('/api/scripts/:id/similar', (req, res) => {
  res.json([]);
});

// Start server
app.listen(port, () => {
  console.log(`Simple backend running on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});