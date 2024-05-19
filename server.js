const express = require("express");
const http = require("http");
const cors = require("cors");
const WebSocket = require("ws");
const amqp = require("amqplib");
const admin = require("./firebaseAdmin");
const mongoose = require("./db");
const Message = require("./models/Message");
const url = require("url");
const { format } = require('date-fns');

require("dotenv").config();

const app = express();
const EXPRESS_PORT = process.env.EXPRESS_PORT || 3000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3800;

app.use(
    cors({
        origin: [`http://localhost:${FRONTEND_PORT}`],
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    })
);

app.get("/api/messages", async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
        const formattedMessages = messages.map(message => ({
            ...message._doc,
            date: format(message.timestamp, 'dd/MM/yyyy HH:mm')
        }));

        res.status(200).json(formattedMessages.reverse());
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

app.use(express.json());

mongoose.connection.once("open", () => {
    console.log("\x1b[32m%s\x1b[0m", "MongoDB connected successfully.");

    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    let channel;
    async function connectRabbitMQ() {
        try {
            const connection = await amqp.connect(`amqp://${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}@rabbitmq:${process.env.RABBITMQ_AMQP_PORT}`);
            channel = await connection.createChannel();
            await channel.assertQueue("chat");
        } catch (error) {
            console.error("Error connecting to RabbitMQ:", error);
        }
    }

    connectRabbitMQ();

    wss.on("connection", function connection(ws, req) {
        const parameters = url.parse(req.url, true).query;
        const token = parameters.token;

        admin
            .auth()
            .verifyIdToken(token)
            .then((decodedToken) => {
                
                ws.user = decodedToken;
            
                ws.on("message", async function incoming(message) {
                   
                    const { userId, text } = JSON.parse(message);

                    const formattedDate = format(new Date(), 'dd/MM/yyyy HH:mm'); 

                    const newMessage = new Message({
                        userId: userId,
                        text: text,
                        date: formattedDate
                    });
                    console.log(newMessage);
                    await newMessage.save();

                    channel.sendToQueue(
                        "chat",
                        Buffer.from(
                            JSON.stringify({
                                userId: userId,
                                text: text,
                                date : formattedDate
                            })
                        )
                    );

                    wss.clients.forEach((client) => {
                        if (
                            client !== ws &&
                            client.readyState === WebSocket.OPEN
                        ) {
                            client.send(
                                JSON.stringify({
                                    userId: userId,
                                    text: text,
                                    date : formattedDate
                                })
                            );
                        }
                    });
                });
            })
            .catch((error) => {
                console.error("Authentication error:", error);
                ws.close();
            });
    });

    server.listen(EXPRESS_PORT, () => {
        console.log(
            "\x1b[32m%s\x1b[0m",
            `Server is running on http://localhost:${EXPRESS_PORT}`
        );
    });
});
