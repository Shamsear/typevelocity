/**
 * TypeVelocity - A futuristic, VisionOS-inspired typing training platform
 */

document.addEventListener('DOMContentLoaded', () => {
    // Reset user data for testing
    resetUserData();
    
    // Initialize the app
    initTheme();
    initUserData();
    initTypingChallenge();
    initProfileSystem();
    initNavigation();
    initLeaderboard();
    initTrophyWall();
    initAccessibility(); // Add accessibility features
    initSoundEffects(); // Initialize sound effects
    checkReducedMotion(); // Check for reduced motion preference
    
    // Initialize keyboard heatmap
    if (window.keyboardHeatmap && typeof window.keyboardHeatmap.init === 'function') {
        window.keyboardHeatmap.init();
    }
});

/**
 * Reset user data for testing purposes
 */
function resetUserData() {
    localStorage.removeItem('typeVelocity_userData');
}

/**
 * Theme Management
 */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('typeVelocity_theme');
    
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Use device preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Theme toggle button event
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        applyTheme(newTheme);
        localStorage.setItem('typeVelocity_theme', newTheme);
    });
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
        document.documentElement.classList.add('dark');
    } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
        document.documentElement.classList.remove('dark');
    }
}

/**
 * User Data Management
 */
function initUserData() {
    // Load user data from localStorage or initialize with defaults
    const userData = loadUserData();
    
    // Check for day change and update streaks
    updateDailyStreak(userData);
    
    // Update UI with user data
    updateUserUI(userData);
}

function loadUserData() {
    const savedData = localStorage.getItem('typeVelocity_userData');
    
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            // Ensure all required properties exist (in case of schema changes)
            return {
                ...getDefaultUserData(),
                ...parsedData
            };
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
            return getDefaultUserData();
        }
    }
    
    // No saved data, return defaults
    return getDefaultUserData();
}

function getDefaultUserData() {
    // Default user data schema
    return {
        // User level and XP
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        
        // Word counts
        totalWordsTyped: 0,
        dailyGoal: 500,
        dailyWordsTyped: 0,
        
        // XP tracking
        dailyXP: 0,
        dailyXPGoal: 200,
        
        // Streak tracking
        streak: 0,
        lastActive: new Date().toISOString().split('T')[0],
        
        // Performance statistics
        stats: {
            averageWPM: 0,
            averageAccuracy: 0,
            bestWPM: 0,
            totalSessions: 0,
            // Track performance over time
            history: []
        },
        
        // Achievement tracking
        achievements: [],
        
        // User preferences
        preferences: {
            soundEffects: true,
            showWPM: true,
            focusMode: false,
            avatar: 'default', // Default avatar
            theme: 'default', // Default theme
            reducedMotion: false, // New preference for reduced motion
            showMiniHeatmap: false // Preference for showing mini-heatmap
        }
    };
}

function saveUserData(userData) {
    try {
        localStorage.setItem('typeVelocity_userData', JSON.stringify(userData));
        return true;
    } catch (error) {
        console.error('Error saving user data to localStorage:', error);
        return false;
    }
}

function updateDailyStreak(userData) {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = userData.lastActive;
    
    if (today !== lastActive) {
        // It's a new day
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActive === yesterdayStr) {
            // User was active yesterday, increment streak
            userData.streak += 1;
        } else {
            // User missed a day, reset streak
            userData.streak = 1;
        }
        
        // Reset daily counters
        userData.dailyWordsTyped = 0;
        userData.dailyXP = 0;
        userData.lastActive = today;
        
        // Save the updated data
        saveUserData(userData);
    }
    
    return userData;
}

function updateUserUI(userData, leveledUp = false) {
    // Update level display
    const levelElements = document.querySelectorAll('.level-display');
    levelElements.forEach(el => {
        el.textContent = userData.level;
        
        // Apply level-up animation if needed
        if (leveledUp && el.tagName === 'DIV') {
            el.classList.add('level-up-animation');
            
            // Remove the animation class after it completes
            setTimeout(() => {
                el.classList.remove('level-up-animation');
            }, 1500);
        }
    });
    
    // Update XP to next level display
    const xpToNextLevelElements = document.querySelectorAll('.xp-to-next-level');
    xpToNextLevelElements.forEach(el => {
        el.textContent = userData.xpToNextLevel;
    });
    
    // Update XP bar
    const xpPercentage = (userData.xp / userData.xpToNextLevel) * 100;
    const xpBars = document.querySelectorAll('.xp-bar');
    xpBars.forEach(bar => {
        // Animate the XP bar
        animateProgressBar(bar, xpPercentage);
        
        // Add XP gain animation if leveled up
        if (leveledUp) {
            bar.classList.add('xp-gain');
            
            // Remove the animation class after it completes
            setTimeout(() => {
                bar.classList.remove('xp-gain');
            }, 2000);
        }
    });
    
    // Update XP text
    const xpTexts = document.querySelectorAll('.xp-text');
    xpTexts.forEach(text => {
        text.textContent = `XP: ${userData.xp}`;
    });
    
    const xpMaxTexts = document.querySelectorAll('.xp-max-text');
    xpMaxTexts.forEach(text => {
        text.textContent = `${userData.xpToNextLevel}`;
    });
    
    // Update daily goal
    const dailyGoalPercentage = Math.min(100, (userData.dailyWordsTyped / userData.dailyGoal) * 100);
    const dailyGoalBars = document.querySelectorAll('.daily-goal-bar');
    dailyGoalBars.forEach(bar => {
        animateProgressBar(bar, dailyGoalPercentage);
    });
    
    const dailyGoalTexts = document.querySelectorAll('.daily-goal-text');
    dailyGoalTexts.forEach(text => {
        text.textContent = `${userData.dailyWordsTyped}/${userData.dailyGoal} words`;
    });
    
    // Update daily goal percentage
    const dailyGoalPercentageElements = document.querySelectorAll('.daily-goal-percentage');
    dailyGoalPercentageElements.forEach(el => {
        el.textContent = `${Math.round(dailyGoalPercentage)}%`;
        
        // Change color if goal is met
        if (dailyGoalPercentage >= 100) {
            el.classList.remove('text-primary');
            el.classList.add('text-green-500');
        } else {
            el.classList.add('text-primary');
            el.classList.remove('text-green-500');
        }
    });
    
    // Update daily XP
    const dailyXPPercentage = Math.min(100, Math.round((userData.dailyXP / userData.dailyXPGoal) * 100));
    const dailyXPBars = document.querySelectorAll('.daily-xp-bar');
    dailyXPBars.forEach(bar => {
        animateProgressBar(bar, dailyXPPercentage);
    });
    
    const dailyXPTexts = document.querySelectorAll('.daily-xp-text');
    dailyXPTexts.forEach(text => {
        text.textContent = `${userData.dailyXP} XP`;
    });
    
    // Update streak
    const streakTexts = document.querySelectorAll('.streak-text');
    streakTexts.forEach(text => {
        text.textContent = `${userData.streak} day streak ${userData.streak >= 3 ? '🔥' : ''}`;
    });
    
    // Update streak badge
    const streakCounts = document.querySelectorAll('.streak-count');
    const streakBadge = document.getElementById('streak-badge');
    
    streakCounts.forEach(el => {
        el.textContent = userData.streak;
    });
    
    // Show/hide streak badge based on streak count
    if (userData.streak >= 3) {
        streakBadge.classList.remove('hidden');
        
        // Update badge color based on streak length
        if (userData.streak >= 30) {
            streakBadge.className = 'text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded-full flex items-center';
        } else if (userData.streak >= 14) {
            streakBadge.className = 'text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full flex items-center';
        } else if (userData.streak >= 7) {
            streakBadge.className = 'text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full flex items-center';
        } else {
            streakBadge.className = 'text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center';
        }
    } else {
        streakBadge.classList.add('hidden');
    }
    
    // Update daily goal display
    const dailyGoalElements = document.querySelectorAll('.daily-goal');
    dailyGoalElements.forEach(el => {
        el.textContent = userData.dailyGoal;
    });
    
    // Update daily XP goal display
    const dailyXPGoalElements = document.querySelectorAll('.daily-xp-goal');
    dailyXPGoalElements.forEach(el => {
        el.textContent = userData.dailyXPGoal;
    });
}

// Animate progress bars with smooth transition
function animateProgressBar(barElement, percentage) {
    // Ensure percentage is between 0 and 100
    const safePercentage = Math.min(100, Math.max(0, percentage));
    
    // Get current width
    const currentWidth = parseFloat(barElement.style.width) || 0;
    
    // Animate from current to target width
    const startTime = performance.now();
    const duration = 800; // animation duration in ms
    
    function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuad = progress * (2 - progress);
        
        // Calculate current width for this frame
        const currentValue = currentWidth + (safePercentage - currentWidth) * easeOutQuad;
        
        // Update width
        barElement.style.width = `${currentValue}%`;
        
        // Continue animation if not complete
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

/**
 * Record session data to user history
 */
function recordSessionData(wpm, accuracy, errors, duration, prompt) {
    const userData = loadUserData();
    
    // Create session record
    const sessionData = {
        date: new Date().toISOString(),
        wpm,
        accuracy,
        errors,
        duration, // in seconds
        promptLength: prompt.length,
        wordsTyped: prompt.length / 5
    };
    
    // Add to history (limit to last 100 sessions)
    if (!userData.stats.history) {
        userData.stats.history = [];
    }
    
    userData.stats.history.unshift(sessionData);
    
    // Keep history at a reasonable size
    if (userData.stats.history.length > 100) {
        userData.stats.history = userData.stats.history.slice(0, 100);
    }
    
    // Save updated user data
    saveUserData(userData);
    
    return sessionData;
}

/**
 * Check for achievements
 */
function checkAchievements(userData, sessionData) {
    const newAchievements = [];
    const existingAchievements = userData.achievements || [];
    
    // Define possible achievements
    const achievements = [
        {
            id: 'first_session',
            title: 'First Steps',
            description: 'Complete your first typing session',
            check: () => userData.stats.totalSessions === 1
        },
        {
            id: 'speed_30',
            title: 'Getting Faster',
            description: 'Reach 30 WPM in a session',
            check: () => sessionData.wpm >= 30
        },
        {
            id: 'speed_50',
            title: 'Speed Demon',
            description: 'Reach 50 WPM in a session',
            check: () => sessionData.wpm >= 50
        },
        {
            id: 'speed_80',
            title: 'Typing Master',
            description: 'Reach 80 WPM in a session',
            check: () => sessionData.wpm >= 80
        },
        {
            id: 'accuracy_95',
            title: 'Precision Typist',
            description: 'Achieve 95% accuracy in a session',
            check: () => sessionData.accuracy >= 95
        },
        {
            id: 'streak_3',
            title: 'Consistency',
            description: 'Maintain a 3-day streak',
            check: () => userData.streak >= 3
        },
        {
            id: 'streak_7',
            title: 'Weekly Warrior',
            description: 'Maintain a 7-day streak',
            check: () => userData.streak >= 7
        },
        {
            id: 'words_1000',
            title: 'Wordsmith',
            description: 'Type 1,000 words total',
            check: () => userData.totalWordsTyped >= 1000
        },
        {
            id: 'words_10000',
            title: 'Prolific Writer',
            description: 'Type 10,000 words total',
            check: () => userData.totalWordsTyped >= 10000
        },
        {
            id: 'level_5',
            title: 'Rising Star',
            description: 'Reach level 5',
            check: () => userData.level >= 5
        },
        {
            id: 'level_10',
            title: 'Expert Typist',
            description: 'Reach level 10',
            check: () => userData.level >= 10
        },
        {
            id: 'perfect_accuracy',
            title: 'Flawless',
            description: 'Complete a session with 100% accuracy',
            check: () => sessionData.accuracy === 100 && sessionData.wpm > 0
        }
    ];
    
    // Check for new achievements
    achievements.forEach(achievement => {
        // Skip if already achieved
        if (existingAchievements.some(a => a.id === achievement.id)) {
            return;
        }
        
        // Check if achievement condition is met
        if (achievement.check()) {
            const newAchievement = {
                id: achievement.id,
                title: achievement.title,
                description: achievement.description,
                dateEarned: new Date().toISOString()
            };
            
            newAchievements.push(newAchievement);
            existingAchievements.push(newAchievement);
        }
    });
    
    // Update achievements in user data if any new ones
    if (newAchievements.length > 0) {
        userData.achievements = existingAchievements;
        saveUserData(userData);
    }
    
    return newAchievements;
}

/**
 * Typing Challenge Management
 */
function initTypingChallenge() {
    const startMissionButton = document.getElementById('start-mission');
    const cancelMissionButton = document.getElementById('cancel-mission');
    const practiceModeButton = document.getElementById('practice-mode');
    const challengeContainer = document.getElementById('challenge-container');
    const challengeTextDisplay = document.getElementById('challenge-text-display');
    const inputField = document.getElementById('typing-input');
    const wpmDisplay = document.getElementById('wpm-value');
    const accuracyDisplay = document.getElementById('accuracy-value');
    const timeDisplay = document.getElementById('time-value');
    
    // Typing state
    let currentPrompt = '';
    let startTime = null;
    let typingInterval = null;
    let correctChars = 0;
    let incorrectChars = 0;
    let totalChars = 0;
    let isTypingActive = false;
    
    // Make currentPrompt accessible globally for the keyboard heatmap
    window.currentPrompt = '';
    
    // Array of fallback typing prompts
    const fallbackPrompts = [
        "The quick brown fox jumps over the lazy dog. This pangram contains all the letters of the English alphabet.",
        "Programming is the art of telling another human what one wants the computer to do. It's about thinking clearly and solving problems systematically.",
        "In the world of typing, speed and accuracy are equally important. Practice regularly to improve both aspects of your typing skills.",
        "The best way to predict the future is to invent it. Technology is just a tool. People give technology purpose and meaning.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. Never give up on your goals.",
        "Believe you can and you're halfway there. Your attitude, not your aptitude, will determine your altitude in life.",
        "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
        "Life is 10% what happens to you and 90% how you react to it. Your reaction is your responsibility.",
        "The future belongs to those who believe in the beauty of their dreams. Dream big and work hard to achieve them.",
        "Coding is not just about writing code; it's about solving problems efficiently and elegantly. Think before you type."
    ];
    
    // Practice mode prompts (shorter and simpler)
    const practiceModePrompts = [
        "The quick brown fox jumps over the lazy dog.",
        "Practice makes perfect when learning to type.",
        "Focus on accuracy first, then speed will follow.",
        "Keep your fingers on the home row keys.",
        "Look at the screen, not at your keyboard.",
        "Type with rhythm to improve your speed.",
        "Good posture helps prevent typing fatigue.",
        "Take short breaks to rest your hands and eyes.",
        "Learn keyboard shortcuts to boost productivity.",
        "Consistent practice leads to typing mastery."
    ];
    
    // Challenge categories
    const challengeCategories = [
        { name: "Inspirational Quotes", prompt: "Generate a short inspirational quote about perseverance and success (30-50 words)" },
        { name: "Tech Facts", prompt: "Create a short interesting fact about technology or computing (30-50 words)" },
        { name: "Typing Tips", prompt: "Write a short tip for improving typing speed and accuracy (30-50 words)" },
        { name: "Programming Wisdom", prompt: "Share a brief insight about programming best practices (30-50 words)" },
        { name: "Digital Productivity", prompt: "Provide a short tip about digital productivity and focus (30-50 words)" },
        { name: "Internet History", prompt: "Write a brief interesting fact about the history of the internet (30-50 words)" },
        { name: "Future Technology", prompt: "Describe a potential future technology in a brief paragraph (30-50 words)" }
    ];
    
    // Start Mission button click event
    startMissionButton.addEventListener('click', () => {
        startNewChallenge();
    });
    
    // Practice Mode button click event
    practiceModeButton.addEventListener('click', () => {
        startPracticeMode();
    });
    
    // Cancel Mission button click event
    cancelMissionButton.addEventListener('click', () => {
        cancelChallenge();
    });
    
    // Input field event listeners
    inputField.addEventListener('input', handleTyping);
    inputField.addEventListener('paste', (e) => e.preventDefault()); // Prevent pasting
    inputField.addEventListener('cut', (e) => e.preventDefault());   // Prevent cutting
    
    // Start a new typing challenge
    function startNewChallenge() {
        // Reset typing state
        resetTypingState();
        
        // Show loading state
        showLoadingState();
        
        // Show cancel button
        cancelMissionButton.classList.remove('opacity-0', 'invisible');
        cancelMissionButton.classList.add('opacity-100', 'visible');
        
        // Enable focus mode - removed
        
        // Get a dynamic prompt from ChatGPT API
        fetchDynamicPrompt()
            .then(prompt => {
                if (prompt) {
                    currentPrompt = prompt;
                } else {
                    // Fallback to static prompt if API fails
                    const randomIndex = Math.floor(Math.random() * fallbackPrompts.length);
                    currentPrompt = fallbackPrompts[randomIndex];
                }
                
                // Initialize the challenge with the prompt
                initializeChallenge(currentPrompt);
            })
            .catch(error => {
                console.error('Error fetching dynamic prompt:', error);
                
                // Fallback to static prompt
                const randomIndex = Math.floor(Math.random() * fallbackPrompts.length);
                currentPrompt = fallbackPrompts[randomIndex];
                
                // Initialize the challenge with the fallback prompt
                initializeChallenge(currentPrompt);
            });
    }
    
    // Start practice mode with simpler prompts
    function startPracticeMode() {
        // Reset typing state
        resetTypingState();
        
        // Show loading state (brief for practice mode)
        challengeTextDisplay.innerHTML = `
            <div class="flex flex-col items-center justify-center">
                <p>Loading practice prompt...</p>
            </div>
        `;
        
        // Activate the challenge container
        challengeContainer.classList.add('border-primary/50', 'dark:border-primary/50', 'active-challenge');
        
        // Show cancel button
        cancelMissionButton.classList.remove('opacity-0', 'invisible');
        cancelMissionButton.classList.add('opacity-100', 'visible');
        
        // Enable focus mode - removed
        
        // Select a random practice prompt
        const randomIndex = Math.floor(Math.random() * practiceModePrompts.length);
        currentPrompt = practiceModePrompts[randomIndex];
        
        // Initialize the challenge with the practice prompt
        setTimeout(() => {
            initializeChallenge(currentPrompt, true);
        }, 500);
    }
    
    // Cancel the current challenge
    function cancelChallenge() {
        // Reset typing state
        resetTypingState();
        
        // Hide cancel button
        cancelMissionButton.classList.add('opacity-0', 'invisible');
        cancelMissionButton.classList.remove('opacity-100', 'visible');
        
        // Reset challenge container
        challengeContainer.classList.remove('border-primary/50', 'dark:border-primary/50', 'active-challenge');
        challengeContainer.classList.add('border-gray-700/50', 'dark:border-gray-700/50', 'border-gray-300/50');
        
        // Reset challenge text
        challengeTextDisplay.innerHTML = `
            <div class="text-gray-400 dark:text-gray-400 text-gray-600 text-lg font-mono">
                Your typing challenge will appear here
            </div>
        `;
        
        // Reset stats display
        wpmDisplay.textContent = '--';
        accuracyDisplay.textContent = '--%';
        timeDisplay.textContent = '--:--';
        
        // Reset start mission button
        startMissionButton.innerHTML = `
            <span class="mr-2">Start Mission</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
        `;
        startMissionButton.disabled = false;
        
        // Reset practice mode button
        practiceModeButton.innerHTML = `
            <span class="mr-2">Practice Mode</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        `;
        practiceModeButton.disabled = false;
        
        // Disable focus mode - removed
    }
    
    // Show loading state while fetching prompt
    function showLoadingState() {
        challengeTextDisplay.innerHTML = `
            <div class="flex flex-col items-center justify-center">
                <div class="mb-3">
                    <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p>Generating your typing challenge...</p>
            </div>
        `;
        
        // Activate the challenge container
        challengeContainer.classList.remove('border-gray-700/50', 'dark:border-gray-700/50', 'border-gray-300/50');
        challengeContainer.classList.add('border-primary/50', 'dark:border-primary/50', 'active-challenge');
        
        // Change button text
        startMissionButton.innerHTML = `
            <span class="mr-2">Generating...</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        `;
        
        // Disable the buttons while loading
        startMissionButton.disabled = true;
        practiceModeButton.disabled = true;
    }
    
    // Initialize the challenge with the provided prompt
    function initializeChallenge(prompt, isPracticeMode = false) {
        totalChars = prompt.length;
        
        // Set the current prompt and make it accessible globally
        currentPrompt = prompt;
        window.currentPrompt = prompt;
        
        // Format the challenge text with character spans
        // We'll wrap each word to prevent cutting off words at the edge
        const words = prompt.split(' ');
        let formattedText = '';
        
        words.forEach((word, wordIndex) => {
            // Process each character in the word
            const wordChars = word.split('').map(char => {
                return `<span class="character">${char}</span>`;
            }).join('');
            
            // Add the word with its characters
            formattedText += `<span class="word">${wordChars}</span>`;
            
            // Add space after word (except for the last word)
            if (wordIndex < words.length - 1) {
                formattedText += `<span class="character space">·</span>`;
            }
        });
        
        // Update the challenge text display
        challengeTextDisplay.innerHTML = formattedText;
        
        // Change button text based on mode
        if (isPracticeMode) {
            startMissionButton.innerHTML = `
                <span class="mr-2">Start Mission</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            `;
            
            practiceModeButton.innerHTML = `
                <span class="mr-2">New Practice</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            `;
        } else {
            startMissionButton.innerHTML = `
                <span class="mr-2">Restart Mission</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            `;
            
            practiceModeButton.innerHTML = `
                <span class="mr-2">Practice Mode</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            `;
        }
        
        // Re-enable the buttons
        startMissionButton.disabled = false;
        practiceModeButton.disabled = false;
        
        // Clear input field and focus it
        inputField.value = '';
        inputField.classList.remove('hidden');
        inputField.focus();
        
        // Start the typing activity
        startTime = new Date();
        isTypingActive = true;
        
        // Start interval to update stats
        if (typingInterval) {
            clearInterval(typingInterval);
        }
        typingInterval = setInterval(updateStats, 1000);
    }
    
    // Fetch dynamic prompt from ChatGPT API
    async function fetchDynamicPrompt() {
        try {
            // Check if dynamic challenges are enabled
            if (!TypeVelocityConfig.app.useDynamicChallenges) {
                return null; // Fall back to static prompts
            }
            
            // Get user preferences or difficulty level
            const userData = loadUserData();
            const userLevel = userData.level || 1;
            
            // Select a category based on user level or randomly
            const categoryIndex = Math.floor(Math.random() * challengeCategories.length);
            const category = challengeCategories[categoryIndex];
            
            // Adjust difficulty based on user level
            let difficultyModifier = "";
            if (userLevel <= 3) {
                difficultyModifier = "Keep it simple with basic vocabulary.";
            } else if (userLevel <= 7) {
                difficultyModifier = "Use moderate vocabulary.";
            } else {
                difficultyModifier = "Use advanced vocabulary and complex sentence structures.";
            }
            
            // Get API configuration
            const apiKey = TypeVelocityConfig.openai.apiKey;
            
            // If no API key is provided, fall back to static prompts
            if (!apiKey || apiKey === "YOUR_OPENAI_API_KEY") {
                console.warn("No OpenAI API key provided. Using fallback prompts.");
                return null;
            }
            
            // API endpoint
            const endpoint = "https://api.openai.com/v1/chat/completions";
            
            // Request payload
            const payload = {
                model: TypeVelocityConfig.openai.model,
                messages: [
                    {
                        role: "system",
                        content: "You are a typing challenge generator. Create concise, interesting text for typing practice. Respond with ONLY the text to type, no additional commentary."
                    },
                    {
                        role: "user",
                        content: `${category.prompt}. ${difficultyModifier}`
                    }
                ],
                temperature: TypeVelocityConfig.openai.temperature,
                max_tokens: TypeVelocityConfig.openai.maxTokens
            };
            
            // Make the API request
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });
            
            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }
            
            // Parse the response
            const data = await response.json();
            
            // Extract the generated text
            const generatedText = data.choices[0].message.content.trim();
            
            // Return the generated text
            return generatedText;
        } catch (error) {
            console.error("Error fetching from ChatGPT API:", error);
            return null; // Return null to trigger fallback
        }
    }
    
    // Handle typing input
    function handleTyping(e) {
        if (!isTypingActive) return;
        
        const inputText = e.target.value;
        const characters = challengeTextDisplay.querySelectorAll('.character');
        
        // Reset character classes
        correctChars = 0;
        incorrectChars = 0;
        
        // Track if the latest character was correct or incorrect
        let lastCharWasCorrect = true;
        
        // Compare input with prompt characters
        for (let i = 0; i < inputText.length; i++) {
            if (i < characters.length) {
                const expectedChar = currentPrompt[i];
                const actualChar = inputText[i];
                
                // Check if this is the last character typed
                const isNewCharacter = i === inputText.length - 1;
                
                if (actualChar === expectedChar) {
                    // For correct spaces, keep the dot visible but mark as correct
                    if (expectedChar === ' ') {
                        characters[i].className = 'character space correct';
                        characters[i].textContent = '·';
                    } else {
                        characters[i].className = 'character correct';
                    }
                    correctChars++;
                    
                    // Play key press sound for the latest character
                    if (isNewCharacter && window.soundEffects && window.soundEffects.keypress) {
                        window.soundEffects.keypress();
                    }
                    
                    // Add subtle animation to the character
                    if (isNewCharacter) {
                        characters[i].animate([
                            { transform: 'scale(1.2)', opacity: '0.9' },
                            { transform: 'scale(1)', opacity: '1' }
                        ], {
                            duration: 150,
                            easing: 'ease-out'
                        });
                    }
                    
                    lastCharWasCorrect = true;
                } else {
                    // For incorrect spaces, show a different indicator
                    if (expectedChar === ' ') {
                        characters[i].className = 'character space incorrect';
                        characters[i].textContent = '·';
                    } else {
                        characters[i].className = 'character incorrect';
                    }
                    incorrectChars++;
                    
                    // Play error sound for the latest character
                    if (isNewCharacter && window.soundEffects && window.soundEffects.error) {
                        window.soundEffects.error();
                    }
                    
                    // Add shake animation to the character
                    if (isNewCharacter) {
                        characters[i].animate([
                            { transform: 'translateX(-3px)' },
                            { transform: 'translateX(3px)' },
                            { transform: 'translateX(-2px)' },
                            { transform: 'translateX(2px)' },
                            { transform: 'translateX(0)' }
                        ], {
                            duration: 200,
                            easing: 'ease-in-out'
                        });
                    }
                    
                    lastCharWasCorrect = false;
                }
            }
        }
        
        // Reset untyped characters
        for (let i = inputText.length; i < characters.length; i++) {
            if (currentPrompt[i] === ' ') {
                characters[i].className = 'character space';
                characters[i].textContent = '·';
            } else {
                characters[i].className = 'character';
            }
        }
        
        // Update stats
        updateStats();
        
        // Check if challenge is complete
        if (inputText.length === currentPrompt.length) {
            completeChallenge();
        }
    }
    
    // Update typing statistics
    function updateStats() {
        if (!startTime) return;
        
        // Calculate elapsed time in minutes
        const currentTime = new Date();
        const elapsedTime = (currentTime - startTime) / 1000; // in seconds
        const elapsedMinutes = elapsedTime / 60;
        
        // Calculate WPM: (characters / 5) / minutes
        // Using standard 5 characters per word metric
        const typedCharacters = correctChars + incorrectChars;
        const wordsTyped = typedCharacters / 5;
        const wpm = Math.round(wordsTyped / (elapsedMinutes || 0.001)); // Avoid division by zero
        
        // Calculate accuracy
        const accuracy = Math.round((correctChars / (typedCharacters || 1)) * 100);
        
        // Format time display (mm:ss)
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = Math.floor(elapsedTime % 60);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update displays
        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = `${accuracy}%`;
        timeDisplay.textContent = formattedTime;
    }
    
    // Complete the challenge
    function completeChallenge() {
        isTypingActive = false;
        clearInterval(typingInterval);
        
        // Hide cancel button
        cancelMissionButton.classList.add('opacity-0', 'invisible');
        cancelMissionButton.classList.remove('opacity-100', 'visible');
        
        // Calculate final stats
        const finalTime = (new Date() - startTime) / 1000; // in seconds
        const finalMinutes = finalTime / 60;
        const wordsTyped = currentPrompt.length / 5;
        const wpm = Math.round(wordsTyped / finalMinutes);
        const accuracy = Math.round((correctChars / totalChars) * 100);
        const errors = incorrectChars;
        
        // Record session data
        const sessionData = recordSessionData(wpm, accuracy, errors, finalTime, currentPrompt);
        
        // Update keyboard heatmap with session errors
        if (window.keyboardHeatmap && typeof window.keyboardHeatmap.updateSessionErrors === 'function') {
            window.keyboardHeatmap.updateSessionErrors(currentPrompt, inputField.value);
        }
        
        // Calculate XP based on performance
        // Formula: (WPM * Accuracy Multiplier * Challenge Length Multiplier * Streak Bonus)
        const userData = loadUserData();
        
        // Base XP from WPM (higher WPM = more XP)
        let earnedXP = Math.round(wpm * 0.5);
        
        // Accuracy multiplier (exponential bonus for high accuracy)
        const accuracyMultiplier = calculateAccuracyMultiplier(accuracy);
        earnedXP = Math.round(earnedXP * accuracyMultiplier);
        
        // Challenge length multiplier (longer challenges give slightly more XP per character)
        const lengthMultiplier = 1 + (currentPrompt.length / 1000);
        earnedXP = Math.round(earnedXP * lengthMultiplier);
        
        // Streak bonus (consecutive days give bonus XP)
        const streakBonus = calculateStreakBonus(userData.streak);
        earnedXP = Math.round(earnedXP * streakBonus);
        
        // Level-based difficulty bonus (higher levels get harder challenges but more XP)
        const levelBonus = 1 + (userData.level * 0.02); // 2% more XP per level
        earnedXP = Math.round(earnedXP * levelBonus);
        
        // Ensure minimum XP gain
        earnedXP = Math.max(earnedXP, 5);
        
        // Check for achievements
        const newAchievements = checkAchievements(userData, sessionData);
        
        // Update user data
        userData.totalWordsTyped += wordsTyped;
        userData.dailyWordsTyped += wordsTyped;
        userData.xp += earnedXP;
        userData.dailyXP += earnedXP;
        
        // Check for level up
        const leveledUp = checkAndProcessLevelUp(userData);
        
        // Update stats
        userData.stats.totalSessions += 1;
        userData.stats.averageWPM = Math.round(((userData.stats.averageWPM * (userData.stats.totalSessions - 1)) + wpm) / userData.stats.totalSessions);
        userData.stats.averageAccuracy = Math.round(((userData.stats.averageAccuracy * (userData.stats.totalSessions - 1)) + accuracy) / userData.stats.totalSessions);
        userData.stats.bestWPM = Math.max(userData.stats.bestWPM, wpm);
        
        // Update last active date
        userData.lastActive = new Date().toISOString().split('T')[0];
        
        // Save updated user data
        saveUserData(userData);
        updateUserUI(userData, leveledUp);
        
        // Update leaderboard with new stats
        if (window.updateUserLeaderboardStats) {
            window.updateUserLeaderboardStats(wpm, accuracy);
        }
        
        // Hide input field
        inputField.classList.add('hidden');
        
        // Add completion animation to challenge container
        challengeContainer.animate([
            { transform: 'scale(1)', boxShadow: '0 0 0 rgba(99, 102, 241, 0.5)' },
            { transform: 'scale(1.02)', boxShadow: '0 0 30px rgba(99, 102, 241, 0.8)' },
            { transform: 'scale(1)', boxShadow: '0 0 0 rgba(99, 102, 241, 0.5)' }
        ], {
            duration: 800,
            easing: 'ease-in-out'
        });
        
        // Play appropriate sound effect
        if (window.soundEffects) {
            // Play level up sound if leveled up
            if (leveledUp && window.soundEffects.levelUp) {
                window.soundEffects.levelUp();
            } 
            // Play achievement sound if new achievements
            else if (newAchievements && newAchievements.length > 0 && window.soundEffects.achievement) {
                window.soundEffects.achievement();
            }
            // Otherwise play completion sound
            else if (window.soundEffects.complete) {
                window.soundEffects.complete();
            }
        }
        
        // Announce completion to screen readers
        announceToScreenReader(`Challenge complete! Your WPM is ${wpm} with ${accuracy}% accuracy. You earned ${earnedXP} XP.`);
        
        // Show results modal with animation
        setTimeout(() => {
            showResultsModal(wpm, accuracy, errors, earnedXP, userData, newAchievements, leveledUp);
        }, 500);
    }
    
    // Reset typing state
    function resetTypingState() {
        if (typingInterval) {
            clearInterval(typingInterval);
        }
        startTime = null;
        correctChars = 0;
        incorrectChars = 0;
        isTypingActive = false;
    }

    // Calculate accuracy multiplier for XP
    function calculateAccuracyMultiplier(accuracy) {
        // Exponential bonus for high accuracy
        // 100% accuracy = 2.0x multiplier
        // 95% accuracy = 1.5x multiplier
        // 90% accuracy = 1.2x multiplier
        // 80% accuracy = 1.0x multiplier
        // Below 80% = penalty (0.8x or lower)
        
        if (accuracy >= 100) return 2.0;
        if (accuracy >= 95) return 1.5;
        if (accuracy >= 90) return 1.2;
        if (accuracy >= 80) return 1.0;
        if (accuracy >= 70) return 0.8;
        return 0.6; // Below 70% accuracy
    }
    
    // Calculate streak bonus for XP
    function calculateStreakBonus(streak) {
        // Bonus for consecutive days
        // 1-2 days: no bonus (1.0x)
        // 3-6 days: small bonus (1.1x)
        // 7-13 days: medium bonus (1.2x)
        // 14-29 days: large bonus (1.3x)
        // 30+ days: max bonus (1.5x)
        
        if (streak >= 30) return 1.5;
        if (streak >= 14) return 1.3;
        if (streak >= 7) return 1.2;
        if (streak >= 3) return 1.1;
        return 1.0;
    }
    
    // Check and process level up
    function checkAndProcessLevelUp(userData) {
        let leveledUp = false;
        
        // Check if XP exceeds current level threshold
        while (userData.xp >= userData.xpToNextLevel) {
            // Level up!
            userData.level += 1;
            userData.xp -= userData.xpToNextLevel;
            
            // Calculate new XP threshold using a progressive curve
            // Each level requires more XP than the previous one
            userData.xpToNextLevel = calculateXpForNextLevel(userData.level);
            
            leveledUp = true;
        }
        
        return leveledUp;
    }
    
    // Calculate XP required for next level
    function calculateXpForNextLevel(level) {
        // Progressive XP curve: 100 * (level^1.5)
        // Level 1 -> 2: 100 XP
        // Level 2 -> 3: 283 XP
        // Level 3 -> 4: 520 XP
        // Level 10 -> 11: 3162 XP
        
        return Math.round(100 * Math.pow(level, 1.5));
    }
}

/**
 * Profile System - Avatar Selection
 */
function initProfileSystem() {
    // Get DOM elements
    const profileButton = document.getElementById('profile-button');
    const profileModal = document.getElementById('profile-modal');
    const profileModalContent = document.getElementById('profile-modal-content');
    const closeProfileModal = document.getElementById('close-profile-modal');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const saveAvatarButton = document.getElementById('save-avatar');
    const userAvatarHeader = document.getElementById('user-avatar-header');
    
    // Load avatar images
    loadAvatarImages();
    
    // Load saved preferences
    loadUserPreferences();
    
    // Profile button click event
    profileButton.addEventListener('click', () => {
        showProfileModal();
    });
    
    // Close modal button event
    closeProfileModal.addEventListener('click', () => {
        hideProfileModal();
    });
    
    // Avatar selection
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            avatarOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('div').classList.remove('border-primary');
                opt.querySelector('div').classList.add('border-transparent');
            });
            
            // Add selected class to clicked option
            option.classList.add('selected');
            option.querySelector('div').classList.add('border-primary');
            option.querySelector('div').classList.remove('border-transparent');
        });
    });
    
    // Save avatar button
    saveAvatarButton.addEventListener('click', () => {
        const selectedAvatar = document.querySelector('.avatar-option.selected').getAttribute('data-avatar');
        saveUserAvatar(selectedAvatar);
        hideProfileModal();
    });
    
    // Load avatar images from avatarImages object
    function loadAvatarImages() {
        // Set avatar images
        document.getElementById('default-avatar').src = avatarImages.default;
        document.getElementById('astro-avatar').src = avatarImages.astro;
        document.getElementById('ninja-avatar').src = avatarImages.ninja;
        document.getElementById('robot-avatar').src = avatarImages.robot;
        document.getElementById('gamer-avatar').src = avatarImages.gamer;
        document.getElementById('coder-avatar').src = avatarImages.coder;
        
        // Set header avatar default
        if (!userAvatarHeader.src || userAvatarHeader.src.includes('default.png')) {
            userAvatarHeader.src = avatarImages.default;
        }
    }
    
    // Show profile modal
    function showProfileModal() {
        profileModal.classList.remove('opacity-0', 'pointer-events-none');
        
        // Animate modal content
        setTimeout(() => {
            profileModalContent.classList.remove('scale-95', 'opacity-0');
            profileModalContent.classList.add('scale-100', 'opacity-100');
            
            // Set focus on first avatar option for keyboard accessibility
            setTimeout(() => {
                const firstAvatarOption = document.querySelector('.avatar-option');
                if (firstAvatarOption) {
                    firstAvatarOption.focus();
                }
            }, 100);
        }, 50);
    }
    
    // Hide profile modal
    function hideProfileModal() {
        // Animate modal content out
        profileModalContent.classList.remove('scale-100', 'opacity-100');
        profileModalContent.classList.add('scale-95', 'opacity-0');
        
        // Hide modal with animation
        setTimeout(() => {
            profileModal.classList.add('opacity-0', 'pointer-events-none');
        }, 200);
    }
    
    // Load user preferences
    function loadUserPreferences() {
        const userData = loadUserData();
        
        // Set avatar
        if (userData.preferences.avatar) {
            updateAvatarDisplay(userData.preferences.avatar);
            
            // Select the correct avatar option
            avatarOptions.forEach(option => {
                if (option.getAttribute('data-avatar') === userData.preferences.avatar) {
                    option.classList.add('selected');
                    option.querySelector('div').classList.add('border-primary');
                    option.querySelector('div').classList.remove('border-transparent');
                } else {
                    option.classList.remove('selected');
                    option.querySelector('div').classList.remove('border-primary');
                    option.querySelector('div').classList.add('border-transparent');
                }
            });
        }
    }
    
    // Save user avatar
    function saveUserAvatar(avatar) {
        const userData = loadUserData();
        userData.preferences.avatar = avatar;
        saveUserData(userData);
        
        // Update avatar display
        updateAvatarDisplay(avatar);
    }
    
    // Update avatar display
    function updateAvatarDisplay(avatar) {
        userAvatarHeader.src = avatarImages[avatar];
    }
}

/**
 * Results Modal Management
 */
function showResultsModal(wpm, accuracy, errors, xp, userData, newAchievements = [], leveledUp = false) {
    const resultsModal = document.getElementById('results-modal');
    const modalContent = document.getElementById('modal-content');
    const resultWpm = document.getElementById('result-wpm');
    const resultAccuracy = document.getElementById('result-accuracy');
    const resultErrors = document.getElementById('result-errors');
    const resultXp = document.getElementById('result-xp');
    const typingInsights = document.getElementById('typing-insights');
    const retryButton = document.getElementById('retry-challenge');
    const closeButton = document.getElementById('close-modal');
    
    // Set results data
    resultWpm.textContent = wpm;
    resultAccuracy.textContent = `${accuracy}%`;
    resultErrors.textContent = errors;
    resultXp.textContent = `${xp} XP`;
    
    // Update modal title if leveled up
    const modalTitle = document.getElementById('modal-title');
    if (leveledUp) {
        modalTitle.innerHTML = `
            <span class="text-2xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text mb-1">Level Up! You're now level ${userData.level}</span>
            <div class="text-sm text-yellow-400 animate-pulse">✨ New challenges await! ✨</div>
        `;
    } else {
        modalTitle.innerHTML = `
            <span class="text-2xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text mb-1">Challenge Complete!</span>
            <p class="text-gray-400 dark:text-gray-400 text-gray-600 text-sm">Here's how you performed</p>
        `;
    }
    
    // Generate insights based on performance
    typingInsights.innerHTML = generateInsights(wpm, accuracy, errors, userData, newAchievements, leveledUp);
    
    // Show modal with animation
    resultsModal.classList.remove('opacity-0', 'pointer-events-none');
    
    // Animate modal content
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
        
        // Set focus on retry button for keyboard accessibility
        setTimeout(() => {
            retryButton.focus();
        }, 100);
    }, 50);
    
    // Add event listeners to buttons
    retryButton.addEventListener('click', () => {
        hideResultsModal();
        setTimeout(() => {
            document.getElementById('start-mission').click();
        }, 300);
    });
    
    closeButton.addEventListener('click', () => {
        hideResultsModal();
    });
}

function hideResultsModal() {
    const resultsModal = document.getElementById('results-modal');
    const modalContent = document.getElementById('modal-content');
    
    // Animate modal content out
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    // Hide modal with animation
    setTimeout(() => {
        resultsModal.classList.add('opacity-0', 'pointer-events-none');
    }, 200);
}

function generateInsights(wpm, accuracy, errors, userData, newAchievements = [], leveledUp = false) {
    let insights = [];
    
    // Show level up message first if applicable
    if (leveledUp) {
        insights.push(`<div class="mb-2 text-yellow-400 font-semibold">🌟 You've reached level ${userData.level}!</div>`);
        insights.push(`<div class="mb-2 text-gray-300">Next level requires ${userData.xpToNextLevel} XP</div>`);
    }
    
    // Show new achievements
    if (newAchievements && newAchievements.length > 0) {
        insights.push(`<div class="mb-2 text-primary font-semibold">🏆 New Achievements:</div>`);
        newAchievements.forEach(achievement => {
            insights.push(`<div class="mb-1 text-green-500">• ${achievement.title} - ${achievement.description}</div>`);
        });
        insights.push(`<div class="mb-2"></div>`);
    }
    
    // Daily goals progress
    const dailyGoalPercentage = Math.min(100, Math.round((userData.dailyWordsTyped / userData.dailyGoal) * 100));
    if (dailyGoalPercentage >= 100) {
        insights.push(`<div class="mb-1 text-green-500">🎯 Daily word goal achieved! (${userData.dailyWordsTyped}/${userData.dailyGoal})</div>`);
    } else if (dailyGoalPercentage >= 75) {
        insights.push(`<div class="mb-1">🎯 You're ${dailyGoalPercentage}% toward your daily word goal!</div>`);
    } else if (dailyGoalPercentage >= 50) {
        insights.push(`<div class="mb-1">🎯 Halfway to your daily word goal (${userData.dailyWordsTyped}/${userData.dailyGoal})</div>`);
    }
    
    // XP goal progress
    const dailyXPPercentage = Math.min(100, Math.round((userData.dailyXP / userData.dailyXPGoal) * 100));
    if (dailyXPPercentage >= 100) {
        insights.push(`<div class="mb-1 text-green-500">⭐ Daily XP goal achieved! (${userData.dailyXP}/${userData.dailyXPGoal} XP)</div>`);
    } else if (dailyXPPercentage >= 75) {
        insights.push(`<div class="mb-1">⭐ You're ${dailyXPPercentage}% toward your daily XP goal!</div>`);
    }
    
    // Streak information
    if (userData.streak >= 7) {
        insights.push(`<div class="mb-1 text-yellow-400">🔥 ${userData.streak} day streak! Keep it up!</div>`);
    } else if (userData.streak >= 3) {
        insights.push(`<div class="mb-1">🔥 ${userData.streak} day streak! You're building momentum!</div>`);
    }
    
    // Compare with average performance
    if (userData.stats.totalSessions > 1) {
        if (wpm > userData.stats.averageWPM) {
            const improvement = Math.round(((wpm - userData.stats.averageWPM) / userData.stats.averageWPM) * 100);
            insights.push(`<div class="mb-1 text-green-500">🚀 ${improvement}% faster than your average speed!</div>`);
        } else if (wpm < userData.stats.averageWPM) {
            insights.push(`<div class="mb-1">💡 You're ${Math.round(userData.stats.averageWPM - wpm)} WPM below your average. Try to maintain a steady rhythm.</div>`);
        }
        
        if (accuracy > userData.stats.averageAccuracy) {
            insights.push(`<div class="mb-1 text-green-500">✓ Great accuracy! ${accuracy}% is above your average of ${userData.stats.averageAccuracy}%.</div>`);
        } else if (accuracy < userData.stats.averageAccuracy - 5) {
            insights.push(`<div class="mb-1">💡 Focus on accuracy. Slow down slightly to reduce errors.</div>`);
        }
    }
    
    // Best performance comparison
    if (wpm > userData.stats.bestWPM) {
        insights.push(`<div class="mb-1 text-green-500">🏆 New personal best! Previous record: ${userData.stats.bestWPM} WPM</div>`);
    }
    
    // If no insights were generated
    if (insights.length === 0) {
        insights.push(`<div class="mb-1">Keep practicing consistently to improve your typing skills!</div>`);
    }
    
    return insights.join('');
}

/**
 * This will be expanded in future steps to include:
 * - Missions and achievements
 * - Leaderboard functionality
 * - ChatGPT API integration for smart feedback
 */ 

/**
 * Navigation System
 */
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const screens = document.querySelectorAll('.screen-container');
    const mainContent = document.querySelector('.container');
    
    // Remove references to the buttons we removed from HTML
    // const showLeaderboardBtn = document.getElementById('show-leaderboard');
    // const showTrophiesBtn = document.getElementById('show-trophies');
    
    // Navigation button click event
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Get the target screen ID
            const targetId = btn.id.replace('nav-', '');
            
            // Update active button with animation
            navButtons.forEach(b => {
                b.classList.remove('active');
                b.classList.add('text-gray-400');
                // Reset any animations
                b.style.transform = '';
                // Hide indicator
                const indicator = b.querySelector('.nav-indicator');
                if (indicator) {
                    indicator.style.opacity = '0';
                }
            });
            
            // Add active class and animate the clicked button
            btn.classList.add('active');
            btn.classList.remove('text-gray-400');
            animateNavButton(btn);
            
            // Show indicator for active tab
            const indicator = btn.querySelector('.nav-indicator');
            if (indicator) {
                indicator.style.opacity = '1';
                indicator.style.transition = 'opacity 0.3s ease';
            }
            
            // Show the target screen, hide others with fade transition
            if (targetId === 'training') {
                // Fade out other screens
                screens.forEach(screen => {
                    if (!screen.classList.contains('hidden')) {
                        fadeOut(screen, () => {
                            screen.classList.add('hidden');
                            fadeIn(mainContent);
                        });
                    }
                });
                
                // Show main content
                mainContent.classList.remove('hidden');
            } else {
                // Fade out main content if visible
                if (!mainContent.classList.contains('hidden')) {
                    fadeOut(mainContent, () => {
                        mainContent.classList.add('hidden');
                        
                        // Show target screen
                        screens.forEach(screen => {
                            if (screen.id === `${targetId}-screen`) {
                                screen.classList.remove('hidden');
                                fadeIn(screen);
                                console.log(`Showing ${targetId}-screen`);
                                
                                // If showing trophy wall, update it
                                if (targetId === 'trophies') {
                                    if (typeof window.updateTrophyWall === 'function') {
                                        window.updateTrophyWall();
                                        console.log('Updating trophy wall');
                                    }
                                }
                            } else {
                                screen.classList.add('hidden');
                            }
                        });
                    });
                } else {
                    // Fade between screens
                    screens.forEach(screen => {
                        if (!screen.classList.contains('hidden')) {
                            fadeOut(screen, () => {
                                screen.classList.add('hidden');
                                
                                // Show target screen
                                screens.forEach(s => {
                                    if (s.id === `${targetId}-screen`) {
                                        s.classList.remove('hidden');
                                        fadeIn(s);
                                        console.log(`Showing ${targetId}-screen`);
                                        
                                        // If showing trophy wall, update it
                                        if (targetId === 'trophies') {
                                            if (typeof window.updateTrophyWall === 'function') {
                                                window.updateTrophyWall();
                                                console.log('Updating trophy wall');
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    });
                }
            }
        });
    });
    
    // Remove event listeners for the buttons we removed
    // Bottom panel button events
    // showLeaderboardBtn.addEventListener('click', () => {
    //     document.getElementById('nav-leaderboard').click();
    // });
    
    // showTrophiesBtn.addEventListener('click', () => {
    //     document.getElementById('nav-trophies').click();
    // });
    
    // Helper function to animate the nav button
    function animateNavButton(btn) {
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            btn.style.transform = 'scale(1.05)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        }, 150);
    }
    
    // Helper function to fade out an element
    function fadeOut(element, callback) {
        element.style.opacity = '1';
        element.style.transition = 'opacity 0.2s ease';
        
        setTimeout(() => {
            element.style.opacity = '0';
            setTimeout(() => {
                if (callback) callback();
            }, 200);
        }, 10);
    }
    
    // Helper function to fade in an element
    function fadeIn(element) {
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.2s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    }
} 

/**
 * Leaderboard System
 */
function initLeaderboard() {
    const leaderboardTableBody = document.getElementById('leaderboard-table-body');
    const leaderboardFilters = document.querySelectorAll('.leaderboard-filter');
    let currentFilter = 'daily';
    
    // Initialize leaderboard data
    initLeaderboardData();
    
    // Filter button click events
    leaderboardFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Update active filter
            leaderboardFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            // Get filter type
            const filterType = filter.textContent.toLowerCase();
            currentFilter = filterType;
            
            // Update leaderboard
            updateLeaderboard(filterType);
        });
    });
    
    // Initial leaderboard display
    updateLeaderboard(currentFilter);
    
    // Initialize leaderboard data in localStorage if it doesn't exist
    function initLeaderboardData() {
        const leaderboardData = localStorage.getItem('typeVelocity_leaderboard');
        
        if (!leaderboardData) {
            // Create mock leaderboard data
            const mockData = {
                daily: generateMockLeaderboardData(10),
                weekly: generateMockLeaderboardData(10),
                'all-time': generateMockLeaderboardData(10)
            };
            
            // Add current user to each leaderboard
            const userData = loadUserData();
            const userEntry = {
                id: 'current-user',
                name: 'You',
                level: userData.level,
                wpm: userData.stats.bestWPM || Math.floor(Math.random() * 20) + 30,
                accuracy: userData.stats.averageAccuracy || Math.floor(Math.random() * 10) + 85,
                streak: userData.streak
            };
            
            // Insert user at a random position in each leaderboard
            ['daily', 'weekly', 'all-time'].forEach(type => {
                const position = Math.floor(Math.random() * mockData[type].length);
                mockData[type].splice(position, 0, userEntry);
                
                // Re-rank everyone
                mockData[type].forEach((entry, index) => {
                    entry.rank = index + 1;
                });
            });
            
            // Save to localStorage
            localStorage.setItem('typeVelocity_leaderboard', JSON.stringify(mockData));
        }
    }
    
    // Generate mock leaderboard data
    function generateMockLeaderboardData(count) {
        const names = [
            'SpeedTyper', 'KeyMaster', 'TypeNinja', 'WordWizard', 
            'SwiftKeys', 'RapidTypist', 'CodeTyper', 'FlashFingers',
            'TypeLord', 'KeyboardKing', 'TypeQueen', 'VelocityViper',
            'QuickType', 'TypeHero', 'KeyNinja', 'WordRacer'
        ];
        
        const data = [];
        
        for (let i = 0; i < count; i++) {
            data.push({
                id: `user-${i}`,
                name: names[Math.floor(Math.random() * names.length)],
                rank: i + 1,
                level: Math.floor(Math.random() * 20) + 1,
                wpm: Math.floor(Math.random() * 50) + 40,
                accuracy: Math.floor(Math.random() * 15) + 85,
                streak: Math.floor(Math.random() * 10)
            });
        }
        
        // Sort by WPM
        return data.sort((a, b) => b.wpm - a.wpm);
    }
    
    // Update leaderboard display
    function updateLeaderboard(filterType) {
        // Get leaderboard data
        const leaderboardData = JSON.parse(localStorage.getItem('typeVelocity_leaderboard'));
        
        if (!leaderboardData) return;
        
        // Get data for current filter
        const data = leaderboardData[filterType];
        
        // Clear table
        leaderboardTableBody.innerHTML = '';
        
        // Add entries
        data.forEach(entry => {
            const row = document.createElement('tr');
            
            // Add current-user class if this is the user
            if (entry.id === 'current-user') {
                row.classList.add('current-user');
            }
            
            row.innerHTML = `
                <td class="py-3 pl-4 font-medium">${entry.rank}</td>
                <td class="py-3">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 text-xs font-bold">
                            ${entry.name.substring(0, 2)}
                        </div>
                        <span class="font-medium">${entry.name}</span>
                        ${entry.id === 'current-user' ? '<span class="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">You</span>' : ''}
                    </div>
                </td>
                <td class="py-3 text-center">${entry.level}</td>
                <td class="py-3 text-center font-medium">${entry.wpm}</td>
                <td class="py-3 text-center">${entry.accuracy}%</td>
                <td class="py-3 pr-4 text-center">
                    <div class="flex items-center justify-center">
                        <span>${entry.streak}</span>
                        ${entry.streak >= 3 ? '<span class="ml-1">🔥</span>' : ''}
                    </div>
                </td>
            `;
            
            leaderboardTableBody.appendChild(row);
        });
    }
    
    // Update leaderboard when user completes a challenge
    window.updateUserLeaderboardStats = function(wpm, accuracy) {
        const leaderboardData = JSON.parse(localStorage.getItem('typeVelocity_leaderboard'));
        
        if (!leaderboardData) return;
        
        const userData = loadUserData();
        
        // Update user entry in each leaderboard
        ['daily', 'weekly', 'all-time'].forEach(type => {
            const userIndex = leaderboardData[type].findIndex(entry => entry.id === 'current-user');
            
            if (userIndex !== -1) {
                // Update stats
                leaderboardData[type][userIndex].wpm = Math.max(leaderboardData[type][userIndex].wpm, wpm);
                leaderboardData[type][userIndex].accuracy = Math.round((leaderboardData[type][userIndex].accuracy + accuracy) / 2);
                leaderboardData[type][userIndex].level = userData.level;
                leaderboardData[type][userIndex].streak = userData.streak;
                
                // Re-sort leaderboard
                leaderboardData[type].sort((a, b) => b.wpm - a.wpm);
                
                // Re-rank everyone
                leaderboardData[type].forEach((entry, index) => {
                    entry.rank = index + 1;
                });
            }
        });
        
        // Save updated leaderboard
        localStorage.setItem('typeVelocity_leaderboard', JSON.stringify(leaderboardData));
        
        // Update display if leaderboard is visible
        if (!document.getElementById('leaderboard-screen').classList.contains('hidden')) {
            updateLeaderboard(currentFilter);
        }
    };
} 

/**
 * Trophy Wall System
 */
function initTrophyWall() {
    const achievementsGrid = document.getElementById('achievements-grid');
    const achievementsCount = document.getElementById('achievements-count');
    
    // Define all possible achievements
    const allAchievements = [
        {
            id: 'first_session',
            title: 'First Steps',
            description: 'Complete your first typing session',
            icon: '🚀',
            color: 'from-blue-500 to-indigo-600'
        },
        {
            id: 'speed_30',
            title: 'Getting Faster',
            description: 'Reach 30 WPM in a session',
            icon: '⚡',
            color: 'from-green-500 to-emerald-600'
        },
        {
            id: 'speed_50',
            title: 'Speed Demon',
            description: 'Reach 50 WPM in a session',
            icon: '🔥',
            color: 'from-orange-500 to-red-600'
        },
        {
            id: 'speed_80',
            title: 'Typing Master',
            description: 'Reach 80 WPM in a session',
            icon: '👑',
            color: 'from-yellow-500 to-amber-600'
        },
        {
            id: 'accuracy_95',
            title: 'Precision Typist',
            description: 'Achieve 95% accuracy in a session',
            icon: '🎯',
            color: 'from-purple-500 to-violet-600'
        },
        {
            id: 'streak_3',
            title: 'Consistency',
            description: 'Maintain a 3-day streak',
            icon: '📆',
            color: 'from-cyan-500 to-blue-600'
        },
        {
            id: 'streak_7',
            title: 'Weekly Warrior',
            description: 'Maintain a 7-day streak',
            icon: '🏆',
            color: 'from-amber-500 to-orange-600'
        },
        {
            id: 'words_1000',
            title: 'Wordsmith',
            description: 'Type 1,000 words total',
            icon: '📝',
            color: 'from-emerald-500 to-green-600'
        },
        {
            id: 'words_10000',
            title: 'Prolific Writer',
            description: 'Type 10,000 words total',
            icon: '📚',
            color: 'from-rose-500 to-pink-600'
        },
        {
            id: 'level_5',
            title: 'Rising Star',
            description: 'Reach level 5',
            icon: '⭐',
            color: 'from-amber-500 to-yellow-600'
        },
        {
            id: 'level_10',
            title: 'Expert Typist',
            description: 'Reach level 10',
            icon: '🌟',
            color: 'from-yellow-400 to-amber-600'
        },
        {
            id: 'perfect_accuracy',
            title: 'Flawless',
            description: 'Complete a session with 100% accuracy',
            icon: '💯',
            color: 'from-indigo-500 to-purple-600'
        }
    ];
    
    // Add some starter achievements if the user doesn't have any
    initializeStarterAchievements();
    
    // Initialize trophy wall
    updateTrophyWall();
    
    // Initialize some starter achievements for new users
    function initializeStarterAchievements() {
        const userData = loadUserData();
        
        // If user has no achievements, add the first_session achievement
        if (!userData.achievements || userData.achievements.length === 0) {
            userData.achievements = [{
                id: 'first_session',
                title: 'First Steps',
                description: 'Complete your first typing session',
                dateEarned: new Date().toISOString()
            }];
            
            // Save the updated user data
            saveUserData(userData);
        }
    }
    
    // Update trophy wall display
    function updateTrophyWall() {
        // Get user data
        const userData = loadUserData();
        const userAchievements = userData.achievements || [];
        
        // Check if elements exist
        if (!achievementsGrid || !achievementsCount) {
            console.error('Achievement elements not found in the DOM');
            return;
        }
        
        // Update achievements count
        achievementsCount.textContent = `${userAchievements.length}/${allAchievements.length}`;
        
        // Clear grid
        achievementsGrid.innerHTML = '';
        
        console.log('Updating trophy wall with', userAchievements.length, 'achievements');
        
        // Add achievement cards
        allAchievements.forEach(achievement => {
            // Check if user has this achievement
            const userAchievement = userAchievements.find(a => a.id === achievement.id);
            const isUnlocked = !!userAchievement;
            
            // Create achievement card
            const card = document.createElement('div');
            card.className = `achievement-card glassmorphism rounded-xl p-4 flex flex-col items-center text-center ${isUnlocked ? '' : 'locked'} transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg`;
            
            // Add achievement details
            card.innerHTML = `
                <div class="achievement-icon mb-2 bg-gradient-to-br ${achievement.color} text-white w-12 h-12 rounded-full flex items-center justify-center text-xl">
                    ${achievement.icon}
                </div>
                <h3 class="text-sm font-semibold mb-1">${achievement.title}</h3>
                <p class="text-xs text-gray-400 mb-2">${achievement.description}</p>
                ${isUnlocked ? 
                    `<div class="text-xs text-green-500 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> Unlocked ${formatDate(userAchievement.dateEarned)}</div>` : 
                    '<div class="text-xs text-gray-500 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Locked</div>'
                }
            `;
            
            // Add to grid
            achievementsGrid.appendChild(card);
        });
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    
    // Make updateTrophyWall globally accessible
    window.updateTrophyWall = updateTrophyWall;
    
    // Add a hook to the checkAchievements function
    const originalCheckAchievements = window.checkAchievements || function() { return []; };
    
    window.checkAchievements = function(userData, sessionData) {
        const newAchievements = originalCheckAchievements(userData, sessionData);
        
        if (newAchievements && newAchievements.length > 0) {
            // Update trophy wall if it's visible
            if (!document.getElementById('trophy-wall-screen').classList.contains('hidden')) {
                updateTrophyWall();
            }
        }
        
        return newAchievements;
    };
} 

/**
 * Accessibility Improvements
 */
function initAccessibility() {
    // Add keyboard navigation for main buttons
    const focusableElements = [
        '#theme-toggle',
        '#profile-button',
        '#start-mission',
        '#practice-mode',
        '#nav-training',
        '#nav-leaderboard',
        '.leaderboard-filter',
        '#retry-challenge',
        '#close-modal',
        '#close-profile-modal',
        '#save-avatar',
        '.avatar-option'
    ];
    
    // Add keyboard navigation between main interactive elements
    document.addEventListener('keydown', (e) => {
        // ESC key to close modals
        if (e.key === 'Escape') {
            hideResultsModal();
            hideProfileModal();
            
            // Cancel challenge if active
            const cancelButton = document.getElementById('cancel-mission');
            if (cancelButton.classList.contains('visible')) {
                cancelChallenge();
            }
        }
        
        // Tab trap for modals
        if (e.key === 'Tab') {
            const resultsModal = document.getElementById('results-modal');
            const profileModal = document.getElementById('profile-modal');
            
            // If results modal is open, trap focus inside it
            if (!resultsModal.classList.contains('pointer-events-none')) {
                trapFocusInModal(resultsModal, e);
            }
            
            // If profile modal is open, trap focus inside it
            if (!profileModal.classList.contains('pointer-events-none')) {
                trapFocusInModal(profileModal, e);
            }
        }
    });
    
    // Add ARIA roles and attributes to improve accessibility
    addAriaAttributes();
    
    // Make avatar selection keyboard accessible
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.setAttribute('tabindex', '0');
        option.setAttribute('role', 'radio');
        option.setAttribute('aria-checked', option.classList.contains('selected') ? 'true' : 'false');
        
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Deselect all options
                avatarOptions.forEach(opt => {
                    opt.classList.remove('selected');
                    opt.setAttribute('aria-checked', 'false');
                    opt.querySelector('div').classList.remove('border-primary');
                    opt.querySelector('div').classList.add('border-transparent');
                });
                
                // Select this option
                option.classList.add('selected');
                option.setAttribute('aria-checked', 'true');
                option.querySelector('div').classList.remove('border-transparent');
                option.querySelector('div').classList.add('border-primary');
            }
        });
    });
}

/**
 * Add ARIA roles and attributes to improve accessibility
 */
function addAriaAttributes() {
    // Navigation
    const navTraining = document.getElementById('nav-training');
    const navLeaderboard = document.getElementById('nav-leaderboard');
    
    navTraining.setAttribute('role', 'tab');
    navTraining.setAttribute('aria-selected', 'true');
    navLeaderboard.setAttribute('role', 'tab');
    navLeaderboard.setAttribute('aria-selected', 'false');
    
    // Challenge container
    const challengeContainer = document.getElementById('challenge-container');
    challengeContainer.setAttribute('role', 'textbox');
    challengeContainer.setAttribute('aria-label', 'Typing challenge area');
    
    // Buttons
    document.getElementById('theme-toggle').setAttribute('aria-label', 'Toggle light/dark theme');
    document.getElementById('profile-button').setAttribute('aria-label', 'Open profile settings');
    document.getElementById('start-mission').setAttribute('aria-label', 'Start typing mission');
    document.getElementById('practice-mode').setAttribute('aria-label', 'Start practice mode');
    document.getElementById('cancel-mission').setAttribute('aria-label', 'Cancel current challenge');
    
    // Results modal
    const resultsModal = document.getElementById('results-modal');
    resultsModal.setAttribute('role', 'dialog');
    resultsModal.setAttribute('aria-modal', 'true');
    resultsModal.setAttribute('aria-labelledby', 'modal-title');
    
    // Profile modal
    const profileModal = document.getElementById('profile-modal');
    profileModal.setAttribute('role', 'dialog');
    profileModal.setAttribute('aria-modal', 'true');
    profileModal.setAttribute('aria-labelledby', 'profile-modal-title');
    
    // Leaderboard table
    const leaderboardTable = document.querySelector('#leaderboard-screen table');
    if (leaderboardTable) {
        leaderboardTable.setAttribute('role', 'table');
        leaderboardTable.setAttribute('aria-label', 'Typing performance leaderboard');
    }
    
    // Add live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-announcements';
    document.body.appendChild(liveRegion);
}

/**
 * Trap focus inside modal dialogs for keyboard accessibility
 */
function trapFocusInModal(modal, event) {
    const focusableElements = modal.querySelectorAll('button, [tabindex="0"]');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}

/**
 * Announce messages to screen readers
 */
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-announcements');
    if (liveRegion) {
        liveRegion.textContent = message;
    }
} 

/**
 * Sound Effects System
 */
function initSoundEffects() {
    // Create audio context
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Create sound effects
    const soundEffects = {
        keypress: createKeyPressSound(audioContext),
        error: createErrorSound(audioContext),
        complete: createCompleteSound(audioContext),
        levelUp: createLevelUpSound(audioContext),
        achievement: createAchievementSound(audioContext),
        click: createClickSound(audioContext)
    };
    
    // Store in global scope for access from other functions
    window.soundEffects = soundEffects;
    
    // Add click sound to buttons
    addButtonSounds();
}

/**
 * Create a short key press sound
 */
function createKeyPressSound(audioContext) {
    return () => {
        // Check if sound effects are enabled in user preferences
        const userData = loadUserData();
        if (!userData.preferences.soundEffects) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440 + Math.random() * 80, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    };
}

/**
 * Create an error sound
 */
function createErrorSound(audioContext) {
    return () => {
        // Check if sound effects are enabled in user preferences
        const userData = loadUserData();
        if (!userData.preferences.soundEffects) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    };
}

/**
 * Create a completion sound
 */
function createCompleteSound(audioContext) {
    return () => {
        // Check if sound effects are enabled in user preferences
        const userData = loadUserData();
        if (!userData.preferences.soundEffects) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            gainNode.gain.setValueAtTime(0.0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + i * 0.1 + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + i * 0.1);
            oscillator.stop(audioContext.currentTime + i * 0.1 + 0.3);
        });
    };
}

/**
 * Create a level up sound
 */
function createLevelUpSound(audioContext) {
    return () => {
        // Check if sound effects are enabled in user preferences
        const userData = loadUserData();
        if (!userData.preferences.soundEffects) return;
        
        // Play an ascending arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
        
        notes.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            gainNode.gain.setValueAtTime(0.0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + i * 0.08 + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.08 + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + i * 0.08);
            oscillator.stop(audioContext.currentTime + i * 0.08 + 0.3);
        });
    };
}

/**
 * Create an achievement sound
 */
function createAchievementSound(audioContext) {
    return () => {
        // Check if sound effects are enabled in user preferences
        const userData = loadUserData();
        if (!userData.preferences.soundEffects) return;
        
        // Play a celebratory sound
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        notes.forEach((freq, i) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.value = freq;
            
            gainNode.gain.setValueAtTime(0.0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + i * 0.12 + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.12 + 0.4);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + i * 0.12);
            oscillator.stop(audioContext.currentTime + i * 0.12 + 0.4);
        });
    };
}

/**
 * Create a button click sound
 */
function createClickSound(audioContext) {
    return () => {
        // Check if sound effects are enabled in user preferences
        const userData = loadUserData();
        if (!userData.preferences.soundEffects) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    };
}

/**
 * Add sound effects to buttons
 */
function addButtonSounds() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (window.soundEffects && window.soundEffects.click) {
                window.soundEffects.click();
            }
        });
    });
} 

/**
 * Check if user prefers reduced motion
 */
function checkReducedMotion() {
    // Check for prefers-reduced-motion media query
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Add a class to the body to disable animations
        document.body.classList.add('reduced-motion');
        
        // Store the preference in user data
        const userData = loadUserData();
        userData.preferences.reducedMotion = true;
        saveUserData(userData);
    }
}