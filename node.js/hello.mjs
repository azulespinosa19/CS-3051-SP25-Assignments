import express from "express";
const app = express();
const port = 8080;

let server = app.listen(port, function(){
    console.log("App server is running on port",port);
    console.log("to end press Ctrl + C");
});

app.get('/', function(req, res) {
    res.send("Hello World");
})

app.get('/myname', function(req, res) {
    res.send("Azul");
})