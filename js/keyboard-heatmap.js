/**
 * TypeVelocity Keyboard Heatmap
 * 
 * This module visualizes typing errors on a virtual keyboard,
 * highlighting problem keys with a color gradient based on error frequency.
 */

// Keyboard layout configuration
const keyboardLayout = [
    // Row 1
    [
        { key: '`', code: 'Backquote' },
        { key: '1', code: 'Digit1' },
        { key: '2', code: 'Digit2' },
        { key: '3', code: 'Digit3' },
        { key: '4', code: 'Digit4' },
        { key: '5', code: 'Digit5' },
        { key: '6', code: 'Digit6' },
        { key: '7', code: 'Digit7' },
        { key: '8', code: 'Digit8' },
        { key: '9', code: 'Digit9' },
        { key: '0', code: 'Digit0' },
        { key: '-', code: 'Minus' },
        { key: '=', code: 'Equal' },
        { key: 'Backspace', code: 'Backspace', width: 'w-16' }
    ],
    // Row 2
    [
        { key: 'Tab', code: 'Tab', width: 'w-10' },
        { key: 'q', code: 'KeyQ' },
        { key: 'w', code: 'KeyW' },
        { key: 'e', code: 'KeyE' },
        { key: 'r', code: 'KeyR' },
        { key: 't', code: 'KeyT' },
        { key: 'y', code: 'KeyY' },
        { key: 'u', code: 'KeyU' },
        { key: 'i', code: 'KeyI' },
        { key: 'o', code: 'KeyO' },
        { key: 'p', code: 'KeyP' },
        { key: '[', code: 'BracketLeft' },
        { key: ']', code: 'BracketRight' },
        { key: '\\', code: 'Backslash' }
    ],
    // Row 3
    [
        { key: 'Caps', code: 'CapsLock', width: 'w-12' },
        { key: 'a', code: 'KeyA' },
        { key: 's', code: 'KeyS' },
        { key: 'd', code: 'KeyD' },
        { key: 'f', code: 'KeyF' },
        { key: 'g', code: 'KeyG' },
        { key: 'h', code: 'KeyH' },
        { key: 'j', code: 'KeyJ' },
        { key: 'k', code: 'KeyK' },
        { key: 'l', code: 'KeyL' },
        { key: ';', code: 'Semicolon' },
        { key: '\'', code: 'Quote' },
        { key: 'Enter', code: 'Enter', width: 'w-12' }
    ],
    // Row 4
    [
        { key: 'Shift', code: 'ShiftLeft', width: 'w-16' },
        { key: 'z', code: 'KeyZ' },
        { key: 'x', code: 'KeyX' },
        { key: 'c', code: 'KeyC' },
        { key: 'v', code: 'KeyV' },
        { key: 'b', code: 'KeyB' },
        { key: 'n', code: 'KeyN' },
        { key: 'm', code: 'KeyM' },
        { key: ',', code: 'Comma' },
        { key: '.', code: 'Period' },
        { key: '/', code: 'Slash' },
        { key: 'Shift', code: 'ShiftRight', width: 'w-16' }
    ],
    // Row 5
    [
        { key: 'Ctrl', code: 'ControlLeft', width: 'w-10' },
        { key: 'Win', code: 'MetaLeft', width: 'w-10' },
        { key: 'Alt', code: 'AltLeft', width: 'w-10' },
        { key: ' ', code: 'Space', width: 'w-64' },
        { key: 'Alt', code: 'AltRight', width: 'w-10' },
        { key: 'Ctrl', code: 'ControlRight', width: 'w-10' }
    ]
];

// Error tracking data structure
let keyErrorData = {};

/**
 * Create a mini-heatmap for real-time feedback during typing
 */
function createMiniHeatmap() {
    // Create a smaller version of the keyboard for the main screen
    const miniKeyboard = document.createElement('div');
    miniKeyboard.id = 'mini-keyboard-heatmap';
    miniKeyboard.className = 'glassmorphism p-2 rounded-xl mb-4 hidden';
    miniKeyboard.setAttribute('aria-label', 'Mini keyboard error heatmap');
    
    // Create a simplified keyboard (just the main letter keys)
    const rows = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];
    
    rows.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'flex justify-center mb-0.5 gap-0.5';
        
        row.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.className = 'mini-key-cap w-6 h-6 rounded flex items-center justify-center text-xs font-medium transition-all duration-300 bg-gray-700/30';
            keyElement.dataset.key = key;
            keyElement.textContent = key;
            keyboardRow.appendChild(keyElement);
        });
        
        miniKeyboard.appendChild(keyboardRow);
    });
    
    // Add the mini keyboard to the challenge container
    document.addEventListener('DOMContentLoaded', () => {
        const challengeContainer = document.getElementById('challenge-container');
        if (challengeContainer) {
            challengeContainer.appendChild(miniKeyboard);
        }
    });
    
    // Store the mini keyboard for later use
    window.miniKeyboardHeatmap = miniKeyboard;
}

/**
 * Update the mini-heatmap visualization
 */
function updateMiniHeatmap() {
    if (!window.miniKeyboardHeatmap) return;
    
    // Find all key elements
    const keyElements = window.miniKeyboardHeatmap.querySelectorAll('.mini-key-cap');
    
    // Calculate max errors for color scaling
    let maxErrors = 0;
    Object.values(keyErrorData).forEach(count => {
        maxErrors = Math.max(maxErrors, count);
    });
    
    // Update each key's color based on error frequency
    keyElements.forEach(keyElement => {
        const key = keyElement.dataset.key.toLowerCase();
        const errorCount = keyErrorData[key] || 0;
        
        // Remove existing color classes
        keyElement.classList.remove(
            'bg-red-500', 'bg-red-400', 'bg-red-300',
            'bg-yellow-500', 'bg-yellow-400', 'bg-yellow-300',
            'bg-green-500', 'bg-green-400', 'bg-green-300',
            'bg-gray-700/30'
        );
        
        // Default background for keys with no errors
        let bgClass = 'bg-gray-700/30';
        
        // Calculate error intensity (0-1)
        let intensity = 0;
        if (maxErrors > 0) {
            intensity = errorCount / maxErrors;
        }
        
        // Apply color based on intensity
        if (errorCount > 0) {
            if (intensity > 0.66) {
                bgClass = 'bg-red-500';
            } else if (intensity > 0.33) {
                bgClass = 'bg-yellow-500';
            } else {
                bgClass = 'bg-green-500';
            }
        }
        
        // Apply the color class
        keyElement.classList.add(bgClass);
    });
}

/**
 * Toggle the mini-heatmap visibility
 * @param {boolean} show - Whether to show or hide the mini-heatmap
 */
function toggleMiniHeatmap(show) {
    if (!window.miniKeyboardHeatmap) return;
    
    if (show) {
        window.miniKeyboardHeatmap.classList.remove('hidden');
        updateMiniHeatmap();
    } else {
        window.miniKeyboardHeatmap.classList.add('hidden');
    }
}

/**
 * Initialize the keyboard heatmap
 */
function initKeyboardHeatmap() {
    // Create the keyboard UI
    createKeyboardUI();
    
    // Create mini-heatmap for real-time feedback
    createMiniHeatmap();
    
    // Load error data from localStorage
    loadErrorData();
    
    // Add event listener to track errors in real-time
    document.getElementById('typing-input').addEventListener('input', trackTypingErrors);
    
    // Add keyboard heatmap to results modal
    addHeatmapToResultsModal();
    
    // Add toggle button for mini-heatmap
    addMiniHeatmapToggle();
    
    // Check user preference for mini-heatmap
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const userData = loadUserData();
            if (userData && userData.preferences && userData.preferences.showMiniHeatmap) {
                toggleMiniHeatmap(true);
            }
        } catch (error) {
            console.error('Error loading mini-heatmap preference:', error);
        }
    });
}

/**
 * Create the virtual keyboard UI
 */
function createKeyboardUI() {
    const keyboardContainer = document.createElement('div');
    keyboardContainer.id = 'keyboard-heatmap';
    keyboardContainer.className = 'glassmorphism p-4 rounded-xl mb-4';
    keyboardContainer.setAttribute('aria-label', 'Keyboard error heatmap');
    
    // Create keyboard rows
    keyboardLayout.forEach((row, rowIndex) => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'flex justify-center mb-1 gap-1';
        
        // Create keys in this row
        row.forEach(keyConfig => {
            const keyElement = document.createElement('div');
            keyElement.className = `key-cap ${keyConfig.width || 'w-8'} h-8 rounded flex items-center justify-center text-xs font-medium transition-all duration-300`;
            keyElement.dataset.key = keyConfig.key;
            keyElement.dataset.code = keyConfig.code;
            keyElement.textContent = keyConfig.key;
            
            // Add to row
            keyboardRow.appendChild(keyElement);
        });
        
        // Add row to keyboard
        keyboardContainer.appendChild(keyboardRow);
    });
    
    // Add keyboard legend
    const legend = document.createElement('div');
    legend.className = 'flex justify-center items-center mt-2 text-xs gap-4';
    
    // Create legend items
    const legendItems = [
        { color: 'bg-green-500', label: 'No errors' },
        { color: 'bg-yellow-500', label: 'Some errors' },
        { color: 'bg-red-500', label: 'Frequent errors' }
    ];
    
    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center';
        
        const colorSwatch = document.createElement('div');
        colorSwatch.className = `w-3 h-3 rounded-full ${item.color} mr-1`;
        
        const label = document.createElement('span');
        label.textContent = item.label;
        
        legendItem.appendChild(colorSwatch);
        legendItem.appendChild(label);
        legend.appendChild(legendItem);
    });
    
    keyboardContainer.appendChild(legend);
    
    // Add reset button
    const resetButton = document.createElement('button');
    resetButton.className = 'mt-2 px-3 py-1 text-xs bg-gray-700/30 hover:bg-gray-700/50 rounded-full transition-colors';
    resetButton.textContent = 'Reset Error Data';
    resetButton.addEventListener('click', resetErrorData);
    
    keyboardContainer.appendChild(resetButton);
    
    // Store the keyboard container for later use
    window.keyboardHeatmapContainer = keyboardContainer;
}

/**
 * Track typing errors in real-time
 * @param {Event} e - Input event
 */
function trackTypingErrors(e) {
    // Get current state from typing challenge
    const inputText = e.target.value;
    const currentPrompt = window.currentPrompt;
    
    if (!currentPrompt || inputText.length === 0) return;
    
    // Check the last character typed
    const lastCharIndex = inputText.length - 1;
    
    // Only process if we have a valid index
    if (lastCharIndex >= 0 && lastCharIndex < currentPrompt.length) {
        const expectedChar = currentPrompt[lastCharIndex];
        const actualChar = inputText[lastCharIndex];
        
        // If there's an error, record it
        if (actualChar !== expectedChar) {
            recordKeyError(actualChar);
        }
    }
}

/**
 * Highlight a key in the mini-heatmap when an error occurs
 * @param {string} key - The key that was incorrectly typed
 */
function highlightKeyError(key) {
    if (!window.miniKeyboardHeatmap) return;
    
    // Normalize the key
    const normalizedKey = key.toLowerCase();
    
    // Find the key element
    const keyElement = window.miniKeyboardHeatmap.querySelector(`.mini-key-cap[data-key="${normalizedKey}"]`);
    
    if (keyElement) {
        // Add error animation
        keyElement.classList.add('key-error-animation');
        
        // Remove animation class after it completes
        setTimeout(() => {
            keyElement.classList.remove('key-error-animation');
        }, 300);
    }
}

/**
 * Record a key error
 * @param {string} key - The key that was incorrectly typed
 */
function recordKeyError(key) {
    // Normalize the key (lowercase for letters)
    const normalizedKey = key.toLowerCase();
    
    // Initialize if not exists
    if (!keyErrorData[normalizedKey]) {
        keyErrorData[normalizedKey] = 0;
    }
    
    // Increment error count
    keyErrorData[normalizedKey]++;
    
    // Save to localStorage
    saveErrorData();
    
    // Update visualizations
    updateHeatmap();
    updateMiniHeatmap();
    
    // Highlight the key in the mini-heatmap
    highlightKeyError(normalizedKey);
}

/**
 * Save error data to localStorage
 */
function saveErrorData() {
    try {
        localStorage.setItem('typeVelocity_keyErrors', JSON.stringify(keyErrorData));
    } catch (error) {
        console.error('Error saving key error data:', error);
    }
}

/**
 * Load error data from localStorage
 */
function loadErrorData() {
    try {
        const savedData = localStorage.getItem('typeVelocity_keyErrors');
        if (savedData) {
            keyErrorData = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error loading key error data:', error);
        keyErrorData = {};
    }
}

/**
 * Reset error data
 */
function resetErrorData() {
    keyErrorData = {};
    saveErrorData();
    updateHeatmap();
    updateMiniHeatmap(); // Also reset mini-heatmap
    
    // Provide feedback
    announceToScreenReader('Keyboard error data has been reset');
}

/**
 * Update the keyboard heatmap visualization
 */
function updateHeatmap() {
    if (!window.keyboardHeatmapContainer) return;
    
    // Find all key elements
    const keyElements = window.keyboardHeatmapContainer.querySelectorAll('.key-cap');
    
    // Calculate max errors for color scaling
    let maxErrors = 0;
    Object.values(keyErrorData).forEach(count => {
        maxErrors = Math.max(maxErrors, count);
    });
    
    // Update each key's color based on error frequency
    keyElements.forEach(keyElement => {
        const key = keyElement.dataset.key.toLowerCase();
        const errorCount = keyErrorData[key] || 0;
        
        // Remove existing color classes
        keyElement.classList.remove(
            'bg-red-500', 'bg-red-400', 'bg-red-300',
            'bg-yellow-500', 'bg-yellow-400', 'bg-yellow-300',
            'bg-green-500', 'bg-green-400', 'bg-green-300',
            'bg-gray-700/30'
        );
        
        // Default background for keys with no errors
        let bgClass = 'bg-gray-700/30';
        
        // Calculate error intensity (0-1)
        let intensity = 0;
        if (maxErrors > 0) {
            intensity = errorCount / maxErrors;
        }
        
        // Apply color based on intensity
        if (errorCount > 0) {
            if (intensity > 0.66) {
                bgClass = 'bg-red-500';
            } else if (intensity > 0.33) {
                bgClass = 'bg-yellow-500';
            } else {
                bgClass = 'bg-green-500';
            }
        }
        
        // Apply the color class
        keyElement.classList.add(bgClass);
        
        // Add error count as tooltip
        if (errorCount > 0) {
            keyElement.setAttribute('title', `${errorCount} errors`);
            keyElement.setAttribute('aria-label', `${key} key: ${errorCount} errors`);
        } else {
            keyElement.setAttribute('title', 'No errors');
            keyElement.setAttribute('aria-label', `${key} key: No errors`);
        }
    });
}

/**
 * Add the keyboard heatmap to the results modal
 */
function addHeatmapToResultsModal() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
        // Get the results modal content
        const modalContent = document.getElementById('modal-content');
        if (!modalContent) return;
        
        // Create a container for the heatmap
        const heatmapSection = document.createElement('div');
        heatmapSection.className = 'mb-6';
        heatmapSection.innerHTML = `
            <h3 class="text-sm font-semibold mb-2 text-primary">Keyboard Error Heatmap</h3>
            <p class="text-xs text-gray-400 mb-3">See which keys you frequently mistype</p>
        `;
        
        // Add the keyboard container
        heatmapSection.appendChild(window.keyboardHeatmapContainer);
        
        // Insert before the action buttons
        const actionButtons = modalContent.querySelector('.grid.grid-cols-2');
        modalContent.insertBefore(heatmapSection, actionButtons);
        
        // Update the heatmap visualization
        updateHeatmap();
    });
    
    // Also update when the results modal is shown
    const originalShowResultsModal = window.showResultsModal;
    if (originalShowResultsModal) {
        window.showResultsModal = function(...args) {
            originalShowResultsModal.apply(this, args);
            updateHeatmap();
        };
    }
}

/**
 * Update session-specific error data after completing a challenge
 * @param {string} prompt - The typing prompt
 * @param {string} userInput - What the user actually typed
 */
function updateSessionErrors(prompt, userInput) {
    // Compare each character
    const minLength = Math.min(prompt.length, userInput.length);
    
    for (let i = 0; i < minLength; i++) {
        if (prompt[i] !== userInput[i]) {
            recordKeyError(userInput[i]);
        }
    }
    
    // Update the visualization
    updateHeatmap();
}

/**
 * Add a toggle button for the mini-heatmap
 */
function addMiniHeatmapToggle() {
    document.addEventListener('DOMContentLoaded', () => {
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-mini-heatmap';
        toggleButton.className = 'absolute top-3 left-3 p-1.5 rounded-full bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-200';
        toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        `;
        toggleButton.setAttribute('aria-label', 'Toggle keyboard heatmap');
        toggleButton.setAttribute('title', 'Toggle keyboard heatmap');
        
        // Add to challenge container
        const challengeContainer = document.getElementById('challenge-container');
        if (challengeContainer) {
            challengeContainer.appendChild(toggleButton);
            
            // Add click event
            toggleButton.addEventListener('click', () => {
                const isHidden = window.miniKeyboardHeatmap.classList.contains('hidden');
                toggleMiniHeatmap(isHidden);
                
                // Save preference
                const userData = loadUserData();
                if (userData.preferences) {
                    userData.preferences.showMiniHeatmap = isHidden;
                    saveUserData(userData);
                }
            });
        }
    });
}

// Export functions for use in main app
window.keyboardHeatmap = {
    init: initKeyboardHeatmap,
    updateSessionErrors: updateSessionErrors,
    resetErrorData: resetErrorData,
    updateHeatmap: updateHeatmap,
    toggleMiniHeatmap: toggleMiniHeatmap,
    updateMiniHeatmap: updateMiniHeatmap
}; 