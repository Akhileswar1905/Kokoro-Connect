const TimeStamp = ({ msg, currentUser }) => {
  return (
    <>
      <span
        style={{
          color: "white",
          alignSelf:
            msg.senderId === currentUser.uid ? "flex-end" : "flex-start",
          fontSize: "8px",
        }}
      >
        {msg.timestamp?.toDate().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </>
  );
};

export default TimeStamp;
