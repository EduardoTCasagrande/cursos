const db = require('./db');

db.serialize(() => {
    // Criação da tabela de resultados de quizzes por módulo
    db.run(`
        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            module TEXT,
            correct_answers INTEGER,
            total_questions INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);


    // Verifica se a coluna `profile_picture` já existe
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error('Erro ao verificar colunas da tabela:', err);
            return;
        }

        const hasProfilePictureColumn = rows.some(column => column.name === 'profile_picture');

        if (!hasProfilePictureColumn) {
            db.run('ALTER TABLE users ADD COLUMN profile_picture TEXT', (err) => {
                if (err) {
                    console.error('Erro ao adicionar coluna `profile_picture`:', err);
                } else {
                    console.log('Coluna `profile_picture` adicionada com sucesso.');
                }
            });
        } else {
            console.log('Coluna `profile_picture` já existe.');
        }
    });
});

console.log('Banco de dados inicializado.');