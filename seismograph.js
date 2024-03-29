(function() {

    var levelsRef = new Firebase('https://laundry.firebaseio.com/levels');

    var anchor = document.querySelector('#script');

    var container = anchor.parentNode;
    var viewport = document.createElement('div');
    while (container.hasChildNodes()) {
        container.removeChild(container.firstChild);
    }
    container.appendChild(anchor);
    container.appendChild(viewport);

    var style = window.getComputedStyle(container, null);
    anchor.style.position = 'absolute';
    anchor.style.width = viewport.style.width = style.width;
    anchor.style.height = viewport.style.height = style.height;
    anchor.style.zIndex = 1;
    anchor.style.zIndex = 0;
    viewport.style.overflow = 'hidden';

    var width = viewport.clientWidth;
    var height = viewport.clientHeight;
    var pan = Math.round(width / 200);
    var totalWidth = pan * 1e3;
    var zero = height / 2;
    var refreshRate = 100;
    var threshold = 50;
    var x, y = zero;
    var deflection = 0;
    var axesPrev = [];
    var canvas;
    var ctx;

    function freshCanvas() {
        var newCanvas = document.createElement('canvas');
        newCanvas.width = totalWidth;
        newCanvas.height = height;
        viewport.appendChild(newCanvas);
        viewport.scrollLeft = 0;
        ctx = newCanvas.getContext('2d');
        ctx.strokeStyle = style.color;
        if (canvas) {
            ctx.drawImage(canvas, width - x, 0);
            viewport.removeChild(canvas);
        }
        canvas = newCanvas;
        x = width;
    }

    function scrollCanvas() {
        viewport.scrollLeft++;
        if (viewport.scrollLeft >= totalWidth - width) {
            freshCanvas();
        }
    }

    function drawTheLine() {
        ctx.beginPath();
        ctx.moveTo(x, y);
        x += pan;
        y = zero + height * deflection / 25;
        deflection = Math.random() * .2 - .1;
        ctx.lineTo(x, y);
        ctx.stroke();
        for (var i = 0; i < pan; i++) {
            setTimeout(scrollCanvas, i * refreshRate / pan);
        }
    }

    function tilt(axes) {
        levelsRef.push({axes: axes});
        if (axesPrev) {
            for (var i = 0; i < axes.length; i++) {
                var delta = axes[i] - axesPrev[i];
                if (Math.abs(delta) > Math.abs(deflection)) {
                    deflection = delta;
                }
            }
        }
        axesPrev = axes;
    }

    freshCanvas();
    ctx.moveTo(0, y);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(event) {
            tilt([event.beta, event.gamma]);
        }, true);
    } else if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', function(event) {
            tilt([event.acceleration.x * 2, event.acceleration.y * 2]);
        }, true);
    } else {
        window.addEventListener('MozOrientation', function(orientation) {
            tilt([orientation.x * 50, orientation.y * 50]);
        }, true);
    }

    setInterval(drawTheLine, refreshRate);
})();
