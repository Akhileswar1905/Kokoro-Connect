import { Link, useNavigate } from "react-router-dom";
import styles from "./login.module.css";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

const Register = () => {
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (res) {
        console.log(res);
        localStorage.setItem("email", email);
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
      setErr(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <span className={styles.heading}>Chat App</span>
        <span className={styles.subheading}>Login</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          {err && <p>{err}</p>}
          <button>Sign In</button>
        </form>
        <p>
          Don&apos;t have an account? <Link to={"/register"}>Click Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
