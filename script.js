(function() {
    // Cek apakah sudah ada injector sebelumnya
    if (document.getElementById('auto-type-injector')) {
        console.log('Auto Type Injector sudah aktif!');
        return;
    }

    // Buat container utama
    const container = document.createElement('div');
    container.id = 'auto-type-injector';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: white;
        min-width: 350px;
        backdrop-filter: blur(10px);
        animation: slideIn 0.5s ease-out;
    `;

    // CSS untuk animasi
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes typeEffect {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .typing-active {
            animation: typeEffect 0.3s ease-in-out;
        }
    `;
    document.head.appendChild(style);

    // Header
    const header = document.createElement('div');
    header.innerHTML = `
        <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
            ⚡ Auto Type Injector
        </h3>
    `;

    // Input textbox
    const textbox = document.createElement('textarea');
    textbox.id = 'auto-type-text';
    textbox.placeholder = 'Masukkan teks yang ingin diketik otomatis...';
    textbox.style.cssText = `
        width: 100%;
        height: 80px;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
        background: rgba(255,255,255,0.9);
        color: #333;
        margin-bottom: 15px;
        box-sizing: border-box;
    `;

    // Container untuk kontrol
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
    `;

    // Speed control
    const speedLabel = document.createElement('label');
    speedLabel.innerHTML = `
        <span style="font-size: 12px; margin-right: 5px;">Kecepatan:</span>
        <select id="type-speed" style="padding: 5px 8px; border: none; border-radius: 5px; font-size: 12px;">
            <option value="50">Cepat</option>
            <option value="100" selected>Normal</option>
            <option value="200">Lambat</option>
            <option value="500">Sangat Lambat</option>
        </select>
    `;

    // Button mulai
    const startBtn = document.createElement('button');
    startBtn.innerHTML = '▶️ Mulai Auto Type';
    startBtn.style.cssText = `
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
    `;

    // Button stop
    const stopBtn = document.createElement('button');
    stopBtn.innerHTML = '⏹️ Stop';
    stopBtn.style.cssText = `
        background: linear-gradient(45deg, #ff4757, #c44569);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: none;
    `;

    // Button close
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '❌';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
    `;

    // Status indicator
    const status = document.createElement('div');
    status.style.cssText = `
        font-size: 12px;
        margin-top: 10px;
        text-align: center;
        opacity: 0.8;
    `;

    // Variabel untuk kontrol typing
    let isTyping = false;
    let typingInterval = null;

    // Mapping karakter ke keyboard info
    function getKeyInfo(char) {
        const specialChars = {
            // Numbers row
            '1': [49, 'Digit1'], '2': [50, 'Digit2'], '3': [51, 'Digit3'], '4': [52, 'Digit4'], '5': [53, 'Digit5'],
            '6': [54, 'Digit6'], '7': [55, 'Digit7'], '8': [56, 'Digit8'], '9': [57, 'Digit9'], '0': [48, 'Digit0'],
            
            // Numbers row with shift
            '!': [49, 'Digit1', true], '@': [50, 'Digit2', true], '#': [51, 'Digit3', true], '$': [52, 'Digit4', true], 
            '%': [53, 'Digit5', true], '^': [54, 'Digit6', true], '&': [55, 'Digit7', true], '*': [56, 'Digit8', true], 
            '(': [57, 'Digit9', true], ')': [48, 'Digit0', true],
            
            // Punctuation
            '-': [189, 'Minus'], '_': [189, 'Minus', true], '=': [187, 'Equal'], '+': [187, 'Equal', true],
            '[': [219, 'BracketLeft'], '{': [219, 'BracketLeft', true], ']': [221, 'BracketRight'], '}': [221, 'BracketRight', true],
            ';': [186, 'Semicolon'], ':': [186, 'Semicolon', true], ',': [188, 'Comma'], '<': [188, 'Comma', true],
            '.': [190, 'Period'], '>': [190, 'Period', true], '/': [191, 'Slash'], '?': [191, 'Slash', true],
            '`': [192, 'Backquote'], '~': [192, 'Backquote', true],
            
            // Special handling for quotes and backslash
            "'": [222, 'Quote'], '"': [222, 'Quote', true], '\\': [220, 'Backslash'], '|': [220, 'Backslash', true],
            
            // Control characters
            ' ': [32, 'Space'], '\n': [13, 'Enter'], '\t': [9, 'Tab']
        };
        
        if (specialChars[char]) {
            const [keyCode, code, shiftKey = false] = specialChars[char];
            return { key: char, code: code, keyCode: keyCode, shiftKey: shiftKey };
        }
        
        // Handle letters
        if (/[a-zA-Z]/.test(char)) {
            const isUpper = char === char.toUpperCase();
            const letter = char.toUpperCase();
            return {
                key: char,
                code: 'Key' + letter,
                keyCode: letter.charCodeAt(0),
                shiftKey: isUpper
            };
        }
        
        // Default fallback
        return {
            key: char,
            code: 'Unidentified',
            keyCode: char.charCodeAt(0),
            shiftKey: false
        };
    }

    // Fungsi untuk mencari input field aktif
    function findActiveInput() {
        const noVNCInput = document.getElementById('noVNC_keyboardinput');
        if (noVNCInput) {
            return noVNCInput;
        }
        
        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.contentEditable === 'true'
        )) {
            return activeElement;
        }
        
        const inputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea, [contenteditable="true"]');
        for (let input of inputs) {
            const rect = input.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                return input;
            }
        }
        
        return null;
    }

    // Fungsi untuk simulasi keyboard event
    function createKeyboardEvent(type, keyInfo) {
        return new KeyboardEvent(type, {
            key: keyInfo.key,
            code: keyInfo.code,
            keyCode: keyInfo.keyCode,
            which: keyInfo.keyCode,
            charCode: keyInfo.keyCode,
            bubbles: true,
            cancelable: true,
            shiftKey: keyInfo.shiftKey,
            ctrlKey: false,
            altKey: false,
            metaKey: false
        });
    }

    // Fungsi untuk simulasi mengetik
    function simulateTyping(element, text, speed) {
        return new Promise((resolve) => {
            let index = 0;
            
            const typeChar = () => {
                if (index < text.length && isTyping) {
                    const char = text.charAt(index);
                    
                    if (element.id === 'noVNC_keyboardinput') {
                        element.focus();
                        element.value = char;
                        
                        const keyInfo = getKeyInfo(char);
                        
                        // Send Shift down if needed
                        if (keyInfo.shiftKey) {
                            const shiftDown = createKeyboardEvent('keydown', {
                                key: 'Shift', code: 'ShiftLeft', keyCode: 16, shiftKey: true
                            });
                            element.dispatchEvent(shiftDown);
                        }
                        
                        // Main key events
                        element.dispatchEvent(createKeyboardEvent('keydown', keyInfo));
                        
                        if (/[\x20-\x7E]/.test(char)) {
                            element.dispatchEvent(createKeyboardEvent('keypress', keyInfo));
                        }
                        
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(createKeyboardEvent('keyup', keyInfo));
                        
                        // Send Shift up if needed
                        if (keyInfo.shiftKey) {
                            const shiftUp = createKeyboardEvent('keyup', {
                                key: 'Shift', code: 'ShiftLeft', keyCode: 16, shiftKey: false
                            });
                            element.dispatchEvent(shiftUp);
                        }
                        
                        setTimeout(() => { element.value = ''; }, 10);
                        
                    } else {
                        // Regular input handling
                        if (element.contentEditable === 'true') {
                            element.textContent += char;
                        } else {
                            element.value += char;
                        }
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    
                    // Update status
                    const displayChar = char === ' ' ? '␣' : char === '\n' ? '⏎' : char === '\t' ? '⇥' : char;
                    status.textContent = `Mengetik "${displayChar}"... ${index + 1}/${text.length} ${element.id === 'noVNC_keyboardinput' ? '(noVNC)' : ''}`;
                    container.classList.add('typing-active');
                    setTimeout(() => container.classList.remove('typing-active'), 300);
                    
                    index++;
                    typingInterval = setTimeout(typeChar, speed);
                } else {
                    resolve();
                }
            };
            
            typeChar();
        });
    }

    // Event listener untuk tombol mulai
    startBtn.addEventListener('click', async () => {
        const text = textbox.value.trim();
        if (!text) {
            alert('Masukkan teks terlebih dahulu!');
            return;
        }

        const targetInput = findActiveInput();
        if (!targetInput) {
            alert('Tidak ditemukan input field. Pastikan halaman memiliki input field atau noVNC aktif.');
            return;
        }

        const speed = parseInt(document.getElementById('type-speed').value);
        const inputInfo = targetInput.id === 'noVNC_keyboardinput' ? 'noVNC (Remote Desktop)' : targetInput.tagName.toLowerCase();
        status.textContent = `Target: ${inputInfo}`;
        
        isTyping = true;
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        targetInput.focus();
        
        try {
            await simulateTyping(targetInput, text, speed);
            status.textContent = 'Auto type selesai! ✅';
        } catch (error) {
            status.textContent = 'Error: ' + error.message;
        }
        
        isTyping = false;
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
    });

    // Event listener untuk tombol stop
    stopBtn.addEventListener('click', () => {
        isTyping = false;
        if (typingInterval) {
            clearTimeout(typingInterval);
        }
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        status.textContent = 'Auto type dihentikan';
    });

    // Event listener untuk tombol close
    closeBtn.addEventListener('click', () => {
        isTyping = false;
        if (typingInterval) {
            clearTimeout(typingInterval);
        }
        container.remove();
        style.remove();
    });

    // Hover effects
    [startBtn, stopBtn, closeBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.05)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
    });

    // Set status awal
    status.textContent = document.getElementById('noVNC_keyboardinput') ? 
        'Siap untuk auto type (noVNC terdeteksi)' : 'Siap untuk auto type';

    // Assembly semua elemen
    controls.appendChild(speedLabel);
    controls.appendChild(startBtn);
    controls.appendChild(stopBtn);
    
    container.appendChild(closeBtn);
    container.appendChild(header);
    container.appendChild(textbox);
    container.appendChild(controls);
    container.appendChild(status);
    
    document.body.appendChild(container);
    textbox.focus();
    
    console.log('🚀 Auto Type Injector berhasil dimuat!');
    console.log('📝 Cara menggunakan:');
    console.log('1. Masukkan teks pada textbox yang muncul di kanan bawah');
    console.log('2. Klik pada input field yang ingin diisi');
    console.log('3. Klik tombol "Mulai Auto Type"');
})();
