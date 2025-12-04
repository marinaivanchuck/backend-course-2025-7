// ======================= 
// LAB 6 — PART 1 
// Commander.js arguments + server initialization 
// ======================= 

const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const { program } = require('commander');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// =======================
// SWAGGER
// =======================
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// ---------------------------------------------- 
// 1. Параметри командного рядка 
// ---------------------------------------------- 
program
    .requiredOption('--host <host>', 'Server host')
    .requiredOption('--port <port>', 'Server port', value => parseInt(value, 10))
    .requiredOption('--cache <path>', 'Cache directory');

program.parse(process.argv);
const options = program.opts();

const HOST = options.host;
const PORT = options.port;
const CACHE_DIR = path.resolve(options.cache);

// ---------------------------------------------- 
// 2. Перевірка/створення директорії кешу 
// ---------------------------------------------- 
if (!fs.existsSync(CACHE_DIR)) {
    console.log(`Cache directory does not exist. Creating: ${CACHE_DIR}`);
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const PHOTOS_DIR = path.join(CACHE_DIR, 'photos');
if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

const DATA_FILE = path.join(CACHE_DIR, 'data.json');
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ items: [] }, null, 2));
}

// ---------------------------------------------- 
// HELPER FUNCTIONS 
// ---------------------------------------------- 
function readDB() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeDB(db) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// Multer для прийому файлів 
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, PHOTOS_DIR),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// ---------------------------------------------- 
// 3. Ініціалізуємо express 
// ---------------------------------------------- 
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================= 
// LAB 6 — PART 2 — API 
// ======================= 

// HTML Forms
app.get('/RegisterForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'RegisterForm.html'));
});

app.get('/SearchForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'SearchForm.html'));
});

// POST /register
app.post('/register', upload.single('photo'), (req, res) => {
    const { inventory_name, description = '' } = req.body;

    if (!inventory_name || inventory_name.trim() === '') {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'inventory_name is required' });
    }

    const id = uuidv4();
    const db = readDB();

    let photoFilename = null;

    if (req.file) {
        const ext = path.extname(req.file.originalname) || '.jpg';
        photoFilename = `${id}${ext}`;
        fs.renameSync(req.file.path, path.join(PHOTOS_DIR, photoFilename));
    }

    const item = {
        id,
        inventory_name,
        description,
        photo: photoFilename ? `/inventory/${id}/photo` : null,
        created_at: new Date().toISOString()
    };

    db.items.push(item);
    writeDB(db);

    res.status(201).json(item);
});

// GET /inventory
app.get('/inventory', (req, res) => {
    const db = readDB();
    res.status(200).json(db.items);
});

// GET /inventory/:id
app.get('/inventory/:id', (req, res) => {
    const db = readDB();
    const item = db.items.find(i => i.id === req.params.id);

    if (!item) return res.status(404).json({ error: 'Not found' });

    res.status(200).json(item);
});

// PUT /inventory/:id
app.put('/inventory/:id', (req, res) => {
    const db = readDB();
    const item = db.items.find(i => i.id === req.params.id);

    if (!item) return res.status(404).json({ error: 'Not found' });

    const { inventory_name, description } = req.body;

    if (inventory_name !== undefined) item.inventory_name = inventory_name;
    if (description !== undefined) item.description = description;

    writeDB(db);
    res.status(200).json(item);
});

// GET /inventory/:id/photo
app.get('/inventory/:id/photo', (req, res) => {
    const db = readDB();
    const item = db.items.find(i => i.id === req.params.id);

    if (!item || !item.photo) return res.status(404).json({ error: 'Photo not found' });

    const filename = fs.readdirSync(PHOTOS_DIR).find(f => f.startsWith(req.params.id));

    if (!filename) return res.status(404).json({ error: 'Photo not found' });

    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(path.join(PHOTOS_DIR, filename));
});

// PUT /inventory/:id/photo
app.put('/inventory/:id/photo', upload.single('photo'), (req, res) => {
    const db = readDB();
    const item = db.items.find(i => i.id === req.params.id);

    if (!item) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Not found' });
    }

    if (!req.file) return res.status(400).json({ error: 'photo is required' });

    const oldPhoto = fs.readdirSync(PHOTOS_DIR).find(f => f.startsWith(req.params.id));
    if (oldPhoto) fs.unlinkSync(path.join(PHOTOS_DIR, oldPhoto));

    const ext = path.extname(req.file.originalname) || '.jpg';
    const newName = `${req.params.id}${ext}`;

    fs.renameSync(req.file.path, path.join(PHOTOS_DIR, newName));

    item.photo = `/inventory/${req.params.id}/photo`;
    writeDB(db);

    res.status(200).json(item);
});

// DELETE /inventory/:id
app.delete('/inventory/:id', (req, res) => {
    const db = readDB();
    const index = db.items.findIndex(i => i.id === req.params.id);

    if (index === -1) return res.status(404).json({ error: 'Not found' });

    const photo = fs.readdirSync(PHOTOS_DIR).find(f => f.startsWith(req.params.id));
    if (photo) fs.unlinkSync(path.join(PHOTOS_DIR, photo));

    db.items.splice(index, 1);
    writeDB(db);

    res.status(200).json({ message: 'Deleted' });
});

// POST /search
app.post('/search', (req, res) => {
    const { id, has_photo } = req.body;

    const db = readDB();
    const item = db.items.find(i => i.id === id);

    if (!item) return res.status(404).json({ error: 'Not found' });

    const result = { ...item };

    if (has_photo) {
        result.description += ` Photo: ${item.photo || 'none'}`;
    }

    res.status(200).json(result);
});

// =======================
// SWAGGER (має бути ПЕРЕД 405!)
// =======================
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --------------------------- 
// 405 Method Not Allowed 
// --------------------------- 
app.all('*', (req, res) => {
    res.status(405).json({ error: 'Method not allowed' });
});

// --------------------------- 
// Part 1 — тестовий endpoint 
// --------------------------- 
app.get('/', (req, res) => {
    res.send('Server is running (Lab 6 — Part 1 completed)');
});

// ---------------------------------------------- 
// 4. Запуск HTTP сервера 
// ---------------------------------------------- 
const server = http.createServer(app);

server.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
    console.log(`Using cache directory: ${CACHE_DIR}`);
});
