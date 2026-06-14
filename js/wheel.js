/**
 * GameVerse Spin the Wheel Component
 * Renders a 6-segment game wheel on Canvas, models physics-based friction slowing,
 * plays tick triggers, and redirects to the chosen play area.
 */

window.GameWheel = {
  canvas: null,
  ctx: null,
  spinButton: null,
  resultPanel: null,
  gameNameEl: null,
  playBtn: null,
  
  games: [
    { id: 'tictactoe', name: 'Tic Tac Toe' },
    { id: 'connectfour', name: 'Connect Four' },
    { id: 'memory', name: 'Memory Match' }
  ],
  
  colors: ['#00ffff', '#ff00ff', '#ffd700'],
  
  startAngle: 0,
  spinTimeout: null,
  isSpinning: false,
  
  init() {
    this.canvas = document.getElementById('wheel-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.spinButton = document.getElementById('wheel-spin-btn');
    this.resultPanel = document.getElementById('wheel-result-panel');
    this.gameNameEl = document.getElementById('wheel-game-name');
    this.playBtn = document.getElementById('wheel-play-btn');
    
    this.drawWheel();
    this.attachEvents();
  },
  
  attachEvents() {
    this.spinButton.addEventListener('click', () => {
      if (this.isSpinning) return;
      this.spin();
    });
  },
  
  drawWheel() {
    const numSegments = this.games.length;
    const arc = Math.PI * 2 / numSegments;
    const outsideRadius = 190;
    const textRadius = 130;
    const insideRadius = 15;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Smooth shadows
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
    
    for (let i = 0; i < numSegments; i++) {
      const angle = this.startAngle + i * arc;
      
      let fillStyle = this.colors[i];
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      
      this.ctx.fillStyle = fillStyle;
      this.ctx.lineWidth = 2;
      
      // Draw Wedge
      this.ctx.beginPath();
      this.ctx.arc(200, 200, outsideRadius, angle, angle + arc, false);
      this.ctx.arc(200, 200, insideRadius, angle + arc, angle, true);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Draw Text Labels
      this.ctx.save();
      this.ctx.shadowBlur = 0; // reset shadow for text
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 12px "Outfit", sans-serif';
      
      this.ctx.translate(
        200 + Math.cos(angle + arc / 2) * textRadius,
        200 + Math.sin(angle + arc / 2) * textRadius
      );
      this.ctx.rotate(angle + arc / 2 + Math.PI / 2);
      
      const text = this.games[i].name;
      this.ctx.fillText(text, -this.ctx.measureText(text).width / 2, 0);
      this.ctx.restore();
    }
  },
  
  spin() {
    this.isSpinning = true;
    this.resultPanel.style.display = 'none';
    this.spinButton.disabled = true;
    
    // Initial high speed and setup deceleration physics
    let velocity = Math.random() * 0.4 + 0.35; // random velocity
    const friction = 0.985; // decel drag factor
    let lastSegmentIndex = -1;
    
    const animateSpin = () => {
      this.startAngle += velocity;
      velocity *= friction;
      
      this.drawWheel();
      
      // Play tick sound when passing segments
      const currentSegment = this.getCurrentSegmentIndex();
      if (currentSegment !== lastSegmentIndex) {
        this.playTickSound();
        lastSegmentIndex = currentSegment;
      }
      
      if (velocity < 0.0015) {
        this.isSpinning = false;
        this.spinButton.disabled = false;
        this.stopSpin();
      } else {
        requestAnimationFrame(animateSpin);
      }
    };
    
    animateSpin();
  },
  
  getCurrentSegmentIndex() {
    const numSegments = this.games.length;
    const arc = Math.PI * 2 / numSegments;
    
    // The pointer is at 12 o'clock, which corresponds to 270 degrees or 1.5 * Math.PI.
    // Determine which segment is intersecting this line.
    let angle = (this.startAngle % (Math.PI * 2));
    if (angle < 0) angle += Math.PI * 2;
    
    // Calculate difference with pointer position (1.5 * Math.PI)
    let pointerPos = 3 * Math.PI / 2;
    let relativeAngle = pointerPos - angle;
    if (relativeAngle < 0) relativeAngle += Math.PI * 2;
    
    const index = Math.floor(relativeAngle / arc) % numSegments;
    return index;
  },
  
  stopSpin() {
    const index = this.getCurrentSegmentIndex();
    const game = this.games[index];
    
    this.gameNameEl.textContent = game.name;
    this.playBtn.setAttribute('href', `${game.id}.html`);
    
    // Glow selected slice on canvas
    this.highlightSegment(index);
    this.playSelectedSound();
    
    // Show prompt redirect actions
    this.resultPanel.style.display = 'block';
    this.resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  
  highlightSegment(index) {
    const numSegments = this.games.length;
    const arc = Math.PI * 2 / numSegments;
    const outsideRadius = 190;
    const insideRadius = 15;
    const angle = this.startAngle + index * arc;
    
    // Draw highlight shell over winning wedge
    this.ctx.save();
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 4;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#ffffff';
    
    this.ctx.beginPath();
    this.ctx.arc(200, 200, outsideRadius, angle, angle + arc, false);
    this.ctx.arc(200, 200, insideRadius, angle + arc, angle, true);
    this.ctx.stroke();
    this.ctx.restore();
  },
  
  playTickSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5 (bright click)
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch(e) {}
  },
  
  playSelectedSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        const start = audioCtx.currentTime + index * 0.08;
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch(e) {}
  }
};
