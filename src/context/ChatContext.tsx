import React, { createContext, useContext, useState, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  images?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface ChatContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentMessages: Message[];
  addMessage: (message: Message) => void;
  createNewChat: () => void;
  deleteChat: (sessionId: string) => void;
  switchChat: (sessionId: string) => void;
  clearCurrentChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("chatSessions");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    const saved = localStorage.getItem("currentSessionId");
    return saved;
  });

  // Initialize first session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: "New Chat",
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setSessions([newSession]);
      setCurrentSessionId(newSession.id);
    } else if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem("currentSessionId", currentSessionId);
    }
  }, [currentSessionId]);

  const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || [];

  const addMessage = (message: Message) => {
    setSessions(sessions.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, message],
        };
      }
      return session;
    }));
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };

  const deleteChat = (sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(newSessions[0]?.id || null);
    }
  };

  const switchChat = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const clearCurrentChat = () => {
    setSessions(sessions.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [],
        };
      }
      return session;
    }));
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSessionId,
        currentMessages,
        addMessage,
        createNewChat,
        deleteChat,
        switchChat,
        clearCurrentChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
