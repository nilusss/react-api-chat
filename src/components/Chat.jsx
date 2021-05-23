import { render } from "@testing-library/react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { getRandomColorFromString } from "./random-color";

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
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  function updateConversation() {}

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
      <ConvosList
        conversations={conversations}
        user={user}
        setActiveConversation={setActiveConversation}
      />
      <Conversation conversation={activeConversation} user={user} />
    </>
  );
}

function ConvosList({ conversations, user, setActiveConversation }) {
  function handleClick(_conversation) {
    setActiveConversation(_conversation);
  }
  return (
    <>
      <div className="sidebar">
        <div className="sidebar-menu">
          {conversations.map((conversation, index) => (
            <button
              style={{ cursor: "pointer" }}
              className="sidebar-link text-left"
              onClick={() => handleClick(conversation)}
              key={index}
            >
              <div className="d-flex position-relative pr-50">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle"
                    style={{
                      height: 38,
                      width: 38,
                      margin: "0 auto",
                      backgroundColor: getRandomColorFromString(
                        conversation.participants.find(
                          (p) => p.username !== user.username
                        ).username
                      ),
                    }}
                  />
                </div>
                <p className="pl-10">
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
                </p>
              </div>
              <div className="sidebar-divider" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Conversation({ conversation, user }) {
  const endOfContentRef = useRef(null);
  function scrollToBottom() {
    endOfContentRef.current?.scrollIntoView();
  }
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);
  if (conversation == null) {
    return "";
  }
  return (
    <>
      <div style={{ paddingLeft: "var(--sidebar-width)" }}>
        <nav className="navbar position-sticky top-0">
          <div className="navbar-content content">
            <div className="d-flex position-relative pr-50">
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle"
                  style={{
                    height: 38,
                    width: 38,
                    margin: "0 auto",
                    backgroundColor: getRandomColorFromString(
                      conversation.participants.find(
                        (p) => p.username !== user.username
                      ).username
                    ),
                  }}
                />
              </div>
              <p className="pl-10">
                {conversation.participants.find(
                  (p) => p.username !== user.username
                ).displayName ||
                  conversation.participants.find(
                    (p) => p.username !== user.username
                  ).username}
              </p>
            </div>
            <span className="text-muted pl-20 font-size-12">
              {conversation.participants.find(
                (p) => p.username !== user.username
              ).displayName
                ? conversation.participants.find(
                    (p) => p.username !== user.username
                  ).username
                : ""}
            </span>
          </div>
        </nav>
        <div
          className="content"
          style={{ paddingBottom: "var(--navbar-height)" }}
        >
          {Object(conversation.messages).map((message, index) => (
            <div className="container clearfix" key={index}>
              <div
                style={{ maxWidth: "50%" }}
                key={index}
                className={
                  message.author.username === user.username
                    ? "float-right card p-10 d-block"
                    : "float-left card p-10 d-block"
                }
              >
                <p key={index} className="margin-0">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          <div ref={endOfContentRef} />
        </div>
        <nav className="navbar position-fixed bottom-0">
          <div className="navbar-content d-inline-block w-full">
            <form action="#" method="">
              <div className="d-inline-block w-three-quarter float-left pr-30">
                <input
                  type="text"
                  className="form-control pr-10"
                  placeholder="Aa"
                />
              </div>
              <input
                className="btn btn-primary d-inline-block float-left"
                type="submit"
                value="⇨"
              />
            </form>
          </div>
        </nav>
      </div>
    </>
  );
}
