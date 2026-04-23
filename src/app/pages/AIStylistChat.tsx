import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Image as ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiCall, API_ENDPOINTS } from "../../config/api";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  images?: string[];
}

const quickPrompts = [
  "Show me a polished weekend outfit",
  "What should I wear to a casual dinner?",
  "Give me a summer street style look",
];

export function AIStylistChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const CHAT_STORAGE_KEY = `chat_history_${userId}`;

  useEffect(() => {
    if (!token || !userId) {
      navigate("/auth");
      return;
    }
    fetchChatHistory();
  }, [token, userId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ✅ Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, CHAT_STORAGE_KEY]);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const fetchChatHistory = async () => {
    try {
      // First try to load from localStorage (faster)
      const cachedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      }

      // Then fetch fresh from backend
      const history = await apiCall(API_ENDPOINTS.GET_CHAT_HISTORY);
      const formatted: Message[] = history.flatMap((item: any) => [
        {
          id: `${item._id}-user`,
          text: item.message,
          sender: "user",
          timestamp: new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          images: item.images ?? undefined,
        },
        {
          id: `${item._id}-ai`,
          text: item.reply,
          sender: "ai",
          timestamp: new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setMessages(formatted);
      // Update cache
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(formatted));
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Fall back to cached version if API fails
      const cachedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      }
    }
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);

    const previews: string[] = [];
    for (let file of newFiles) {
      previews.push(await toBase64(file));
    }
    setImagePreview(prev => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const clearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setMessages([]);
      setFiles([]);
      setImagePreview([]);
      setInputMessage("");
      // Clear from localStorage
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setFiles([]);
    setImagePreview([]);
    setInputMessage("");
  };

  const handleSendMessage = async (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter") return;
    if (e?.shiftKey) return;
    if (!inputMessage.trim() && !files.length) return;
    if (!token) {
      navigate("/auth");
      return;
    }

    const base64Images: string[] = [];
    for (let file of files) {
      base64Images.push(await toBase64(file));
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: inputMessage || "[Image attached]",
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      images: base64Images.length ? base64Images : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setFiles([]);
    setImagePreview([]);
    setLoading(true);

    try {
      const data = await apiCall(API_ENDPOINTS.SEND_MESSAGE, {
        method: "POST",
        data: { message: userMessage.text, images: base64Images },
      });

      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        text: data.reply,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Server error";
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: `Error: ${errorText}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <div className="bg-white border-b border-purple-200 px-3 sm:px-6 py-2 sm:py-4 flex items-center justify-between sticky top-0 shadow-sm z-20 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">AI Stylist</h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">Ask fashion questions</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={clearChat}
            title="Clear chat"
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-red-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <Trash2 size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={resetChat}
            title="Reset chat"
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-blue-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <RefreshCw size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-6 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center mb-2 sm:mb-4">
              <Sparkles size={24} className="sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Welcome to AI Stylist</h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md px-2">
              Ask for outfit ideas, styling advice, or share images for feedback.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
            {m.sender === "ai" && (
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center mr-1 sm:mr-3 flex-shrink-0 mt-1">
                <Sparkles size={12} className="sm:w-4 sm:h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] sm:max-w-[70%] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-sm transition-all ${m.sender === "user"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none"
              : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
              }`}>
              {m.images?.length ? (
                <div className="mb-2 sm:mb-3 flex flex-wrap gap-1">
                  {m.images.map((src, idx) => (
                    <img key={idx} src={src} alt="attachment" className="h-16 sm:h-20 w-16 sm:w-20 rounded object-cover" />
                  ))}
                </div>
              ) : null}
              <div className="whitespace-pre-wrap break-words">{m.text}</div>
              <div className={`text-xs mt-1 sm:mt-2 ${m.sender === "user" ? "text-purple-100" : "text-gray-500"}`}>
                {m.timestamp}
              </div>
            </div>
            {m.sender === "user" && (
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center ml-1 sm:ml-3 flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">U</span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <Sparkles size={16} className="text-white animate-spin" />
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-purple-200 p-2 sm:p-4 shadow-lg">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFiles}
          style={{ display: "none" }}
        />

        {imagePreview.length > 0 && (
          <div className="mb-2 sm:mb-3 flex gap-1 sm:gap-2 flex-wrap">
            {imagePreview.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt="preview" className="h-12 w-12 sm:h-16 sm:w-16 rounded border-2 border-purple-300 object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-red-600 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-2 sm:gap-3">
          <div className="flex flex-wrap gap-1 sm:gap-2 max-h-12 overflow-y-auto">
            {quickPrompts.map((prompt) => (
              <button
                type="button"
                key={prompt}
                onClick={() => setInputMessage(prompt)}
                className="px-2 sm:px-3 py-1 sm:py-2 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm hover:bg-purple-50 transition whitespace-nowrap flex-shrink-0"
              >
                {prompt.length > 20 ? prompt.substring(0, 17) + "..." : prompt}
              </button>
            ))}
          </div>

          <div className="flex gap-1 sm:gap-3">
            <button
              onClick={openFilePicker}
              title="Add images"
              className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition flex items-center justify-center flex-shrink-0 min-h-[40px]"
            >
              <ImageIcon size={16} className="sm:w-5 sm:h-5" />
            </button>

            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleSendMessage}
              placeholder="Ask..."
              rows={1}
              className="flex-1 min-h-[40px] sm:min-h-[46px] resize-none border-2 border-gray-200 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm rounded-lg focus:outline-none focus:border-purple-500 transition"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={loading || (!inputMessage.trim() && !files.length)}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 min-h-[40px]"
            >
              <Send size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="hidden sm:block rounded-2xl sm:rounded-3xl border border-purple-100 bg-purple-50 p-3 sm:p-4 text-xs sm:text-sm text-gray-600">
            <h3 className="font-semibold text-purple-700 mb-1 sm:mb-2 text-xs sm:text-sm">Chat Tips</h3>
            <p className="text-xs">Upload photos for tailored suggestions.</p>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-1 sm:mt-2">Enter to send</div>
      </div>
    </div>
  );
}
