import { useContext } from "react";
import Chat from "../../components/chat/Chat";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./home.module.css";
import { ChatContext } from "../../context/ChatContext";
import Empty from "../../components/EmptyChat/Empty";

const Home = () => {
  const data = useContext(ChatContext);
  console.log(data);
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Sidebar />
        {data.data.chatId === "null" ? <Empty /> : <Chat />}
      </div>
    </div>
  );
};

export default Home;
