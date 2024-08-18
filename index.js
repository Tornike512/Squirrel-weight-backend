const express = require("express");
const fs = require("fs");
const path = require("path");
const requestIp = require("request-ip");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");

const filePath = path.join(__dirname, "ips.json"); // Path to your JSON file

app.use(express.json());
app.use(cors());
app.use(requestIp.mw());

app.use(async (req, res, next) => {
  try {
    const ip = req.clientIp;
    let data = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      data = JSON.parse(fileData);
    }

    data.push({ ip });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log("IP Address saved:", ip);
  } catch (error) {
    console.error("Error saving IP address:", error);
  }
  next();
});

app.get("/", (req, res) => {
  res.send(req.clientIp);
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
