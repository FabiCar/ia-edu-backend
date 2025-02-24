import express from "express"
import cors from "cors"

// import rutas
import chatRoutes from "./routes/chat";
import mongoose from "mongoose"
import dotenv from "dotenv"
import character from "./models/character";
import exampleData from "./models/mock_character_example";

dotenv.config({ path: ".env" });

const app = express();

app.use(cors());
app.use(express.json());


// use chat route
app.use("/chat", chatRoutes);
app.use("/audio", express.static("public/audio"));

// connected database
try {
    mongoose.connect("mongodb://chatbot-db:27017/chatbot", {})
        .then(() => {
            console.log("DB connected !!!")
            character.insertMany(exampleData, { ordered: false });
            console.log(">>> Insert data succesfully << !!!")
        })
        .catch((err) => console.log("Error connect DB!!", err));

} catch (err) {
    console.log(">> Error on migrate data ", err)
}
export default app;