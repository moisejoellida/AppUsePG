const { create } = require('domain');
const express = require('express');
const path = require('path');
const {Pool} = require('pg');

const app = express();

//pool de coonexion à la base de données
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tutoelephantpg',
    password: '0628732261',
    port: 5432
});
console.log("Connexion à la base de donnees reussie");

//creation de la table Livre
const sql_create = `CREATE TABLE IF NOT EXISTS Livres (
    Livre_ID SERIAL PRIMARY KEY,
    Titre VARCHAR(100) NOT NULL,
    Auteur VARCHAR(100) NOT NULL,
    Commentaires TEXT
  );`;
  
  pool.query(sql_create, [], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Création réussie de la table 'Livres'");
  });

  //Insertion de données dans la table Livre
  const sql_insert = `INSERT INTO Livres (Livre_ID, Titre, Auteur, Commentaires) VALUES
  (1,'Mrs. Bridge', 'Evan S. Connell', 'Premier de la série'),
  (2,'Mr. Bridge', 'Evan S. Connell', 'Second de la série'),
  (3,'L''ingénue libertine', 'Colette', Minne + Les égarements de Minne'),
  (4,'Mr. Lida', 'Mon avanture à Paris', 'Une longue histoire dans Paname')
  ON CONFLICT DO NOTHING;`;

pool.query(sql_insert, [], (err, result) => {
    if(err){
        return console.error(err.message);
    }
    const sql_sequence = "SELECT SETVAL('Livres_Livre_ID_Seq', MAX(Livre_ID)) FROM Livres;";
    pool.query(sql_sequence, [], (err, result) => {
        if(err){
            return console.error(err.message);
        }
        console.log("Information enregistres dans la table 'Livres'");
    })
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: false}));//definition du middleware
app.listen(3000, () => {
    console.log("My app listen on : http://localhost:3000/")
});

//url racine
app.get("/", (req, res) => {
    res.render("index");
});

//url about
app.get("/about", (req, res) => {
    res.render("about");
});

//url data
app.get("/data", (req, res) => {
    const test = {
        titre: "test",
        items: ["One", "Two", "Three"]
    };
    res.render("data", {model: test});
});

//url de recupération des livres
app.get("/livres", (req, res) => {
    const sql = "SELECT * FROM Livres ORDER BY Titre";
    pool.query(sql, [], (err, result) => {
        if(err){
            return console.error(err.message);
        }
        res.render("livres", {model: result.rows});
    });
});

//Méthode qui permet de recuperer un livre par son id
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const SQL = "SELECT * FROM livres WHERE Livre_ID = $1";
    pool.query(SQL, [id], (err, result) => {
        if(err){
            return console.error(err.message);
        }
        res.render("edit", {model: result.rows[0]});
    });
});

//Méthode de creation de livre
app.get("/create", (req, res) => {
    res.render("create", {model: {}});
})

//Méthode qui permet d'enregistrer les modifications en base de données
app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const book = [req.body.titre, req.body.auteur, req.body.commentaires, id];
    const sql = "UPDATE Livres SET Titre = $1, Auteur = $2, Commentaires = $3 WHERE (Livre_ID = $4)";
    pool.query(sql, book, (err, result) => {
        if(err){
            return console.error(err.message);
        }
        res.redirect("/livres");
    });
});

//Méthode qui d'envoyer les informations du nouveau livre
app.post("/create", (req, res) => {
    const sql = "INSERT INTO Livres(Titre, Auteur, Commentaires) VALUES ($1, $2, $3)";
    const book = [req.body.titre, req.body.auteur, req.body.commentaires];
    pool.query(sql, book, (err, result) => {
        if(err){
            return console.error(err.message);
        }
        res.redirect("/livres");
    });
});

//Methode de suppression 
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Livres WHERE Livre_ID = $1";
    pool.query(sql, [id], (err, result) => {
        if(err){
            return console.error(err.message);
        }
        res.render("delete", {model: result.rows[0]});
    });
});
