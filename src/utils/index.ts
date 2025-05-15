import { type Match, type Set } from "wasp/entities";

type MatchWithSets = Match & {
  sets?: Set[];
};

// Parse the tennis score into a readable format
function formatTennisScore(match: MatchWithSets): string {
  if (!match.score || typeof match.score !== "object") {
    throw new Error("Invalid score format");
  }

  try {
    const score = match.score as {
      player1: { points: string; games: number };
      player2: { points: string; games: number };
    };
    
    const currentGame = `${score.player1.points}-${score.player2.points}`;
    
    const gamesScore = `${score.player1.games}-${score.player2.games}`;
    
    let setsInfo = "";
    if (match.sets && Array.isArray(match.sets) && match.sets.length > 0) {
      setsInfo = match.sets.map(set => 
        `${set.player1Games}-${set.player2Games}`
      ).join(", ");
    }
    
    const status = match.isComplete ? "Completed" : "In progress";
    
    let scoreString = `${status}: `;
    
    if (setsInfo) {
      scoreString += `Sets: [${setsInfo}]`;
    }
    
    if (!match.isComplete) {
      scoreString += ` Current game: ${currentGame}, Games: ${gamesScore}`;
    }
    
    return scoreString;
  } catch (error) {
    console.error("Error parsing score:", error);
    return "Score format error";
  }
}

export const generateMatchSummary = (matches: MatchWithSets[]) => {
  // Format matches for email
  const formattedMatches = matches.map(match => ({
    player1: match.player1Name,
    player2: match.player2Name,
    score: formatTennisScore(match),
    date: match.createdAt.toLocaleDateString(),
  }));

  // Create HTML content for the email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c5282; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
        .match { margin-bottom: 20px; padding: 15px; border-radius: 5px; background-color: #f8fafc; }
        .match-header { font-weight: bold; font-size: 18px; margin-bottom: 5px; }
        .match-score { color: #4a5568; }
        .match-date { color: #718096; font-size: 14px; }
        .footer { margin-top: 30px; font-size: 14px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Tennis Matches Daily Summary</h1>
        <p>Here's a summary of yesterday's tennis matches:</p>
        
        ${matches.length > 0 ? 
          formattedMatches.map(match => `
            <div class="match">
              <div class="match-header">${match.player1} vs. ${match.player2}</div>
              <div class="match-score">${match.score}</div>
              <div class="match-date">${match.date}</div>
            </div>
          `).join('') : 
          '<p>No matches were completed yesterday.</p>'
        }
        
        <div class="footer">
          <p>This is an automated summary from your Tennis Score App.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Create plain text version
  const textContent = `
    Tennis Matches Daily Summary
    
    Here's a summary of yesterday's tennis matches:
    
    ${matches.length > 0 ? 
      formattedMatches.map(match => 
        `${match.player1} vs. ${match.player2}
        ${match.score}
        ${match.date}
        `
      ).join('\n\n') : 
      'No matches were completed yesterday.'
    }
    
    This is an automated summary from your Tennis Score App.
  `;

  return { textContent, htmlContent };
}
