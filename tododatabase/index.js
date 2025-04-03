const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
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

// Routes

app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos', (err, rows) => {
        if (err) res.status(500).send(err);
        else res.json(rows);
    });
});

app.post('/todos', (req, res) => {
    const { text } = req.body;
    db.run('INSERT INTO todos (text) VALUES (?)', [text], function(err) {
        if (err) res.status(500).send(err);
        else res.json({ id: this.lastID, text, completed: 0 });
    });
});

app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    db.run('UPDATE todos SET completed = ? WHERE id = ?', [completed, id], function(err) {
        if (err) res.status(500).send(err);
        else res.json({ updated: this.changes });
    });
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
        if (err) res.status(500).send(err);
        else res.json({ deleted: this.changes });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'tododatabase.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
