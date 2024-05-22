"use client"
import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/aichat.module.css";
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function aiChat() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "system", content: "안녕하세요. 무엇을 도와드릴까요?" },
  ]);
  const chatContainerRef = useRef(null);

  

  const api = axios.create({
    baseURL: 'http://localhost:5000/api'
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const sendMessage = async (message) => {
    setChatHistory(prev => [...prev, { role: "user", content: message }]);
    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:5000/api/generate?endpoint=chat',
        data: {
          message: message
        },
        withCredentials: true, // 쿠키/인증 토큰 포함
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('서버 응답:', response.data);
      const data = response.data;
      if (data.success) {
        // Open a connection to receive streamed responses
        const eventSource = new EventSource("http://localhost:5000/api/generate?endpoint=stream");
        eventSource.onmessage = function (event) {
          // Parse the event data, which is a JSON string
          const parsedData = JSON.parse(event.data);
          console.log("AI 응답:", parsedData.message);
          // Check if the last message in the chat history is from the assistant
          setChatHistory((prevChatHistory) => {
            const newChatHistory = [...prevChatHistory];
            if (
              newChatHistory.length > 0 &&
              newChatHistory[newChatHistory.length - 1].role === "assistant"
            ) {
              // If so, append the new chunk to the existing assistant message content
              newChatHistory[newChatHistory.length - 1].content += parsedData;
            } else {
              // Otherwise, add a new assistant message to the chat history
              newChatHistory.push({ role: "assistant", content: parsedData });
            }
            return newChatHistory;
          });
        };
        eventSource.onerror = function () {
          eventSource.close();
        };
        return () => {
          eventSource.close(); // 컴포넌트 언마운트 시 연결 종료
        };
      }
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  const clearChat = () => {
    setChatHistory([{ role: "system", content: "안녕하세요. 무엇을 도와드릴까요?" }]);
  };

  const saveChat = async () => {
    try {
      await api.post('/saveChat', { chatData: chatHistory });
      alert("채팅이 저장되었습니다.");
    } catch (error) {
      console.error("채팅 저장 중 오류 발생:", error);
      alert("채팅 저장에 실패했습니다.");
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await api.get('/getChats');
      setChatHistory(response.data);
      router.push('/chatHistory');
    } catch (error) {
      console.error("채팅 기록을 가져오는데 실패했습니다:", error);
      alert("채팅 기록을 가져오는데 실패했습니다.");
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    sendMessage(message.trim());
    setMessage("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-custom-green-light space-y-8 p-8">
      <h1 className="text-4xl font-bold text-black mb-6">AI 챗</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className={styles.chatContainer} ref={chatContainerRef}>
          {chatHistory && chatHistory.map((msg, index) => (
            <div key={index} className={msg.role === "user" ? styles.userMessage : styles.assistantMessage}>
            {msg.content}
          </div>
          ))}
        </div>
        <form onSubmit={onSubmit} className="mt-4 justify-between">
          <div className="flex items-center rounded-md border border-custom-green">
            <input
              className="flex-grow p-3  rounded-md focus:outline-none"
              placeholder="메시지를 입력해주세요"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="ml-2 mt-auto flex flex-col justify-between bg-custom-green text-white px-2 py-1 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              type="submit">
              ▶️
            </button>
          </div>
        </form>
        <div className="flex justify-between mt-4">
          <button onClick={clearChat} className="bg-custom-green hover:bg-custom-green-dark text-white font-bold py-2 px-4 rounded">
            초기화
          </button>
          <button onClick={saveChat} className="bg-custom-green hover:bg-custom-green-dark text-white font-bold py-2 px-4 rounded">
            채팅 저장
          </button>
          <button onClick={fetchChatHistory} className="bg-custom-green hover:bg-custom-green-dark text-white font-bold py-2 px-4 rounded">
            채팅 내역
          </button>
        </div>
      </div>
    </main>
  );
}
