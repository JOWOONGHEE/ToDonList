const React = require('react');
const { useState, useEffect } = React;
const { useSession } = require('next-auth/react'); // useSession hook added

const ChatHistory = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const { data: session } = useSession(); // Session data used

  useEffect(() => {
    async function fetchChatHistory() {
      if (session) {
        const userEmail = session.user.email; // Email of the logged-in user
        const response = await fetch(`/getChats?userEmail=${encodeURIComponent(userEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setChatHistory(data.chats);
        } else {
          console.error("Failed to fetch chat history.");
          alert("Failed to fetch chat history.");
        }
      }
    }
    if (session) {
      fetchChatHistory();
    }
  }, [session]); // Request again when session changes

  return (
    <div>
      <h1>Chat History</h1>
      {chatHistory.map((chat, index) => (
        <div key={index}>
          <strong>{chat.role === 'user' ? 'User' : 'Assistant'}:</strong> {chat.content}
        </div>
      ))}
    </div>
  );
};

module.exports = ChatHistory;
