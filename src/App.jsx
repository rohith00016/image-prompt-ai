import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./App.css";

const App = () => {
  const [file, setFile] = useState(null);
  const [responseText, setResponseText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const apiKey = import.meta.env.VITE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  function fileToGenerativePart(file, mimeType) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          inlineData: {
            data: reader.result.split(",")[1],
            mimeType,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function run() {
    setIsLoading(true);
    setResponseText(null);
    if (!file) {
      console.log("No file selected");
      setIsLoading(false);
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const imagePart = await fileToGenerativePart(file, file.type);

      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = await response.text();
      setResponseText(text);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileChange = (event) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  return (
    <div className="App">
      <div className="input">
        <input type="file" id="fileInput" onChange={handleFileChange} />
        <input
          type="text"
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Enter your prompt here"
        />
        <button onClick={run} disabled={isLoading}>
          Run
        </button>
      </div>
      {isLoading && <p>Loading...</p>}
      {responseText && <ReactMarkdown>{responseText}</ReactMarkdown>}
    </div>
  );
};

export default App;
