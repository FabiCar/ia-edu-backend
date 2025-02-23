import mongoose , { Schema, Document } from "mongoose";

export interface ICharacterData {
    category: string;
    content: string;
}

export interface ICharacter extends Document {
    name: string;
    alias?: string[];
    birthDate?: string;
    deathDate?: string;
    nationality?: string;
    occupation?: string[];
    data: ICharacterData[];
}

const CharacterSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    alias: { type: [String], default: [] },
    birthDate: { type: String },
    deathDate: { type: String },
    nationality: { type: String },
    occupation: { type: [String], default: [] },
    data: [
        {
            category: { type: String, required: true },
            content: { type: String, required: true }
        }
    ]
});

export default mongoose.model<ICharacter>("Character", CharacterSchema);

