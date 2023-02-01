import Math;
size(800, 800, P2D);
void setup() {
    size(width, height);
}

//originally used as a settings button, now just here for reference (on KA you edit the variable to change settings)
var playerCount = 1;

//customizables
var timerLimit = 30;
var numCardLimit = 9;
var ansRange = [10, 40];
var goalScore = 20;
var cpuOptions = [[[1.5, 3], 4000], [[2, 4], 3000], [[2.5, 4.75], 2000], [[3, 5], 1500], [[3.75, 5.49], 1000]];
var cpuStrength = 1;

frameRate(60);
var mouseIsReleased = false;
var mousePressing = false;
textAlign(CENTER, CENTER);

var score = [];
var gameState = "homeScreen";
var numerals = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var operations = ["+", "-", "x", "/"];
var timer = [0, 0];
var currTurn = true;
var currAns = round(random(ansRange[0]-0.5, ansRange[1]+0.49));
var operationsDeck = [{value: "+", order: []}, {value: "-", order: []}, {value: "x", order: []}, {value: "/", order: []}];

var currPlayer = 0;
var players = [];

//color timers
var lastPenalty = -10000;
var lastGU = -10000;
var lastWrong = -10000;
var lastTimeout = -10000;
var lastScore = [];
var lastBig = -10000;
var lastChange = -10000;

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
    lastChange = millis();
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
        if (round(random(0.5, cpuOptions[cpuStrength][1])) === 1 && currTurn === false && timer[0] > 5) {
            currAns = round(random(ansRange[0]-0.5, ansRange[1]+0.49));
            changeTurn();
            var oppScore = round(random(cpuOptions[cpuStrength][0][0], cpuOptions[cpuStrength][0][1]));
            score[1] += oppScore;
            if (oppScore === 5) {
                lastBig = millis();
            }
            lastScore[1] = millis();
            wipe(currPlayer);
        }
        if (timer[1] === timerLimit*40) {
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
    if (mousePressing && mouseX >=x && mouseX <= x+w && mouseY >= y && mouseY <= y+h) {
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
            ellipse(x+w-h/11, y+h/11, 3/11*h, 3/11*h);
        }
        else {
            ellipse(x+w-h/8, y+h/8, height/20, height/20);
            fill(255, 255, 255);
            textSize(3/100*height);
            text(active, x+w-h/8, y+h/8);
        }
    }
    if (typeof(active) === 'object') {
        if (active.length > 0) {
            for (var i = 0; i < min(active.length, 2); i++) {
                fill(0, 0, 0);
                ellipse(x+width/80, y+height/80+i*height/20, 3/80*height, 3/80*height);
                fill(255, 255, 255);
                textSize(0.026*height);
                text(active[i], x+width/80, y+height/80+i*height/20);
            }
            if (active.length >= 3) {
                for (var i = 2; i < min(active.length, 4); i++) {
                    fill(0, 0, 0);
                    ellipse(x+w-width/80, y+height/80+i*height/20-height/10, 3/80*height, 3/80*height);
                    fill(255, 255, 255);
                    textSize(0.026*height);
                    text(active[i], x+w-width/80, y+height/80+i*height/20-height/10);
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
    score = [];
    for (var i = 0; i < players.length; i++) {
        players[i].deck = [];
        players[i].func = [];
    }
    currPlayer = 0;
    currTurn = true;
    for (var i = 0; i < players.length; i++) {
        for (var x = 0; x < players[i].deck.length; x++) {
            players[i].deck[x].value = round(random(0.5, numCardLimit + 0.49));
        }
    }
    currAns = round(random(ansRange[0]-0.5, ansRange[1]+0.49));
};
var deckSetup = function() {
    players = [];
    for (var i = 0; i < playerCount; i++) {
        players.push({deck: [], func: []});
        for (var x = 0; x < 5; x++) {
            players[i].deck.push({value: round(random(0.5, numCardLimit + 0.49)), order: 0, used: false});
        }
    }
    for (var i = 0; i < operationsDeck.length; i++) {
        operationsDeck[i].order = [];
    }
    for (var i = 0; i < max(2, playerCount); i++) {
        score.push(0);
        lastScore.push(-10000);
    }
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
        gameState = "cpuSettings";
    }
    if (inputCard(13/24*width, 77/120*height, width/3, height/4, [200, 100, 100], "", 0) === true) {
        playerCount = max(playerCount, 2);
        gameState = "playerSelect";
    }
    fill(0, 0, 0);
    textSize(width/20);
    text("CPUゲーム", 7/24*width, 23/30*height);
    text("マルチプレイ", 17/24*width, 23/30*height);
};
var cpuSettings = function() {
    var cpuPointer = width/6+(cpuStrength)*0.167*width;
    background(130, 130, 170);
    textSize(width/10);
    fill(0, 0, 0);
    text("CPUの強さを\n選んでください", width/2, height/3);
    strokeWeight(1);
    if (inputCard(1/25*width, 1/25*height, width/6, height/8, [100, 100, 100], "", 0) === true) {
        gameState = "homeScreen";
    }
    if (inputCard(width/4, 0.73*height, width/2, height/5, [200, 100, 100], "", 0) === true) {
        deckSetup();
        gameState = "game";
    }
    fill(0, 0, 0);
    textSize(height/20);
    text("戻る", width*0.127, height*0.105);
    strokeWeight(height/40);
    line(width/6, 0.63*height, 5/6*width, 0.63*height);
    for (var i = 0; i < 5; i++) {
        line(width/6+i*0.167*width, 0.63*height, width/6+i*0.167*width, 0.66*height);
    }
    if (mouseX >= width/6 && mouseX <= 5/6*width && mouseY >= width/2.5 && mouseY <= 0.7*height && (mousePressing || mouseIsReleased)) {
        cpuPointer = mouseX;
    }
    strokeWeight(1);
    fill(255, 0, 0);
    triangle(cpuPointer, 0.6*height, cpuPointer - width/25, 0.55*height, cpuPointer + width/25, 0.55*height);
    fill(0, 0, 0);
    textSize(width/20);
    switch (cpuStrength) {
        case 0:
            text("弱い", cpuPointer-1, 0.51*height);
            break;
        case 1:
            text("普通", cpuPointer-1, 0.51*height);
            break;
        case 2:
            text("強い", cpuPointer-1, 0.51*height);
            break;
        case 3:
            text("とても強い", cpuPointer-1, 0.51*height);
            break;
        case 4:
            text("鬼", cpuPointer-1, 0.51*height);
            break;
    }
    textSize(width/16);
    text("始めましょう!", width/2, height*0.835);
    cpuStrength = Math.round((cpuPointer-width/6)/(0.167*width)+2)-2;
};
var playerSelect = function() {
    var pointerPos = width/6+(playerCount-2)*0.134*width;
    background(200, 100, 100);
    textSize(width/10);
    fill(0, 0, 0);
    text("何人で\n遊びますか", width/2, height/3);
    strokeWeight(1);
    if (inputCard(1/25*width, 1/25*height, width/6, height/8, [100, 100, 100], "", 0) === true) {
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
    if (mouseX >= width/6 && mouseX <= 5/6*width && mouseY >= width/2.5 && mouseY <= 0.7*height && (mousePressing || mouseIsReleased)) {
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
    var scored = false;
    timer[1]++;
    timer[0] = ceil(timer[1]/60);
    background(156, 96, 0);
    
    //turn text
    fill(0, 0, 0);
    if (currTurn === true) {
        textSize(3.5/80*width);
        if (playerCount === 1) {
            text("あなたのターン", 32/40*width, 37/80*height);
        }
        else {
            text("P"+(currPlayer+1)+"のターン", 32/40*width, 37/80*height);
        }
        text("式を作りなさい", 32/40*width, 43/80*height);
        }
    else {
        textSize(height/20);
        text("CPUターン", 32/40*width, 37/80*height);
        textSize(3/80*height);
        text("欲しくない数を換\nえれます", 32/40*width, 9/16*height);
    }
    
    //CPU-specific code
    if (playerCount === 1) {
        oppGameplay();
        fill(0, 0, 0);
        textSize(height/20);
        text("点数:\n" + score[1] + "/" + goalScore, 7/80*width, height/10);
        penaltyCol(lastScore[1]);
        text("点数:\n" + score[1] + "/" + goalScore, 7/80*width, height/10);
    }
    
    //multiplayer-specific
    else {
        for (var i = 1; i < playerCount; i++) {
            var targetPlayer = currPlayer+i;
            if (targetPlayer >= playerCount) {
                targetPlayer -= playerCount;
            }
            fill(0, 0, 0);
            textSize(width/30);
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
    if (inputCard(49/80*width, 33/40*height, width/5, height*11/80, [100, 100, 100], "ギブアップ", 0) === true && currTurn === true && millis() - lastChange > 2000) {
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
            score[currPlayer] += (players[currPlayer].func.length+1)/2;
            if (players[currPlayer].func.length === 9) {
                lastBig = millis();
            }
            lastScore[0] = millis();
            scored = true;
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
    text("点数:\n" + score[currPlayer] + "/" + goalScore, 73/80*width, 9/10*height);
    penaltyCol(lastScore[0], [100, 230, 100]);
    text("点数:\n" + score[currPlayer] + "/" + goalScore, 73/80*width, 9/10*height);
    
    //alert text
    penaltyCol(lastGU, [0, 0, 0]);
    textSize(3/80*height);
    text("ギブアップ", 3/16*width, 47/80*height);
    penaltyCol(lastWrong);
    text("違います", 3/16*width, 47/80*height); 
    penaltyCol(lastTimeout);
    text("タイムアウト", 3/16*width, 47/80*height);
    
    if (lastBig < maxArr(lastScore)) {
        penaltyCol(maxArr(lastScore), [230, 230, 100]);
        text("成功", 3/16*width, 47/80*height);
    }
    else {
        penaltyCol(lastBig, [255, 255, 0]);
        textSize(width/4);
        text("大成功", width/2, height/2);
    }
    
    //win or loss check
    if (playerCount === 1) {
        if (score[0] >= goalScore) {
            fill(255, 255, 255, 150);
            noStroke();
            rect(0, 0, width, height);
            gameState = "CPUwin";
        }
        if (score[1] >= goalScore) {
            fill(255, 255, 255, 150);
            noStroke();
            rect(0, 0, width, height);
            gameState = "CPUloss";
        }
    }
    else {
        for (var i = 0; i < score.length; i++) {
            if (score[i] >= goalScore) {
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
    
    //change turn
    if (scored) {
        changeTurn();
    }
    scored = false;
};
var winScreen = function() {
    fill(0, 0, 0);
    textSize(3/40*width);
    text("おめでとうございます！\n勝ちです。", width/2, 3/8*height);
    if (inputCard(5/16*width, 5/8*height, 3/8*width, height/4, [220, 100, 100], "", 0) === true) {
        gameState = "homeScreen";
        resetGame();
    }
    textSize(1/16*width);
    text("やり直す", width/2, 3/4*height);
};
var loseScreen = function() {
    fill(0, 0, 0);
    textSize(1/4*height);
    text("あ", width/2, 3/8*height);
    if (inputCard(5/16*width, 5/8*height, 3/8*width, height/4, [100, 100, 220], "", 0) === true) {
        gameState = "homeScreen";
        resetGame();
    }
    textSize(1/16*width);
    text("やり直す", width/2, 3/4*height);
};
var multiWinScreen = function() {
    fill(0, 0, 0);
    var winner = 0;
    for (var i = 0; i < score.length; i++) {
        if (score[i] >= goalScore) {
            winner = i + 1;
        }
    }
    textSize(3/40*width);
    text("終了です！\nP"+(winner)+"の優勝", width/2, 3/8*height);
    if (inputCard(5/16*width, 5/8*height, 3/8*width, height/4, [220, 100, 100], "", 0) === true) {
        gameState = "homeScreen";
        resetGame();
    }
    textSize(1/16*width);
    text("やり直す", width/2, 3/4*height);
};

//processingJS
void draw() {
    switch (gameState) {
        case "homeScreen":
            homeScreen();
            break;
        case "cpuSettings":
            cpuSettings();
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
void mouseReleased() {
    mousePressing = false;
    mouseIsReleased = true;
};
void mousePressed() {
    mousePressing = true;
};
