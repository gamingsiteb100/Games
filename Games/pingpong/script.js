/**************** FIREBASE ****************/
const firebaseConfig = {
  apiKey: "AIzaSyDMYqD8ivXUMKRplKiWCPUDHPUhkzYMCSU",
  authDomain: "gamingsiteb100.firebaseapp.com",
  databaseURL: "https://gamingsiteb100-default-rtdb.firebaseio.com",
  projectId: "gamingsiteb100",
  storageBucket: "gamingsiteb100.firebasestorage.app",
  messagingSenderId: "1017304911890",
  appId: "1:1017304911890:web:8693311d2f9cdf393bc8cb",
  measurementId: "G-DB0CBDJMDM"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const gameRef = db.ref("game");

/**************** CANVAS ****************/
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = Math.min(800, innerWidth - 20);
  canvas.height = Math.min(400, innerHeight - 180);
}
resize();
addEventListener("resize", resize);

/**************** GAME STATE ****************/
const paddleH = 80;
const paddleW = 10;

let playerId = Math.random() > 0.5 ? "p1" : "p2";

let state = {
  p1Y: 150,
  p2Y: 150,
  ballX: canvas.width / 2,
  ballY: canvas.height / 2,
  ballVX: 4,
  ballVY: 4,
  score1: 0,
  score2: 0
};

/**************** INPUT ****************/
canvas.addEventListener("touchmove", e => {
  const y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
  state[playerId + "Y"] = y - paddleH / 2;
  gameRef.set(state);
});

/**************** GAME LOOP (HOST) ****************/
if (playerId === "p1") {
  setInterval(() => {
    state.ballX += state.ballVX;
    state.ballY += state.ballVY;

    if (state.ballY <= 0 || state.ballY >= canvas.height)
      state.ballVY *= -1;

    // Paddle collisions
    if (state.ballX < 20 &&
        state.ballY > state.p1Y &&
        state.ballY < state.p1Y + paddleH)
      state.ballVX *= -1;

    if (state.ballX > canvas.width - 20 &&
        state.ballY > state.p2Y &&
        state.ballY < state.p2Y + paddleH)
      state.ballVX *= -1;

    // Scoring
    if (state.ballX < 0) {
      state.score2++;
      resetBall();
    }

    if (state.ballX > canvas.width) {
      state.score1++;
      resetBall();
    }

    gameRef.set(state);
  }, 16);
}

function resetBall() {
  state.ballX = canvas.width / 2;
  state.ballY = canvas.height / 2;
  state.ballVX *= -1;
}

/**************** SYNC ****************/
gameRef.on("value", snap => {
  if (snap.exists()) state = snap.val();
  document.getElementById("p1").textContent = state.score1;
  document.getElementById("p2").textContent = state.score2;
});

/**************** DRAW ****************/
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillRect(10, state.p1Y, paddleW, paddleH);
  ctx.fillRect(canvas.width - 20, state.p2Y, paddleW, paddleH);

  ctx.beginPath();
  ctx.arc(state.ballX, state.ballY, 7, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(draw);
}
draw();

