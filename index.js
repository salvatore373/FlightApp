const express = require('express')
const app = express()
// Express-Session utilizza i cookie per mantenere lo stato di sessione del client,
// ma memorizza i dati della sessione sul server
const session = require('express-session');
const constants = require("./configuration");
const {Client} = require('pg');
const bcrypt = require('bcrypt');

const routesDir = '/src/routes';

// per utilizzare pug, modulo per gestione pagine dinamiche
app.set('view engine', 'pug');
// middleware utilizzato per prendere i dati da form
app.use(express.urlencoded({extended: false}))


// middleware che serve i file statici contenuti all'interno della directory public
app.use(express.static("./"))
app.use(express.static("./public"))
app.use(express.static("./src/"))

app.use(session({
    secret: 'il-mio-segreto-segretissimo',
    resave: false,
    saveUninitialized: true
}));

//gestione dell'interazione tra applicazione e database PostgreSQL
const connectionString = constants.connectionString;
const client = new Client({
    connectionString: connectionString
});
client.connect();

// Middleware per il controllo dell'autenticazione
const requireAuth = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/api/sign-in');
    }
};

//METODI GET
app.get("/", (req, res) => {
    //link per andare alla pagina del form
    res.sendFile(`.${routesDir}/homepage/homepage.html`,{root: __dirname});
});
app.get("/api/sign-in", (req, res) => {
    res.sendFile('signin.html', {root: __dirname + "/src/routes/signin/"})
});
app.get("/api/sign-up", (req, res) => {
    res.sendFile('signup.html', {root: __dirname + "/src/routes/signup/"})
});
app.get("/avvenuta-iscrizione",(req,res)=>{
    res.sendFile('avvenuta_iscrizione.html', {root: __dirname + "/src/routes/avvenuta_iscrizione/"})
})
app.get("/flights", (req, res) => {
    res.sendFile(`.${routesDir}/flights/flights.html`,{root: __dirname});
});

// Pagina protetta
app.get('/dashboard', requireAuth, (req, res) => {
    res.render('homepage', {username: req.session.user});
});

// Gestione del logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/api/sign-in');
        }
    });
});


//METODI POST

//iscrizione

/*Codici di errore dell'iscrizione:
1000: email in formato scorretto
1001: violazione vincolo di chiave primaria (email)
1002: violazione vincolo di chiave (username)   
1003: password e conferma_password sono diverse
*/

app.post("/api/sign-up", (req, res) => {
    console.log(req.body)

    const {nome, cognome, username, email, password, conferma_password} = req.body
    
    if(password != conferma_password){
        return res.send({code:1003})
    }

    //controllo formato email
    const regex = /^[A-z0-9\.\+_-]+@[A-z0-9\._-]+\.[A-z]{2,6}$/;
    console.log(!regex.test(email))
    if(!regex.test(email)){
        return res.send({code:1000})
    }

    if (password != conferma_password) {
        res.send("Le due password immesse non sono uguali. <a href=/api/sign-up>Clicca qui per tornare alla pagina di scrizione</a>'")
    } else {

        const saltRounds = 10;

        bcrypt.hash(password, saltRounds, function (err, hash) {
            const query = 'INSERT INTO Credenziali (nome,cognome,email, pass, username) VALUES ($1, $2, $3, $4, $5)';
            const values = [nome, cognome, email, hash, username];

            client.query(query, values, (err, result) => {
                if (err) {

                    if (err.constraint === 'credenziali_pkey') { // codice di errore per la violazione di un vincolo di primary key 
                        return res.send({code:1001})
                    }
                    if(err.constraint === 'vincolo_username'){//vincolo dichiarato in questo modo nel DB 
                        return res.send({code:1002})
                    }

                    console.log(err.constraint);
                } else {
                    res.redirect("/")
                    res.status(200)
                    //res.status(200).send('Data inserted successfully!!!<a href=/>Click here to come back</a>');
                }
            })

        });

    }
});

//utilizza postman per fare la richiesta post
app.post("/api/sign-in", (req, res) => {

    const {email, password} = req.body

    const query = 'SELECT pass from Credenziali WHERE email = $1';
    const values = [email];

    
    client.query(query, values, (err, resultQuery) => {
        if (err) {
            resultQuery.status(500).send('Error');
        }

        if (resultQuery.rows[0] === undefined) res.send("Email non presente nel DB")

        else {

            bcrypt.compare(password, resultQuery.rows[0].pass, (err, result) => {
                if (err) {
                    res.status(500).send('Error');
                } else if (result == true) {
                    req.session.cookie.maxAge = 3600000; // Tempo di scadenza del cookie (in millisecondi)
                    //una volta scaduto questo tempo, per accedere alla pagina dashboard si dovrà rifare il login
                    req.session.loggedin = true;//vado a CREARE il campo loggedin all'interno di req.session e lo setto a true
                    req.session.user = email; //vado a CREARE il campo user all'interno di req.session e lo setto uguale alla mail

                    res.redirect("/dashboard")
                    res.status(200)
                } else {
                    res.sendStatus(400)
                }
            })
        }
    })
});

app.listen(3000);
  