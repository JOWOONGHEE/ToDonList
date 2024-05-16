import React, { useState, useEffect } from 'react';

function ChatHistoryPage() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    fetch('/api/getChats')
      .then(response => response.json())
      .then(data => setChats(data))
      .catch(error => console.error('Error fetching chats:', error));
  }, []);

  return (
    <div>
      <h1>Chat History</h1>
      <ul>
        {chats.map((chat, index) => (
          <li key={index}>
            {chat.role}: {chat.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatHistoryPage;