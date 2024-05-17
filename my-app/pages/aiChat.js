import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/aiChat.module.css";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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
      const completion = await openai.chat.completions.create({
        messages: chatHistory.concat([{ role: "user", content: message }]),
        model: "gpt-3.5-turbo",
      });
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { role: "assistant", content: completion.choices[0].message.content },
      ]);
    } catch (error) {
      console.error("OpenAI API 호출 중 오류 발생:", error);
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
    <div>
      <Head>
        <title>To-Don List AI 챗</title>
      </Head>
      <h1 className={styles.heading1}>To-Don List AI 챗</h1>
      <div className={styles.chatContainer} ref={chatContainerRef}>
        {chatHistory && chatHistory.map((msg, index) => (
          <div key={index} className={msg.role === "user" ? styles.userMessage : styles.assistantMessage}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className={styles.messageInputContainer}>
        <form onSubmit={onSubmit}>
          <div className={styles.inputGroup}>
            <input
              className={styles.textInput}
              placeholder="메시지를 입력해주세요"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className={styles.sendButton} type="submit">
              보내기
            </button>
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.button} type="button" onClick={clearChat}>
              초기화
            </button>
            <button className={styles.button} type="button" onClick={saveChat}>
              채팅 저장
            </button>
            <button className={styles.button} type="button" onClick={fetchChatHistory}>
              채팅 기록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
