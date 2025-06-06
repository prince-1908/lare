import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { questions } = body;

        if (!questions) {
            return new Response(JSON.stringify({ error: "No questions provided" }), { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API });

        const response = await ai.models.generateContent({
            model:"gemini-2.5-pro-exp-03-25",
            contents:`Answer the following Questions: ${questions}`
        })

        const data = response.text;

        return new Response(JSON.stringify({ answers: data || "No answer found." }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching answers:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch answers." }), { status: 500 });
    }
}
