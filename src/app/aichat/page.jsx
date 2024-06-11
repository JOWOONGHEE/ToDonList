"use client"
import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/aichat.module.css";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react'; // NextAuth의 useSession 훅 임포트

export default function AiChat() {
  const router = useRouter();
  const { data: session, status } = useSession(); // 세션 데이터와 상태를 가져옴
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
  const [totalPages, setTotalPages] = useState(1); // 총 페이지 수 상태 추가
  const chatContainerRef = useRef(null);
  
  // 상태 관리를 위한 추가적인 useState 호출
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    
  

  const api = axios.create({
    baseURL: 'http://localhost:5000/api'
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    // 로그인 상태 확인
    if (status === 'authenticated' && session?.user?.email) {
      // 사용자별 채팅 내역 불러오기
      fetchChatHistory(session.user.email, currentPage);
    }
  }, [session, status, currentPage]);

  const fetchChatHistory = async (userEmail, page) => {
    setLoading(true); // 로딩 상태 시작
    try {
      const response = await axios.get(`http://localhost:5000/api/getChats?userEmail=${userEmail}&page=${page}`);
      if (Array.isArray(response.data.chats)) {
        setChatHistory(response.data.chats);
        setTotalPages(response.data.totalPages); // 총 페이지 수 설정
      } else {
        console.error('응답 데이터의 "chats" 키가 배열이 아닙니다:', response.data.chats);
        setError('채팅 데이터를 불러오는데 문제가 발생했습니다.'); // 사용자에게 에러 메시지 표시
      }
    } catch (error) {
      console.error('채팅 기록을 가져오는데 실패했습니다:', error);
      setError('채팅 기록을 가져오는데 실패했습니다.'); // 사용자에게 에러 메시지 표시
    } finally {
      setLoading(false); // 로딩 상태 종료
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    
  };

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

  const clearChat = async() => {
    setChatHistory([{ role: "system", content: "안녕하세요. 무엇을 도와드릴까요?" }]);
    
    // Reset the chat history on the server
    await fetch("/api/generate?endpoint=reset", { method: "POST" });
  };

  const saveChat = async () => {
    if (status === 'authenticated' && session?.user?.email) {
      try {
        const filteredChatHistory = chatHistory.filter(msg => !msg.chatHistory);
        await api.post('/saveChat', {
          userEmail: session.user.email,
          chatHistory: filteredChatHistory
        });
        alert("채팅이 저장되었습니다.");
      } catch (error) {
        console.error("채팅 저장 중 오류 발생:", error);
        alert("채팅 저장에 실패했습니다.");
      }
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    sendMessage(message.trim());
    setMessage("");
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage > 1 ? currentPage - 1 : 1);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1); // 여기서는 최대 페이지 수를 체크하지 않습니다. 서버에서 빈 배열을 반환할 수 있습니다.
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-custom-green-light space-y-8 p-8">
      <h1 className="text-4xl font-bold text-black mb-6">AI 챗</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className={styles.chatContainer} ref={chatContainerRef}>
        {chatHistory && chatHistory
          .filter(msg => msg.content && msg.content.trim() !== "") // 빈 메시지 필터링
          .map((msg, index) => (
            <div key={index} 
              className={
                msg.role === "user" ? styles.userMessage : styles.assistantMessage
              }>
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
        <div className="flex justify-end mt-2 space-x-2">
          <button onClick={clearChat} className="bg-custom-green hover:bg-custom-green-dark text-white font-bold py-2 px-4 rounded">
            초기화
          </button>
          <button onClick={saveChat} className="bg-custom-green hover:bg-custom-green-dark text-white font-bold py-2 px-4 rounded">
            채팅 저장
          </button>
          <button onClick={toggleModal} className="bg-custom-green hover:bg-custom-green-dark text-white font-bold py-2 px-4 rounded">
            채팅 내역
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.closeButton} onClick={toggleModal}>&times;</span>
            <h2 className={styles.modalTitle}>채팅 내역</h2>
            {chatHistory.length > 0 ? (
              chatHistory.map((chat, index) => (
                <div key={index} className={styles.chatMessage}>
                  {chat.chatHistory.map((msg, msgIndex) => (
                    <div key={msgIndex}>
                      <strong>{msg.role === 'user' ? '사용자' : '어시스턴트'}:</strong> {msg.content}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>채팅 내역이 없습니다.</p>
            )}
            <div className={styles.pagination}>
              <button onClick={handlePrevPage} disabled={currentPage === 1}>이전</button>
              <button onClick={handleNextPage}>다음</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


