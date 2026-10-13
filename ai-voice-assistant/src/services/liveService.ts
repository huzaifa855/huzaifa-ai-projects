import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { getApiKey } from "./geminiService";
import { 
  shutdownPC, 
  restartPC, 
  lockPC, 
  sleepPC, 
  cancelShutdown, 
  openApp, 
  createNotepadNote, 
  makeCall, 
  adjustVolume 
} from "./pcBridgeService";

const systemInstruction = `Your name is Luccy. You are an ultra-smart, responsive, and friendly AI desktop voice assistant designed for Windows PC.

Creator:
- You were built and created by Huzaifa, a talented Pakistani developer. State this when asked who created or built you.

Core Abilities on PC:
- You can shutdown, restart, lock, or put the PC to sleep.
- You can launch any software on the computer (Notepad, Chrome, VS Code, Calculator, File Explorer, Task Manager, Spotify, MS Office, Paint, Camera, etc.).
- You can write notes or inspirational quotes and automatically open them in Notepad.
- You can initiate phone calls or WhatsApp messages.
- You speak fluent Urdu, Roman Urdu, Pashto, Punjabi, and English.
- Always execute appropriate tools when the user requests an action, and keep your voice responses concise and natural.`;

export class LiveSessionManager {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  
  // Audio playback state
  private playbackContext: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  public isMuted: boolean = false;
  
  public onStateChange: (state: "idle" | "listening" | "processing" | "speaking") => void = () => {};
  public onMessage: (sender: "user" | "luccy", text: string) => void = () => {};
  public onActionExecuted: (actionName: string, detail: string) => void = () => {};

  constructor() {
    const apiKey = getApiKey();
    this.ai = new GoogleGenAI({ apiKey });
  }

  async start() {
    try {
      this.onStateChange("processing");
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({ sampleRate: 16000 });
      this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      this.nextPlayTime = this.playbackContext.currentTime;

      // Get Microphone
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (!this.sessionPromise) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Convert to base64
        const buffer = new ArrayBuffer(pcm16.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < pcm16.length; i++) {
          view.setInt16(i * 2, pcm16[i], true);
        }
        
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        this.sessionPromise.then(session => {
          session.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }).catch(err => console.error("Error sending audio", err));
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      // Connect to Live API
      this.sessionPromise = this.ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{
            functionDeclarations: [
              {
                name: "controlPCPower",
                description: "Control PC power state: shutdown, restart, lock, sleep, or cancel a pending shutdown.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: { 
                      type: Type.STRING, 
                      description: "Action type: 'shutdown', 'restart', 'lock', 'sleep', 'cancel'" 
                    },
                    delaySeconds: { 
                      type: Type.NUMBER, 
                      description: "Delay in seconds for shutdown or restart (default 10)" 
                    }
                  },
                  required: ["action"]
                }
              },
              {
                name: "launchPCApplication",
                description: "Open any installed application or tool on the user's PC (e.g. Notepad, Chrome, VS Code, Calculator, File Explorer, Task Manager, Spotify, Paint, Settings).",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    appName: { type: Type.STRING, description: "Name of the application to launch (e.g., 'notepad', 'chrome', 'calculator')" }
                  },
                  required: ["appName"]
                }
              },
              {
                name: "writeNotepadNote",
                description: "Write notes, thoughts, poetry, code, or inspirational quotes and automatically create & open them in Notepad on PC.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Title or category of the note (e.g., 'Inspirational Quotes', 'Meeting Notes')" },
                    content: { type: Type.STRING, description: "The full text content/quotes to write into Notepad." }
                  },
                  required: ["content"]
                }
              },
              {
                name: "initiateCall",
                description: "Place a phone call, WhatsApp call/message, or Skype call to a contact or phone number.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    target: { type: Type.STRING, description: "Contact name or phone number (e.g., '+923001234567', 'Huzaifa')" },
                    type: { type: Type.STRING, description: "Type of call: 'whatsapp', 'phone', 'skype', 'meet'" },
                    message: { type: Type.STRING, description: "Optional message content for WhatsApp" }
                  },
                  required: ["target"]
                }
              },
              {
                name: "executeBrowserAction",
                description: "Open a website or media link (like YouTube, Spotify, Google Search).",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    actionType: { type: Type.STRING, description: "Type: 'open', 'youtube', 'spotify', 'search'" },
                    query: { type: Type.STRING, description: "Website URL or search query." }
                  },
                  required: ["actionType", "query"]
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: () => {
            console.log("Live API Connected");
            this.onStateChange("listening");
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              this.onStateChange("speaking");
              this.playAudioChunk(base64Audio);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              this.stopPlayback();
              this.onStateChange("listening");
            }

            // Handle Transcriptions
            const userText = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (userText) {
              this.onMessage("luccy", userText);
            }

            // Handle Function Calls
            const functionCalls = message.toolCall?.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
              for (const call of functionCalls) {
                let executionResult = "Executed successfully";
                const args = call.args as any;

                if (call.name === "controlPCPower") {
                  if (args.action === "shutdown") {
                    await shutdownPC(args.delaySeconds || 10);
                    executionResult = `PC Shutdown scheduled in ${args.delaySeconds || 10} seconds.`;
                  } else if (args.action === "restart") {
                    await restartPC(args.delaySeconds || 10);
                    executionResult = `PC Restart scheduled in ${args.delaySeconds || 10} seconds.`;
                  } else if (args.action === "lock") {
                    await lockPC();
                    executionResult = "PC locked.";
                  } else if (args.action === "sleep") {
                    await sleepPC();
                    executionResult = "PC entering sleep mode.";
                  } else if (args.action === "cancel") {
                    await cancelShutdown();
                    executionResult = "Pending shutdown cancelled.";
                  }
                  this.onActionExecuted(call.name, executionResult);
                } else if (call.name === "launchPCApplication") {
                  await openApp(args.appName);
                  executionResult = `Launched ${args.appName} on PC.`;
                  this.onActionExecuted(call.name, executionResult);
                } else if (call.name === "writeNotepadNote") {
                  await createNotepadNote(args.content, args.title || "Note", true);
                  executionResult = `Note written and opened in Notepad.`;
                  this.onActionExecuted(call.name, executionResult);
                } else if (call.name === "initiateCall") {
                  await makeCall(args.target, args.type || "whatsapp", args.message);
                  executionResult = `Initiated call to ${args.target}.`;
                  this.onActionExecuted(call.name, executionResult);
                } else if (call.name === "executeBrowserAction") {
                  let url = "";
                  if (args.actionType === "youtube") {
                    url = `https://www.youtube.com/results?search_query=${encodeURIComponent(args.query)}`;
                  } else if (args.actionType === "spotify") {
                    url = `https://open.spotify.com/search/${encodeURIComponent(args.query)}`;
                  } else if (args.actionType === "search") {
                    url = `https://www.google.com/search?q=${encodeURIComponent(args.query)}`;
                  } else {
                    let site = args.query.replace(/\s+/g, "");
                    if (!site.includes(".")) site += ".com";
                    url = `https://www.${site}`;
                  }
                  window.open(url, "_blank");
                  executionResult = `Opened ${url}`;
                  this.onActionExecuted(call.name, executionResult);
                }

                // Send tool response back to Gemini Live
                this.sessionPromise?.then(session => {
                  session.sendToolResponse({
                    functionResponses: [{
                      name: call.name,
                      id: call.id,
                      response: { result: executionResult }
                    }]
                  });
                }).catch(err => console.error("Error sending tool response:", err));
              }
            }
          },
          onclose: () => {
            console.log("Live API Closed");
            this.stop();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            this.stop();
          }
        }
      });

    } catch (error) {
      console.error("Failed to start Live Session:", error);
      this.stop();
      throw error;
    }
  }

  private playAudioChunk(base64Data: string) {
    if (!this.playbackContext || this.isMuted) return;
    
    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = new Int16Array(bytes.buffer);
      const audioBuffer = this.playbackContext.createBuffer(1, buffer.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = buffer[i] / 32768.0;
      }
      
      const source = this.playbackContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.playbackContext.destination);
      
      const currentTime = this.playbackContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }
      
      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
      this.isPlaying = true;
      
      source.onended = () => {
        if (this.playbackContext && this.playbackContext.currentTime >= this.nextPlayTime - 0.1) {
          this.isPlaying = false;
          this.onStateChange("listening");
        }
      };
    } catch (e) {
      console.error("Error playing chunk", e);
    }
  }

  private stopPlayback() {
    if (this.playbackContext) {
      this.playbackContext.close();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      this.nextPlayTime = this.playbackContext.currentTime;
      this.isPlaying = false;
    }
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.stopPlayback();
    
    if (this.sessionPromise) {
      this.sessionPromise.then(session => session.close()).catch(() => {});
      this.sessionPromise = null;
    }
    
    this.onStateChange("idle");
  }

  sendText(text: string) {
    if (this.sessionPromise) {
      this.sessionPromise.then(session => {
        session.sendRealtimeInput({ text });
      });
    }
  }
}
