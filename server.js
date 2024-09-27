const express = require("express");
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = 1234;

// Middleware to serve static files and parse request bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'postgress', // Make sure this is the correct password
    database: 'postgres',
    port: 5432,
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to fetch all employees
app.get('/employees', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM public.employee');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to add a new employee
app.post('/employees', async (req, res) => {
    const { Name, Age, Sex, MarritalStatus } = req.body;
    const query = 'INSERT INTO public.employee("Name", "Age", "Sex", "Marrital status") VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [Name, Age, Sex, MarritalStatus];

    try {
        const results = await pool.query(query, values);
        res.status(201).json(results.rows[0]);
    } catch (error) {
        console.error('Error inserting employee:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get employee by ID
app.get('/employees/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM public.employee WHERE "id" = $1';
    const values = [id];

    try {
        const results = await pool.query(query, values);
        if (results.rows.length > 0) {
            res.status(200).json(results.rows[0]);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update employee
app.put('/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, Age, Sex, MarritalStatus } = req.body;
    const query = 'UPDATE public.employee SET "Name" = $1, "Age" = $2, "Sex" = $3, "Marrital status" = $4 WHERE "id" = $5 RETURNING *';
    const values = [Name, Age, Sex, MarritalStatus, id];

    try {
        const results = await pool.query(query, values);
        if (results.rows.length > 0) {
            res.status(200).json(results.rows[0]);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
