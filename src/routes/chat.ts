import express, { Request, Response } from "express";
import character from "../models/character";
import { normalizeText } from "../helpers/normalizeText";
import { getOllamaResponse } from "../helpers/iaResponse";

const person = "joaquin suarez";
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  
  try {
    const character_data = await character.findOne({ name: new RegExp(normalizeText(person), "i") });
    const context = character_data ? character_data : "Not found information !";

    console.log({ prompt, context })

    const responseText = await getOllamaResponse(prompt, context);

    res.status(200).json(responseText)

  } catch (err) {
    console.log(">> ERROR ON ROUTE", err)
    res.status(500).json({ error: "Error on process request" })
  }
})

export default router;