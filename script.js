// script.js

document.addEventListener("DOMContentLoaded", () => {
  const gridDisplay = document.querySelector(".grid");
  const scoreDisplay = document.getElementById("score");
  const resultDisplay = document.getElementById("result");
  const width = 4;
  let squares = [];
  let score = 0;
  let moveCount = 0;
  let moveLog = [];

  function createBoard() {
    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.innerHTML = 0;
      gridDisplay.appendChild(square);
      squares.push(square);
    }
    generate();
    generate();
  }

  function generate() {
    const emptySquares = squares.filter(sq => sq.innerHTML == 0);
    if (emptySquares.length === 0) return;
    const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    randomSquare.innerHTML = 2;
    checkForGameOver();
  }

  function move(direction) {
    moveCount++;
    moveLog.push(direction);
  }

  function slide(row) {
    let filtered = row.filter(val => val);
    let missing = width - filtered.length;
    let zeros = Array(missing).fill(0);
    return filtered.concat(zeros);
  }

  function slideReversed(row) {
    let filtered = row.filter(val => val);
    let missing = width - filtered.length;
    let zeros = Array(missing).fill(0);
    return zeros.concat(filtered);
  }

  function moveLeft() {
    for (let i = 0; i < 16; i += width) {
      const row = squares.slice(i, i + width).map(sq => parseInt(sq.innerHTML));
      const newRow = slide(row);
      for (let j = 0; j < width; j++) squares[i + j].innerHTML = newRow[j];
    }
  }

  function moveRight() {
    for (let i = 0; i < 16; i += width) {
      const row = squares.slice(i, i + width).map(sq => parseInt(sq.innerHTML));
      const newRow = slideReversed(row);
      for (let j = 0; j < width; j++) squares[i + j].innerHTML = newRow[j];
    }
  }

  function moveUp() {
    for (let i = 0; i < width; i++) {
      const column = [0, 1, 2, 3].map(j => parseInt(squares[i + j * width].innerHTML));
      const newColumn = slide(column);
      for (let j = 0; j < 4; j++) squares[i + j * width].innerHTML = newColumn[j];
    }
  }

  function moveDown() {
    for (let i = 0; i < width; i++) {
      const column = [0, 1, 2, 3].map(j => parseInt(squares[i + j * width].innerHTML));
      const newColumn = slideReversed(column);
      for (let j = 0; j < 4; j++) squares[i + j * width].innerHTML = newColumn[j];
    }
  }

  function combineRow() {
    for (let i = 0; i < 15; i++) {
      if (squares[i].innerHTML === squares[i + 1].innerHTML) {
        const total = parseInt(squares[i].innerHTML) * 2;
        squares[i].innerHTML = total;
        squares[i + 1].innerHTML = 0;
        score += total;
        scoreDisplay.innerHTML = score;
      }
    }
  }

  function combineColumn() {
    for (let i = 0; i < 12; i++) {
      if (squares[i].innerHTML === squares[i + width].innerHTML) {
        const total = parseInt(squares[i].innerHTML) * 2;
        squares[i].innerHTML = total;
        squares[i + width].innerHTML = 0;
        score += total;
        scoreDisplay.innerHTML = score;
      }
    }
  }

  function control(e) {
    switch (e.keyCode) {
      case 37:
        move("Left"); keyLeft(); break;
      case 38:
        move("Up"); keyUp(); break;
      case 39:
        move("Right"); keyRight(); break;
      case 40:
        move("Down"); keyDown(); break;
    }
  }
  document.addEventListener("keyup", control);

  function keyLeft() {
    moveLeft(); combineRow(); moveLeft(); generate();
  }

  function keyRight() {
    moveRight(); combineRow(); moveRight(); generate();
  }

  function keyUp() {
    moveUp(); combineColumn(); moveUp(); generate();
  }

  function keyDown() {
    moveDown(); combineColumn(); moveDown(); generate();
  }

  function checkForWin() {
    if (squares.some(sq => sq.innerHTML == 2048)) {
      resultDisplay.innerHTML = "مبروووك يا fatima 🎉 وصلتِ لـ 2048! 👑";
      document.removeEventListener("keyup", control);
      showStats();
      setTimeout(clear, 3000);
    }
  }

  function checkForGameOver() {
    if (!squares.some(sq => sq.innerHTML == 0)) {
      resultDisplay.innerHTML = "خلصت اللعبة يا fatima 😢 حاولي مرة تانية!";
      document.removeEventListener("keyup", control);
      showStats();
      setTimeout(clear, 3000);
    }
  }

  function showStats() {
    console.log("عدد الحركات:", moveCount);
    const counts = moveLog.reduce((acc, move) => {
      acc[move] = (acc[move] || 0) + 1;
      return acc;
    }, {});

    const summary = {
      maxScore: score,
      totalMoves: moveCount,
      uniqueMoves: Object.keys(counts).length,
    };
    console.log("\nالإحصائيات:\n", summary);

    downloadCSV();

    if (moveLog.length > 0) {
      const ctx = document.getElementById("moveChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Left", "Right", "Up", "Down"],
          datasets: [{
            label: "عدد الحركات",
            data: [
              moveLog.filter(m => m === "Left").length,
              moveLog.filter(m => m === "Right").length,
              moveLog.filter(m => m === "Up").length,
              moveLog.filter(m => m === "Down").length,
            ],
            backgroundColor: ["#f39c12", "#2980b9", "#27ae60", "#c0392b"]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "🎮 تحليل الحركات خلال الجلسة"
            },
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }

  function downloadCSV() {
    const csv = ["Move,Index", ...moveLog.map((move, i) => `${move},${i + 1}`)].join("\n");
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = "game_data.csv";
    document.body.appendChild(link);
    link.click();
  }

  function addColours() {
    const colors = {
      0: "#afa192", 2: "#eee4da", 4: "#ede0c8", 8: "#f2b179",
      16: "#ffcea4", 32: "#e8c064", 64: "#ffab6e", 128: "#fd9982",
      256: "#ead79c", 512: "#76daff", 1024: "#beeaa5", 2048: "#d7d4f0"
    };
    squares.forEach(sq => {
      const val = parseInt(sq.innerHTML);
      sq.style.backgroundColor = colors[val] || "#ffffff";
    });
  }

  let myTimer = setInterval(addColours, 50);
  function clear() { clearInterval(myTimer); }

  createBoard();
});
const bgMusic = document.getElementById("bgMusic");
const toggleSoundBtn = document.getElementById("toggleSound");
const restartBtn = document.getElementById("restartBtn");

let soundOn = false;

toggleSoundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  if (soundOn) {
    bgMusic.play();
    toggleSoundBtn.textContent = "إيقاف الصوت 🔇";
  } else {
    bgMusic.pause();
    toggleSoundBtn.textContent = "تشغيل الصوت 🔈";
  }
});

// إظهار زر إعادة التشغيل لما تنتهي اللعبة
function showRestartButton() {
  restartBtn.style.display = "inline-block";
}

// إعادة تعيين اللعبة
restartBtn.addEventListener("click", () => {
  // إعادة تحميل الصفحة أو إعادة تهيئة اللعبة
  location.reload();
});

// في checkForWin() و checkForGameOver() أضف هذا السطر قبل setTimeout(clear, 3000);

showRestartButton();
