const express = require("express");
const request = require("request");

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/proxy", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL parameter is required." });
  }

  request(url).pipe(res);
});

app.listen(port, () => {
  console.log(`CORS Proxy Server is running on port ${port}`);
});