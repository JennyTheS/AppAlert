const express = require("express");

const app = express();
app.use(express.json());

let posts = [];

app.get("/", (req, res) => {
  res.send("AlertApp server is running!");
});

app.get("/api/posts", (req, res) => {
  res.json(posts);
});

app.post("/telegram-webhook", (req, res) => {
  const message = req.body.channel_post;

  if (message) {
    posts.unshift({
      id: message.message_id,
      text: message.text || message.caption || "",
      date: message.date,
      photo: Boolean(message.photo)
    });

    posts = posts.slice(0, 50);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AlertApp running on port ${PORT}`);
});
