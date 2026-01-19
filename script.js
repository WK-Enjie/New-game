// Add this to your script.js file in the submitAnswer function (around line 700):

function submitAnswer() {
    // ... existing code ...
    
    // Calculate points from selected boxes
    let pointsEarned = 0;
    let boxResultsHTML = '';
    
    currentGame.selectedBoxes.forEach((boxIndex, i) => {
        const boxValue = currentGame.boxValues[boxIndex];
        let earnedValue = 0;
        
        if (isCorrect) {
            // If answer is correct
            if (boxValue > 0) {
                // Positive points go to current player
                earnedValue = boxValue;
                currentGame.gameStats.positiveBoxes++;
            } else if (boxValue < 0) {
                // Negative points go to opponent
                const opponent = currentGame.players.find(p => !p.isActive);
                opponent.score += Math.abs(boxValue); // Give positive to opponent
                earnedValue = boxValue; // Current player gets negative
                currentGame.gameStats.negativeBoxes++;
            }
        } else {
            // If answer is wrong
            if (boxValue > 0) {
                // Lose positive points
                earnedValue = -boxValue;
                currentGame.gameStats.positiveBoxes++;
            } else if (boxValue < 0) {
                // Get negative points (double penalty)
                earnedValue = boxValue * 2;
                currentGame.gameStats.negativeBoxes++;
            }
        }
        
        // Update current player's score
        activePlayer.score += earnedValue;
        pointsEarned += earnedValue;
        currentGame.gameStats.totalPointsEarned += earnedValue;
        
        // ... rest of the existing code ...
    });
    
    // ... rest of the function ...
}