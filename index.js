const express = require('express')
const app = express()

app.set('view engine', 'pug');//per utilizzare pug, modulo per gestione pagine dinamiche

app.use(express.urlencoded({extended:false}))//middleware utilizzato per prendere i dati da form

app.use(express.static("./public"))//middleware che serve i file statici contenuti all'interno della directory public


/*Express-Session utilizza i cookie per mantenere lo stato di sessione del client, ma memorizza i dati della sessione sul server */
const session = require('express-session');

app.use(session({
    secret: 'il-mio-segreto-segretissimo',
    resave: false,
    saveUninitialized: true
  }));

// Middleware per il controllo dell'autenticazione
const requireAuth = (req, res, next) => {
    if (req.session.loggedin) {
      next();
    } else {
      res.redirect('/api/sign-in');
    }
  };

//gestione dell'interazione tra applicazione e database PostgreSQL
const connectionString = 'postgresql://postgres:alessio2001@localhost:5432/Persone';
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const client = new Client({
  connectionString: connectionString
});
client.connect();

//METODI GET
app.get("/",(req,res)=>{
    res.send("<h1> HOMEPAGE </h1> <a href='api/sign-up/'>Clicca qui per andare nella pagina di iscrizione</a>")//link per andare alla pagina del form 
  })
  
  app.get("/api/sign-in",(req,res)=>{
    res.sendFile('signin.html',{root:__dirname + "/public"})
  })
  
  app.get("/api/sign-up",(req,res)=>{
    res.sendFile('signup1.html',{root:__dirname + "/public"})
  })
  
  // Pagina protetta
  app.get('/dashboard',requireAuth, (req, res) => {
    res.render('homepage', { username: req.session.user});
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
app.post("/api/sign-up",(req,res)=>{
    console.log(req.body) 
  
    const {nome,cognome,email,password,conferma_password} = req.body
    
    if(password != conferma_password){
      res.send("Le due password immesse non sono uguali. <a href=/api/sign-up>Clicca qui per tornare alla pagina di scrizione</a>'")
    }
    else{
  
      const saltRounds = 10;
  
      bcrypt.hash(password, saltRounds, function(err, hash) { 
        const query = 'INSERT INTO Credenziali (nome,cognome,email, pass) VALUES ($1, $2, $3, $4)';
        const values = [nome,cognome,email, hash];
  
        client.query(query, values, (err, result) => {
          if (err) {
  
            if (err.code === '23505') { // codice di errore per la violazione di un vincolo univoco
              return res.status(400).send('Errore: l\'indirizzo email è già registrato. <a href=/>Click here to returnto the Homepage</a>');
            }
  
            console.log(err.message);
            res.status(500).send('Error inserting data');
          } else {
            res.status(200).send('Data inserted successfully!!!<a href=/>Click here to come back</a>');
          }
        })
    
      });
  
    }
  })

  app.post("/api/sign-in",(req,res)=>{//utilizza postman per fare la richiesta post
  
    const {email,password} = req.body
      
    const query = 'SELECT pass from Credenziali WHERE email = $1';
    const values = [email];
  
    client.query(query, values, (err, resultQuery) => {
      if (err) {
        resultQuery.status(500).send('Error');
      }
      
      if(resultQuery.rows[0] === undefined)res.send("Email non presente nel DB")
      
      else{

        bcrypt.compare(password, resultQuery.rows[0].pass, (err,result)=>{
          if (err) {
            res.status(500).send('Error');
          } else if (result == true) {
            req.session.cookie.maxAge = 3600000; // Tempo di scadenza del cookie (in millisecondi)
            //una volta scaduto questo tempo, per accedere alla pagina dashboard si dovrà rifare il login 
            req.session.loggedin = true;//vado a CREARE il campo loggedin all'interno di req.session e lo setto a true
            req.session.user = email; //vado a CREARE il campo user all'interno di req.session e lo setto uguale alla mail
  
            res.redirect("/dashboard")
          } else {
            res.send('La password non corrisponde!');
          }
        })
      }
    })
  })
  
  
app.listen(3000)
  