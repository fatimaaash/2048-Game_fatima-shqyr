document.addEventListener("DOMContentLoaded", () => {
  const gridDisplay = document.querySelector(".grid");
  const scoreDisplay = document.getElementById("score");
  const resultDisplay = document.getElementById("result");
  let squares = [];
  const width = 4;
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
  createBoard();

  function generate() {
    let randomNumber = Math.floor(Math.random() * squares.length);
    if (squares[randomNumber].innerHTML == 0) {
      squares[randomNumber].innerHTML = 2;
      checkForGameOver();
    } else generate();
  }

  function move(direction) {
    moveCount++;
    moveLog.push(direction);
  }

  function moveRight() {
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) {
        let row = [
          parseInt(squares[i].innerHTML),
          parseInt(squares[i + 1].innerHTML),
          parseInt(squares[i + 2].innerHTML),
          parseInt(squares[i + 3].innerHTML),
        ];
        let filteredRow = row.filter((num) => num);
        let missing = 4 - filteredRow.length;
        let zeros = Array(missing).fill(0);
        let newRow = zeros.concat(filteredRow);

        squares[i].innerHTML = newRow[0];
        squares[i + 1].innerHTML = newRow[1];
        squares[i + 2].innerHTML = newRow[2];
        squares[i + 3].innerHTML = newRow[3];
      }
    }
  }

  function moveLeft() {
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) {
        let row = [
          parseInt(squares[i].innerHTML),
          parseInt(squares[i + 1].innerHTML),
          parseInt(squares[i + 2].innerHTML),
          parseInt(squares[i + 3].innerHTML),
        ];
        let filteredRow = row.filter((num) => num);
        let missing = 4 - filteredRow.length;
        let zeros = Array(missing).fill(0);
        let newRow = filteredRow.concat(zeros);

        squares[i].innerHTML = newRow[0];
        squares[i + 1].innerHTML = newRow[1];
        squares[i + 2].innerHTML = newRow[2];
        squares[i + 3].innerHTML = newRow[3];
      }
    }
  }

  function moveUp() {
    for (let i = 0; i < 4; i++) {
      let column = [
        parseInt(squares[i].innerHTML),
        parseInt(squares[i + width].innerHTML),
        parseInt(squares[i + width * 2].innerHTML),
        parseInt(squares[i + width * 3].innerHTML),
      ];
      let filteredColumn = column.filter((num) => num);
      let missing = 4 - filteredColumn.length;
      let zeros = Array(missing).fill(0);
      let newColumn = filteredColumn.concat(zeros);

      squares[i].innerHTML = newColumn[0];
      squares[i + width].innerHTML = newColumn[1];
      squares[i + width * 2].innerHTML = newColumn[2];
      squares[i + width * 3].innerHTML = newColumn[3];
    }
  }

  function moveDown() {
    for (let i = 0; i < 4; i++) {
      let column = [
        parseInt(squares[i].innerHTML),
        parseInt(squares[i + width].innerHTML),
        parseInt(squares[i + width * 2].innerHTML),
        parseInt(squares[i + width * 3].innerHTML),
      ];
      let filteredColumn = column.filter((num) => num);
      let missing = 4 - filteredColumn.length;
      let zeros = Array(missing).fill(0);
      let newColumn = zeros.concat(filteredColumn);

      squares[i].innerHTML = newColumn[0];
      squares[i + width].innerHTML = newColumn[1];
      squares[i + width * 2].innerHTML = newColumn[2];
      squares[i + width * 3].innerHTML = newColumn[3];
    }
  }

  function combineRow() {
    for (let i = 0; i < 15; i++) {
      if (squares[i].innerHTML === squares[i + 1].innerHTML) {
        let combinedTotal =
          parseInt(squares[i].innerHTML) + parseInt(squares[i + 1].innerHTML);
        squares[i].innerHTML = combinedTotal;
        squares[i + 1].innerHTML = 0;
        score += combinedTotal;
        scoreDisplay.innerHTML = score;
      }
    }
    checkForWin();
  }

  function combineColumn() {
    for (let i = 0; i < 12; i++) {
      if (squares[i].innerHTML === squares[i + width].innerHTML) {
        let combinedTotal =
          parseInt(squares[i].innerHTML) +
          parseInt(squares[i + width].innerHTML);
        squares[i].innerHTML = combinedTotal;
        squares[i + width].innerHTML = 0;
        score += combinedTotal;
        scoreDisplay.innerHTML = score;
      }
    }
    checkForWin();
  }

  function control(e) {
    if (e.keyCode === 37) {
      move("Left");
      keyLeft();
    } else if (e.keyCode === 38) {
      move("Up");
      keyUp();
    } else if (e.keyCode === 39) {
      move("Right");
      keyRight();
    } else if (e.keyCode === 40) {
      move("Down");
      keyDown();
    }
  }
  document.addEventListener("keyup", control);

  function keyRight() {
    moveRight();
    combineRow();
    moveRight();
    generate();
  }

  function keyLeft() {
    moveLeft();
    combineRow();
    moveLeft();
    generate();
  }

  function keyUp() {
    moveUp();
    combineColumn();
    moveUp();
    generate();
  }

  function keyDown() {
    moveDown();
    combineColumn();
    moveDown();
    generate();
  }

  function checkForWin() {
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].innerHTML == 2048) {
        resultDisplay.innerHTML = "مبروووك يا fatima 🎉 وصلتِ لـ 2048! 👑";
        document.removeEventListener("keyup", control);
        showStats();
        setTimeout(() => clear(), 3000);
      }
    }
  }

  function checkForGameOver() {
    let zeros = 0;
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].innerHTML == 0) {
        zeros++;
      }
    }
    if (zeros === 0) {
      resultDisplay.innerHTML = "خلصت اللعبة يا fatima 😢 حاولي مرة تانية!";
      document.removeEventListener("keyup", control);
      showStats();
      setTimeout(() => clear(), 3000);
    }
  }

  function showStats() {
    console.log("عدد الحركات:", moveCount);
    const counts = moveLog.reduce((acc, move) => {
      acc[move] = (acc[move] || 0) + 1;
      return acc;
    }, {});
    console.log("\nالحركات المتوفرة:\n", counts);

    let summary = {
      maxScore: score,
      totalMoves: moveCount,
      uniqueMoves: Object.keys(counts).length,
    };
    console.log("\nالإحصائيات:\n", summary);
    downloadCSV();
  }

  function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Move,Index\n";
    moveLog.forEach((move, index) => {
      csvContent += `${move},${index + 1}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "game_data.csv");
    document.body.appendChild(link);
    link.click();
  }
const ctx = document.getElementById("moveChart").getContext("2d");
const moveData = {
  labels: ["Left", "Right", "Up", "Down"],
  datasets: [{
    label: "عدد الحركات",
    data: [
      moveLog.filter((m) => m === "Left").length,
      moveLog.filter((m) => m === "Right").length,
      moveLog.filter((m) => m === "Up").length,
      moveLog.filter((m) => m === "Down").length
    ],
    backgroundColor: ["#f39c12", "#2980b9", "#27ae60", "#c0392b"]
  }]
};

new Chart(ctx, {
  type: "bar",
  data: moveData,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "تحليل الحركات خلال الجلسة 🎮"
      },
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

  function clear() {
    clearInterval(myTimer);
  }

  function addColours() {
    for (let i = 0; i < squares.length; i++) {
      const val = parseInt(squares[i].innerHTML);
      const colors = {
        0: "#afa192",
        2: "#eee4da",
        4: "#ede0c8",
        8: "#f2b179",
        16: "#ffcea4",
        32: "#e8c064",
        64: "#ffab6e",
        128: "#fd9982",
        256: "#ead79c",
        512: "#76daff",
        1024: "#beeaa5",
        2048: "#d7d4f0",
      };
      squares[i].style.backgroundColor = colors[val] || "#ffffff";
    }
  }
  addColours();
  var myTimer = setInterval(addColours, 50);
});
