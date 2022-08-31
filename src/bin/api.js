#!/usr/bin/env node
import express, { urlencoded, json } from "express";
import { Folder } from "../index.js";
const app = express();
app.use(urlencoded({extended: true}));
app.use(json());
app.listen(process.env.PORT||3000, function(){console.log("Port listen on http://localhost:%o/", this.address().port)});
app.get("/", (req, res) => Folder(req.query.folder).then(data => res.json(data)));