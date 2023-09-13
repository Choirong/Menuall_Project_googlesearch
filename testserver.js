const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.set("views", "./views");
const port = 5000;

app.get("/", (req, res) => {
  res.render("test", {
    title: "Node.js + Express with view Engine",
  });
});

app.listen(port, () => {
  console.log("http://localhost:${port}");
});

console.log(__dirname);
