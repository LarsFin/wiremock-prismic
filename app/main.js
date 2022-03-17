require('dotenv').config();

const express = require('express');

const app = express();
const port = 3000;

const config = {
    prismic: {
        endpoint: process.env.PRISMIC_ENDPOINT,
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    },
}

const prismic = require('./prismic');

app.use(express.json());

app.get('/documents/:uid', (req, res) => {
    prismic.getDocument(config.prismic, req.params.uid)
    .then(q => {
        if (q.err !== undefined) {
            console.error(q.err.message);
            res.status(q.status).send('query failed');
            return;
        }

        res.status(q.status).send(q.result);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('query failed');
    })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
