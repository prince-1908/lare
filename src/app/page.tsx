'use client'
import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import Image from "next/image";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion, AnimatePresence } from "framer-motion";
import { studyQuotes } from "@/data/quotes";

const images = [
  '/luffy/random1.gif',
  '/luffy/random2.gif',
  '/luffy/random3.gif',
  '/luffy/random4.jpeg',
  '/luffy/random5.gif',
  '/luffy/random6.gif',
  '/luffy/random1.gif',
  '/luffy/random2.gif',
  '/luffy/random3.gif',
  '/luffy/random4.jpeg',
  '/luffy/random5.gif',
  '/luffy/random6.gif',
  '/luffy/random1.gif',
  '/luffy/random2.gif',
  '/luffy/random3.gif',
  '/luffy/random4.jpeg',
  '/luffy/random5.gif',
  '/luffy/random6.gif',
  '/luffy/random7.gif',
  '/luffy/random8.gif',
  '/luffy/random9.gif',
  '/luffy/random10.gif',
  '/luffy/random11.gif',
  '/luffy/random12.gif',
  '/luffy/random13.gif',
  '/luffy/random14.jpeg',
  '/luffy/random15.gif',
  '/luffy/random16.gif',
  '/luffy/random17.gif',
  '/luffy/random18.gif',
  '/luffy/random19.gif',
  '/luffy/random20.gif',
  '/luffy/random21.gif',
  '/luffy/random22.jpeg',
]

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

  const [index, setIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % studyQuotes.length);
      if(imageIndex<images.length-1){
        setImageIndex((prevIndex) => (prevIndex + 1));
      } else {
        setImageIndex(0);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-primary">
      <div className="mb-2 text-center">
        <h1 className="text-7xl font-bold">𐌋𐌀Ré</h1>
        <p>
          your personal ai-powered exam preparation bot
        </p>
      </div>
      <div
        className="flex grow w-full gap-12"
      >
        <div
          className="min-w-1/3"
        >
          <div className="p-6 bg-secondary rounded-2xl flex flex-col justify-center">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4 bg-primary p-4 rounded-xl cursor-pointer" />
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
              <p className="mt-4 text-center">Extracting text...</p>
            ) : (
              <textarea
                value={text}
                rows={50}
                onChange={(e) => setText(e.target.value)}
                className="mt-4 p-2 bg-[#5C8374] focus:bg-[#93B1A6] rounded overflow-auto max-h-40 border-0 outline-0 text-primary font-semibold hide-scrollbar"
              />
            )}
            <button
              onClick={getAnswers}
              className="mt-4 px-4 py-2 bg-primary rounded-lg disabled:opacity-50 cursor-pointer"
              disabled={!text || fetchingAnswers}
            >
              {fetchingAnswers ? "Fetching Answers..." : "Get Answers"}
            </button>
          </div>
        </div>
        <div
          className="h-[85vh] overflow-y-auto hide-scrollbar bg-secondary grow rounded-lg"
        >
          {answers && !fetchingAnswers ? (
            <div className="p-4 text-left text-lg">
              <h2 className="font-bold mb-2">Answers:</h2>
              <div className="whitespace-pre-wrap">
                <TextGenerateEffect words={answers} />
              </div>
            </div>
          ) : (
            fetchingAnswers ?
              <div className="h-full w-full flex gap-4 flex-col justify-center items-center">
                <div className="loader"></div>
                <Image
                  src='/luffy/loading.gif'
                  alt=""
                  height={500}
                  width={500}
                />
              </div> :
              <div className="h-full flex flex-col justify-center items-center px-8">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="text-5xl font-semibold mb-4 text-center"
                  >
                    {studyQuotes[index]}
                  </motion.p>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="mt-4"
                  >
                    <Image
                      src={images[imageIndex]}
                      alt=""
                      height={400}
                      width={400}
                    />
                  </motion.p>
                </AnimatePresence>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
