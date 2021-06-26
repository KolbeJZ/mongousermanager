/*
HOW TO START THE APP
 In the terminal, run 'node app.js'.
*/

const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const dbConnectionString = "mongodb://localhost:27017/usermongo";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
mongoose.connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.set('useFindAndModify', false) 
const database = mongoose.connection;
database.once("open", () => {
    console.log("Database connected");
});
const userSchema = new mongoose.Schema({
    userID: String,
    first: String,
    last: String,
    email: String,
    age: String
})
const users = mongoose.model('users', userSchema)
app.get('/', (req, res) => {
    users.find({}, (err, data) => {
        res.render('index', { users: data })
    })
})

app.post('/search', (req, res) => { 
    let search = req.body.search.toLowerCase()
    users.find({}, (err, data) => {
        let filteredList = data.filter(i => {
            let first = i.first.toLowerCase()
            let last = i.last.toLowerCase()
            return first == search || last == search
        })
        res.render('index', { users: filteredList })
    })
})

let sorter = false;
app.get('/sort', (req, res) => {
    function compareAsc(a, b) { 
        const user1 = a.first.toLowerCase();
        const user2 = b.first.toLowerCase();

        let comparison = 0;
        if (user1 > user2) {
            comparison = 1;
        } else if (user1 < user2) {
            comparison = -1;
        }
        return comparison;
    }
    function compareDes(a, b) { 
        const user1 = a.first.toLowerCase();
        const user2 = b.first.toLowerCase();

        let comparison = 0;
        if (user1 > user2) {
            comparison = -1;
        } else if (user1 < user2) {
            comparison = 1;
        }
        return comparison;
    }
    if (!sorter) {
        users.find({}, (err, data) => {
            let newList = data.sort(compareAsc)
            res.render('index', { users: newList })
        })
        sorter = true
    } else {
        users.find({}, (err, data) => {
            let newList = data.sort(compareDes)
            res.render('index', { users: newList })
        })
        sorter = false
    }
})

app.get('/create', (req, res) => {
    res.render('form') 
})

app.post('/create', (req, res) => {
    const newUser = new users() 
    newUser.userID = req.body.userID
    newUser.first = req.body.first
    newUser.last = req.body.last
    newUser.email = req.body.email
    newUser.age = req.body.age

    newUser.save((err, data) => {
        if (err) throw err
        res.redirect('/')
    })
})

app.get('/edit/:userID', (req, res) => {
    users.findOne({ userID: req.params.userID }, (err, data) => {
        res.render('edit', { user: data })
    })
})
app.post('/edit/:userID', (req, res) => {
    let foundUser = req.params.userID;
    users.findOneAndUpdate({ userID: foundUser }, {
        userID: req.body.userID,
        first: req.body.first,
        last: req.body.last,
        email: req.body.email,
        age: req.body.age,
    }, (err, data) => {
        if (err) throw err
        res.redirect('/')
    })
})

app.post('/delete/:userID', (req, res) => {
    let foundUser = req.params.userID;
    users.findOneAndDelete({ userID: foundUser }, (err, data) => {
        if (err) throw err
        console.log(`User removed: ${data}`)
        res.redirect('/')
    });
});

app.listen(3000, () => {
    console.log("Listening on port 3000.")
})