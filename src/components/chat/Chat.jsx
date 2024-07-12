import { useContext, useEffect, useRef, useState } from "react";
import styles from "./chat.module.css";
import {
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { uploadFile } from "../../lib/utils";
import { v4 as uuid } from "uuid";

const Chat = () => {
  const [msgs, setMsgs] = useState([]);
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [file, setFile] = useState(null);

  const lastMessageRef = useRef(null); // Ref for the last message element

  const handleSend = async (e) => {
    e.preventDefault();

    let msgContent = text;
    let imgContent = img;
    let fileContent = file;
    let imgUrl = null;
    let fileUrl = null;

    setText("");
    setImg(null);
    setFile(null);

    if (imgContent) {
      imgUrl = await uploadFile(imgContent);
    }

    if (fileContent) {
      fileUrl = await uploadFile(fileContent);
    }

    const msg = {
      id: uuid(),
      text: msgContent,
      senderId: currentUser.uid,
      timestamp: Timestamp.now(),
      ...(imgUrl && { imgUrl: imgUrl }),
      ...(fileUrl && { fileUrl: fileUrl }),
    };

    await updateDoc(doc(db, "chats", data.chatId), {
      messages: arrayUnion(msg),
    });

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
        sender: currentUser.uid,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });
    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
        sender: currentUser.uid,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });
  };

  useEffect(() => {
    const onSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      doc.exists() && setMsgs(doc.data().messages);
    });
    return () => onSub();
  }, [data.chatId]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  return (
    <div className={styles.container}>
      {data.chatId === "null" ? (
        <div className={styles.emptyChat}>
          <h3>Start a conversation</h3>
        </div>
      ) : (
        <div className={styles.wrapper}>
          {/* header */}
          <header>
            <span>{data.user?.displayName}</span>
            <img
              src={data.user?.photoURL || "/profile.png"}
              alt="profile"
              width={32}
              height={32}
              style={{ borderRadius: "50%" }}
            />
          </header>

          {/* Body */}
          <main className={styles.body}>
            {msgs.map((msg, index) => (
              <div
                key={msg.id}
                ref={index === msgs.length - 1 ? lastMessageRef : null} // Set ref for the last message
                className={`${styles.message} ${
                  msg.senderId === currentUser.uid ? styles.sender : ""
                }`}
              >
                <p>{msg.text}</p>
                {msg.imgUrl && (
                  <div
                    className={`${styles.imgMsg} ${
                      msg.senderId === currentUser.uid ? styles.sender : ""
                    }`}
                  >
                    <img src={msg.imgUrl} alt="img" width={400} />
                  </div>
                )}
                {msg.fileUrl && <a href={msg.fileUrl}>File</a>}
                {/* Time Sent Or Received */}
                <span
                  className={`${styles.time}`}
                  style={{
                    color: msg.senderId === currentUser.uid ? "white" : "black",
                    alignSelf:
                      msg.senderId === currentUser.uid
                        ? "flex-end"
                        : "flex-start",
                  }}
                >
                  {msg.timestamp?.toDate().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </main>

          {/* Footer */}
          {/* Preview */}
          {img && (
            <div className={styles.preview}>
              <img
                src={URL.createObjectURL(img)}
                alt="preview"
                style={{ width: "500px" }}
              />
            </div>
          )}

          {/* Preview for File */}
          {file && (
            <div className={styles.preview}>
              <img src="/folder.png" alt="" />
              <p>{file.name}</p>
            </div>
          )}
          <div className={styles.footer}>
            <form onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <label htmlFor="images">
                <img src="/image.png" alt="images" width={20} />
              </label>
              <input
                type="file"
                id="images"
                accept=".jpg,.png,.svg"
                onChange={(e) => setImg(e.target.files[0])}
              />
              <label htmlFor="files">
                <img src="/attachment.png" alt="attachment" width={20} />
              </label>
              <input
                type="file"
                id="files"
                accept="*"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button>Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
