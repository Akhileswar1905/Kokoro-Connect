import { useContext, useEffect, useState } from "react";
import styles from "./sidebar.module.css";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);
  const [searchChat, setSearchChat] = useState([]);
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  // Adding chats
  const handleClick = async (user) => {
    if (!currentUser || !currentUser.uid || !user || !user.uid) {
      console.log("User information is missing");
      return;
    }

    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [`${combinedId}.userInfo`]: {
            uid: user.uid,
            displayName: user?.displayName,
            photoURL: user?.photoURL,
          },
          [`${combinedId}.date`]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [`${combinedId}.userInfo`]: {
            uid: currentUser.uid,
            displayName: currentUser?.displayName,
            photoURL: currentUser?.photoURL,
          },
          [`${combinedId}.date`]: serverTimestamp(),
        });
        handleSelect({
          uid: user.uid,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
    setSearch("");
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (!search) {
        setSearchChat([]);
        return;
      }
      const q = query(
        collection(db, "users"),
        where("displayName", ">=", search),
        where("displayName", "<=", search + "\uf8ff")
      );

      const res = await getDocs(q);
      setSearchChat(res.docs.map((doc) => doc.data()));
    };
    handleSearch();
  }, [search]);

  // Get userChats using onSnapshot
  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      console.log("Current user information is missing");
      return;
    }

    const userChatRef = doc(db, "userChats", currentUser.uid);
    const unsubscribe = onSnapshot(userChatRef, (doc) => {
      if (doc.exists()) {
        const chatEntries = Object.entries(doc.data());
        setChats(chatEntries);
      } else {
        console.log("No such document!");
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    return <div>Loading...</div>; // Add a loading spinner or message here
  }
  // Selecting a chat
  const handleSelect = (chat) => {
    dispatch({
      type: "SET_CHAT",
      payload: chat.userInfo,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header>
          <span>{currentUser?.displayName}'s Chats</span>
        </header>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Search list */}
          {searchChat.map((chat) => (
            <div
              className={styles.item}
              key={chat.uid}
              onClick={() => handleClick(chat)}
            >
              <img
                src={chat?.photoURL || "/profile.png"}
                alt="profile"
                width={32}
                height={32}
                style={{ borderRadius: "50%" }}
              />
              <div>
                <h4>{chat?.displayName}</h4>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.list}>
          {chats.map(([chatId, chatData]) => (
            <div
              className={styles.item}
              key={chatId}
              onClick={() => handleSelect(chatData)}
            >
              <img
                src={chatData.userInfo?.photoURL || "/profile.png"}
                alt="profile"
                width={32}
                height={32}
                style={{ borderRadius: "50%" }}
              />
              <div>
                <h4>{chatData.userInfo?.displayName}</h4>
                <small>
                  {chatData.lastMessage?.sender === currentUser.uid ? (
                    <span>You: </span>
                  ) : (
                    ""
                  )}
                  {chatData.lastMessage?.text.substr(0, 20) + "..."}
                </small>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.logout}>
          <button
            onClick={() => {
              localStorage.removeItem("email");
              navigate("/login");
            }}
          >
            <span>Logout</span>
            <img src="/signout.png" alt="logout" width={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
