(function () {
  const canvas = document.getElementById('ocean-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let animId;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const WAVE_LAYERS = [
    { y: 0.10, amp: 18, len: 900, speed: 0.10, bobAmp: 5, bobSpeed: 0.04, color: [8, 16, 38] },
    { y: 0.22, amp: 22, len: 750, speed: 0.13, bobAmp: 6, bobSpeed: 0.05, color: [10, 22, 48] },
    { y: 0.35, amp: 20, len: 650, speed: 0.16, bobAmp: 5, bobSpeed: 0.06, color: [12, 28, 56] },
    { y: 0.48, amp: 24, len: 800, speed: 0.12, bobAmp: 7, bobSpeed: 0.04, color: [14, 35, 65] },
    { y: 0.60, amp: 18, len: 600, speed: 0.18, bobAmp: 4, bobSpeed: 0.07, color: [16, 42, 75] },
    { y: 0.72, amp: 22, len: 700, speed: 0.14, bobAmp: 6, bobSpeed: 0.05, color: [18, 50, 85] },
    { y: 0.84, amp: 16, len: 550, speed: 0.20, bobAmp: 4, bobSpeed: 0.08, color: [12, 38, 68] },
    { y: 0.94, amp: 14, len: 650, speed: 0.16, bobAmp: 5, bobSpeed: 0.06, color: [8, 28, 52] },
  ];

  function waveY(x, time, layer) {
    var primary = Math.sin((x / layer.len + time * layer.speed) * Math.PI * 2) * layer.amp;
    var secondary = Math.sin((x / (layer.len * 0.6) + time * layer.speed * 1.4 + 0.5) * Math.PI * 2) * (layer.amp * 0.3);
    var tertiary = Math.sin((x / (layer.len * 1.8) + time * layer.speed * 0.7 + 1.2) * Math.PI * 2) * (layer.amp * 0.15);
    var bob = Math.sin(time * layer.bobSpeed * Math.PI * 2) * layer.bobAmp;
    return primary + secondary + tertiary + bob;
  }

  function drawWave(layer, time, alpha) {
    var baseY = height * layer.y;
    var r = layer.color[0], g = layer.color[1], b = layer.color[2];

    ctx.beginPath();
    ctx.moveTo(0, height);

    for (var x = 0; x <= width; x += 3) {
      var y = baseY + waveY(x, time, layer);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    ctx.fill();

    ctx.beginPath();
    for (var x2 = 0; x2 <= width; x2 += 3) {
      var wy = baseY + waveY(x2, time, layer);
      if (x2 === 0) {
        ctx.moveTo(x2, wy);
      } else {
        ctx.lineTo(x2, wy);
      }
    }
    ctx.strokeStyle = 'rgba(' + Math.min(r + 30, 255) + ',' + Math.min(g + 40, 255) + ',' + Math.min(b + 50, 255) + ',' + (alpha * 0.4) + ')';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawFoam(time) {
    var foamLayer = WAVE_LAYERS[2];
    var baseY = height * foamLayer.y;

    for (var x = 0; x <= width; x += 8) {
      var wy = baseY + waveY(x, time, foamLayer);
      var slope = waveY(x + 3, time, foamLayer) - waveY(x - 3, time, foamLayer);
      if (slope < -1.0) {
        var foamAlpha = Math.min(Math.abs(slope) * 0.02, 0.06);
        ctx.fillStyle = 'rgba(180, 210, 240, ' + foamAlpha + ')';
        ctx.fillRect(x - 1, wy - 1, 2, 1);
      }
    }

    var foamLayer2 = WAVE_LAYERS[5];
    var baseY2 = height * foamLayer2.y;

    for (var x3 = 0; x3 <= width; x3 += 8) {
      var wy2 = baseY2 + waveY(x3, time, foamLayer2);
      var slope2 = waveY(x3 + 3, time, foamLayer2) - waveY(x3 - 3, time, foamLayer2);
      if (slope2 < -0.8) {
        var foamAlpha2 = Math.min(Math.abs(slope2) * 0.015, 0.05);
        ctx.fillStyle = 'rgba(160, 200, 230, ' + foamAlpha2 + ')';
        ctx.fillRect(x3 - 1, wy2 - 1, 2, 1);
      }
    }
  }

  function animate(timestamp) {
    var time = timestamp / 1000;

    ctx.clearRect(0, 0, width, height);

    var grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#060c1f');
    grad.addColorStop(0.15, '#0a1230');
    grad.addColorStop(0.35, '#0e1a3e');
    grad.addColorStop(0.55, '#0f2548');
    grad.addColorStop(0.75, '#0c1e3a');
    grad.addColorStop(1, '#070e22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    var alphas = [0.55, 0.50, 0.48, 0.45, 0.42, 0.40, 0.50, 0.55];
    for (var i = 0; i < WAVE_LAYERS.length; i++) {
      drawWave(WAVE_LAYERS[i], time, alphas[i]);
    }

    drawFoam(time);

    animId = requestAnimationFrame(animate);
  }

  animId = requestAnimationFrame(animate);
})();
