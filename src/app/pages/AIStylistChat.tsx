import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Image } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  images?: string[];
}

export function AIStylistChat() {

  const userId =
    localStorage.getItem("userId") || "guest";

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [inputMessage, setInputMessage] =
    useState("");

  const [files, setFiles] =
    useState<File[]>([]);

  const [loading, setLoading] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);


  // ✅ auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);


  // ✅ base64 convert
  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () =>
        resolve(reader.result as string);

      reader.onerror = reject;

    });


  // ✅ load history
  useEffect(() => {

    fetch(
      "http://localhost:5000/history/" +
      userId
    )
      .then((res) => res.json())
      .then((data) => {

        const all: Message[] = [];

        data.forEach((c: any) => {

          all.push({
            id: Math.random().toString(),
            text: c.message,
            sender: "user",
            timestamp: "",
          });

          all.push({
            id: Math.random().toString(),
            text: c.reply,
            sender: "ai",
            timestamp: "",
          });

        });

        setMessages(all);

      });

  }, []);



  const openFilePicker = () => {
    fileInputRef.current?.click();
  };


  const handleFiles = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (!e.target.files) return;

    setFiles(
      Array.from(e.target.files)
    );

  };


  const handleSendMessage =
    async () => {

      if (!inputMessage.trim())
        return;

      const userMessage: Message = {

        id: Date.now().toString(),

        text: inputMessage,

        sender: "user",

        timestamp:
          new Date().toLocaleTimeString(),

      };

      setMessages((prev) => [
        ...prev,
        userMessage,
      ]);

      const textToSend =
        inputMessage;

      setInputMessage("");

      setLoading(true);


      // images convert

      const base64Images = [];

      for (let file of files) {

        const data =
          await toBase64(file);

        base64Images.push(data);

      }


      try {

        const res = await fetch(
          "http://localhost:5000/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({

              message:
                textToSend,

              userId:
                userId,

              images:
                base64Images,

            }),
          }
        );

        const data =
          await res.json();

        const aiMessage: Message = {

          id: Date.now().toString(),

          text:
            data.reply,

          sender: "ai",

          timestamp:
            new Date().toLocaleTimeString(),

        };

        setMessages((prev) => [
          ...prev,
          aiMessage,
        ]);

        setLoading(false);

        setFiles([]);

      } catch {

        setLoading(false);

      }

    };


  return (

    <div className="h-screen flex flex-col bg-gray-50">


      {/* HEADER */}

      <div className="bg-white border-b px-4 py-3 flex">

        <Sparkles />
        <button
          onClick={() => {

            setMessages([]);

          }}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          Clear Chat
        </button>

        <h1 className="ml-2 font-bold">
          AI Stylist Chat
        </h1>

      </div>



      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((m) => (

          <div
            key={m.id}
            className={`flex ${m.sender === "user"
              ? "justify-end"
              : "justify-start"
              }`}
          >

            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl shadow
              ${m.sender === "user"
                  ? "bg-purple-500 text-white"
                  : "bg-white border"
                }`}
            >

              <div className="text-sm">
                {m.text.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>

            </div>

          </div>

        ))}


        {loading && (
          <div>AI typing...</div>
        )}


        <div
          ref={messagesEndRef}
        />

      </div>





      <div className="bg-white border-t p-3">


        <input
          title='buttion'
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFiles}
          style={{ display: "none" }}
        />


        <div className="flex gap-2">

          <button
            title='buttion'
            onClick={openFilePicker}
            className="w-10 h-10 bg-gray-200 rounded"
          >
            <Image size={18} />
          </button>


          <input
            title='buttion'
            value={inputMessage}
            onChange={(e) =>
              setInputMessage(
                e.target.value
              )
            }
            className="flex-1 border px-2"
          />


          <button
            title='buttion'
            onClick={
              handleSendMessage
            }
            className="w-10 h-10 bg-purple-500 text-white rounded"
          >
            <Send size={18} />
          </button>

        </div>

      </div>

    </div>

  );

}