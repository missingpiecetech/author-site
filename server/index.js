const express = require("express");
const cors = require("cors");
// const fetch = require("node-fetch");
const Parser = require("rss-parser");
const parser = new Parser();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route
app.get("/", (req, res) => {
  res.send("Welcome to the Author's API");
});

app.get("/api/rssFeed", (req, res) => {
  console.log("Received request for /api/rssFeed");
  // Fetch and return the RSS feed data
  const RSS_URL =
    "https://www.youtube.com/feeds/videos.xml?channel_id=UCwEMq5GTFJMUWxnC7KVxKPw";

  const parse = async (url) => {
    const feed = await parser.parseURL(encodeURI(url));
    return feed;
  };

  parse(RSS_URL)
    .then((data) => {
      res.type("application/json").send(data);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
