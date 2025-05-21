document.addEventListener("DOMContentLoaded", () => {
  const gridDisplay = document.querySelector(".grid");
  const scoreDisplay = document.getElementById("score");
  const resultDisplay = document.getElementById("result");
  const width = 4;
  let winCount = 0;
  let lossCount = 0;
  let squares = [];
  let score = 0;
  let moveCount = 0;
  let moveLog = [];
  let gameAnalyticsLog = [];
  let lastMoveTime = Date.now();
  let dangerChart;

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

  function getMaxTile() {
    let max = 0;
    for (let sq of squares) {
      let val = parseInt(sq.innerHTML);
      if (val > max) max = val;
    }
    return max;
  }

  function move(direction) {
    moveCount++;
    moveLog.push(direction);

    const now = Date.now();
    const moveTime = now - lastMoveTime;
    lastMoveTime = now;

    const emptyCount = squares.filter(sq => sq.innerHTML == 0).length;
    const maxTile = getMaxTile();

    gameAnalyticsLog.push({
      direction: direction,
      score: score,
      maxTile: maxTile,
      moveTime: moveTime,
      emptyTiles: emptyCount,
      timestamp: new Date().toISOString()
    });

    // استدعاء النموذج الذكي
    saveLatestMove(direction, score, maxTile, moveTime, emptyCount);

    // توصيات ذكية
    const recentMoves = moveLog.slice(-3);
    if (recentMoves.length === 3 && recentMoves.every(m => m === recentMoves[0])) {
      showRecommendation("أنتِ تكررين نفس الاتجاه، جربي تغيير الاتجاه لتحسين النتيجة.");
    }

    if (score < 100 && moveCount > 30) {
      showRecommendation("النقاط ما زالت منخفضة، حاولي التركيز على دمج البلاطات الكبيرة.");
    }
  }

  function showRecommendation(message) {
    const box = document.getElementById("recommendationBox");
    box.innerText = `📌 توصية: ${message}`;
    box.style.display = "block";
    setTimeout(() => {
      box.style.display = "none";
    }, 4000);
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
      const riskLevel = data.prediction === 1 ? 90 : 20;
      drawDangerGauge(riskLevel);

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

  function drawDangerGauge(level) {
    const ctx = document.getElementById("dangerGauge").getContext("2d");

    if (dangerChart) dangerChart.destroy();

    dangerChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["الخطر"],
        datasets: [{
          data: [level, 100 - level],
          backgroundColor: level >= 70 ? ["#e74c3c", "#ddd"] :
                          level >= 40 ? ["#f1c40f", "#ddd"] :
                                        ["#2ecc71", "#ddd"],
          borderWidth: 0
        }]
      },
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
     checkForWin();
  }

  function keyRight() {
    moveRight(); combineRow(); moveRight(); generate();
  }
   checkForWin();

  function keyUp() {
    moveUp(); combineColumn(); moveUp(); generate();
     checkForWin();
  }

  function keyDown() {
    moveDown(); combineColumn(); moveDown(); generate();
     checkForWin();
  }

  function checkForWin() {
  if (squares.some(sq => sq.innerHTML == 2048)) {
    winCount++;
    resultDisplay.innerHTML = "مبروووك يا fatima 🎉 وصلتِ لـ 2048! 👑";
    document.removeEventListener("keyup", control);
    showStats();
    showRestartButton();
    setTimeout(clear, 3000);
  }
}


  function checkForGameOver() {
  if (!squares.some(sq => sq.innerHTML == 0)) {
    lossCount++;
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

  // 🎯 رسم مخطط الحركات
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

  // 🟢 رسم مخطط الفوز والخسارة
  const ctx2 = document.getElementById("winLossChart").getContext("2d");
  new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: ["فوز", "خسارة"],
      datasets: [{
        data: [winCount, lossCount],
        backgroundColor: ["#2ecc71", "#e74c3c"]
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "🎯 نسبة الفوز والخسارة"
        },
        legend: {
          position: "bottom"
        }
      }
    }
  });

  // ⏱️ تحليل الزمن بين الحركات
  const moveTimes = gameAnalyticsLog.map(entry => entry.moveTime);
  const moveLabels = moveTimes.map((_, i) => `حركة ${i + 1}`);

  const ctx3 = document.getElementById("moveTimeChart").getContext("2d");
  new Chart(ctx3, {
    type: "line",
    data: {
      labels: moveLabels,
      datasets: [{
        label: "الزمن بين الحركات (ms)",
        data: moveTimes,
        borderColor: "#8e44ad",
        backgroundColor: "rgba(142, 68, 173, 0.2)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "⏱️ تطور سرعة اللعب خلال الجلسة"
        },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "ms"
          }
        }
      }
    }
  });

  // 📈 تحليل أعلى بلاطة (Max Tile)
  const maxTiles = gameAnalyticsLog.map(entry => entry.maxTile);
  const maxTileLabels = maxTiles.map((_, i) => `حركة ${i + 1}`);

  const ctx4 = document.getElementById("maxTileChart").getContext("2d");
  new Chart(ctx4, {
    type: "line",
    data: {
      labels: maxTileLabels,
      datasets: [{
        label: "أعلى بلاطة",
        data: maxTiles,
        borderColor: "#e67e22",
        backgroundColor: "rgba(230, 126, 34, 0.2)",
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "📈 تطور أعلى بلاطة خلال الجلسة"
        },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "قيمة البلاطة"
          }
        }
      }
    }
  });
}



  // 🎯 الرسم البياني يظهر فقط إذا فيه تحركات
  
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
