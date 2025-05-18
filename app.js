const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const db = require('./database/db');
const authRoutes = require('./routes/auth');
const multer = require('multer');

const app = express();
const PORT = 3001;

// multer para upload de arquivos ---- arrumar sec
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.resolve('public/uploads'));
    },
    filename: (req, file, callback) => {
        const time = new Date().getTime();
        callback(null, `${time}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });


const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(session({
    secret: 'meu-segredo',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 600
    }
}));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use('/', authRoutes);
app.use((req, res, next) => {
    res.status(404).render('busca')
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});