const express = require('express');
const path = require('path');
const app = express();
const port = 8080;


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'templates', 'index.html'));
});

app.get('/logout', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'templates', 'logout.html'));
})

app.get('/sign-in', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'templates', 'sign-in.html'));
});

app.get('/sign-up', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'templates', 'sign-up.html'));
});

app.get('/route-optimizer', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'templates', 'route-optimizer.html'));
});

app.get('/saved', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'templates', 'saved-routes.html'));
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
