require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT;
const urls = {};

function generateCode(length = 6){
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (i = 0; i<length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("URL Shortener is now running");
});

app.get("/:code", (req, res) => {
    const code = req.params.code;
    const url = urls[code];

    if (!url) {
        return res.status(404).send("Short URL not found");
    }

    res.redirect(url);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post("/api/shorten", (req, res) => {
    const url = req.body.url;
    if(!url){
        return (res.status(400).json({error: "URL is required"}));
    }
    const code = generateCode();
    urls[code] = url;
    
    res.json({
        code: code,
        shortUrl: `${req.protocol}://${req.get("host")}/${code}`
    });
});