import { Link, useNavigate } from "react-router-dom";
import styles from "./register.module.css";
import { createUser } from "../../lib/utils";
import { useState } from "react";

const Register = () => {
  const navigate = useNavigate();
  const [disable, setDisable] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    file: null,
    password: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { displayName, file, email, password } = form;
    if (!displayName || !email || !file || !password) {
      alert("Please fill all the fields");
      return;
    }

    setDisable(true);
    const res = await createUser(form);
    if (res) {
      setDisable(false);
      localStorage.setItem("email", email);
      navigate("/");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <span className={styles.heading}>Chat App</span>
        <span className={styles.subheading}>Register</span>
        <form onSubmit={handleSubmit}>
          <input
            required
            type="text"
            placeholder="Display Name"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
          />
          <label htmlFor="file" style={{ margin: "10px", marginLeft: "0px" }}>
            <img src="/labelImage.png" alt="img" width={33} height={33} />
            <span>Add an avatar</span>
          </label>
          <input
            required
            type="file"
            placeholder="Add an avatar"
            id="file"
            name="file"
            onChange={handleChange}
          />
          <input
            required
            type="email"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            required
            type="password"
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <button
            style={{ backgroundColor: !disable ? "#2F80ED" : "#BDBDBD" }}
            disabled={disable}
          >
            Sign Up
          </button>
        </form>
        <p>
          Already have an account? <Link to={"/login"}>Click Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
