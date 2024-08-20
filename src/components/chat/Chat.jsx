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
import { RiEmojiStickerLine } from "react-icons/ri";
import EmojiPicker from "emoji-picker-react";
import TimeStamp from "../TimeStamp/TimeStamp";
import { IoMdSend } from "react-icons/io";

const Chat = () => {
  const emojiRef = useRef(null);

  const [emojiPicker, setEmojiPicker] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [file, setFile] = useState(null);

  const lastMessageRef = useRef(null);

  const addEmoji = (e) => {
    let emoji = e.emoji;
    setText((prevText) => prevText + emoji);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();

    if (text === "" && img === null && file === null) return;

    let msgContent = text;
    let imgUrl = null;
    let fileUrl = null;

    setText("");
    setImg(null);
    setFile(null);

    try {
      if (img) {
        imgUrl = await uploadFile(img);
      }

      if (file) {
        fileUrl = await uploadFile(file);
      }

      const msg = {
        id: uuid(),
        text: msgContent,
        senderId: currentUser.uid,
        timestamp: Timestamp.now(),
        ...(imgUrl && { imgUrl }),
        ...(fileUrl && { fileUrl }),
      };

      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion(msg),
      });

      const updateData = {
        [data.chatId + ".lastMessage"]: {
          text: msgContent,
          sender: currentUser.uid,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      };

      await updateDoc(doc(db, "userChats", currentUser.uid), updateData);
      await updateDoc(doc(db, "userChats", data.user.uid), updateData);
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      if (doc.exists()) {
        setMsgs(doc.data().messages);
      }
    });

    return () => unsub();
  }, [data.chatId]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  return (
    <div className={styles.container}>
      {
        <div className={styles.wrapper}>
          {/* Header */}
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
                ref={index === msgs.length - 1 ? lastMessageRef : null}
                className={`${styles.message} ${
                  msg.senderId === currentUser.uid ? styles.sender : ""
                }`}
              >
                <p>{msg.text}</p>
                {msg.imgUrl && (
                  <div
                    className={`${styles.imgMsg} ${
                      msg.senderId === currentUser.uid
                        ? styles.senderImg
                        : styles.Img
                    }`}
                  >
                    <img src={msg.imgUrl} alt="img" />
                  </div>
                )}
                {msg.fileUrl && (
                  <div
                    className={`${styles.fileMsg} ${
                      msg.senderId === currentUser.uid ? styles.sender : ""
                    }`}
                  >
                    {msg.fileUrl.includes(".mp4") ||
                    msg.fileUrl.includes(".gif") ? (
                      <video src={msg.fileUrl} autoPlay loop />
                    ) : (
                      <>
                        <img src="/folder.png" alt="file" />
                        <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                          {msg.fileUrl.split("/").pop()}
                        </a>
                      </>
                    )}
                    <TimeStamp msg={msg} currentUser={currentUser} />
                  </div>
                )}
                <TimeStamp msg={msg} currentUser={currentUser} />
              </div>
            ))}{" "}
            {""}
          </main>

          {/* Footer */}
          {img && (
            <div className={styles.preview}>
              <img
                src={URL.createObjectURL(img)}
                alt="preview"
                style={{ width: "500px" }}
              />
            </div>
          )}

          {file && (
            <div className={styles.preview}>
              <img src="/folder.png" alt="" />
              <p>{file.name}</p>
            </div>
          )}
          <div className={styles.footer}>
            {emojiPicker && (
              <div className={styles.emojiPicker}>
                <EmojiPicker
                  theme="dark"
                  width={400}
                  height={400}
                  onEmojiClick={addEmoji}
                />
              </div>
            )}
            <form onSubmit={handleSend}>
              <RiEmojiStickerLine
                width={20}
                height={20}
                onClick={() => setEmojiPicker((prev) => !prev)}
                style={{
                  cursor: "pointer",
                }}
              />
              <input
                type="text"
                placeholder="Type a message..."
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <label htmlFor="images">
                <img src="/image.png" alt="images" width={20} />
              </label>
              <input
                type="file"
                id="images"
                accept=".jpg,.png,.svg, .gif"
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
              <button type="submit" className={styles.btn}>
                <IoMdSend />
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  );
};

export default Chat;
