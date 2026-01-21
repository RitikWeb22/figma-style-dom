const canvas = document.getElementById('canvas');
const layersList = document.getElementById('layers-list');
const propsPanel = document.getElementById('properties-panel');

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;
canvas.style.transformOrigin = 'top left';

let elements = [];
let selectedId = null;
let zoom = 1;
let history = [];
let historyIndex = -1;
let draggedLayerIdx = null;

// history system 
function saveState() {
    const state = JSON.stringify(elements);
    if (history[historyIndex] === state) return;
    if (historyIndex < history.length - 1) history = history.slice(0, historyIndex + 1);
    history.push(state);
    historyIndex++;
    if (history.length > 50) { history.shift(); historyIndex--; }
    localStorage.setItem('figma_save', state);
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        elements = JSON.parse(history[historyIndex]);
        render();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        elements = JSON.parse(history[historyIndex]);
        render();
    }
}

// Creating  Elements
function addShape(type) {
    const id = 'el_' + Date.now();
    let config = {
        id, type, x: 200, y: 200, w: 150, h: 150,
        rotate: 0, bg: '#3b82f6', opacity: 100,
        visible: true, radius: 0
    };

    if (type === 'rect') { config.h = 100; config.radius = 4; }
    if (type === 'circle') { config.radius = 50; }
    if (type === 'text') {
        config.w = 250; config.h = 80;
        config.bg = 'transparent';
        config.text = 'Double Click to Edit';
        config.fontSize = 24;
        config.textColor = '#ffffff';
    }
    if (type === 'triangle') config.bg = '#ef4444';

    elements.push(config);
    selectedId = id;
    render();
    saveState();
}

function addImage() {
    const url = prompt('Paste Image URL');
    if (!url) return;
    const id = 'el_' + Date.now();
    elements.push({
        id, type: 'image', x: 100, y: 100, w: 200, h: 200,
        rotate: 0, url, radius: 0, opacity: 100, visible: true
    });
    selectedId = id;
    render();
    saveState();
}


// Ye function element ko canvas se bahar jane se rokta hai
function applyBoundary(el) {
    if (el.x < 0) el.x = 0;
    if (el.y < 0) el.y = 0;
    if (el.x + el.w > CANVAS_WIDTH) el.x = CANVAS_WIDTH - el.w;
    if (el.y + el.h > CANVAS_HEIGHT) el.y = CANVAS_HEIGHT - el.h;
}

// Main  yaha pr Elements render honge
function render() {
    canvas.innerHTML = '';
    layersList.innerHTML = '';

    elements.forEach((el, index) => {
        if (!el.visible) return;

        const div = document.createElement('div');
        div.className = `element ${el.id === selectedId ? 'selected' : ''}`;
        div.id = el.id;

        let borderRadius = el.type === 'circle' ? '50%' : el.radius + 'px';
        let clipPath = el.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none';

        div.style.cssText = `
            position: absolute;
            left: ${el.x}px;
            top: ${el.y}px;
            width: ${el.w}px;
            height: ${el.h}px;
            background: ${el.bg};
            transform: rotate(${el.rotate}deg);
            border-radius: ${borderRadius};
            clip-path: ${clipPath};
            opacity: ${el.opacity / 100};
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: ${index};
            user-select: none;
            cursor: move;
        `;

        if (el.type === 'image') {
            div.style.backgroundImage = `url(${el.url})`;
            div.style.backgroundSize = 'cover';
        }

        if (el.type === 'text') {
            div.innerText = el.text;
            div.style.color = el.textColor;
            div.style.fontSize = el.fontSize + 'px';
            div.style.textAlign = 'center';
            div.style.whiteSpace = 'pre-wrap';
            div.style.wordBreak = 'break-word';
            div.style.padding = '10px';

            div.ondblclick = (e) => {
                e.stopPropagation();
                div.contentEditable = true;
                div.style.cursor = 'text';
                div.style.userSelect = 'text';
                div.focus();
                document.execCommand('selectAll', false, null);
            };

            div.oninput = (e) => {
                el.text = e.target.innerText;
            };

            div.onblur = () => {
                div.contentEditable = false;
                div.style.cursor = 'move';
                div.style.userSelect = 'none';
                saveState();
                render();
            };
        }

        if (el.id === selectedId) {
            ['nw', 'ne', 'sw', 'se', 'rot'].forEach(type => {
                const handle = document.createElement('span');
                handle.className = `handle ${type}`;
                handle.onmousedown = (e) => startResize(e, el.id, type);
                div.appendChild(handle);
            });
        }

        div.onmousedown = (e) => {
            if (div.contentEditable === 'true') return;
            if (e.target.classList.contains('handle')) return;

            selectedId = el.id;
            document.querySelectorAll('.element').forEach(node => node.classList.remove('selected'));
            div.classList.add('selected');

            updateProps();
            startDrag(e, el.id);
        };

        canvas.appendChild(div);
    });

    renderLayers();
}

function renderLayers() {
    layersList.innerHTML = ''; // Clear layers before re-rendering 
    [...elements].reverse().forEach((el, i) => {
        const originalIndex = elements.length - 1 - i;
        const layer = document.createElement('div');
        layer.className = `layer-item ${el.id === selectedId ? 'active' : ''}`;
        layer.draggable = true;
        layer.innerHTML = `<span>${el.type.toUpperCase()}</span>`;
        layer.onclick = () => { selectedId = el.id; render(); };
        layer.ondragstart = () => { draggedLayerIdx = originalIndex; };
        layer.ondragover = (e) => e.preventDefault();
        layer.ondrop = () => {
            const moved = elements.splice(draggedLayerIdx, 1)[0];
            elements.splice(originalIndex, 0, moved);
            render();
            saveState();
        };
        layersList.appendChild(layer);
    });
}

//  alignments  
function alignElement(mode) {
    const el = elements.find(i => i.id === selectedId);
    if (!el) return;
    if (mode === 'left') el.x = 0;
    if (mode === 'center') el.x = (CANVAS_WIDTH - el.w) / 2;
    if (mode === 'right') el.x = CANVAS_WIDTH - el.w;
    if (mode === 'top') el.y = 0;
    if (mode === 'middle') el.y = (CANVAS_HEIGHT - el.h) / 2;
    if (mode === 'bottom') el.y = CANVAS_HEIGHT - el.h;
    render();
    saveState();
}

function adjustZoom(v) {
    zoom = Math.min(3, Math.max(0.1, zoom + v));
    canvas.style.transform = `scale(${zoom})`;
    document.getElementById('zoom-level').innerText = Math.round(zoom * 100) + '%';
}

function startDrag(e, id) {
    const el = elements.find(i => i.id === id);
    let sx = e.clientX, sy = e.clientY;

    function move(m) {
        el.x += (m.clientX - sx) / zoom;
        el.y += (m.clientY - sy) / zoom;


        applyBoundary(el);

        sx = m.clientX; sy = m.clientY;
        const div = document.getElementById(id);
        if (div) {
            div.style.left = el.x + 'px';
            div.style.top = el.y + 'px';
        }
    }
    function up() {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        saveState();
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
}

function startResize(e, id, type) {
    e.stopPropagation(); e.preventDefault();
    const el = elements.find(i => i.id === id);
    let sx = e.clientX, sy = e.clientY;

    function move(m) {
        const dx = (m.clientX - sx) / zoom;
        const dy = (m.clientY - sy) / zoom;
        if (type.includes('e')) el.w = Math.max(20, el.w + dx);
        if (type.includes('s')) el.h = Math.max(20, el.h + dy);
        if (type.includes('w')) { el.x += dx; el.w -= dx; }
        if (type.includes('n')) { el.y += dy; el.h -= dy; }
        if (type === 'rot') {
            const r = document.getElementById(id).getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            el.rotate = Math.atan2(m.clientY - cy, m.clientX - cx) * 180 / Math.PI + 90;
        }

        // Resize ke baad check karo ki bahar na jaye
        applyBoundary(el);

        sx = m.clientX; sy = m.clientY;
        render();
    }
    function up() {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        saveState();
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
}

// Properties 
function updateProps() {
    const el = elements.find(i => i.id === selectedId);
    if (!el) {
        propsPanel.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">Select an element</div>';
        return;
    }

    let html = `
        <div class="prop-group"><label>W</label><input type="number" value="${Math.round(el.w)}" onchange="updateValue('w', this.value)"></div>
        <div class="prop-group"><label>H</label><input type="number" value="${Math.round(el.h)}" onchange="updateValue('h', this.value)"></div>
    `;

    if (el.type === 'text') {
        html += `
            <div class="prop-group"><label>Color</label><input class="prop-fill" type="color" value="${el.textColor}" oninput="updateValue('textColor', this.value)"></div>
            <div class="prop-group"><label>Size</label><input type="number" value="${el.fontSize}" onchange="updateValue('fontSize', this.value)"></div>
        `;
    } else if (el.type !== 'image') {
        html += `<div class="prop-group"><label>Fill</label><input class="prop-fill" type="color" value="${el.bg}" oninput="updateValue('bg', this.value)"></div>`;
    }

    html += `
    <div class="prop-group">
            <label>Opacity (${el.opacity}%)</label>
            <input type="range" min="0" max="100" value="${el.opacity}" oninput="updateValue('opacity', this.value)" onchange="saveState()">
        </div>
        <button onclick="deleteEl()" style="background:#ef4444; color:white; width:100%; padding:8px; border-radius:4px; margin-top:10px;">Delete</button>
    `;

    propsPanel.innerHTML = html;
}

function updateValue(key, val) {
    const el = elements.find(i => i.id === selectedId);
    if (!el) return;
    el[key] = (key === 'bg' || key === 'textColor' || key === 'text') ? val : Number(val);
    render();
    const div = document.getElementById(el.id);
    if (div) {
        if (key === 'w') div.style.width = val + 'px';
        if (key === 'h') div.style.height = val + 'px';
        if (key === 'bg') div.style.background = val;
        if (key === 'textColor') div.style.color = val;
        if (key === 'fontSize') div.style.fontSize = val + 'px';
        if (key === 'opacity') div.style.opacity = val / 100;

        applyBoundary(el);
    }

    if (!['bg', 'textColor', 'opacity'].includes(key)) saveState();
}

function deleteEl() {
    elements = elements.filter(i => i.id !== selectedId);
    selectedId = null;
    render();
    saveState();
}

//  Keyboard Logic yaha likhe hai ---
window.onkeydown = (e) => {
    if (e.target.contentEditable === 'true' || e.target.tagName === 'INPUT') return;

    // Delete Key
    if (e.key === 'Delete') deleteEl();

    // Undo/Redo
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }

    // Arrow Keys Movement
    const el = elements.find(i => i.id === selectedId);
    if (el) {
        const moveAmount = e.shiftKey ? 10 : 5; // Shift ke sath 10px varna 5px
        let moved = false;

        if (e.key === 'ArrowLeft') { el.x -= moveAmount; moved = true; }
        if (e.key === 'ArrowRight') { el.x += moveAmount; moved = true; }
        if (e.key === 'ArrowUp') { el.y -= moveAmount; moved = true; }
        if (e.key === 'ArrowDown') { el.y += moveAmount; moved = true; }

        if (moved) {
            e.preventDefault(); // Page scroll hone se roko
            applyBoundary(el); // Canvas se bahar na jaye
            render();
            saveState();
        }
    }
};

// contorl d krne se duplicate krne ka code 
function duplicateElement() {
    const el = elements.find(i => i.id === selectedId);
    if (!el) return;

    const newId = 'el_' + Date.now();
    // Object.assign se purane element ki copy banake ke use kiya hai maine
    const copy = Object.assign({}, el, {
        id: newId,
        x: el.x + 20, // isse Thoda side mai paste hoga
        y: el.y + 20
    });

    elements.push(copy);
    selectedId = newId;
    render();
    saveState();
}

const saved = localStorage.getItem('figma_save');
if (saved) {
    elements = JSON.parse(saved);
    history = [saved];
    historyIndex = 0;
}
render();