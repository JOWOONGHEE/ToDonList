// import React, { useState, useEffect } from 'react';
const React = require('react');
const { useState, useEffect } = React;

const ChatHistory = () => {
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    async function fetchChatHistory() {
      const response = await fetch('/getChats');
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.chats[0].chatHistory);
      } else {
        console.error("채팅 기록을 가져오는데 실패했습니다.");
        alert("채팅 기록을 가져오는데 실패했습니다.");
      }
    }
    fetchChatHistory();
  }, []);

  return (
    <div>
      <h1>채팅 기록</h1>
      {chatHistory.map((chat, index) => (
        <div key={index}>
          <strong>{chat.role === 'user' ? '사용자' : '어시스턴트'}:</strong> {chat.content}
        </div>
      ))}
    </div>
  );
};

module.exports = ChatHistory;

