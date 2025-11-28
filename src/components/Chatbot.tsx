// components/ChatBot.tsx
import { useEffect } from "react";
import { createChat } from "@n8n/chat";
import "@n8n/chat/style.css";

const ChatBot = () => {
  useEffect(() => {
    createChat({
      webhookUrl: "http://localhost:5678/webhook/e654d8b9-2cf4-4847-89ed-86e21a0a9547/chat",
    //   chatTitle: "Demeter Assistant 🌱",
    //   initialMessage: "👋 Hi, I’m Demeter! Ask me about crop health, fertilizer, or irrigation.",
      theme: {
        primary: "#28a745",
        secondary: "#ffffff",
      },
    });
  }, []);

  return null; // nothing to render, widget attaches automatically
};

export default ChatBot;
