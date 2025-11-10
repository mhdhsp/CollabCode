import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7109";
const token = localStorage.getItem("token");

const ProjectChatSection = ({ projectId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [limit, setLimit] = useState(10);
  const [isSending, setIsSending] = useState(false);
  const [connection, setConnection] = useState(null);
  const messagesEndRef = useRef(null);

  // 🧩 1️⃣ Fetch old messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/Chat/GetAllMsg/${projectId}?limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data?.data || [];
      setMessages([...data].reverse());
      console.log("Messages loaded:", data.length);
    } catch (err) {
      console.error("❌ Fetch messages failed:", err);
    }
  };

  // 🧩 2️⃣ Setup SignalR
  useEffect(() => {
    if (!projectId) return;

    const connectSignalR = async () => {
      console.log("Connecting to SignalR for project:", projectId);

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/hubs/chat`, {
          withCredentials: true,
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // 🔔 Listen for new messages
      conn.on("ReceiveMsg", (msg) => {
        console.log("📩 Real-time message:", msg);
        const incomingProjectId = msg.projectId ?? msg.ProjectId;
        if (incomingProjectId != projectId) return;

        setMessages((prev) => {
          const exists = prev.some(
            (m) => m.content === msg.content && m.time === msg.time
          );
          if (exists) return prev;
          return [...prev, msg];
        });

        scrollToBottom();
      });

      try {
        await conn.start();
        console.log("✅ SignalR connected");
        await conn.invoke("JoinGroup", projectId.toString());
        console.log("✅ Joined group:", projectId);
        setConnection(conn);
      } catch (err) {
        console.error("❌ SignalR connection error:", err);
      }
    };

    connectSignalR();
    fetchMessages();

    // 🧹 Cleanup
    return () => {
      if (connection) {
        connection.invoke("LeaveGroup", projectId.toString()).catch(() => {});
        connection.stop();
      }
    };
  }, [projectId, limit]);

  // 🧩 3️⃣ Send new message
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);

    const tempMsg = {
      senderId: currentUserId,
      senderName: "You",
      content: newMessage,
      time: new Date().toISOString(),
      projectId,
    };

    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    try {
      await axios.post(
        `${API_BASE_URL}/api/Chat/AddMsg`,
        { projectId, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Message sent to API");
      setNewMessage("");
    } catch (err) {
      console.error("❌ Send message failed:", err);
      setMessages((prev) => prev.filter((m) => m.time !== tempMsg.time));
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReadMore = () => {
    setLimit((prev) => prev + 10);
  };

  // 🧩 4️⃣ UI
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white text-center py-2">
        <strong>Project Chat</strong>
      </div>

      <div
        className="card-body p-3"
        style={{
          height: "300px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 ? (
          <div className="text-muted text-center flex-grow-1 d-flex align-items-center justify-content-center">
            No messages yet
          </div>
        ) : (
          <>
            {messages.length >= limit && (
              <div className="text-center mb-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleReadMore}
                >
                  Read More
                </button>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={`${m.time}-${i}`}
                className={`d-flex mb-2 ${
                  m.senderId === currentUserId
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`p-2 rounded-3 ${
                    m.senderId === currentUserId
                      ? "bg-primary text-white"
                      : "bg-light"
                  }`}
                  style={{ maxWidth: "75%" }}
                >
                  <small className="d-block fw-bold">
                    {m.senderName ?? "Unknown"}
                  </small>
                  <div>{m.content}</div>
                  <small
                    className="text-muted d-block text-end"
                    style={{ fontSize: "0.7em" }}
                  >
                    {m.time
                      ? new Date(m.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </small>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="card-footer p-2">
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={isSending}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={sendMessage}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectChatSection;



// import React, { useState, useEffect, useRef } from 'react';
// import projectChatService from '../../services/api/chatService';
// import signalRConnectionService from '../../services/signalRConnection';

// const ProjectChatSection = ({ projectId, currentUserId }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [limit, setLimit] = useState(10);
//   const [isSending, setIsSending] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Fetch messages
//   useEffect(() => {
//     if (projectId) fetchMessages();
//   }, [projectId, limit]);

//   const fetchMessages = async () => {
//     console.log(`Fetching messages for projectId: ${projectId}, limit: ${limit}`);
//     try {
//       const res = await projectChatService.getMessages(projectId, limit);
//       console.log(`Messages fetched:`, res);
//       // API returns newest first → reverse to show oldest first
//       const sorted = [...res].reverse();
//       setMessages(sorted);
//     } catch (err) {
//       console.error('Fetch messages error:', err);
//     }
//   };

//   // SignalR Real-Time Listener
//   useEffect(() => {
//     if (!projectId) return;

//     const setupSignalR = async () => {
//       console.log("Setting up SignalR for project:", projectId);
//       await signalRConnectionService.startConnection(projectId);

//       signalRConnectionService.onReceive((msg) => {
//         console.log("Real-time message received:", msg);
//         if (msg.projectId !== projectId) return;

//         setMessages((prev) => {
//           const exists = prev.some(
//             (m) => m.content === msg.content && m.time === msg.time
//           );
//           if (exists) {
//             console.log("Duplicate message ignored:", msg);
//             return prev;
//           }
//           const newMsg = {
//             ...msg,
//             senderName: msg.senderName || 'User',
//           };
//           console.log("Adding real-time message:", newMsg);
//           return [...prev, newMsg];
//         });
//         scrollToBottom();
//       });
//     };

//     setupSignalR();

//     return () => {
//       console.log("Cleaning up: leaving group", projectId);
//       signalRConnectionService.leaveGroup(projectId);
//     };
//   }, [projectId]);

//   // Send Message
//   const sendMessage = async () => {
//     if (!newMessage.trim() || isSending) return;
//     setIsSending(true);

//     const tempMsg = {
//       senderId: currentUserId,
//       senderName: 'You',
//       content: newMessage,
//       time: new Date().toISOString(),
//       projectId,
//     };

//     setMessages((prev) => [...prev, tempMsg]);
//     scrollToBottom();

//     try {
//       await projectChatService.sendMessage(projectId, newMessage);
//       console.log("Message sent to API");
//       setNewMessage('');
//     } catch (err) {
//       console.error('Send message error:', err);
//       // Optional: remove optimistic message on error
//       setMessages((prev) => prev.filter(m => m.time !== tempMsg.time));
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleReadMore = () => {
//     setLimit((prev) => prev + 10);
//   };

//   return (
//     <div className="card shadow-sm">
//       <div className="card-header bg-primary text-white text-center py-2">
//         <strong>Project Chat</strong>
//       </div>

//       <div
//         className="card-body p-3"
//         style={{
//           height: '300px',
//           overflowY: 'auto',
//           display: 'flex',
//           flexDirection: 'column',
//         }}
//       >
//         {messages.length === 0 ? (
//           <div className="text-muted text-center flex-grow-1 d-flex align-items-center justify-content-center">
//             No messages yet
//           </div>
//         ) : (
//           <>
//             {/* Read More Button */}
//             {messages.length >= limit && (
//               <div className="text-center mb-2">
//                 <button
//                   className="btn btn-outline-secondary btn-sm"
//                   onClick={handleReadMore}
//                 >
//                   Read More
//                 </button>
//               </div>
//             )}

//             {/* Messages */}
//             {messages.map((m, i) => (
//               <div
//                 key={`${m.time}-${m.senderId}-${i}`}
//                 className={`d-flex mb-2 ${
//                   m.senderId === currentUserId
//                     ? 'justify-content-end'
//                     : 'justify-content-start'
//                 }`}
//               >
//                 <div
//                   className={`p-2 rounded-3 ${
//                     m.senderId === currentUserId
//                       ? 'bg-primary text-white'
//                       : 'bg-light'
//                   }`}
//                   style={{ maxWidth: '75%' }}
//                 >
//                   <small className="d-block fw-bold">
//                     {m.senderName ?? 'Unknown'}
//                   </small>
//                   <div>{m.content}</div>
//                   <small
//                     className="text-muted d-block text-end"
//                     style={{ fontSize: '0.7em' }}
//                   >
//                     {m.time
//                       ? new Date(m.time).toLocaleTimeString([], {
//                           hour: '2-digit',
//                           minute: '2-digit',
//                         })
//                       : ''}
//                   </small>
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </>
//         )}
//       </div>

//       <div className="card-footer p-2">
//         <div className="input-group">
//           <input
//             type="text"
//             className="form-control form-control-sm"
//             placeholder="Type a message..."
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//             disabled={isSending}
//           />
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={sendMessage}
//             disabled={isSending}
//           >
//             {isSending ? 'Sending...' : 'Send'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectChatSection;