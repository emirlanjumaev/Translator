import React, { useEffect, useState } from "react";
import languageList from "./language.json";
import { useDebouncedCallback } from "use-debounce";

import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { IoVolumeHighOutline } from "react-icons/io5";
import { useSpeechSynthesis } from "react-speech-kit";

import { PiMicrophone } from "react-icons/pi";

export default function Translator() {
  const { transcript, finalTranscript } = useSpeechRecognition();

  const { speak, voices } = useSpeechSynthesis();
  const [inputFormat, setInputFormat] = useState("en");
  const [outputFormat, setOutputFormat] = useState("ru");
  const [translatedText, setTranslatedText] = useState("");
  const [inputText, setInputText] = useState("");
  const [load, setLoad] = useState(false);
  const [voice, setVoice] = useState({
    v1: null,
    v2: null,
  });

  function getCurrentVoice() {
    const googleVoices = voices.filter((item) => item.name.includes("Google"));
    const v1 = googleVoices.find((item) => item.lang.includes(inputFormat));
    const v2 = googleVoices.find((item) => item.lang.includes(outputFormat));

    setVoice(() => {
      return {
        v1: v1 || 0,
        v2: v2 || 0,
      };
    });

    return {
      v1,
      v2,
    };
  }

  const handleReverseLanguage = () => {
    const value = inputFormat;
    setInputFormat(outputFormat);
    setOutputFormat(value);
    setInputText("");
    setTranslatedText("");
  };

  const handleRemoveInputText = () => {
    setInputText("");
    setTranslatedText("");
  };

  const handleTranslate = async () => {
    if (!inputText || !inputFormat || !outputFormat)
      return setTranslatedText("");

    const url = `https://microsoft-translator-text.p.rapidapi.com/translate?to%5B0%5D=${outputFormat}&api-version=3.0&profanityAction=NoAction&textType=plain`;
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": import.meta.env.VITE_API_KEY,
        "X-RapidAPI-Host": "microsoft-translator-text.p.rapidapi.com",
      },
      body: JSON.stringify([
        {
          Text: inputText,
        },
      ]),
    };
    setLoad(true);
    try {
      const response = await fetch(url, options);
      const result = await response.text();
      const responseObject = JSON.parse(result);
      const translation = responseObject[0].translations[0].text;
      setTranslatedText(translation);
    } catch (error) {
      console.log(error);
      alert("Please Try Again! Some Error Occurred at your side");
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    getCurrentVoice();
  }, [voices]);

  useEffect(() => {
    handleTranslate();
  }, [outputFormat]);

  const debounced = useDebouncedCallback((value) => {
    handleTranslate();
  }, 500);

  useEffect(() => {
    setInputText(transcript);
    debounced();
  }, [transcript]);

  return (
    <div className="container">
      <div className="row1">
        <select
          value={inputFormat}
          onChange={(e) => {
            setInputFormat(e.target.value), getCurrentVoice();
          }}
        >
          {Object.keys(languageList).map((key, index) => {
            const language = languageList[key];
            return (
              <option key={index} value={key}>
                {language.name}
              </option>
            );
          })}
        </select>
        <svg
          className="reversesvg"
          onClick={handleReverseLanguage}
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"></path>
        </svg>
        <select
          value={outputFormat}
          onChange={(e) => {
            setOutputFormat(e.target.value);
            setTranslatedText("Translation");
          }}
        >
          {Object.keys(languageList).map((key, index) => {
            const language = languageList[key];
            return (
              <option key={index + 118} value={key}>
                {language.name}
              </option>
            );
          })}
        </select>
      </div>
      <div className="row2">
        <div
          className="inputText"
          style={{
            // border: "1px solid gray",
            borderRadius: "6px",
            overflow: "hidden",
            boxShadow: "0px 0px 1px black",
          }}
        >
          <svg
            className="removeinput"
            style={{ display: inputText.length ? "block" : "none" }}
            onClick={handleRemoveInputText}
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
          <textarea
            type="text"
            value={inputText}
            placeholder="Enter Text"
            onChange={(e) => {
              setInputText(e.target.value);
              debounced(handleTranslate);
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "20%",
            }}
          >
            <button
              onClick={SpeechRecognition.startListening}
              className="span"
              style={{ margin: "0 10px 10px 10px" }}
            >
              <PiMicrophone style={{ fontSize: "21px" }} />
            </button>
            <button
              disabled={voice.v1 === 0 || !inputText}
              onClick={() => {
                speak({ text: inputText, voice: voice.v1 });
              }}
              className="span"
              style={{ margin: "0 10px 10px 10px" }}
            >
              <IoVolumeHighOutline style={{ fontSize: "21px" }} />
            </button>
          </div>
        </div>
        <div
          className="outputText"
          style={{ display: "flex", flexDirection: "column" }}
        >
          {
            <span style={{ padding: "0px 10px 10px 10px" }}>
              {load ? "Идет перевод..." : translatedText}
            </span>
          }
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              height: "20%",
            }}
          >
            <button
              style={{ margin: "0 10px 10px 10px" }}
              onClick={SpeechRecognition.startListening}
              className="span"
            >
              <PiMicrophone style={{ fontSize: "21px" }} />
            </button>
            <button
              disabled={voice.v2 === 0 || !translatedText}
              onClick={() => {
                speak({ text: translatedText, voice: voice.v2 });
              }}
              className="span"
              style={{ margin: "0 10px 10px 10px" }}
            >
              <IoVolumeHighOutline style={{ fontSize: "21px" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
