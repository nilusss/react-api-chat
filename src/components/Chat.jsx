import axios from "axios";
import moment from "moment";
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
  const user = { username: "user" };
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timerInterval, setTimerInterval] = useState();

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
      if (activeConversation) {
        const updatedConvo = _conversations.find(
          (c) => c.id === activeConversation.id
        );
        setActiveConversation(updatedConvo);
      }
      setLoading(false);
    }
    make_async();
    const timer = setTimeout(async () => {
      make_async();
      console.log("5 sec");
      setTimerInterval(new Date());
    }, 5000);
    return () => clearTimeout(timer);
  }, [timerInterval]);
  if (loading) return "loading";
  return (
    <>
      <ConvosList
        conversations={conversations}
        user={user}
        setActiveConversation={setActiveConversation}
      />
      <Conversation
        conversation={activeConversation}
        user={user}
        setActiveConversation={setActiveConversation}
      />
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

function Conversation({ conversation, user, setActiveConversation }) {
  const endOfContentRef = useRef(null); //used for autoscroll when loading chat
  const messageEl = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();

    const data = {
      content: messageEl.current.value,
    };
    console.log(data);

    const response = await a_pi.post(
      "/chat-test/" +
        user.username +
        "/" +
        conversation.participants.find((p) => p.username !== user.username)
          .username,
      data
    );
    const convoCopy = { ...conversation };
    convoCopy.messages.push(response.data);
    setActiveConversation(convoCopy);
    messageEl.current.value = "";
    messageEl.current.focus();
  }

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
      <div style={{ paddingLeft: "var(--sidebar-width) " }} className="h-full">
        <nav className="navbar position-sticky top-0" style={{ zIndex: "99" }}>
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
          style={{
            paddingBottom: "var(--navbar-height)",
          }}
        >
          {Object(conversation.messages).map((message, index) => {
            const floatSide =
              message.author.username === user.username
                ? "float-right"
                : "float-left";
            const bgColor =
              message.author.username === user.username ? "bg-primary" : "";
            return (
              <div className="clearfix mb-20 pt-20" key={index}>
                <div className={floatSide + " mw-half"}>
                  <div
                    key={index}
                    className={bgColor + " card p-10 d-block m-0"}
                  >
                    <p key={index} className="m-0">
                      {message.content}
                    </p>
                  </div>
                  <span className={floatSide + " font-size-12 text-muted pt-5"}>
                    {moment(message.createdAt).format("ddd HH:MM")}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={endOfContentRef} />
        </div>
        <nav
          style={{ width: "calc(100% - var(--sidebar-width))" }}
          className="navbar position-fixed bottom-0"
        >
          <div className="navbar-content d-inline-block w-full">
            <form
              className="form-inline"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <input
                required
                type="text"
                name="message"
                className="form-control pr-10"
                placeholder="Aa"
                ref={messageEl}
              />
              <input className="btn btn-primary" type="submit" value="⇨" />
            </form>
          </div>
        </nav>
      </div>
    </>
  );
}
