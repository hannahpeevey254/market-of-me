let data;
let bubbles = [];
let tooltip;
let t = 0;
let lastUpdate = 0;
let currentSet = 0;

// all 10 predefined market sets
let influenceSets = [
  { "Heart rate": 14, "Sleep stages": 13, "Period cycles": 12, "Anxiety": 11, "Mood": 10, "Screen time": 9, "Movement": 8, "Weight": 7, "Step count": 6, "Age": 5, "Origin": 4, "Body pain": 3, "Creativity": 2, "IQ": 1 },
  { "Sleep stages": 14, "Mood": 13, "Heart rate": 12, "Anxiety": 11, "Period cycles": 10, "Step count": 9, "Weight": 8, "Screen time": 7, "Movement": 6, "Body pain": 5, "Origin": 4, "Creativity": 3, "Age": 2, "IQ": 1 },
  { "Period cycles": 14, "Heart rate": 13, "Anxiety": 12, "Sleep stages": 11, "Mood": 10, "Weight": 9, "Screen time": 8, "Movement": 7, "Step count": 6, "Origin": 5, "Body pain": 4, "Age": 3, "Creativity": 2, "IQ": 1 },
  { "Mood": 14, "Sleep stages": 13, "Heart rate": 12, "Period cycles": 11, "Anxiety": 10, "Movement": 9, "Weight": 8, "Step count": 7, "Screen time": 6, "Age": 5, "Body pain": 4, "Origin": 3, "Creativity": 2, "IQ": 1 },
  { "Anxiety": 14, "Period cycles": 13, "Heart rate": 12, "Mood": 11, "Sleep stages": 10, "Weight": 9, "Screen time": 8, "Movement": 7, "Step count": 6, "Creativity": 5, "Origin": 4, "Age": 3, "Body pain": 2, "IQ": 1 },
  { "Sleep stages": 14, "Anxiety": 13, "Period cycles": 12, "Heart rate": 11, "Mood": 10, "Origin": 9, "Movement": 8, "Step count": 7, "Screen time": 6, "Weight": 5, "Body pain": 4, "Creativity": 3, "Age": 2, "IQ": 1 },
  { "Heart rate": 14, "Period cycles": 13, "Sleep stages": 12, "Mood": 11, "Anxiety": 10, "Step count": 9, "Movement": 8, "Weight": 7, "Screen time": 6, "Age": 5, "Creativity": 4, "Origin": 3, "Body pain": 2, "IQ": 1 },
  { "Mood": 14, "Heart rate": 13, "Anxiety": 12, "Sleep stages": 11, "Period cycles": 10, "Weight": 9, "Screen time": 8, "Origin": 7, "Movement": 6, "Step count": 5, "Creativity": 4, "Age": 3, "Body pain": 2, "IQ": 1 },
  { "Period cycles": 14, "Mood": 13, "Sleep stages": 12, "Heart rate": 11, "Anxiety": 10, "Screen time": 9, "Movement": 8, "Weight": 7, "Origin": 6, "Step count": 5, "Age": 4, "Body pain": 3, "Creativity": 2, "IQ": 1 },
  { "Sleep stages": 14, "Heart rate": 13, "Mood": 12, "Period cycles": 11, "Anxiety": 10, "Creativity": 9, "Weight": 8, "Step count": 7, "Movement": 6, "Screen time": 5, "Age": 4, "Origin": 3, "Body pain": 2, "IQ": 1 }
];

function preload() {
  data = loadJSON('data.json');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  tooltip = select('#tooltip');

  // create bubbles
  let ids = Object.keys(data).sort((a, b) => data[b].totalValue - data[a].totalValue);
  for (let i = 0; i < ids.length; i++) {
    let id = ids[i];
    let d = data[id];
    let val = d.totalValue;
    let y = map(i, 0, ids.length - 1, 100, height - 100);
    let x = random(120, width * 0.6 - 120);
    let size = map(val, 0, 90, 40, 160);
    let col = getColor(val);
    bubbles.push({ id, val, x, y, size, col, xoff: random(1000), yoff: random(1000) });
  }
}

function draw() {
  background('#0A0A0A');
  t += 0.01;
  let hovered = false;

  // every 20 seconds → update set + values
  if (millis() - lastUpdate > 5000) {
    currentSet = (currentSet + 1) % influenceSets.length;
    marketFluctuation();
    lastUpdate = millis();
  }

  // left: bubbles
  for (let b of bubbles) {
    b.x += sin(t + b.xoff) * 0.4;
    b.y += cos(t + b.yoff) * 0.4;

    let d = dist(mouseX, mouseY, b.x, b.y);
   
// aura / glow
    noStroke();
    for (let i = 4; i > 0; i--) {
      let alpha = map(i, 4, 0, 40, 0); // brighter, tighter aura
      fill(red(b.col), green(b.col), blue(b.col), alpha);
      ellipse(b.x, b.y, b.size + i * 8); // smaller spread
    }

    fill(b.col);
    ellipse(b.x, b.y, b.size);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(map(b.size, 40, 160, 9, 14));
    text(`#${b.id}`, b.x, b.y - 10);
    textSize(map(b.size, 40, 160, 12, 20));
    text(`€${b.val.toFixed(0)}`, b.x, b.y + 10);

    if (d < b.size / 2) {
       stroke(255);
       strokeWeight(2);
       noFill();
       ellipse(b.x, b.y, b.size * 1.1);

  // show ID, value, and which variables exist (no personal info)
  let availableVars = Object.keys(data[b.id])
    .filter(k => !["id", "totalValue", "x", "y", "size", "col", "xoff", "yoff"].includes(k))
    .filter(k => data[b.id][k] && data[b.id][k] !== "n/a");

  tooltip.html(
    `<strong>${b.id}</strong><br>` +
    `Value: €${b.val.toFixed(0)}<br>` +
    `Variables: ${availableVars.join(", ")}`
  );

  tooltip.style('display', 'block');
  tooltip.position(mouseX + 10, mouseY + 10);
  hovered = true;
}

  }

  if (!hovered) tooltip.style('display', 'none');

  // right: market influence board
  drawMarketBoard();
}

function marketFluctuation() {
  const current = influenceSets[currentSet];
  const topVariables = Object.keys(current).slice(0, 3); // top 3 gainers

  for (let b of bubbles) {
    let change = random(-3, 3);
    if (random() < 0.5) change += random(0, 2); // slight upward bias
    b.val = constrain(b.val + change, 0, 90);
    b.size = map(b.val, 0, 90, 40, 160);
    b.col = getColor(b.val);
  }
}

function drawMarketBoard() {
  const current = influenceSets[currentSet];
  const previous = influenceSets[(currentSet - 1 + influenceSets.length) % influenceSets.length];
  const sorted = Object.entries(current).sort((a, b) => b[1] - a[1]);

  push();
  textAlign(LEFT, TOP);
  rectMode(CORNER);

  // right-side background
  noStroke();
  fill(10, 10, 10, 230);
  rect(width * 0.62, 0, width * 0.38, height);

  // header
  fill('#C4C600');
  textSize(28);
  text("DATA MARKET EXCHANGE", width * 0.65, 40);

  // timestamp
  let now = new Date();
  let timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  fill(180);
  textSize(10);
  text(`${timeStr}  ${dateStr}`, width * 0.65, 70);

  // column headers
  fill(255);
  textSize(14);
  text("Variable", width * 0.65, 100);
  text("€ Value", width * 0.82, 100);
  text("Change", width * 0.9, 100);

  // table rows
  textSize(13);
  let startY = 125;
  for (let i = 0; i < sorted.length; i++) {
    let [metric, value] = sorted[i];
    let prevVal = previous[metric] || 0;
    let change = value - prevVal;

    let y = startY + i * 24;

    // alternating row background
    if (i % 2 === 0) {
      fill(255, 255, 255, 8);
      rect(width * 0.65, y - 4, width * 0.32, 24);
    }

    // variable name
    fill(lerpColor(color('#43123F'), color('#C4C600'), value / 14));
    text(metric, width * 0.65 + 10, y);

    // value
    fill(255);
    textAlign(RIGHT, TOP);
    text(`€${value}`, width * 0.88, y);

    // change indicator
    if (change > 0) {
      fill('#00FF66'); // green up
      textAlign(LEFT, TOP);
      text(`▲ +${change}`, width * 0.9, y);
    } else if (change < 0) {
      fill('#FF4040'); // red down
      textAlign(LEFT, TOP);
      text(`▼ ${change}`, width * 0.9, y);
    } else {
      fill(180);
      textAlign(LEFT, TOP);
      text('—', width * 0.9, y);
    }
  }

  pop();
}


function getColor(val) {
  if (val >= 70) return color('#C4C600');
  else if (val >= 55) return color('#EC940C');
  else if (val >= 40) return color('#7E0950');
  else return color('#43123F');
}
function mousePressed() {
  for (let b of bubbles) {
    let d = dist(mouseX, mouseY, b.x, b.y);
    if (d < b.size / 2) {
      console.log("Opening profile for ID:", b.id); // debug message
      window.open(`profile.html?id=${b.id}`, '_blank');
      return;
    }
  }
}
