const express = require('express')
const app = express()
// Express-Session utilizza i cookie per mantenere lo stato di sessione del client,
// ma memorizza i dati della sessione sul server
const session = require('express-session');
const constants = require("./configuration");
const {Client} = require('pg');
const bcrypt = require('bcrypt');

const routesDir = '/src/routes';

// middleware utilizzato per prendere i dati da form
app.use(express.urlencoded({extended: false}))


// middleware che serve i file statici contenuti all'interno della directory public
app.use(express.static("./"))
app.use(express.static("./public"))
app.use(express.static("./src/"))

app.use(session({
    secret: 'il-mio-segreto-segretissimo',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge:30*60*1000,rolling:true}//cookie settati a 30 minuti e rolling a true fara si che la durata della sessione sara sempre rinnovata ad ogni richiesta
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
app.get("/booking", (req, res) => {
    res.sendFile(`.${routesDir}/booking/booking.html`,{root: __dirname});
});
app.get("/profile",(req,res)=>{
    res.sendFile('profilePage.html', {root: __dirname + "/src/routes/profilePage/"})
})

//endpoint per gestire informazioni personali del profilo 
app.get("/get-personal-info", async (req,res)=>{
    const email = req.session.user
    console.log(req.session)
    const query = 'SELECT nome,cognome,username from Credenziali WHERE email = $1';
    const values = [email];
    try {
        const resultQuery = await client.query(query, values);

        const nome = resultQuery.rows[0].nome
        const cognome = resultQuery.rows[0].cognome
        const username = resultQuery.rows[0].username
        console.log(req.session.user)
        res.status(200)
        return res.send({nome:nome, cognome:cognome, username:username, email:email})
    } catch (error) {
        return res.status(500).send('Error');
    }
})

// Pagina protetta
app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile('/homepage.html', {root: __dirname + "/src/routes/homepage/"})
});

// Gestione del logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            //req.session.destroy()
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
                } else {
                    req.session.user = email;//mi salvo la mail lato server in modo tale che 
                                             //un utente che si è appena iscritto possa vedere 
                                             //e fare tutto ciò che puo fare un utente gia iscritto (leggere informazioni personali nel profilo e tutto il resto)  
                    res.redirect("/")
                    res.status(200)
                }
            })

        });

    }
});



//CODICI DI ERRORE /api/sign-in
// "Error" -> errore
// "Success" --> login andato a buon fine 
app.post("/api/sign-in", (req, res) => {

    const {email, password} = req.body

    const query = 'SELECT pass from Credenziali WHERE email = $1';
    const values = [email];

    
    client.query(query, values, (err, resultQuery) => {
        if (err) {
            resultQuery.status(500).send('Error');
        }

        if (resultQuery.rows[0] === undefined) return res.send({code:"Error"})
        
        bcrypt.compare(password, resultQuery.rows[0].pass, (err, result) => {
            if (err) {
                return res.status(500).send({code:"Error"});
            } else if (result == true) {
                req.session.loggedin = true;//vado a CREARE il campo loggedin all'interno di req.session e lo setto a true
                req.session.user = email; //vado a CREARE il campo user all'interno di req.session e lo setto uguale alla mail

                //res.redirect("/dashboard")
                return res.send({code:"Success"}).status(200)
            } else {
                return res.send({code:"Error"})
            }
        })    
    })
});


//CODICI DI ERRORE 
// 1000 --> password e conferma_password diverse
// 1001 --> old_password errata
// success --> password aggiornata correttamente 

app.post("/reset-password",async (req,res)=>{
    console.log(req.session)
    const email = req.session.user
    const {old_pass, new_pass,conf_new_pass} = req.body
    //gestione errore password diverse
    if(new_pass !== conf_new_pass){
        return res.send({code:1000}).status(200)
    }
    const query = 'SELECT pass from Credenziali WHERE email = $1';
    const values = [email];

    try {
        const resultQuery = await client.query(query, values);

        const result = await bcrypt.compare(old_pass, resultQuery.rows[0].pass);

        if (result === true) {
            const saltRounds = 10
            const new_pass_crypted = await bcrypt.hash(new_pass,saltRounds)
            const query1 = "UPDATE Credenziali SET pass = $1 WHERE email = $2";
            const values1 = [new_pass_crypted,email]
            const resultQuery1 = await client.query(query1,values1)
            res.send({code:"success"})
            res.status(200);
        } else {
            return res.send({code:1001}).status(200);
        }

    } catch (error) {
        res.status(500).send('Error');
    }
})

app.post("/cancellazione-account",(req,res)=>{
    const {pass,conf_pass} = req.body
    console.log(pass)
    if(pass !== conf_pass ){
        return res.send({error_code:1000})
    }
})

app.listen(3000);
  