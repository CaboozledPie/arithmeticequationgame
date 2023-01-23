# arithmeticequationgame

/**
 * 算数式カードゲーム
 * 
 * ルール（日本語）：各自は5枚の0から9までの「数カード」を持っています。そして、そのプレイヤーも5枚の「＝」カードも持っています。解決の山札から取ったカードを中央に置いて、ゲームは始まります。
 *
 * あなたのターンでは、制限時間（初期値30秒）までに、自分のカードと「＋」、「-」、「x」、「/」の演算を使って、中央の解決のカードと等しい有効な式を作ります（「＝」カードをクリックすることで完成を意味します）。制限時間内であれば、何度でも挑戦することができます（1回間違えると3秒のペナルティ）。有効な式を作ることに成功すると、使用した数字カードは新しいものと交換され、「=」カードが1枚使用されます。
 * 
 * でも、制限時間の前に正しい式を作れなければ、次のプレイヤは同じ解決カードの式を作ろうとできます。このプレイヤーがターンを演じている間、前のプレイヤーは自分のカードのどれかを新しい乱数と交換することができますが、これは他のプレイヤーがターンを演じている間のみで、カード1枚につき1回までとします。
 *
 * このプレイヤーも答えられなかった場合は、次のプレイヤーに進み（2人だけの場合は最初のプレイヤーに戻る）、カードが解けるまで（その時点で新しい答えのカードが渡される）プレイが続きます。
 *
 *最初の全部の「＝」カードを使えるプレイヤーが勝ちます。
 *
 * Rules (English): Each player has five number cards with numbers 0 through 9 . They also receive 5 "=" cards. A number picked from the "answer" deck (generally larger numbers) is randomly placed in the center of the table, and a randomly chosen player begins the game.
 * 
 * On this player's turn, they have until the time limit (default 30 seconds) to create a valid expression using their cards and the operations +, -, *, and/or / that equals the answer card in the center (you signify completion by clicking your equals card). They're allowed to try as many times as they want within that time limit (with a three second penalty per incorrect guess); if they successfully create a valid expression, the used number cards are replaced with with new ones, and one "=" card is used.
 * 
 * However, if they fail to provide a correct equation within the time limit, the next player now has the opportunity to play their cards for the same answer. While the other player is playing their turn, the previous player may swap any of their cards for a new random number, but only while the other player is playing their turn, and only up to once per card.
 * 
 * If this player also fails to answer, play progresses to the next player (or returns to the first player if there are only two players), and this continues until the card is solved (at which point a new answer card is given).
 * 
 * A player wins once they have used all of their "=" cards.
**/
