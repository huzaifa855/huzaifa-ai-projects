/**
 * Command Service: Parses user input (English, Roman Urdu, Urdu, Pashto)
 * and detects intent for PC automation, calling, note creation, and media.
 */

export interface CommandResult {
  action: string;
  type: 
    | "shutdown" 
    | "restart" 
    | "cancel_shutdown" 
    | "lock" 
    | "sleep" 
    | "open_app" 
    | "create_note" 
    | "call" 
    | "volume" 
    | "browser" 
    | "none";
  payload?: any;
  spokenReply: string;
}

export function processCommand(command: string): CommandResult {
  const lowerCmd = command.toLowerCase().trim();

  // -------------------------------------------------------------
  // 1. PC POWER COMMANDS (SHUTDOWN / RESTART / LOCK / SLEEP / CANCEL)
  // -------------------------------------------------------------

  // Cancel Shutdown
  if (
    lowerCmd.includes("cancel shutdown") ||
    lowerCmd.includes("abort shutdown") ||
    lowerCmd.includes("shutdown cancel") ||
    lowerCmd.includes("shutdown roko") ||
    lowerCmd.includes("shutdown mat karo") ||
    lowerCmd.includes("band mat karo")
  ) {
    return {
      action: "Cancelling pending shutdown...",
      type: "cancel_shutdown",
      spokenReply: "Shutdown process has been cancelled successfully. Your PC will stay on!",
    };
  }

  // Shutdown
  if (
    lowerCmd === "shutdown" ||
    lowerCmd === "shutdown pc" ||
    lowerCmd === "turn off pc" ||
    lowerCmd === "turn off computer" ||
    lowerCmd.includes("shutdown my pc") ||
    lowerCmd.includes("shutdown computer") ||
    lowerCmd.includes("pc shutdown") ||
    lowerCmd.includes("pc band kar") ||
    lowerCmd.includes("computer band kar") ||
    lowerCmd.includes("system band kar") ||
    lowerCmd.includes("pc off kar")
  ) {
    return {
      action: "Initiating PC Shutdown sequence (10s delay)...",
      type: "shutdown",
      payload: { delay: 10 },
      spokenReply: "Initiating PC shutdown in 10 seconds. You can say 'Cancel shutdown' to abort.",
    };
  }

  // Restart
  if (
    lowerCmd === "restart" ||
    lowerCmd === "restart pc" ||
    lowerCmd === "reboot" ||
    lowerCmd.includes("restart my pc") ||
    lowerCmd.includes("restart computer") ||
    lowerCmd.includes("pc restart") ||
    lowerCmd.includes("computer restart")
  ) {
    return {
      action: "Initiating PC Restart (10s delay)...",
      type: "restart",
      payload: { delay: 10 },
      spokenReply: "Restarting your PC in 10 seconds.",
    };
  }

  // Lock PC
  if (
    lowerCmd === "lock pc" ||
    lowerCmd === "lock computer" ||
    lowerCmd.includes("pc lock") ||
    lowerCmd.includes("screen lock") ||
    lowerCmd.includes("lock my pc")
  ) {
    return {
      action: "Locking PC workstation...",
      type: "lock",
      spokenReply: "Locking your PC workstation now.",
    };
  }

  // Sleep PC
  if (
    lowerCmd === "sleep pc" ||
    lowerCmd === "sleep mode" ||
    lowerCmd.includes("pc sleep") ||
    lowerCmd.includes("computer ko sula")
  ) {
    return {
      action: "Putting PC to sleep...",
      type: "sleep",
      spokenReply: "Putting your computer to sleep.",
    };
  }

  // -------------------------------------------------------------
  // 2. NOTEPAD & QUOTES AUTOMATION
  // -------------------------------------------------------------

  // "write quotes in notepad" / "notepad mein quotes likho" / "quote likh do"
  const quoteMatch = 
    lowerCmd.match(/(?:write|put|type|generate|add)?\s*(?:motivational\s*)?(?:quotes?|shayari|aqwal)\s*(?:in|to|on)?\s*notepad/i) ||
    lowerCmd.match(/notepad\s*me(?:in)?\s*(?:quotes?|shayari|aqwal)\s*(?:likh|daal)/i) ||
    lowerCmd.match(/quotes?\s*(?:likh|bana)\s*(?:do|de)/i);

  if (quoteMatch) {
    const quotes = [
      `"The only way to do great work is to love what you do." — Steve Jobs`,
      `"Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill`,
      `"Believe you can and you're halfway there." — Theodore Roosevelt`,
      `"Dream big and dare to fail." — Norman Vaughan`,
      `"Khudi ko kar buland itna ke har taqdeer se pehle, Khuda bande se khud pooche bata teri raza kya hai." — Allama Iqbal`
    ].join("\n\n");

    return {
      action: "Generating inspiring quotes and opening in Notepad...",
      type: "create_note",
      payload: {
        title: "Inspiring Quotes",
        content: quotes,
        openInNotepad: true,
      },
      spokenReply: "I have written some inspiring quotes and opened them in Notepad for you!",
    };
  }

  // "create note [text]" / "notepad bana de jisme likha ho [text]" / "write note [text]"
  const noteMatch = 
    lowerCmd.match(/(?:create note|write note|notepad bana|save note|write in notepad|notepad me likho)\s*(?:saying|that|jisme likha ho|:)?\s*(.+)/i);

  if (noteMatch) {
    const content = noteMatch[1].trim();
    return {
      action: `Creating note and opening in Notepad...`,
      type: "create_note",
      payload: {
        title: "Quick Note",
        content: content,
        openInNotepad: true,
      },
      spokenReply: `Note created and opened in Notepad: "${content.slice(0, 40)}..."`,
    };
  }

  // -------------------------------------------------------------
  // 3. CALLING & PHONE LINK / WHATSAPP / SKYPE
  // -------------------------------------------------------------

  // "call [name/number]" / "[name] ko call lagao" / "call laga do [name]"
  const callMatch = 
    lowerCmd.match(/^call\s+([\d\+\w\s]+)$/i) ||
    lowerCmd.match(/^dial\s+([\d\+\w\s]+)$/i) ||
    lowerCmd.match(/(.+?)\s*ko\s*call\s*(?:lagao|karo|laga\s*do|laga\s*de)/i) ||
    lowerCmd.match(/call\s*(?:laga\s*do|laga\s*de|karo)\s*(?:to\s*)?(.+)/i);

  if (callMatch) {
    const target = (callMatch[1] || "").trim();
    if (target && !target.includes("notepad") && !target.includes("shutdown") && !target.includes("quote")) {
      const isNumber = /^[\d\+\s\-()]+$/.test(target);
      return {
        action: `Initiating call to ${target}...`,
        type: "call",
        payload: {
          target: target,
          type: isNumber ? "phone" : "whatsapp",
        },
        spokenReply: `Connecting call to ${target}. Opening dialer now.`,
      };
    }
  }

  // "send whatsapp message to [number] saying [message]"
  const waMatch = lowerCmd.match(
    /^(?:send\s+(?:a\s+)?whatsapp(?:\s+message)?\s+to\s+)([\d\+\s]+)\s+(?:saying|with message)\s+(.+)$/i
  );
  if (waMatch) {
    const number = waMatch[1].replace(/\s+/g, "");
    const message = waMatch[2].trim();
    return {
      action: `Opening WhatsApp chat with ${number}...`,
      type: "call",
      payload: {
        target: number,
        type: "whatsapp",
        message: message,
      },
      spokenReply: `Opening WhatsApp with message to ${number}.`,
    };
  }

  // -------------------------------------------------------------
  // 4. VOLUME & SYSTEM CONTROLS
  // -------------------------------------------------------------
  if (lowerCmd.includes("volume up") || lowerCmd.includes("awaaz badhao") || lowerCmd.includes("awaz tez")) {
    return {
      action: "Increasing PC volume...",
      type: "volume",
      payload: { action: "up" },
      spokenReply: "Increasing volume.",
    };
  }

  if (lowerCmd.includes("volume down") || lowerCmd.includes("awaaz kam") || lowerCmd.includes("awaz dheemi")) {
    return {
      action: "Decreasing PC volume...",
      type: "volume",
      payload: { action: "down" },
      spokenReply: "Decreasing volume.",
    };
  }

  if (lowerCmd === "mute" || lowerCmd.includes("mute pc") || lowerCmd.includes("awaz band")) {
    return {
      action: "Muting PC audio...",
      type: "volume",
      payload: { action: "mute" },
      spokenReply: "Muting audio.",
    };
  }

  // -------------------------------------------------------------
  // 5. APPLICATION LAUNCHER (OPEN ANY PC APP)
  // -------------------------------------------------------------

  // "open [app name]" / "[app name] kholo" / "launch [app]" / "start [app]"
  const openAppMatch = 
    lowerCmd.match(/^(?:open|launch|start|run)\s+(.+)$/i) ||
    lowerCmd.match(/^(.+?)\s*(?:kholo|chalao|khol\s*do|khol\s*de)$/i);

  if (openAppMatch) {
    let rawTarget = openAppMatch[1].trim();

    // Remove common trailing words
    rawTarget = rawTarget.replace(/^(app|software|program|application)\s+/i, "");

    // Media exceptions
    if (rawTarget.includes("youtube")) {
      return {
        action: "Opening YouTube in browser...",
        type: "browser",
        payload: { url: "https://www.youtube.com" },
        spokenReply: "Opening YouTube.",
      };
    }

    if (rawTarget.startsWith("google") && rawTarget.length > 6) {
      const query = rawTarget.replace(/^google\s*/i, "").trim();
      return {
        action: `Searching Google for "${query}"...`,
        type: "browser",
        payload: { url: `https://www.google.com/search?q=${encodeURIComponent(query)}` },
        spokenReply: `Searching Google for ${query}.`,
      };
    }

    // Default: Open PC Application
    return {
      action: `Launching ${rawTarget} on PC...`,
      type: "open_app",
      payload: { appName: rawTarget },
      spokenReply: `Opening ${rawTarget} on your PC now.`,
    };
  }

  // YouTube search: "play [song] on youtube"
  const ytMatch = lowerCmd.match(/^play\s+(.+?)\s+on\s+youtube$/i);
  if (ytMatch) {
    const query = encodeURIComponent(ytMatch[1].trim());
    return {
      action: `Playing ${ytMatch[1]} on YouTube...`,
      type: "browser",
      payload: { url: `https://www.youtube.com/results?search_query=${query}` },
      spokenReply: `Playing ${ytMatch[1]} on YouTube.`,
    };
  }

  // Spotify search: "search [query] on spotify"
  const spotifyMatch = lowerCmd.match(/^search\s+(.+?)\s+on\s+spotify$/i);
  if (spotifyMatch) {
    const query = encodeURIComponent(spotifyMatch[1].trim());
    return {
      action: `Searching ${spotifyMatch[1]} on Spotify...`,
      type: "browser",
      payload: { url: `https://open.spotify.com/search/${query}` },
      spokenReply: `Searching ${spotifyMatch[1]} on Spotify.`,
    };
  }

  return {
    action: "",
    type: "none",
    spokenReply: "",
  };
}
