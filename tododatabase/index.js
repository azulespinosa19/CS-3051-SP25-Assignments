const mustacheExpress = require('mustache-express');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname); // Template lives in same folder
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <--- Needed for form posts
app.use(express.static('public'));

// SQLite DB setup
const db = new sqlite3.Database('./todos.db', (err) => {
    if (err) console.error(err.message);
    else console.log("Connected to SQLite DB.");
});

db.run(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0
    )
`);

// ====== Routes ======

// Render page with todos using Mustache
app.get('/', (req, res) => {
    db.all('SELECT * FROM todos', (err, rows) => {
        if (err) return res.status(500).send(err.message);
        console.log("Rendering Mustache with rows:", rows);
        res.render('tododatabase', { todos: rows });
    });
});

// Add new todo from form
app.post('/todos', (req, res) => {
    const { text } = req.body;
    db.run('INSERT INTO todos (text) VALUES (?)', [text], () => {
        res.redirect('/');
    });
});

// Toggle completed status
app.post('/todos/:id/toggle', (req, res) => {
    const id = req.params.id;
    db.get('SELECT completed FROM todos WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        const newStatus = row.completed ? 0 : 1;
        db.run('UPDATE todos SET completed = ? WHERE id = ?', [newStatus, id], () => {
            res.redirect('/');
        });
    });
});

// Delete a todo
app.post('/todos/:id/delete', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM todos WHERE id = ?', [id], () => {
        res.redirect('/');
    });
});

// ====== Optional JSON API routes (if you still want them) ======

// Get todos as JSON (for testing)
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos', (err, rows) => {
        if (err) res.status(500).send(err);
        else res.json(rows);
    });
});

// Mark complete (API-style)
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    db.run('UPDATE todos SET completed = ? WHERE id = ?', [completed, id], function (err) {
        if (err) res.status(500).send(err);
        else res.json({ updated: this.changes });
    });
});

// Delete via API
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
        if (err) res.status(500).send(err);
        else res.json({ deleted: this.changes });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});