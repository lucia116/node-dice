class Game {
    constructor() {
        this.gameOver = false;
        this.leftTotal = 0;
        this.rightTotal = 0;
        this.yahtzBonus = 0;
        this.leftBonus = 0;
        UI.buildPlayerElements(this);
        var person = prompt("Please enter your name", "Nick");
        App.players[0] = (new Player(App.id, person, 'red', 0, App.playerElements[0]));
        Game.thisPlayer = App.players[0];
        Game.currentPlayer = Game.thisPlayer;
        socket.emit('loggedIn', {
            'name': person
        });
        socket.on('updateRoll', (data) => {
            this.rollTheDice(data);
        });
        socket.on('updateDie', (data) => {
            app.dice.die[data.dieNumber].clicked();
        });
        socket.on('updateScore', (data) => {
            console.log('on-updateScore');
            if (UI.scoreElements[parseInt(data.scoreNumber, 10)].clicked()) {
            }
        });
        socket.on('resetTurn', (data) => {
            console.log('Last player: ' + Game.currentPlayer.name + ' New player: ' + App.players[data.currentPlayerIndex].name);
            Game.currentPlayer = App.players[data.currentPlayerIndex];
            this.resetTurn();
        });
        let ui = new UI();
        const self = this;
        app.game = this;
        app.sounds = new Sounds();
        app.dice = new Dice();
        app.possible = new Possible();
        UI.buildScoreElements(this);
        document.addEventListener('click', function (event) {
            self.clickEventAggregator(event);
        });
        this.resetGame();
    }
    clickEventAggregator(event) {
        var mouseEvent = event;
        var target = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);
        if (Game.currentPlayer.id === App.id) {
            var className = target.getAttribute('class');
            var element_id = target.getAttribute('data-id');
            var index = parseInt(element_id, 10);
            if (element_id === 'rollButton') {
                this.rollTheDice({ id: App.id });
            }
            else if (element_id === 'exit_menu') {
                window.close();
                setTimeout(() => { alert("Please close the 'Browser-Tab' to exit this program!"); }, 250);
            }
            else if (element_id === 'status_menu') {
                alert('status');
            }
            else if (className === 'die') {
                app.dice.die[index].clicked();
                socket.emit('dieClicked', {
                    'id': Game.id,
                    'dieNumber': index
                });
            }
            else if (className === 'shaddowed score-container'
                || className === 'score-label'
                || className === 'score-value') {
                if (element_id && element_id.length > 0 && Dice.evaluator.sumOfAllDie > 0) {
                    let elemIndex = parseInt(element_id, 10);
                    console.log('emit-scoreClicked');
                    socket.emit('scoreClicked', {
                        'id': Game.id,
                        'scoreNumber': elemIndex
                    });
                    if (UI.scoreElements[elemIndex].clicked()) {
                        console.log('emit-turnOver');
                        socket.emit('turnOver', {
                            'id': Game.id
                        });
                    }
                }
            }
        }
    }
    showPlayerScores(player) {
        let message;
        if (player === Game.thisPlayer) {
            message = 'Your Scoring Statistics:' + '\n ' + '\n';
        }
        else {
            message = 'Computers Scoring Statistics:' + '\n' + '\n';
        }
        document.getElementById('scoresContent').textContent = message;
        app.scoresDialog.showModal();
    }
    rollTheDice(data) {
        app.sounds.play(app.sounds.roll);
        if (this.gameOver) {
            this.resetGame();
        }
        if (data.id === App.id) {
            app.dice.roll();
            socket.emit('playerRolled', {
                'id': App.id,
                'player': Game.currentPlayer.name,
                'dice': app.dice.die
            });
        }
        else {
            app.dice.roll(data.dice);
        }
        this.evaluatePossibleScores();
        switch (Dice.rollCount) {
            case 1:
                this.rollButton.textContent = 'Roll Again';
                break;
            case 2:
                this.rollButton.textContent = 'Last Roll';
                break;
            case 3:
                this.rollButton.disabled = true;
                this.rollButton.textContent = 'Select Score';
                break;
            default:
                this.rollButton.textContent = 'Roll Dice';
                Dice.rollCount = 0;
        }
    }
    clearPossibleScores() {
        UI.scoreElements.forEach(function (thisElement) {
            thisElement.clearPossible();
        });
    }
    evaluatePossibleScores() {
        UI.scoreElements.forEach(function (thisElement) {
            thisElement.setPossible();
        });
    }
    resetTurn() {
        this.rollButton.style.backgroundColor = Game.currentPlayer.color;
        this.gameOver = this.isGameComplete();
        this.rollButton.disabled = false;
        app.dice.resetTurn();
        if (this.gameOver) {
            this.clearPossibleScores();
            this.setLeftScores();
            this.setRightScores();
            if (App.players.length > 1) {
                this.showFinalScore((App.players[App.myIndex].score > App.players[1].score) ? App.players[App.myIndex] : App.players[1]);
            }
            else {
                this.showFinalScore(App.players[App.myIndex]);
            }
        }
        else {
            this.rollButton.textContent = 'Roll Dice';
            this.clearPossibleScores();
            this.setLeftScores();
            this.setRightScores();
        }
    }
    showFinalScore(winner) {
        var winMsg;
        if (winner !== Game.thisPlayer) {
            app.sounds.play(app.sounds.nooo);
            winMsg = ' wins with ';
        }
        else {
            app.sounds.play(app.sounds.woohoo);
            winMsg = ' win with ';
        }
        this.rollButton.innerHTML = 'Roll Dice';
        app.logLine(winner.name + winMsg + winner.score, app.scoreMsg);
        this.rollButton.style.backgroundColor = winner.color;
        Game.currentPlayer = App.players[App.myIndex];
    }
    setLeftScores() {
        this.leftTotal = 0;
        App.players.forEach((player) => {
            player.score = 0;
        });
        var val;
        for (var i = 0; i < 6; i++) {
            val = UI.scoreElements[i].finalValue;
            if (val > 0) {
                this.leftTotal += val;
                UI.scoreElements[i].owner.addScore(val);
                if (UI.scoreElements[i].hasFiveOfaKind && (app.dice.fiveOfaKindCount > 1)) {
                    UI.scoreElements[i].owner.addScore(100);
                }
            }
        }
        var bonusValue = 35;
        this.leftBonus = (this.leftTotal > 62) ? bonusValue : 0;
        if (this.leftBonus > 0) {
            this.leftScoreElement.textContent = '^ total = ' + this.leftTotal.toString() + '+' + bonusValue;
            if (App.players[App.myIndex].score > App.players[1].score) {
                App.players[App.myIndex].addScore(bonusValue);
            }
            else {
                if (App.players.length > 1) {
                    App.players[1].addScore(bonusValue);
                }
            }
        }
        else {
            this.leftScoreElement.textContent = '^ total = ' + this.leftTotal.toString();
        }
        if (this.leftTotal === 0) {
            this.leftScoreElement.textContent = '^ total = 0';
        }
    }
    setRightScores() {
        let val;
        let len = UI.scoreElements.length;
        for (var i = 6; i < len; i++) {
            val = UI.scoreElements[i].finalValue;
            if (val > 0) {
                UI.scoreElements[i].owner.addScore(val);
                if (UI.scoreElements[i].hasFiveOfaKind && (app.dice.fiveOfaKindCount > 1) && (i !== UI.FiveOfaKind)) {
                    UI.scoreElements[i].owner.addScore(100);
                }
            }
        }
    }
    isGameComplete() {
        let result = true;
        UI.scoreElements.forEach(function (thisElement) {
            if (!thisElement.owned) {
                result = false;
            }
        });
        return result;
    }
    resetGame() {
        app.dice = new Dice();
        app.dice.resetGame();
        UI.scoreElements.forEach(function (thisElement) {
            thisElement.reset();
        });
        this.gameOver = false;
        this.leftBonus = 0;
        this.yahtzBonus = 0;
        this.leftTotal = 0;
        this.rightTotal = 0;
        this.leftScoreElement.textContent = '^ total = 0';
        App.players.forEach((player) => {
            player.resetScore();
        });
        this.rollButton.style.backgroundColor = Game.currentPlayer.color;
        this.rollButton.textContent = 'Roll Dice';
        this.rollButton.disabled = false;
    }
}