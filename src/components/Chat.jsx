import axios from "axios";
import { useEffect, useState } from "react";

const a_pi = axios.create({
  baseURL: "https://3sem.dyrhoi.com/teamup/api",
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
});

export function Chat() {
  const user = { username: "nilusss" };
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function make_async() {
      const response = await a_pi.get("/chat-test/" + user.username);
      const _conversations = response.data.data.sort((a, b) => {
        return (
          new Date(b.messages.slice(-1)[0]?.createdAt || 0) -
          new Date(a.messages.slice(-1)[0]?.createdAt || 0)
        );
      });
      setConversations(_conversations);
      setLoading(false);
    }
    make_async();
  }, []);
  if (loading) return "loading";
  return (
    <>
      <ConvosList conversations={conversations} user={user} />
    </>
  );
}

function ConvosList({ conversations, user }) {
  console.log(conversations);
  return (
    <>
      <div className="sidebar">
        <div className="sidebar-menu">
          {conversations.map((conversation, index) => (
            <button
              className="sidebar-link text-left"
              onClick={() => console.log(conversation)}
              key={index}
            >
              <span className="d-block font-weight-bold font-size-18">
                {
                  conversation.participants.find(
                    (p) => p.username !== user.username
                  ).username
                }
              </span>
              <span className="text-truncate d-inline-block w-150">
                {conversation.messages.slice(-1)[0]?.author.username ===
                user.username
                  ? "You: "
                  : ""}

                {conversation.messages.slice(-1)[0]?.content}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
