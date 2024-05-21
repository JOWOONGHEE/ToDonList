"use client"
import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/aichat.module.css";
import { useRouter } from 'next/navigation';


export default function aiChat() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const sendMessage = async (message) => {
    setChatHistory((prev) => [...prev, { role: "user", content: message }]);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: chatHistory.concat([{ role: "user", content: message }]) }),
      });
      const data = await response.json();
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { role: "assistant", content: data.choices[0].message.content },
      ]);
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  // 채팅 저장
  const saveChat = async () => {
    await fetch('/api/saveChat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatData: chatHistory }),
    });
  };
  //저장된 채팅내역 가져오기
  const fetchChatHistory = async () => {
    try {
      const response = await fetch('/api/getChats');
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data); // 데이터 구조에 따라 조정 필요
        router.push('/api/chatHistory'); // 사용자에게 보여줄 페이지로 이동
      } else {
        console.error("채팅 기록을 가져오는데 실패했습니다.");
        alert("채팅 기록을 가져오는데 실패했습니다."); // 사용자에게 에러 알림
      }
    } catch (error) {
      console.error("네트워크 에러:", error);
      alert("네트워크 에러가 발생했습니다."); // 사용자에게 에러 알림
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
