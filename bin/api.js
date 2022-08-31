#!/usr/bin/env node
const express = require("express");
const mediafire = require("../src/index");
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.listen(process.env.PORT||3000, function(){console.log("Port listen on http://localhost:%o/", this.address().port)});
app.get("/", (req, res) => mediafire.Folder(req.query.folder).then(data => res.json(data)));