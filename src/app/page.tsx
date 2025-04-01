'use client'
import { useState } from "react";
import Tesseract from "tesseract.js";
import Image from "next/image";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<string>("");
  const [fetchingAnswers, setFetchingAnswers] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        setImage(null);
        setText("");
        return;
      }
      setError("");
      setImage(file);
      extractText(file);
    }
  };

  const extractText = async (file: File) => {
    setLoading(true);
    try {
      const { data } = await Tesseract.recognize(URL.createObjectURL(file), "eng");
      setText(data.text);
    } catch (err) {
      console.error("Error extracting text:", err);
      setError("Failed to extract text. Please try again.");
    }
    setLoading(false);
  };

  const getAnswers = async () => {
    if (!text) return;
    setFetchingAnswers(true);
    try {
      const response = await fetch("/api/getAnswers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: text })
      });
      const data = await response.json();
      const ans = cleanText(data.answers)
      setAnswers(ans);
    } catch (err) {
      console.error("Error fetching answers:", err);
      setError("Failed to fetch answers. Try again later.");
    }
    setFetchingAnswers(false);
  };

  const cleanText = (text: string) => {
    return text
      .replace(/^Answers:\n/, '') // Remove "Answers:" at the start
      .replace(/---+/g, '') // Remove "---" separators
      .replace(/\n{2,}/g, '\n\n') // Reduce multiple newlines to a maximum of 2
      .replace(/\*\*(.*?)\*\*/g, '$1') // Convert **bold** to <strong>bold</strong>
      .trim(); // Trim leading/trailing spaces
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Exam Preparation Bot</h1>

      <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-md text-center">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {image &&
          <Image
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="mt-4 max-w-xs mx-auto"
            height={400}
            width={400}
          />}

        {loading ? (
          <p className="mt-4 text-blue-600">Extracting text...</p>
        ) : (
          <pre className="mt-4 p-2 bg-gray-200 border rounded text-sm overflow-auto max-h-40">{text}</pre>
        )}

        <button
          onClick={getAnswers}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          disabled={!text || fetchingAnswers}
        >
          {fetchingAnswers ? "Fetching Answers..." : "Get Answers"}
        </button>

        {answers && (
          <div className="mt-4 p-4 bg-green-100 border rounded-lg text-left">
            <h2 className="font-bold mb-2">Answers:</h2>
            <div className="text-sm whitespace-pre-wrap">{answers}</div>
          </div>
        )}
      </div>
    </div>
  );
}
