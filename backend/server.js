require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("redis");
const app = express();
const PORT = process.env.PORT;


const pg = require("pg");

const db = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    }
});

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});

redisClient.connect();

setInterval(async () => {
    await db.query(
        "DELETE FROM urls WHERE expires_at <= NOW()"
    );

    console.log("Expired URLs cleaned up");
}, 24 * 60 * 60 * 1000);

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

// Redis
app.post("/api/shorten", async (req, res) => {
    const url = req.body.url;
    if(!url){
        return (res.status(400).json({error: "URL is required"}));
    }
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);
    await db.query("INSERT INTO urls (code, original_url, expires_at) VALUES ($1, $2, $3)",[code, url, expiresAt]);
    
    await redisClient.set(code, url, {EX: 60 * 60 * 24 * 90}); 
    
    res.json({
        code: code,
        shortUrl: `${req.protocol}://${req.get("host")}/${code}`
    });
});

app.get("/:code", async (req, res) => {
    const code = req.params.code;
    const url = await redisClient.get(code);

    if (!url) {
        return res.status(404).send("Short URL not found");
    }

    res.redirect(url);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



