(function() {

    var lastVibration = undefined;
    var vibrations = 0;
    var vibrating = undefined;
    var listening = false;
    var notify = false;
    var notified = false;

    function notify() {
        if (notified) {
            return;
        }
        notified = true;
        document.querySelector('.notify').classList.add('notified');
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://4i9r.localtunnel.com/notify', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log(xhr.responseText);
                } else {
                    console.error(xhr.statusText);
                }
            }
        };
        xhr.onerror = function (e) {
            console.error(xhr.statusText);
        };
        xhr.send('phone=2489826323');
    }
    window.notify = notify;

    function cancelNotify() {
        notified = false;
        document.querySelector('.notified').classList.remove('notified');
    }

    var button = document.querySelector('.start');
    button.addEventListener('click', function() {
        if (button.classList.contains('start')) {
            listening = true;

            button.classList.remove('start');
            button.classList.add('stop');
            button.innerHTML = 'Stop';
        } else {
            lastVibration = undefined;
            vibrations = 0;
            vibrating = undefined;
            listening = false;

            button.classList.remove('stop');
            button.classList.add('start');
            button.innerHTML = 'Start';
            cancelNotify();
        }
    });

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
        levelsRef.push(axes);
        document.querySelector('.axes').innerHTML = (axes[0] || 0).toFixed(1) + ',' + (axes[1] || 0).toFixed(1) + ',' + deflection.toFixed(1) + '|' + vibrations;

        if (listening && axes[0] < -3) {
            vibrations++;
            lastVibration = new Date();
            vibrating = true;
        }

        document.querySelector('.axes').innerHTML += vibrations;

        if (listening && new Date() - lastVibration > 3000) {
            vibrating = false;
            notify();
        }

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
