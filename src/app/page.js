'use client'
import { useEffect, useRef, useState, memo } from "react";

const Message = memo(({ msg, lastMessageRef }) => {
  const isBotMessage = msg.role === "bot";
  const alignClass = isBotMessage ? "justify-start" : "justify-end";

  return (
    <div className={`flex ${alignClass}`}>
      <p
        ref={lastMessageRef}
        className={`bg-blue-800 rounded-xl text-sm p-2 m-2  ${isBotMessage ? 'mr-auto' : 'ml-auto'}`}
        style={{
          maxWidth: '85%',
          overflowWrap: 'break-word',
          fontWeight: "bold",
          fontFamily: 'Roboto, sans-serif',
          wordSpacing: '0.1rem',
        }}
      >
        {msg.message}
      </p>
    </div>
  );
});
Message.displayName = 'Message';


const Messages = memo(({ messages, lastMessageRef }) => {
  return (
    <div>
      {messages.map((msg, index) => (
        <Message key={index} msg={msg} lastMessageRef={index === messages.length - 1 ? lastMessageRef : null} />
      ))}
    </div>
  );
});
Messages.displayName = 'Messages';

export default function Home() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [context, setContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  const lastMessageRef = useRef(null);

  const sendMessage = async () => {
    if(message == '' || sent) return;
    setMessage("");
    setSent(true);
    setMessages(prevMessages => [...prevMessages, { role: "user", message }]);
    if (context == null) {
      setContext(message);
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: message, context: message }),
      });
      const json = await response.json();
      json.answer = "Context has been set successfully. Now you can ask questions.";
      setMessages(prevMessages => [...prevMessages, { role: "bot", message: json.answer }]);
    } else {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: message, context: context }),
      });
      const json = await response.json();
      setMessages(prevMessages => [...prevMessages, { role: "bot", message: json.answer }]);
    }
    setSent(false);
  };

  const handleKeyDown = async (e) => {
    if (e.key !== 'Enter' || message == '') return;
    await sendMessage();
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  return (
    <div className="flex w-full h-screen justify-center text-white">
      <div className="relative w-full max-w-4xl h-full py-5 flex flex-col items-center">
        <p className="mx-5 text-xl sm:text-2xl md:text-3xl">Welcome to Multilingual Chatbot</p>
        <div className="flex-grow px-5 mt-5 w-full sm:w-5/6 overflow-auto rounded-lg p-4 custom-scrollbar">
          {
            messages.length === 0 ?
              <div className="flex flex-col justify-center items-center h-full w-full">
                <div className="w-4/5 bg-blue-950 p-5 rounded-xl">Hello, I am a multilingual question answering chatbot. I understand almost 100+ languages known world wide. Before asking any questions you first have to provide me context paragraph, from which i will find answers for questions. You can ask questions in any language yet answers will be in same language as context. </div>
              </div> :
              <Messages messages={messages} lastMessageRef={lastMessageRef} />
          }
        </div>
        <div className="w-full px-5 sm:w-5/6 flex justify-center mt-4">
          <div className="flex w-full max-w-4xl gap-2 items-center">
            <input
              ref={inputRef}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              value={message}
              className="h-12 w-full border-gray-700 border-2 focus:border-gray-700 focus:border-2 focus:outline-none px-3 py-3 bg-transparent rounded-xl"
              placeholder={context == null ? "Enter context" : "Ask a question"}
            />
            {
              !sent  ?
                <svg
                  onClick={sendMessage}
                  viewBox="0 0 24 24"
                  className={`h-11 w-12 p-1 bg-gradient-to-br ${message !== "" ? "from-blue-600 cursor-pointer to-purple-500 hover:bg-gradient-to-bl focus:ring focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800" : "from-blue-800 to-purple-800"} rounded-xl`}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#ffffff"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M10.3009 13.6949L20.102 3.89742M10.5795 14.1355L12.8019 18.5804C13.339 19.6545 13.6075 20.1916 13.9458 20.3356C14.2394 20.4606 14.575 20.4379 14.8492 20.2747C15.1651 20.0866 15.3591 19.5183 15.7472 18.3818L19.9463 6.08434C20.2845 5.09409 20.4535 4.59896 20.3378 4.27142C20.2371 3.98648 20.013 3.76234 19.7281 3.66167C19.4005 3.54595 18.9054 3.71502 17.9151 4.05315L5.61763 8.2523C4.48114 8.64037 3.91289 8.83441 3.72478 9.15032C3.56153 9.42447 3.53891 9.76007 3.66389 10.0536C3.80791 10.3919 4.34498 10.6605 5.41912 11.1975L9.86397 13.42C10.041 13.5085 10.1295 13.5527 10.2061 13.6118C10.2742 13.6643 10.3352 13.7253 10.3876 13.7933C10.4468 13.87 10.491 13.9585 10.5795 14.1355Z"
                      stroke={sent === false && message !== "" ? "#ffffff" : "#707070"}
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                </svg>
                :
                <div className="h-11 w-12 p-1 rounded-lg typing-animation bg-gradient-to-br from-blue-600 to bg-purple-500">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
