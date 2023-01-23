import Math;
size(800, 800, P2D);
void setup() {
    size(width, height);
}

//for CPU game choose 1, or input a number for player count (up to 7)
var playerCount = 1;

//customizables
var timerLimit = 30;
var numCardLimit = 9;
var ansRange = [10, 40];
var goalScore = 5;

frameRate(60);
var mouseIsReleased = false;
textAlign(CENTER, CENTER);

//variables
var score = [];
var lastScore = [];
var gameState = "homeScreen";
var numerals = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var operations = ["+", "-", "x", "/"];
var timer = [0, 0];
var currTurn = true;
var currAns = round(random(ansRange[0]-0.5, ansRange[1]+0.49));
var operationsDeck = [{value: "+", order: []}, {value: "-", order: []}, {value: "x", order: []}, {value: "/", order: []}];

var currPlayer = 0;
var players = [];
var deckSetup = function() {
    for (var i = 0; i < playerCount; i++) {
        players.push({deck: [], func: []});
        for (var x = 0; x < 5; x++) {
            players[i].deck.push({value: round(random(0.5, numCardLimit + 0.49)), order: 0, used: false});
        }
    }
    for (var i = 0; i < max(2, playerCount); i++) {
        score.push(goalScore);
        lastScore.push(0);
    }
};

//color timers
var lastPenalty = 0;
var lastGU = 0;
var lastWrong = 0;
var lastTimeout = 0;

//convenience/function
var maxArr = function(arr) {
    var max = arr[0];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
};
var evaluate = function(arr) {
    //PEMDAS
    var mdSolved = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === "x") {
            mdSolved[mdSolved.length-1] *= arr[i+1];
            i+=1;
        }
        else if (arr[i] === "/") {
            mdSolved[mdSolved.length-1] /= arr[i+1];
            i+=1;
        }
        else {
            mdSolved.push(arr[i]);
        }
    }
    var finalSolve = mdSolved[0];
    for (var i = 0; i < mdSolved.length; i++) {
        if (mdSolved[i] === "+") {
            finalSolve += mdSolved[i+1];
            i+=1;
        }
        else if (mdSolved[i] === "-") {
            finalSolve -= mdSolved[i+1];
            i+=1;
        }
    }
    return finalSolve;
};
var inArray = function(val, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            return true;
        }
    }
    return false;
};
var wipe = function(player) {
    players[player].func = [];
    for (var i = 0; i < players[player].deck.length; i++) {
        players[player].deck[i].order = 0;
        players[player].deck[i].used = false;
    }
    for (var i = 0; i < operationsDeck.length; i++) {
        operationsDeck[i].order = [];
        operationsDeck[i].used = false;
    }
};
var changeTurn = function() {
    timer = [0, 1];
    if (playerCount === 1) {
        if (currTurn === true) {
            currTurn = false;
        }
        else {
            currTurn = true;
        }
    }
    else {
        wipe(currPlayer);
        currPlayer++;
        if (currPlayer >= playerCount) {
            currPlayer -= playerCount;
        }
        wipe(currPlayer);
    }
};
var oppGameplay = function() {
    stroke(0, 0, 0);
    for (var i = 0; i < 5; i++) {
        fill(0, 174, 255);
        rect(33/80*width+i*9/80*width, 3/80*height, height/10, 11/80*height, height/40);
    }
    for (var i = 0; i < 4; i++) {
        fill(255, 100, 100);
        rect(21/40*width+i*9/80*width, height/5, height/10, 11/80*height, height/40);
    }
    fill(220, 220, 220);
    rect(width/20, height/5, height/5, 11/80*height, height/40);
    fill(150, 150, 150);
    rect(23/80*width, height/5, height/5, 11/80*height, height/40);
    fill(100, 100, 100);
    rect(3/16*width, 3/80*height, height/5, 11/80*height, height/40);
    if (currTurn === false) {
        if (round(random(0.5, 2000.49)) === 1 && currTurn === false && timer[0] > 5) {
            currAns = round(random(ansRange[0]-0.5, ansRange[1]+0.49));
            changeTurn();
            score[1] -= 1;
            wipe(currPlayer);
            lastScore[1] = millis();
        }
        if (timer[1] === timerLimit*30) {
            if (round(random(0.5, 2.49)) === 1) {
                wipe(currPlayer);
                changeTurn();
                lastGU = millis();
            }
        }
    }
};
var penaltyCol = function(ms, col) {
    if (col) {
        fill(col[0], col[1], col[2], 255-(millis()-ms)/10);
    }
    else {
        fill(255, 0, 0, 255-(millis()-ms)/10);
    }
};
var inputCard = function(x, y, w, h, col, input, active) {
    fill(col[0], col[1], col[2]);
    stroke(0, 0, 0);
    if (mouseX >=x && mouseX <= x+w && mouseY >= y && mouseY <= y+h) {
        fill(col[0]-30, col[1]-30, col[2]-30);
    }
    if (mouseIsPressed && mouseX >=x && mouseX <= x+w && mouseY >= y && mouseY <= y+h) {
        fill(col[0]-60, col[1]-60, col[2]-60);
    }
    rect(x, y, w, h, height/40);
    fill(0, 0, 0);
    textSize(1/30*height);
    text(input, x+w/2, y+h/2);
    if (active !== 0 && typeof(active) !== 'object') {
        if (active === "reset") {
            fill(255, 0, 0);
            noStroke();
            ellipse(x+w-5, y+5, 15, 15);
        }
        else {
            ellipse(x+w-5, y+5, 20, 20);
            fill(255, 255, 255);
            text(active, x+w-5, y+5);
        }
    }
    if (typeof(active) === 'object') {
        if (active.length > 0) {
            for (var i = 0; i < min(active.length, 2); i++) {
                fill(0, 0, 0);
                ellipse(x+5, y+5+i*20, 15, 15);
                fill(255, 255, 255);
                textSize(12);
                text(active[i], x+5, y+5+i*20);
            }
            if (active.length >= 3) {
                for (var i = 2; i < min(active.length, 4); i++) {
                    fill(0, 0, 0);
                    ellipse(x+w-5, y+5+i*20-40, 15, 15);
                    fill(255, 255, 255);
                    textSize(12);
                    text(active[i], x+w-5, y+5+i*20-40);
                }
            }
        }
    }
    if (mouseIsReleased && mouseX >=x && mouseX <= x+w && mouseY >= y && mouseY <= y+h) {
        mouseIsReleased = false;
        return true;
    }
    else {
        return false;
    }
};
var testAns = function(func, ans) {
    if (evaluate(func) === ans) {
        return true;
    }
    return false;
};
var resetGame = function() {
    for (var i = 0; i < players.length; i++) {
        wipe(i);
    }
    if (playerCount !== 1) {
        currPlayer -= 1;
    }
    currTurn = true;
    for (var i = 0; i < players.length; i++) {
        score[i] = goalScore;
        for (var x = 0; x < players[i].deck.length; x++) {
            players[i].deck[x].value = round(random(0.5, numCardLimit + 0.49));
        }
    }
    currAns = round(random(ansRange[0]-0.5, ansRange[1]+0.49));
};

//gamestates
var homeScreen = function() {
    background(90, 152, 214);
    textSize(width/8);
    fill(0, 0, 0);
    text("算数式\nカードゲーム", width/2, height*3/8);
    if (inputCard(1/8*width, 77/120*height, width/3, height/4, [130, 130, 170], "", 0) === true) {
        playerCount = 1;
        deckSetup();
        gameState = "game";
    }
    if (inputCard(13/24*width, 77/120*height, width/3, height/4, [200, 100, 100], "", 0) === true) {
        playerCount = 2;
        gameState = "playerSelect";
    }
    fill(0, 0, 0);
    textSize(width/20);
    text("CPUゲーム", 7/24*width, 23/30*height);
    text("マルチプレイ", 17/24*width, 23/30*height);
};
var playerSelect = function() {
    var pointerPos = width/6+(playerCount-2)*0.134*width;
    background(200, 100, 100);
    textSize(width/10);
    fill(0, 0, 0);
    text("何人で\n遊びますか", width/2, height/3.5);
    strokeWeight(1);
    if (inputCard(1/25*width, 1/25*height, width/6, height/8, [130, 130, 170], "", 0) === true) {
        gameState = "homeScreen";
    }
    if (inputCard(width/4, 0.73*height, width/2, height/5, [130, 130, 170], "", 0) === true) {
        deckSetup();
        gameState = "game";
    }
    fill(0, 0, 0);
    textSize(height/20);
    text("戻る", width*0.127, height*0.105);
    textSize(width/16);
    text("始めましょう!", width/2, height*0.835);
    stroke(0, 0, 0);
    strokeWeight(height/40);
    line(width/6, 0.63*height, 5/6*width, 0.63*height);
    for (var i = 0; i < 6; i++) {
        line(width/6+i*0.134*width, 0.63*height, width/6+i*0.134*width, 0.66*height);
    }
    if (mouseX >= width/6 && mouseX <= 5/6*width && mouseY >= width/2.5 && mouseY <= 0.7*height && mouseIsPressed) {
        pointerPos = mouseX;
    }
    strokeWeight(1);
    fill(255, 0, 0);
    triangle(pointerPos, 0.6*height, pointerPos - width/25, 0.55*height, pointerPos + width/25, 0.55*height);
    fill(0, 0, 0);
    textSize(width/20);
    text(playerCount + "人", pointerPos-1, 0.51*height);
    playerCount = Math.round((pointerPos-width/6)/(0.134*width)+2);
};
var game = function() {
    timer[1]++;
    timer[0] = ceil(timer[1]/60);
    background(156, 96, 0);
    
    //turn text
    fill(0, 0, 0);
    if (currTurn === true) {
        textSize(3/80*width);
        if (playerCount === 1) {
            text("あなたのターン", 33/40*width, 37/80*height);
        }
        else {
            text("P"+(currPlayer+1)+"のターン", 33/40*width, 37/80*height);
        }
        text("式を作りなさい", 33/40*width, 43/80*height);
        }
    else {
        textSize(height/20);
        text("CPUターン", 33/40*width, 37/80*height);
        textSize(3/80*height);
        text("欲しくない数を換\nえれます", 33/40*width, 9/16*height);
    }
    
    //CPU-specific code
    if (playerCount === 1) {
        oppGameplay();
        fill(0, 0, 0);
        textSize(height/20);
        text("残り:\n" + score[1], 7/80*width, height/10);
        penaltyCol(lastScore[1]);
        text("残り:\n" + score[1], 7/80*width, height/10);
    }
    
    //multiplayer-specific
    else {
        for (var i = 1; i < playerCount; i++) {
            var targetPlayer = currPlayer+i;
            if (targetPlayer >= playerCount) {
                targetPlayer -= playerCount;
            }
            fill(0, 0, 0);
            text("P"+(targetPlayer+1), width/20+(((i+1)%2)*39/80*width), 19/200*height+(floor((i-1)/2)*height/10));
            text(score[targetPlayer], 19/40*width+(((i+1)%2)*39/80*width), 19/200*height+(floor((i-1)/2)*height/10));
            for (var x = 0; x < players[targetPlayer].deck.length; x++) {
                if (inputCard(7/80*width+x*3/40*width+(((i+1)%2)*39/80*width), height/20+(floor((i-1)/2)*height/10), height/16, height*33/400, [0, 174, 255], players[targetPlayer].deck[x].value, players[targetPlayer].deck[x].order) === true && players[targetPlayer].deck[x].used === false) {
                    players[targetPlayer].deck[x].used = true;
                    players[targetPlayer].deck[x].order = "reset";
                    var newNum = round(random(0.5, numCardLimit + 0.49));
                    while (newNum === players[targetPlayer].deck[x].value) {
                        newNum = round(random(0.5, numCardLimit + 0.49));
                    }
                    players[targetPlayer].deck[x].value = newNum;
                }
            }
        }
    }
    
    //answer card
    inputCard(height*2/5, height*2/5, height/5, height/5, [230, 200, 100], currAns, 0);
    
    //numberDeck buttons
    for (var i = 0; i < players[currPlayer].deck.length; i++) {
        if (inputCard(3/80*width+i*9/80*width, 33/40*height, height/10,11/80*height, [0, 174, 255], players[currPlayer].deck[i].value, players[currPlayer].deck[i].order) === true) {
            if (currTurn === true && players[currPlayer].deck[i].used === false && inArray(players[currPlayer].func[players[currPlayer].func.length-1], numerals) === false) {
                players[currPlayer].deck[i].order = players[currPlayer].func.length+1;
                players[currPlayer].func.push(players[currPlayer].deck[i].value);
                players[currPlayer].deck[i].used = true;
            }
            
            //CPU-game only
            if (currTurn === false && players[currPlayer].deck[i].used === false) {
                players[currPlayer].deck[i].used = true;
                players[currPlayer].deck[i].order = "reset";
                var newNum = round(random(0.5, numCardLimit + 0.49));
                while (newNum === players[currPlayer].deck[i].value) {
                    newNum = round(random(0.5, numCardLimit + 0.49));
                }
                players[currPlayer].deck[i].value = newNum;
            }
        }
    }
    
    //operations
    for (var i = 0; i < 4; i++) {
        if (inputCard(3/80*width+i*9/80*width, 53/80*height, height/10, 11/80*height, [255, 100, 100], operationsDeck[i].value, operationsDeck[i].order) === true) {
            if (currTurn === true && inArray(players[currPlayer].func[players[currPlayer].func.length-1], operations) === false && players[currPlayer].func.length > 0 && players[currPlayer].func.length < 9) {
                operationsDeck[i].order.push(players[currPlayer].func.length+1);
                players[currPlayer].func.push(operationsDeck[i].value);
                operationsDeck[i].used = true;
            }
        }
    }
    
    //wipe & giveup button
    if (inputCard(41/80*width, 53/80*height, width/5, height*11/80, [150, 150, 150], "キャンセル", 0) === true && currTurn === true) {
        wipe(currPlayer);
    }
    if (inputCard(49/80*width, 33/40*height, width/5, height*11/80, [100, 100, 100], "ギブアップ", 0) === true && currTurn === true) {
        wipe(currPlayer);
        changeTurn();
        lastPenalty = millis();
        lastGU = millis();
    }
    
    //equals card, ans check
    if (inputCard(3/4*width, 53/80*height, width/5, height*11/80, [220, 220, 220], "=", 0) === true && currTurn === true && inArray(players[currPlayer].func[players[currPlayer].func.length-1], operations) === false) {
        if (testAns(players[currPlayer].func, currAns) === false) {
            timer[1] += 180;
            lastPenalty = millis();
            lastWrong = millis();
        }
        if (testAns(players[currPlayer].func, currAns) === true) {
            currAns = round(random(ansRange[0]-0.5, ansRange[1]+0.49));
            for (var i = 0; i < players[currPlayer].deck.length; i++) {
                if (players[currPlayer].deck[i].order !== 0) {
                    players[currPlayer].deck[i].value = round(random(0.5, numCardLimit + 0.49));
                }
            }
            score[currPlayer] -= 1;
            changeTurn();
            lastScore[0] = millis();
        }
        wipe(currPlayer);
    }
    
    //timer
    textSize(1/10*height);
    fill(255*timer[0]/timerLimit, 0, 0);
    text(timer[0], 3/16*width, height/2);
    penaltyCol(lastPenalty);
    text(timer[0], 3/16*width, height/2);
    
    //scores
    textSize(1/20*height);
    fill(0, 0, 0);
    text("残り:\n" + score[currPlayer], 73/80*width, 9/10*height);
    penaltyCol(lastScore[0], [100, 230, 100]);
    text("残り:\n" + score[currPlayer], 73/80*width, 9/10*height);
    
    //alert text
    penaltyCol(lastGU, [0, 0, 0]);
    textSize(3/80*height);
    text("ギブアップ", 3/16*width, 47/80*height);
    penaltyCol(lastWrong);
    text("違います", 3/16*width, 47/80*height); 
    penaltyCol(lastTimeout);
    text("タイムアウト", 3/16*width, 47/80*height);
    
    penaltyCol(maxArr(lastScore), [230, 230, 100]);
    text("成功", 3/16*width, 47/80*height);
    
    //win or loss check
    if (playerCount === 1) {
        if (score[0] === 0) {
            fill(255, 255, 255, 150);
            noStroke();
            rect(0, 0, width, height);
            gameState = "CPUwin";
        }
        if (score[1] === 0) {
            fill(255, 255, 255, 150);
            noStroke();
            rect(0, 0, width, height);
            gameState = "CPUloss";
        }
    }
    else {
        for (var i = 0; i < score.length; i++) {
            if (score[i] === 0) {
                fill(255, 255, 255, 150);
                noStroke();
                rect(0, 0, width, height);
                gameState = "multiWin";
            }
        }
    }
    
    //timeout
    if (timer[1] >= timerLimit*60) {
        wipe(currPlayer);
        changeTurn();
        lastPenalty = millis();
        lastTimeout = millis();
    }
};
var winScreen = function() {
    fill(0, 0, 0);
    textSize(3/40*width);
    text("おめでとうございます！\n勝ちです。", 200, 150);
    if (inputCard(125, 250, 150, 100, [220, 100, 100], "", 0) === true) {
        gameState = "game";
        resetGame();
    }
    textSize(1/16*width);
    text("やり直す", 200, 300);
};
var loseScreen = function() {
    fill(0, 0, 0);
    textSize(1/4*height);
    text("あ", 200, 150);
    if (inputCard(125, 250, 150, 100, [100, 100, 220], "", 0) === true) {
        gameState = "game";
        resetGame();
    }
    textSize(1/16*width);
    text("やり直す", 200, 300);
};
var multiWinScreen = function() {
    fill(0, 0, 0);
    textSize(3/40*width);
    text("終了です！\nP"+(currPlayer)+"の優勝", 200, 150);
    if (inputCard(125, 250, 150, 100, [220, 100, 100], "", 0) === true) {
        gameState = "game";
        resetGame();
    }
    textSize(1/16*width);
    text("やり直す", 200, 300);
};

//processingJS
var draw = function() {
    switch (gameState) {
        case "homeScreen":
            homeScreen();
            break;
        case "playerSelect":
            playerSelect();
            break;
        case "game":
            game();
            break;
        case "CPUwin":
            winScreen();
            break;
        case "CPUloss":
            loseScreen();
            break;
        case "multiWin":
            multiWinScreen();
    }
    mouseIsReleased = false;
};
var mouseReleased = function() {
    mouseIsReleased = true;
};
