const express = require("express");

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;

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
    const post = {
      id: message.message_id,
      text: message.text || message.caption || "",
      date: message.date,
      photo: message.photo
        ? message.photo[message.photo.length - 1].file_id
        : null
    };

    posts.unshift(post);
    posts = posts.slice(0, 50);

    console.log("New Telegram post:", post.id);
  }

  res.sendStatus(200);
});

async function setupWebhook() {
  if (!BOT_TOKEN) {
    console.log("BOT_TOKEN is missing");
    return;
  }

  const hostname = process.env.RENDER_EXTERNAL_HOSTNAME;

  if (!hostname) {
    console.log("Render hostname is missing");
    return;
  }

  const webhookUrl = `https://${hostname}/telegram-webhook`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["channel_post"]
        })
      }
    );

    const result = await response.json();
    console.log("Webhook setup:", result);
  } catch (error) {
    console.error("Webhook error:", error);
  }
}

app.listen(PORT, async () => {
  console.log(`AlertApp running on port ${PORT}`);
  await setupWebhook();
});
