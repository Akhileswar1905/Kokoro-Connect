import Chat from "../../components/chat/Chat";
import Sidebar from "../../components/sidebar/Sidebar";
import styles from "./home.module.css";

const Home = () => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Sidebar />
        <Chat />
      </div>
    </div>
  );
};

export default Home;
