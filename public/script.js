const socket = io("/");
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: 8000,
});

const peers = {};

const videoGrid = document.getElementById("video-grid");
const myVideo = document
  .createElement("div")
  .appendChild(document.createElement("video"));
myVideo.muted = true;

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", function (remoteUserStream) {
        // Show stream in some video/canvas element.
        addVideoStream(video, remoteUserStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    let text = $("input");

    $("html").keydown((e) => {
      // console.log(e)
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });

    socket.on("createMessage", (message) => {
      console.log("this is coming from server", message);
      $(".messages").append(
        `<li class='message'><b>user</b><br/>${message}</li>`
      );
      scrollToBottom();
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const scrollToBottom = () => {
  let d = $(".main_chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

// Mute our audio
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnMuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `<i class="fa fa-microphone" aria-hidden="true"></i>
    <span>Mute</span>`;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnMuteButton = () => {
  const html = `<i class="unmute fa fa-microphone-slash" aria-hidden="true"></i>
    <span>Mute</span>`;
  document.querySelector(".main__mute_button").innerHTML = html;
};

// Stop or play audio
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    //   console.log("------myVideo------", myVideo)
    //   $('video').replaceWith(`
    //     <div style="background: gray; color:white; height: 200px;
    //     width: 300px;
    //     object-fit: cover;
    //     margin: 5px;display:flex;justify-content:center;align-items:center">
    //         Dinesh
    //     </div>
    // `)
    //   myVideo.html= '<div style="background: gray; color:white">Dinesh</div>'
    //   $('video').remove()
    //   document.createElement("div");
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
      <i class="fa fa-video"></i>
      <span>Stop Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
    <i class="stop fa fa-video-slash"></i>
      <span>Play Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};
