const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const gameRoutes = require('./routes/game-routes');
const userRoutes = require('./routes/user-routes');
const eventWindowRoutes = require('./routes/eventWindow-routes');
// const slotRoutes = require('./routes/slot-routes');
const transactionRoutes = require('./routes/transaction-routes');
const playerSummaryRoutes = require('./routes/playerSummary-routes');
// const optionSummaryRoutes = require('./routes/optionSummary-routes');
const HttpError = require('./models/http-error');

const app = express();


app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

    next();
});

app.use('/api/game', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/window', eventWindowRoutes);
// app.use('/api/slot', slotRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/playerSummary', playerSummaryRoutes);
// app.use('/api/optionSummary', optionSummaryRoutes);

app.use((req, res, next) => {
    throw new HttpError('Could not find this route.', 404);
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occurred!'});
});

mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-dhan1.gcp.mongodb.net/${process.env.DB_Name}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        }
    )
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log("Server Started");
        });
    })
    .catch(err => {
        console.log(err);
    });
