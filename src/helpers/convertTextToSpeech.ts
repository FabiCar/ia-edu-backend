import fs from "fs";
import path from "path";
import axios from "axios";

const ELEVEN_LABS_API_KEY="sk_82ab2d83918b9249d16a9cac05305bf5a7a2a9fb72420c34";
const VOICE_ID="CwhRBWXzGAHq8TQ4Fs17";

export const convertTextToSpeech = async (text: string, filename: string): Promise<string>  => {
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