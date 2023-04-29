const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20")
const keys = require("./keys");
const constants = require("../configuration");

const {Client} = require('pg');
//gestione dell'interazione tra applicazione e database PostgreSQL
const client = new Client({
    connectionString: constants.connectionString
});
client.connect();

//passport.serializeUser serve per salvare le informazioni dell'utente nella sessione solo la prima volta che l'utente fa l'accesso,  
passport.serializeUser((user,done)=>{
    done(null,user.id)
})
//passport.deserializeUser serve per recuperare le informazioni dell'utente.
//In pratica viene chiamata ad ogni richiesta per caricare le informazioni dell'utente dal database 
//E CREARE L'OGGETTO REQ.USER (è deserializedUser che crea questo oggetto)
passport.deserializeUser((id, done) => {    
    const query = "SELECT * from googleUsers where id=$1"
    const values = [id]
    
    client.query(query, values, (err, result) => {
        if (err) {
            return done(err)
        }
        
        if (!result || !result.rows || !result.rows[0]) {
            return done(new Error("User not found"))
        }

        done(null, result.rows[0])
    })
})


passport.use(new GoogleStrategy({
    //options for the strategy
    callbackURL:"/auth/google/redirect",  //redirect after the authentication 
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    scope: ["profile","email"]

},(accessToken, refreshToken, profile, done) => {
    
    //passport callback function
    //.log(profile)
    //check if user already exists
    const query = "SELECT id from googleUsers where id=$1"
    const values = [profile.id]
    
    client.query(query, values, (err, result) => {
        if (err) {

        } else {
            if(result.rows[0] === undefined){//non è presente nel DB
                
                const username = profile.displayName
                const id = profile.id
                const name = profile.name.givenName
                const surname = profile.name.familyName
                const profilePhoto = profile.photos[0].value
                const  email = profile.emails[0].value

                queryInsert = 'INSERT INTO googleUsers (username, id, nome, cognome, fotoprofilo, email) VALUES ($1, $2, $3, $4, $5, $6)';
                valuesInsert = [username,id,name,surname,profilePhoto,email];

                client.query(queryInsert, valuesInsert, (err, result) => {
                if (err) {

                } else {
                    console.log("Utente registrato correttamente")
                }
            })
            }else{//è presente nel DB
                console.log("Utente gia presente nel DB")
            }
            
        }
        done(null,profile)
    })


})
)