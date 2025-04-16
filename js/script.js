console.log("lets write some js");

let currFolder;
let currSong = new Audio();
let songs;
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/spotify_clone/${folder}`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];

    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //show all the songs in playlist
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
      <img src="./img/music.svg" class="invert" alt="">
                <div class="info">
                  <div>${song
                    .replaceAll("%20", " ")
                    .replaceAll("%A4", " ")
                    .replaceAll("%E0", " ")
                    .replaceAll("%A5", " ")
                    .replaceAll("%26", " ")
                    .replaceAll("%23", " ")
                    .replaceAll("%AE", " ")
                    .replaceAll("%95", " ")
                    .replaceAll("%5B", " ")
                    .replaceAll("%5D", " ")
                    .replaceAll("%97", " ")
                    .replaceAll("%9D", " ")
                    .replaceAll("%B8", " ")
                    .replaceAll("%B5", " ")
                    .replaceAll("%B0", " ")
                    .replaceAll("%B2", " ")
                    .replaceAll("%9C", " ")
                    .replaceAll("%2C", " ")}</div>
                  <div>Sahil</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img src="./img/circle_play.svg" class="invert" alt="">
                </div>  </li>`;
  }

  // attach an even listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, paused = false) => {
  currSong.src = `/spotify_clone/${currFolder}/` + track;
  if (!paused) {
    currSong.play();
    play.src = "./img/pause.svg";
  } 
  document.querySelector(".songInfo").innerHTML = track;
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/spotify_clone/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");

  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index]; 

    if (e.href.includes("/spotify_clone/songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-1)[0];

      //get the metadata of the folder
      let a = await fetch(
        `/spotify_clone/songs/${folder}/info.json`
      );
      let response = await a.json();
      console.log(response);

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18 34V14L32 24L18 34Z" fill="black" />
                </svg>
              </div>
              <img
                src="/spotify_clone/songs/${folder}/cover.jpg"
                alt=""
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
              </div>`;
    }
  }
  console.log(anchors);

  // load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(
        `songs/${item.currentTarget.dataset.folder}`
      );
      playMusic(songs[0]);
      // agar main item.target karu to me agar card ke andar image pe click karunga to image milegi or button pe click karunga to song milega but // item.currentTarget karne se me poore card ko target kar sakta hu mtlb card pe click krunga to result milega kyuki hamne card select kia hai
    });
  });
}

async function main() {
  // get the list of all the songs

  await getSongs("songs/pahadi_hits");
  playMusic(songs[0], true);

  // display all the albums on the page
  displayAlbums();

  //attach an event listener to play next and previous

  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "./img/pause.svg";
    } else {
      currSong.pause();
      play.src = "./img/play.svg";
    }
  });

  // listen for time update event
  currSong.addEventListener("timeupdate", () => {
    console.log(currSong.currentTime, currSong.duration);
    document.querySelector(".songTime").innerHTML = `${formatTime(
      currSong.currentTime
    )}/${formatTime(currSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currSong.currentTime / currSong.duration) * 100 + "%"; // moving the seekbar
  });

  // add an eventlistener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currSong.currentTime = (currSong.duration * percent) / 100;
  });

  // add an eventlistener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //add event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add an eventListener to prev
  previous.addEventListener("click", () => {
    console.log("previous is clicked");
    let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1].replaceAll("%20", " "));
    }
  });

  // add an eventListener to next
  next.addEventListener("click", () => {
    console.log("next is clicked");
    let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1].replaceAll("%20", " "));
    }
  });

  // add an event to volume

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to ", e.target.value, "/ 100");
      currSong.volume = parseInt(e.target.value) / 100;
    });

  //add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    console.log(e.target);
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    
    else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currSong.volume = 0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
