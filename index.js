const express = require("express");
const app = express();
const request = require("request");
const cron = require("node-cron");
const wikip = require("wiki-infobox-parser");

const PORT = process.env.PORT || 3000; // Use process environment variable for port

// Cron job to keep the app alive
cron.schedule("*/5 * * * *", function () {
  request(
    `https://render-free-tier.onrender.com/`,
    function (error, response, body) {
      if (error) {
        console.log("Error: ", error.message);
      } else {
        console.log("Response: ", response.body);
      }
    }
  );
});

// EJS
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/index", (req, response) => {
  let url = "https://en.wikipedia.org/w/api.php";
  let params = {
    action: "opensearch",
    search: req.query.person,
    limit: "1",
    namespace: "0",
    format: "json",
  };

  url = url + "?";
  Object.keys(params).forEach((key) => {
    url += "&" + key + "=" + params[key];
  });

  // Get Wikipedia search string
  request(url, (err, res, body) => {
    if (err) {
      response.redirect("404");
    }
    result = JSON.parse(body);
    x = result[3][0];
    x = x.substring(30, x.length);
    // Get Wikipedia JSON
    wikip(x, (err, final) => {
      if (err) {
        response.redirect("404");
      } else {
        const answers = final;
        response.send(answers);
      }
    });
  });
});

// Port
app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}...`);
});
