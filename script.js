// Five Crowns Score Keeper JavaScript

class FiveCrownsGame {
    constructor() {
        this.gameState = {
            players: [],
            currentRound: 1,
            currentDealer: 0,
            scores: Array(11).fill(null).map(() => []),
            isGameComplete: false,
            appState: 'setup' // 'setup', 'playing', 'results'
        };
        
        this.initializeDOM();
        this.setupEventListeners();
        this.showSetupScreen();
    }

    initializeDOM() {
        // Cache DOM elements
        this.elements = {
            // Screens
            setupScreen: document.getElementById('setupScreen'),
            gameScreen: document.getElementById('gameScreen'),
            resultsScreen: document.getElementById('resultsScreen'),
            
            // Setup elements
            newPlayerInput: document.getElementById('newPlayerInput'),
            addPlayerBtn: document.getElementById('addPlayerBtn'),
            startGameBtn: document.getElementById('startGameBtn'),
            playersSection: document.getElementById('playersSection'),
            playersList: document.getElementById('playersList'),
            playerCount: document.getElementById('playerCount'),
            
            // Game elements
            newGameBtn: document.getElementById('newGameBtn'),
            currentRound: document.getElementById('currentRound'),
            cardsDealt: document.getElementById('cardsDealt'),
            wildCard: document.getElementById('wildCard'),
            currentDealer: document.getElementById('currentDealer'),
            roundScoringCard: document.getElementById('roundScoringCard'),
            scoringRound: document.getElementById('scoringRound'),
            scoringInputs: document.getElementById('scoringInputs'),
            completeRoundBtn: document.getElementById('completeRoundBtn'),
            scoreTable: document.getElementById('scoreTable'),
            hiddenScoresMsg: document.getElementById('hiddenScoresMsg'),
            
            // Results elements
            startNewGameBtn: document.getElementById('startNewGameBtn'),
            winnerText: document.getElementById('winnerText'),
            rankingsList: document.getElementById('rankingsList'),
            finalScoreTable: document.getElementById('finalScoreTable')
        };
    }

    setupEventListeners() {
        // Setup screen listeners
        this.elements.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.elements.newPlayerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        this.elements.startGameBtn.addEventListener('click', () => this.startGame());
        
        // Game screen listeners
        this.elements.newGameBtn.addEventListener('click', () => this.showSetupScreen());
        this.elements.completeRoundBtn.addEventListener('click', () => this.completeRound());
        
        // Results screen listeners
        this.elements.startNewGameBtn.addEventListener('click', () => this.showSetupScreen());
    }

    showSetupScreen() {
        this.resetGameState();
        this.showScreen('setup');
        this.elements.newPlayerInput.value = '';
        this.updatePlayerCount();
        this.updateStartButton();
        this.renderPlayersList();
    }

    resetGameState() {
        this.gameState = {
            players: [],
            currentRound: 1,
            currentDealer: 0,
            scores: Array(11).fill(null).map(() => []),
            isGameComplete: false,
            appState: 'setup'
        };
    }

    showScreen(screenName) {
        // Hide all screens
        this.elements.setupScreen.classList.add('hidden');
        this.elements.gameScreen.classList.add('hidden');
        this.elements.resultsScreen.classList.add('hidden');
        
        // Show requested screen
        switch (screenName) {
            case 'setup':
                this.elements.setupScreen.classList.remove('hidden');
                break;
            case 'playing':
                this.elements.gameScreen.classList.remove('hidden');
                break;
            case 'results':
                this.elements.resultsScreen.classList.remove('hidden');
                break;
        }
    }

    addPlayer() {
        const name = this.elements.newPlayerInput.value.trim();
        if (name && this.gameState.players.length < 8 && !this.gameState.players.includes(name)) {
            this.gameState.players.push(name);
            this.elements.newPlayerInput.value = '';
            this.renderPlayersList();
            this.updatePlayerCount();
            this.updateStartButton();
            
            if (this.gameState.players.length > 0) {
                this.elements.playersSection.classList.remove('hidden');
            }
        }
    }

    removePlayer(index) {
        this.gameState.players.splice(index, 1);
        this.renderPlayersList();
        this.updatePlayerCount();
        this.updateStartButton();
        
        if (this.gameState.players.length === 0) {
            this.elements.playersSection.classList.add('hidden');
        }
    }

    updatePlayerName(index, newName) {
        if (newName.trim()) {
            this.gameState.players[index] = newName.trim();
        }
    }

    renderPlayersList() {
        this.elements.playersList.innerHTML = '';
        
        this.gameState.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-item';
            playerDiv.innerHTML = `
                <input type="text" value="${this.escapeHtml(player)}" class="text-input" 
                       onchange="game.updatePlayerName(${index}, this.value)">
                <button class="btn btn-remove" onclick="game.removePlayer(${index})" 
                        title="Remove ${this.escapeHtml(player)}">
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            `;
            this.elements.playersList.appendChild(playerDiv);
        });
    }

    updatePlayerCount() {
        this.elements.playerCount.textContent = this.gameState.players.length;
    }

    updateStartButton() {
        this.elements.startGameBtn.disabled = this.gameState.players.length < 2;
    }

    startGame() {
        if (this.gameState.players.length < 2) return;
        
        this.gameState.appState = 'playing';
        this.gameState.scores = Array(11).fill(null).map(() => Array(this.gameState.players.length).fill(null));
        
        this.showScreen('playing');
        this.renderGameBoard();
    }

    renderGameBoard() {
        this.updateGameHeader();
        this.updateScoreTable();
        this.renderRoundScoring();
    }

    updateGameHeader() {
        this.elements.currentRound.textContent = this.gameState.currentRound;
        this.elements.cardsDealt.textContent = this.getCardsDealt(this.gameState.currentRound);
        this.elements.wildCard.textContent = this.getWildCard(this.gameState.currentRound);
        this.elements.currentDealer.textContent = this.gameState.players[this.gameState.currentDealer];
    }

    getCardsDealt(round) {
        return round + 2;
    }

    getWildCard(round) {
        const wildCards = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return wildCards[round - 1];
    }

    renderRoundScoring() {
        if (this.gameState.isGameComplete) {
            this.elements.roundScoringCard.classList.add('hidden');
            return;
        }
        
        this.elements.roundScoringCard.classList.remove('hidden');
        this.elements.scoringRound.textContent = this.gameState.currentRound;
        
        this.elements.scoringInputs.innerHTML = '';
        
        this.gameState.players.forEach((player, index) => {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'scoring-item';
            
            const existingScore = this.gameState.scores[this.gameState.currentRound - 1][index];
            const scoreValue = existingScore !== null ? existingScore : '';
            
            inputDiv.innerHTML = `
                <label class="input-label">${this.escapeHtml(player)}</label>
                <input type="number" min="0" max="999" value="${scoreValue}" 
                       class="text-input" placeholder="0" 
                       onchange="game.updateScore(${index}, this.value)"
                       oninput="game.checkCompleteButton()">
            `;
            this.elements.scoringInputs.appendChild(inputDiv);
        });
        
        this.checkCompleteButton();
    }

    updateScore(playerIndex, value) {
        const numValue = parseInt(value, 10);
        this.gameState.scores[this.gameState.currentRound - 1][playerIndex] = isNaN(numValue) ? null : numValue;
        this.checkCompleteButton();
    }

    checkCompleteButton() {
        const roundScores = this.gameState.scores[this.gameState.currentRound - 1];
        const allScoresEntered = roundScores.every(score => score !== null && score !== undefined);
        this.elements.completeRoundBtn.disabled = !allScoresEntered;
    }

    completeRound() {
        const roundScores = this.gameState.scores[this.gameState.currentRound - 1];
        if (!roundScores.every(score => score !== null && score !== undefined)) return;
        
        const isLastRound = this.gameState.currentRound === 11;
        
        if (isLastRound) {
            this.gameState.isGameComplete = true;
            this.showResults();
        } else {
            this.gameState.currentRound++;
            this.gameState.currentDealer = (this.gameState.currentDealer + 1) % this.gameState.players.length;
            this.renderGameBoard();
        }
    }

    updateScoreTable() {
        const table = this.elements.scoreTable;
        const thead = table.querySelector('thead tr');
        const tbody = table.querySelector('tbody');
        
        // Update header
        thead.innerHTML = '<th class="round-header">Round</th>';
        this.gameState.players.forEach(player => {
            const th = document.createElement('th');
            th.className = 'player-header';
            th.innerHTML = `<div class="truncate" title="${this.escapeHtml(player)}">${this.truncateText(player, 8)}</div>`;
            thead.appendChild(th);
        });
        
        // Update body
        tbody.innerHTML = '';
        
        for (let round = 1; round <= 11; round++) {
            const tr = document.createElement('tr');
            const isCurrent = round === this.gameState.currentRound && !this.gameState.isGameComplete;
            if (isCurrent) tr.className = 'current-round';
            
            const roundCell = document.createElement('td');
            roundCell.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    ${round}
                    ${isCurrent ? '<span class="badge badge-primary" style="font-size: 0.6rem;">Current</span>' : ''}
                </div>
            `;
            tr.appendChild(roundCell);
            
            this.gameState.players.forEach((_, playerIndex) => {
                const td = document.createElement('td');
                const score = this.gameState.scores[round - 1][playerIndex];
                td.textContent = score !== null && score !== undefined ? score : '-';
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        }
        
        // Add totals row
        const totalsRow = document.createElement('tr');
        totalsRow.className = 'totals-row';
        
        const totalCell = document.createElement('td');
        totalCell.textContent = 'Total';
        totalsRow.appendChild(totalCell);
        
        this.gameState.players.forEach((_, playerIndex) => {
            const td = document.createElement('td');
            if (this.gameState.isGameComplete) {
                const total = this.calculateTotalScore(playerIndex);
                td.textContent = total;
            } else {
                td.textContent = '???';
            }
            totalsRow.appendChild(td);
        });
        
        tbody.appendChild(totalsRow);
        
        // Show/hide hidden scores message
        this.elements.hiddenScoresMsg.classList.toggle('hidden', this.gameState.isGameComplete);
    }

    calculateTotalScore(playerIndex) {
        return this.gameState.scores.reduce((total, roundScores) => {
            return total + (roundScores[playerIndex] || 0);
        }, 0);
    }

    showResults() {
        this.showScreen('results');
        this.renderResults();
    }

    renderResults() {
        const playerTotals = this.gameState.players.map((player, index) => ({
            name: player,
            total: this.calculateTotalScore(index),
            index
        }));
        
        // Sort by total score (lowest wins)
        const sortedPlayers = [...playerTotals].sort((a, b) => a.total - b.total);
        
        // Update winner text
        this.elements.winnerText.innerHTML = 
            `🎉 <strong style="color: var(--primary);">${this.escapeHtml(sortedPlayers[0].name)}</strong> wins with ${sortedPlayers[0].total} points! 🎉`;
        
        // Render rankings
        this.renderRankings(sortedPlayers);
        
        // Render final score table
        this.renderFinalScoreTable();
    }

    renderRankings(sortedPlayers) {
        this.elements.rankingsList.innerHTML = '';
        
        sortedPlayers.forEach((player, position) => {
            const rankingDiv = document.createElement('div');
            const positionClass = this.getPositionClass(position);
            rankingDiv.className = `ranking-item ${positionClass}`;
            
            rankingDiv.innerHTML = `
                <div class="ranking-left">
                    ${this.getPositionIcon(position)}
                    <div class="ranking-info">
                        <div class="player-name">${this.escapeHtml(player.name)}</div>
                        <div class="position-text">${this.getPositionText(position)}</div>
                    </div>
                </div>
                <div class="ranking-right">
                    <div class="score">${player.total}</div>
                    <div class="points-label">points</div>
                </div>
            `;
            
            this.elements.rankingsList.appendChild(rankingDiv);
        });
    }

    getPositionClass(position) {
        const classes = ['first-place', 'second-place', 'third-place'];
        return classes[position] || 'other-place';
    }

    getPositionIcon(position) {
        const icons = [
            '<svg class="position-icon gold" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 14l5.5-5.5L10 10l4-4 6 6-1.5 1.5L15 10l-2.5 2.5L8 8 5 16z"/></svg>',
            '<svg class="position-icon silver" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4V2c0-1.1.9-2 2-2s2 .9 2 2v2h6v2h-1.5L17 22H7L8.5 6H7V4z"/></svg>',
            '<svg class="position-icon bronze" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
        ];
        return icons[position] || '<svg class="position-icon other" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }

    getPositionText(position) {
        const positions = ['1st Place - Winner!', '2nd Place', '3rd Place'];
        return positions[position] || `${position + 1}th Place`;
    }

    renderFinalScoreTable() {
        const table = this.elements.finalScoreTable;
        table.innerHTML = '';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const roundHeader = document.createElement('th');
        roundHeader.className = 'round-header';
        roundHeader.textContent = 'Round';
        headerRow.appendChild(roundHeader);
        
        this.gameState.players.forEach(player => {
            const th = document.createElement('th');
            th.className = 'player-header';
            th.innerHTML = `<div class="truncate" title="${this.escapeHtml(player)}">${this.truncateText(player, 8)}</div>`;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        
        this.gameState.scores.forEach((roundScores, roundIndex) => {
            const tr = document.createElement('tr');
            
            const roundCell = document.createElement('td');
            roundCell.textContent = roundIndex + 1;
            tr.appendChild(roundCell);
            
            this.gameState.players.forEach((_, playerIndex) => {
                const td = document.createElement('td');
                td.textContent = roundScores[playerIndex] || 0;
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        // Add totals row
        const totalsRow = document.createElement('tr');
        totalsRow.className = 'totals-row';
        
        const totalHeader = document.createElement('td');
        totalHeader.textContent = 'Total';
        totalsRow.appendChild(totalHeader);
        
        this.gameState.players.forEach((_, playerIndex) => {
            const td = document.createElement('td');
            td.textContent = this.calculateTotalScore(playerIndex);
            totalsRow.appendChild(td);
        });
        
        tbody.appendChild(totalsRow);
        table.appendChild(tbody);
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }
}

// Initialize the game when the DOM is loaded
let game;
document.addEventListener('DOMContentLoaded', function() {
    game = new FiveCrownsGame();
});

// Make game methods available globally for inline event handlers
window.game = null;
document.addEventListener('DOMContentLoaded', function() {
    window.game = new FiveCrownsGame();
});
