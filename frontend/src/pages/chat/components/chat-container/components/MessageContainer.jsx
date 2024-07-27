import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_ALL_MSGS, GET_CHANNEL_MSGS, HOST } from "@/utils/constants";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";

function MessageContainer() {
  const scrollRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMsgs,
    setSelectedChatMsgs,
    setFileDownloadProgress,
    setIsDownloading,
    userInfo,
  } = useAppStore();
  const [showImage, setshowImage] = useState(false);
  const [imageUrl, setimageUrl] = useState(null);

  useEffect(() => {
    const getMsgs = async () => {
      try {
        const res = await apiClient.post(
          GET_ALL_MSGS,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (res.data.messages) {
          console.log("Direct messages fetched:", res.data.messages);
          setSelectedChatMsgs(res.data.messages);
        }
      } catch (err) {
        console.log({ err });
      }
    };

    const getChannelMsgs = async () => {
      try {
        const res = await apiClient.get(
          `${GET_CHANNEL_MSGS}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (res.data.msgs) {
          console.log("Channel messages fetched:", res.data.msgs);
          setSelectedChatMsgs(res.data.msgs);
        }
      } catch (err) {
        console.log({ err });
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") {
        getMsgs();
      } else if (selectedChatType === "channel") {
        getChannelMsgs();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMsgs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMsgs]);

  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|tiff|webp|svg|ico|heic|heif)$/i;

    return imageRegex.test(filePath);
  };

  const renderMsgs = () => {
    let lastDate = null;
    return selectedChatMsgs.map((msg, index) => {
      const msgDate = moment(msg.timestamp).format("YYYY-MM-DD");
      const showDate = msgDate !== lastDate;

      lastDate = msgDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(msg.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(msg)}
          {selectedChatType === "channel" && renderChannelMessages(msg)}
        </div>
      );
    });
  };

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);

    const res = await apiClient.get(`${HOST}/${url}`, {
      responseType: "blob",
      onDownloadProgress: (progress) => {
        const { loaded, total } = progress;
        const percentCompleted = Math.round((loaded * 100) / total);

        setFileDownloadProgress(percentCompleted);
      },
    });
    const urlBlob = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false);
    setFileDownloadProgress(0);
  };

  const renderChannelMessages = (msg) => {
    return (
      <div
        className={`mt-5 ${
          msg.sender._id !== userInfo.id ? "text-left" : "text-right"
        }`}
      >
        {msg.messageType === "text" && (
          <div
            className={`${
              msg.sender._id === userInfo.id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-white/50"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {msg.content}
          </div>
        )}
        {msg.messageType === "file" && (
          <div
            className={`${
              msg.sender === userInfo._id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-white/50"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(msg.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setshowImage(true);
                  setimageUrl(msg.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${msg.fileUrl}`}
                  alt="User uploaded content"
                  height="300"
                  width="300"
                />
              </div>
            ) : (
              <div className="cursor-pointer flex items-center justify-center gap-5">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />{" "}
                </span>
                <span>{msg.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50  cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(msg.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        {msg.sender._id !== userInfo.id ? (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-12 w-12 rounded-full overflow-hidden">
              {msg.sender.image && (
                <AvatarImage
                  className="object-cover w-full h-full bg-black"
                  src={`${HOST}/${msg.sender.image}`}
                  alt={"profile"}
                />
              )}
              <AvatarFallback
                className={`uppercase h-12 w-12 text-lg flex items-center justify-center rounded-full ${getColor(
                  msg.sender.color
                )}`}
              >
                {" "}
                {msg.sender.firstName
                  ? msg.sender.firstName.split("").shift()
                  : msg.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">{`${msg.sender.firstName} ${msg.sender.lastName}`}</span>
            <span className="text-sm text-white/60">
              {moment(msg.timestamp).format("LT")}
            </span>
          </div>
        ) : (
          <div className="text-sm text-white/60 mt-1">
            {moment(msg.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };

  const renderDMMessages = (msg) => (
    <div
      className={`${
        msg.sender === selectedChatData._id ? "text-left" : "text-right"
      }`}
    >
      {msg.messageType === "text" && (
        <div
          className={`${
            msg.sender !== selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-white/50"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {msg.content}
        </div>
      )}

      {msg.messageType === "file" && (
        <div
          className={`${
            msg.sender !== selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-white/50"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {checkIfImage(msg.fileUrl) ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                setshowImage(true);
                setimageUrl(msg.fileUrl);
              }}
            >
              <img
                src={`${HOST}/${msg.fileUrl}`}
                alt="User uploaded content"
                height="300"
                width="300"
              />
            </div>
          ) : (
            <div className="cursor-pointer flex items-center justify-center gap-5">
              <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip />{" "}
              </span>
              <span>{msg.fileUrl.split("/").pop()}</span>
              <span
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50  cursor-pointer transition-all duration-300"
                onClick={() => downloadFile(msg.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}
      <div className="text-xs text-gray-600 ">
        {moment(msg.timestamp).format("LT")}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMsgs()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[100] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-md flex-col">
          <div>
            <img
              src={`${HOST}/${imageUrl}`}
              className="h-[80vh] w-full bg-cover"
            />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50  cursor-pointer transition-all duration-300"
              onClick={() => downloadFile(imageUrl)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50  cursor-pointer transition-all duration-300"
              onClick={() => {
                setshowImage(false);
                setimageUrl(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageContainer;
