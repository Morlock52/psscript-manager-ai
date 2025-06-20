import express from 'express';
const app = express();
app.get('/ping', (req, res) => res.send('pong'));
app.listen(4000, () => console.log('Minimal server running on 4000'));
