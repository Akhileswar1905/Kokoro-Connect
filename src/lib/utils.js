import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage, db } from "./firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

const uploadAndUpdate = (res, form) => {
  const { displayName, email, file } = form;

  const storageRef = ref(storage, displayName);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.log(error.message);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);

          await updateProfile(res.user, {
            displayName: displayName,
            photoURL: downloadURL,
          });

          const user = {
            uid: res.user.uid,
            email: email,
            displayName: displayName,
            photoURL: downloadURL,
          };

          await setDoc(doc(db, "users", res.user.uid), user);
          await setDoc(doc(db, "userChats", res.user.uid), {});

          resolve(user);
        } catch (error) {
          console.log(error.message);
          reject(error);
        }
      }
    );
  });
};

export const createUser = async (form) => {
  const { email, password } = form;
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = await uploadAndUpdate(res, form);
    return user;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

export const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.log(error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};
