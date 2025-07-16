/**
 * TypeVelocity Configuration
 * 
 * This file contains configuration settings for the TypeVelocity application.
 * IMPORTANT: Never commit this file with actual API keys to version control.
 * Instead, use environment variables or a secure configuration management system.
 */

const TypeVelocityConfig = {
    // OpenAI API Configuration
    openai: {
        apiKey: "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", // Replace with your actual API key
        model: "gpt-3.5-turbo",        // Model to use for challenges
        temperature: 0.7,              // Creativity level (0.0 to 1.0)
        maxTokens: 100                 // Maximum length of generated text
    },
    
    // Application Settings
    app: {
        useDynamicChallenges: true,    // Set to false to use only static challenges
        maxHistoryEntries: 100,        // Maximum number of history entries to store
        defaultDailyGoal: 500          // Default daily word goal
    }
};

// Prevent modification of the configuration
Object.freeze(TypeVelocityConfig); 