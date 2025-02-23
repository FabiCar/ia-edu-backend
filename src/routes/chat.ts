import express, { Request, Response } from "express";
import character from "../models/character";
import axios from "axios";
import fs from "fs";
import path from "path";
import { normalizeText } from "../helpers/normalizeText";
import { getOllamaResponse } from "../helpers/iaResponse";
import { ElevenLabsClient } from "elevenlabs";


const person = "joaquin suarez";

const router = express.Router();

const IA_URI = "http://chatbot-ia-model:11434";

const ELEVEN_LABS_API_KEY="sk_82ab2d83918b9249d16a9cac05305bf5a7a2a9fb72420c34";
const VOICE_ID="CwhRBWXzGAHq8TQ4Fs17";


const elevenlabs = new ElevenLabsClient({
  apiKey: "sk_82ab2d83918b9249d16a9cac05305bf5a7a2a9fb72420c34", // Defaults to process.env.ELEVENLABS_API_KEY
});


async function convertTextToSpeech(text: string, filename: string): Promise<string> {
  const outputPath = path.join(__dirname, "../../public/audio", filename);

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: { stability: 0.5, similarity_boost: 0.5 },
    },
    {
      headers: {
        "xi-api-key": ELEVEN_LABS_API_KEY,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  console.log(">>> response audio ::", response)

  fs.writeFileSync(outputPath, response.data);
  console.log(`✅ Audio generado y guardado en: ${outputPath}`);
  
  return `/audio/${filename}`;
}



router.post("/", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  console.log(">>> BODY REQ :::", req.body)
  try {
    const character_data = await character.findOne({ name: new RegExp(normalizeText(person), "i") });
    const context = character_data ? character_data : "Not found information !";

    console.log({ prompt, context })

    const responseText = await getOllamaResponse(prompt, context);
    //await convertTextToSpeech(responseText, audioFilename);
    //res.json({message: responseText, audio:`/audio/${audioFilename}`})
    const audioFilename = `response_${Date.now()}.mp3`;
    const audioPath = await convertTextToSpeech(responseText, audioFilename);


    res.status(200).json({ message: responseText, audio: audioPath })

  } catch (err) {
    console.log(">> ERROR ON ROUTE", err)
    res.status(500).json({ error: "Error on process request" })
  }
})

export default router;