/**
 *
 * Note: Proxy server is not useful anymore.
 * We are using the new Cloud Giovanni API.
 *
 */

import express from "express";
import fetch from "node-fetch";

const app = express();
const port = 9000;

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/hydro1/*", (req, res) => {
  const url =
    "https://hydro1.gesdisc.eosdis.nasa.gov" + req.url.replace("/hydro1", "");

  fetch(url)
    .then((response) => response.text())
    .then((text) => {
      res.send(text);
    })
    .catch((err) => {
      console.error(err);
      res.send("Failed to fetch");
    });
});

app.listen(port, "127.0.0.1", () => {
  console.log("Server is running on http://127.0.0.1:" + port);
});
