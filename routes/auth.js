const express = require('express');
const db = require('../database/db');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { error } = require('console');
const { off } = require('process');

// Configuração do multer para upload de arquivos
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

// Resto das rotas...
router.get('/', (req, res) => {
    res.redirect('login');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
        if (err || !user) {
            console.log('Usuário não encontrado ou erro na consulta');
            return res.redirect('/login');
        }

        req.session.user = user;

        console.log('Usuário autenticado', req.session);

        if (user.role === 'admin') {
            return res.redirect('/dashboard');
        } else {
            return res.redirect('/dashboard');
        }
    });
});

router.get('/dashboard', (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.status(403).render('forbiden');
    }

    if (user.role === 'admin') {
        db.all('SELECT * FROM users', (err, users) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao buscar usuários.');
            }

            res.render('dashboard', { user, users,});
        });
    } else {
        res.render('dashboard', { user, users: []});
    }
});

router.get('/register', (req, res) => {
    //const user = req.session.user;  
    //console.log(user); // Debug: veja o que realmente está na sessão

    //if (user && user.role === 'admin') { 
      //  res.render('register', { user });
    //} else {
        //res.status(403).render('forbiden'); // Código correto para acesso negado
    //}
    res.render('register')

});


router.get('/plataforma', (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.status(403).render('forbiden');
    }

    // Caminhos dos vídeos
    const videos = [
        { path: '/videos/videoplayback.mp4', title: 'Aula 1', desc: 'Anora, uma jovem stripper do Brooklyn, conhece o filho de um oligarca russo na boate em que trabalha. Os dois engatam um improvável romance e Anora vive uma história de Cinderela contemporânea por alguns dias. Em Las Vegas, o casal resolve consumar o relacionamento intempestivo e se casa de forma impulsiva. Quando a notícia do casamento chega à Rússia, o conto de fadas é rapidamente ameaçado: os pais do jovem partem para Nova York com a irredutível intenção de anular o matrimônio.'},
        { path: '/videos/videoplayback1.mp4', title: 'Aula 2', desc: 'Anora, uma jovem stripper do Brooklyn, conhece o filho de um oligarca russo na boate em que trabalha. Os dois engatam um improvável romance e Anora vive uma história de Cinderela contemporânea por alguns dias. Em Las Vegas, o casal resolve consumar o relacionamento intempestivo e se casa de forma impulsiva. Quando a notícia do casamento chega à Rússia, o conto de fadas é rapidamente ameaçado: os pais do jovem partem para Nova York com a irredutível intenção de anular o matrimônio' },
        { path: '/videos/videoplayback.mp4', title: 'Aula 3', desc: 'No início da década de 1970, o Brasil enfrenta o endurecimento da ditadura militar. No Rio de Janeiro, a família Paiva - Rubens, Eunice e seus cinco filhos - vive à beira da praia em uma casa de portas abertas para os amigos. Um dia, Rubens Paiva é levado por militares à paisana e desaparece. Eunice - cuja busca pela verdade sobre o destino de seu marido se estenderia por décadas - é obrigada a se reinventar e traçar um novo futuro para si e seus filhos.' },
        { path: '/videos/videoplayback1.mp4', title: 'Aula 4000000000' },
        { path: '/videos/videoplayback.mp4', title: 'Como tirar cabeça' },
    ];

    // Passando os vídeos para o template
    res.render('plataforma', { videos, user });
});

router.post('/register', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT COUNT(*) AS total FROM users', (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao verificar usuários existentes.');
        }

        const totalUsers = row.total;
        const role = totalUsers === 0 ? 'admin' : 'user';

        db.get('SELECT * FROM users WHERE username = ?', [username], (err, existingUser) => {
            if (existingUser) {
                return res.send('Usuário já existe.');
            }

            db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Erro ao registrar usuário.');
                }

                res.redirect('/login');
            });
        });
    });
});

router.post('/delete-user', (req, res) => {
    const userId = req.body.userId;
    const user = req.session.user;

    if (!user || user.role !== 'admin') {
        return res.status(403).send('Acesso negado.');
    }

    db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao remover usuário.');
        }

        res.redirect('/dashboard');
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Erro ao destruir a sessão.');
        }

        res.clearCookie('connect.sid');

        res.redirect('/login');
    });
});

router.post('/update-progress', (req, res) => {
    const user = req.session.user;

    if (!user) {
        console.log('Acesso negado: usuário não autenticado.');
        return res.status(403).send('Acesso negado.');
    }

    const { progress } = req.body;
    console.log('Progresso recebido no servidor:', progress);

    // Verifica se o progresso é válido
    const progressValue = Math.min(Math.max(parseFloat(progress), 0), 100);
    console.log('Progresso processado:', progressValue);

    // Atualiza o progresso no banco de dados
    db.run('UPDATE users SET progress = ? WHERE id = ?', [progressValue, user.id], (err) => {
        if (err) {
            console.error('Erro ao atualizar o progresso:', err);
            return res.status(500).send('Erro ao atualizar o progresso.');
        }

        console.log('Progresso atualizado com sucesso para o usuário:', user.id);
        res.sendStatus(200);
    });
});

router.get('/modulo1', (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.status(403).render('forbiden');
    }

    // Caminhos dos vídeos
    const videos = [
        { path: '/videos/videoplayback.mp4', title: 'Aula 1' },
        { path: '/videos/videoplayback1.mp4', title: 'Aula 2' },
        { path: '/videos/videoplayback.mp4', title: 'Aula 3' },
        { path: '/videos/videoplayback1.mp4', title: 'Aula 4000000000' },
        { path: '/videos/videoplayback.mp4', title: 'Como tirar cabeça' },
    ];

    // Passando os vídeos para o template
    res.render('modulo1', { videos, user });
});

router.get('/get-progress', (req, res) => {
    const user = req.session.user;

    if (!user) {
        return res.status(403).send('Acesso negado.');
    }

    db.get('SELECT progress FROM users WHERE id = ?', [user.id], (err, row) => {
        if (err) {
            console.error('Erro ao buscar o progresso:', err);
            return res.status(500).send('Erro ao buscar o progresso.');
        }

        res.json({ progress: row ? row.progress : 0 });
    });
});

router.get('/artigos', (req, res) => {
    res.render('artigos');
});

router.get('/upload', (req, res) => { 
    const user = req.session.user;
    console.log(user)
    res.render('upload', { user });
;
});

router.post('/upload', (req, res, next) => {
    if (!req.session.user) {
        return res.status(403).render('forbiden')
    }
    next();
}, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Nenhum arquivo foi enviado.');
        }

        // Salva o caminho da foto de perfil no banco de dados
        const profilePicturePath = `/uploads/${req.file.filename}`;
        const userId = req.session.user.id;

        // Atualizar o caminho da imagem no banco de dados
        db.run('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePicturePath, userId], (err) => {
            if (err) {
                console.error('Erro ao atualizar foto de perfil:', err);
                return res.status(500).send('Erro ao atualizar foto de perfil.');
            }

            // Atualiza a sessão do usuário com a nova foto de perfil
            req.session.user.profile_picture = profilePicturePath;

            res.redirect('upload');
        });
    } catch (error) {
        res.status(500).send('Erro ao processar o upload.');
    }
});

router.get('/usuario/:id', (req, res) => {
    const userId = req.params.id;

    // Primeiro busca o usuário
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(404).send('Usuário não encontrado.');
        }

        // Depois busca os resultados dos quizzes desse usuário
        db.all(`
            SELECT module, correct_answers, total_questions
            FROM quiz_results
            WHERE user_id = ?
        `, [userId], (err, results) => {
            if (err) {
                console.error('Erro ao buscar resultados do quiz:', err);
                return res.status(500).send('Erro ao carregar perfil do usuário.');
            }

            res.render('usuario', {
                userData: user,
                quizResults: results
            });
        });
    });
});


// Mostrar o quiz do módulo 1
router.get('/modulo1/quiz', (req, res) => {
    if (!req.session.user) {
        return res.status(403).render('forbiden');
    }

    res.render('modulos/modulo1_quiz');
});

// Processar respostas do quiz do módulo 1
router.post('/modulo1/quiz', (req, res) => {
    if (!req.session.user) {
        return res.status(403).render('forbiden');
    }

    const userId = req.session.user.id;
    const respostas = req.body;

    // Gabarito
    const gabarito = {
        q1: 'Brasília',
        q2: '4'
    };

    let corretas = 0;
    let total = Object.keys(gabarito).length;

    for (let pergunta in gabarito) {
        if (respostas[pergunta] === gabarito[pergunta]) {
            corretas++;
        }
    }

    // Salvar no banco
    db.run(`
        INSERT INTO quiz_results (user_id, module, correct_answers, total_questions)
        VALUES (?, ?, ?, ?)
    `, [userId, 'modulo1', corretas, total], (err) => {
        if (err) {
            console.error('Erro ao salvar resultados do quiz:', err);
            return res.status(500).send('Erro ao salvar resultado.');
        }

        res.send(`Você acertou ${corretas} de ${total} perguntas. Resultado salvo.`);
    });
});


router.get('/modulo2/quiz', (req, res) => {
    if (!req.session.user) {
        return res.status(403).render('forbiden');
    }

    res.render('modulo2_quiz');
});


router.post('/modulo2/quiz', (req, res) => {
    if (!req.session.user) {
        return res.status(403).render('forbiden');
    }

    const userId = req.session.user.id;
    const respostas = req.body;

    // Gabarito
    const gabarito = {
        q1: 'paris',
        q2: 'azul'
    };

    let corretas = 0;
    let total = Object.keys(gabarito).length;

    for (let pergunta in gabarito) {
        if (respostas[pergunta] === gabarito[pergunta]) {
            corretas++;
        }
    }

    // Salvar no banco
    db.run(`
        INSERT INTO quiz_results (user_id, module, correct_answers, total_questions)
        VALUES (?, ?, ?, ?)
    `, [userId, 'modulo2', corretas, total], (err) => {
        if (err) {
            console.error('Erro ao salvar resultados do quiz:', err);
            return res.status(500).send('Erro ao salvar resultado.');
        }

        res.send(`Você acertou ${corretas} de ${total} perguntas. Resultado salvo.`);
    });
});


module.exports = router;