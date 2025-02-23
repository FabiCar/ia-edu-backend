import axios from "axios";
import { promptRules } from "./promtRules";
import { normalizeText } from "./normalizeText";
import redisClient from "../infraestructure/redisClient";
import { convertTextToSpeech } from "./convertTextToSpeech";
const IA_URI = "http://chatbot-ia-model:11434";

const callIAModel = async (ctx: string, strFormat: string, prompt: string) => {
  // Enviamos el contexto bien estructurado a Mistral
  const response = await axios.post(IA_URI + "/api/generate", {
    model: "gemma2:2b",
    prompt: `${promptRules}
      
      Información del personaje:
      ${ctx}
      
      Pregunta: ${prompt}
      Respuesta:`,
    temperature: 0.2,
    max_tokens: 50,
    stream: false
  });

  const audioFilename = `response_${Date.now()}.mp3`;

  console.log(">>> CREATE AUDIO ++> ", response?.data?.response)

  const audioPath = await convertTextToSpeech(response.data?.response, audioFilename);
  await redisClient.set(normalizeText(prompt), JSON.stringify({message: response?.data?.response, audio: audioPath}));
  return { message: response?.data?.response, audio: audioPath}
}



export const getOllamaResponse = async (prompt: string, characterData: any): Promise<any> => {
  try {
    
    let formatContext: string | null = null;
    if (!characterData) {
      return "No se encontró información sobre este personaje.";
    }

    // Construimos el contexto dinámico basado en las categorías disponibles
    let context = `Nombre: ${characterData.name}\n`;
    if (characterData.alias && characterData.alias.length > 0) {
      context += `Alias: ${characterData.alias.join(", ")}\n`;
    }
    if (characterData.nationality) {
      context += `Nacionalidad: ${characterData.nationality}\n`;
    }
    if (characterData.occupation && characterData.occupation.length > 0) {
      context += `Ocupación: ${characterData.occupation.join(", ")}\n`;
    }

    context += "\n=== Información disponible ===\n";

    if (characterData.data && characterData.data.length > 0) {
      characterData.data.forEach((entry: any) => {
        const category = normalizeText(entry.category);
        const content = normalizeText(entry.content);
        if (
          prompt.split(" ").some(word => category.includes(word)) ||
          prompt.split(" ").some(word => content.includes(word))
        ) {
          context += `\n**${entry.category}**:\n${entry.content}\n`;
          console.log("\n>> CATEGORY AND CONTENT FOUND !!!!\n")
          formatContext = context.replace(/\s+/g, '').toLowerCase();
        }
      });
      if (formatContext) {
        // csonulto cache si existe retorno si no ejecuto ollama y actualizo cache con nuevo contexto
        const cachedResponse = await redisClient.get(normalizeText(prompt));
        if (cachedResponse) {
          console.log("✅ Respuesta obtenida de Redis")
          return JSON.parse(cachedResponse)
        } else {
          return await callIAModel(context, formatContext, prompt)
        }
      }
    } else {
      context += "\nNo hay información detallada disponible.\n";
      return "Lo siento, no puedo responder a tu pregunta en este momento."
    }

    console.log(">>> CONTEXT ::", context)   

  } catch (err) {
    console.log(">> Error on get ollama response function :", err)
    return ">> ERROR OLAMA RESPONSE FUNCTION"
  }
}