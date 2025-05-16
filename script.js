document.addEventListener("DOMContentLoaded", () => {
  const gridDisplay = document.querySelector(".grid");
  const scoreDisplay = document.getElementById("score");
  const resultDisplay = document.getElementById("result");
  const width = 4;
  let squares = [];
  let score = 0;
  let moveCount = 0;
  let moveLog = [];
  let gameAnalyticsLog = [];
  let lastMoveTime = Date.now();

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

    const now = Date.now();
    const moveTime = now - lastMoveTime;
    lastMoveTime = now;

    const emptyCount = squares.filter(sq => sq.innerHTML == 0).length;

    gameAnalyticsLog.push({
      direction: direction,
      score: score,
      maxTile: getMaxTile(),
      moveTime: moveTime,
      emptyTiles: emptyCount,
      timestamp: new Date().toISOString()
    });
function getMaxTile() {
  let max = 0;
  for (let sq of squares) {
    let val = parseInt(sq.innerHTML);
    if (val > max) max = val;
  }
  return max;
}

    // استدعاء النموذج الذكي
    saveLatestMove(direction, score, getMaxTile(), moveTime, emptyCount);
  }

  function saveLatestMove(direction, score, maxTile, moveTime, emptyTiles) {
  const latestMove = {
    Score: score,
    MaxTile: maxTile,
    "MoveTime(ms)": moveTime,
    EmptyTiles: emptyTiles
  };

  fetch('http://127.0.0.1:5000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(latestMove)
  })
  .then(res => res.json())
  .then(data => {
    // نحدد مستوى الخطر: إذا النموذج توقع خسارة = 100 (خطر عالي)، وإلا 20
const riskLevel = data.prediction === 1 ? 90 : 20;

// نرسم العداد بناءً على مستوى الخطر
drawDangerGauge(riskLevel);

// نعرض تحذير فقط إذا كان عالي
if (data.prediction === 1) {
  const warningBox = document.getElementById("warningBox");
  warningBox.style.display = "block";
  setTimeout(() => {
    warningBox.style.display = "none";
  }, 3000);
}

  })
  .catch(err => {
    console.error("خطأ في الاتصال بالنموذج:", err);
  });
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
      case 37: move("Left"); keyLeft(); break;
      case 38: move("Up"); keyUp(); break;
      case 39: move("Right"); keyRight(); break;
      case 40: move("Down"); keyDown(); break;
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
      showRestartButton();
      setTimeout(clear, 3000);
    }
  }

  function checkForGameOver() {
    if (!squares.some(sq => sq.innerHTML == 0)) {
      resultDisplay.innerHTML = "خلصت اللعبة يا fatima 😢 حاولي مرة تانية!";
      document.removeEventListener("keyup", control);
      showStats();
      showRestartButton();
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

    generateCSVAnalytics();

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

  function generateCSVAnalytics() {
    let csvContent = "Direction,Score,MaxTile,MoveTime(ms),EmptyTiles,Timestamp\n";
    gameAnalyticsLog.forEach(entry => {
      csvContent += `${entry.direction},${entry.score},${entry.maxTile},${entry.moveTime},${entry.emptyTiles},${entry.timestamp}\n`;
    });

    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    link.download = "full_game_data.csv";
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
let dangerChart; // متغير عالمي

function drawDangerGauge(level) {
  const ctx = document.getElementById("dangerGauge").getContext("2d");

  if (dangerChart) {
    dangerChart.destroy(); // نحذف القديم قبل نرسم جديد
  }

  const data = {
    labels: ["الخطر"],
    datasets: [{
      data: [level, 100 - level],
      backgroundColor: level >= 70 ? ["#e74c3c", "#ddd"] :
                       level >= 40 ? ["#f1c40f", "#ddd"] :
                                     ["#2ecc71", "#ddd"],
      borderWidth: 0
    }]
  };

  dangerChart = new Chart(ctx, {
    type: "doughnut",
    data: data,
    options: {
      circumference: 180,
      rotation: -90,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}


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

function showRestartButton() {
  restartBtn.style.display = "inline-block";
}

restartBtn.addEventListener("click", () => {
  location.reload();
});
