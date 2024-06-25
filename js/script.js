let currentSong = new Audio();
let songs;
let currFolder;

document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}`);
  let response = await a.text();
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

  // show all songs in playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img class="invert" src="/Img/music.svg" alt="" /><div class="info">
    <div>${song.replaceAll("%20", " ")} </div>
   <div>Om</div>
    </div>
    <div class="playnow ">
    <span>Play Now</span>
    <img class="invert" src="/Img/playnow.svg" alt="">
    </div></li>`;
  }
  //Attach an event listener  to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}
function ShowPlaybar() {
  document.querySelector(".playbar").style.display = "inline-block";
  document.querySelector(".marquee").style.display = "none";
}
function HidePlaybar() {
  document.querySelector(".playbar").style.display = "none";
  document.querySelector(".marquee").style.display = "block";
}
const playMusic = (track, pause) => {
  currentSong.src = ""; // Initialize src to empty string initially

  if (track) {
    currentSong.src = `/${currFolder}/` + track;
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    ShowPlaybar();
  } else {
    // Handle case when track is not provided (optional)
    currentSong.src = "";
    document.querySelector(".songInfo").innerHTML = "";
    HidePlaybar();
  }
  if (!pause && track) {
    currentSong.play();
    play.src = "/Img/pause.svg";
  }

  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      // get meta data of folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder="${folder}" class="card Cu-Po">
              <div class="play">
                <img src="/Img/play.svg" alt="" />
              </div>
              <img
                src="/songs/${folder}/cover.jpeg"
                alt=""
              />
              <h3 style="text-overflow: ellipsis;">${response.title}</h3>
              <p>${response.description}</p>
            </div>`;
    }
  }
  // load  the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

// play next song when one ends
currentSong.addEventListener("ended", () => {
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  if (index + 1 < songs.length) {
    playMusic(songs[index + 1]);
  } else {
    // Optionally, you can stop playback or loop back to the first song
    currentSong.pause();
    play.src = "/Img/play1.svg";
  }
});
async function main() {
  //get list of all songs there
  await getSongs("songs");
  playMusic(songs[0], true);

  //Display all albums on page
  displayAlbums();

  //Attach eventlistener to play
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/Img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/Img/play1.svg";
    }
  });
  // space bar
  document.body.onkeydown = function (e) {
    if (e.key == " " || e.code == "Space") {
      e.preventDefault();
      if (currentSong.paused) {
        currentSong.play();
        play.src = "/Img/pause.svg";
      } else {
        currentSong.pause();
        play.src = "/Img/play1.svg";
      }
    }
  };
  //listen for timupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  //add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  // add event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // add event listener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  // add an event listener to previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  // add an event listener to next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  //adding icons when volume varies
  let vol = document.querySelector(".volume>img");
  vol.addEventListener("click", (e) => {
    if (e.target.src.includes("volume")) {
      e.target.src = "/Img/mute.svg";
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = "/Img/volume-low.svg";
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
  // add an event listener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (e.target.value == 0) {
        vol.src = "/Img/mute.svg";
      } else if (e.target.value > 0 && e.target.value <= 33) {
        vol.src = "/Img/volume-low.svg";
      } else if (e.target.value > 33 && e.target.value <= 70) {
        vol.src = "/Img/volume-mid.svg";
      } else {
        vol.src = "/Img/volume-high.svg";
      }
    });
}
main();
