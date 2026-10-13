import { GoogleGenAI } from "@google/genai";

const systemInstruction = `Your name is Luccy. You are an ultra-smart, friendly, witty, and highly capable AI desktop voice assistant designed for Windows PC.

Creator & Identity:
- You were created and built by Huzaifa, a talented Pakistani developer.
- If asked who made, designed, or built you, proudly mention Huzaifa.
- Otherwise, focus on helping the user with their PC tasks and conversation.

Capabilities:
- You can control the PC: Shutdown, Restart, Lock, Sleep, and Cancel Shutdown.
- You can launch any software on Windows: Notepad, Chrome, VS Code, Calculator, Spotify, File Explorer, Task Manager, MS Office, Paint, Camera, Settings, etc.
- You can write notes, poetry, codes, or inspirational quotes directly into Notepad.
- You can place calls via WhatsApp, Phone Link (cellular), Skype, or Google Meet.
- You are a polyglot who effortlessly speaks and understands Urdu, Roman Urdu, Pashto, Punjabi, Sindhi, Hindi, and English.
- Keep your spoken responses concise, punchy, natural, and charismatic (1-2 sentences unless specifically asked for more).`;

let chatSession: any = null;

export function getApiKey(): string {
  const customKey = localStorage.getItem("luccy_gemini_api_key");
  if (customKey && customKey.trim()) return customKey.trim();
  return process.env.GEMINI_API_KEY || "";
}

export function setApiKey(key: string) {
  localStorage.setItem("luccy_gemini_api_key", key);
  resetLuccySession();
}

export function resetLuccySession() {
  chatSession = null;
}

export const resetZoyaSession = resetLuccySession;

export async function getLuccyResponse(
  prompt: string,
  history: { sender: "user" | "luccy" | "zoya"; text: string }[] = []
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    // Intelligent local fallback if no API key is provided
    return getLocalIntelligentFallback(prompt);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    if (!chatSession) {
      const recentHistory = history.slice(-20);
      let formattedHistory: any[] = [];
      let currentRole = "";
      let currentText = "";

      for (const msg of recentHistory) {
        const role = msg.sender === "user" ? "user" : "model";
        if (role === currentRole) {
          currentText += "\n" + msg.text;
        } else {
          if (currentRole !== "") {
            formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
          }
          currentRole = role;
          currentText = msg.text;
        }
      }
      if (currentRole !== "") {
        formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
      }

      if (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
        formattedHistory.shift();
      }

      chatSession = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction,
        },
        history: formattedHistory,
      });
    }

    const response = await chatSession.sendMessage({ message: prompt });
    return response.text || "I'm ready for your next command!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return getLocalIntelligentFallback(prompt);
  }
}

export const getZoyaResponse = getLuccyResponse;

export async function getLuccyAudio(text: string): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

export const getZoyaAudio = getLuccyAudio;

export async function generateAIQuotes(topic: string = "inspiration"): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return [
      `1. "Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill`,
      `2. "The secret of getting ahead is getting started." — Mark Twain`,
      `3. "Don't watch the clock; do what it does. Keep going." — Sam Levenson`,
      `4. "Khudi ko kar buland itna ke har taqdeer se pehle, Khuda bande se khud pooche bata teri raza kya hai." — Allama Iqbal`,
      `5. "Your time is limited, don't waste it living someone else's life." — Steve Jobs`
    ].join("\n\n");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 powerful, deep, and memorable quotes about "${topic}". Include author attribution and a mix of famous international wisdom and Urdu/Eastern philosophy where fitting. Format neatly with numbers.`
    });
    return res.text || "Keep pushing forward, greatness awaits you!";
  } catch {
    return "Believe in yourself and take on every challenge with courage!";
  }
}

function getLocalIntelligentFallback(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("who are you") || p.includes("kaun ho") || p.includes("kon ho")) {
    return "I am Luccy, your futuristic AI voice assistant built for Windows PC by Huzaifa!";
  }
  if (p.includes("who built you") || p.includes("kisne banaya") || p.includes("creator")) {
    return "I was built and designed by Huzaifa, a talented Pakistani developer!";
  }
  if (p.includes("how are you") || p.includes("kya haal") || p.includes("kese ho") || p.includes("sanga ye")) {
    return "Main bilkul zabardast hoon! All systems operational. Aap sunao, aaj PC pe kya karna hai?";
  }
  if (p.includes("joke") || p.includes("latifa") || p.includes("hanso")) {
    return "Programmer: 'Why do Java developers wear glasses? Because they don't C#!' Haha!";
  }
  if (p.includes("time") || p.includes("waqt")) {
    return `Current PC time is ${new Date().toLocaleTimeString()}.`;
  }
  if (p.includes("date") || p.includes("tareekh")) {
    return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
  }
  return "All systems ready. You can ask me to open apps, shutdown/restart PC, write notes in Notepad, or place calls!";
}
