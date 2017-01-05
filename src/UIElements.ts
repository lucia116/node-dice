class UI {
  static scoreElements: ScoreElement[]
  static node: HTMLElement[]
  // scoring index/id
  static ThreeOfaKind: number = 6
  static FourOfaKind: number = 7
  static SmallStraight: number = 8
  static LargeStraight: number = 9
  static House: number = 10
  static FiveOfaKind: number = 11
  static Chance: number = 12

  static buildScoreElements() {
    let scTop = 190
    let scLeft = Board.canvas.clientLeft + 25
    let scRight = scLeft + Board.scoreWidth + 5
    let righOffset = (Board.scoreWidth * 2) + 80

    Board.scoreElement.push(new ScoreElement(0, 'Ones', '', scLeft, scTop, true))
    Board.scoreElement.push(new ScoreElement(1, 'Twos', '', scRight, scTop, false))
    Board.scoreElement.push(new ScoreElement(2, 'Threes', '', scLeft, scTop + 100, true))
    Board.scoreElement.push(new ScoreElement(3, 'Fours', '', scRight, scTop + 100, false))
    Board.scoreElement.push(new ScoreElement(4, 'Fives', '', scLeft, scTop + 200, true))
    Board.scoreElement.push(new ScoreElement(5, 'Sixes', '', scRight, scTop + 200, false))
    Board.scoreElement.push(new ScoreElement(UI.ThreeOfaKind, 'Three', 'O-Kind', scLeft + righOffset, scTop, true))
    Board.scoreElement.push(new ScoreElement(UI.FourOfaKind, 'Four', 'O-Kind', scRight + righOffset, scTop, false))
    Board.scoreElement.push(new ScoreElement(UI.SmallStraight, 'Small', 'Straight', scLeft + righOffset, scTop + 100, true))
    Board.scoreElement.push(new ScoreElement(UI.LargeStraight, 'Large', 'Straight', scRight + righOffset, scTop + 100, false))
    Board.scoreElement.push(new ScoreElement(UI.House, 'Full', 'House', scLeft + righOffset, scTop + 200, true))
    Board.scoreElement.push(new ScoreElement(UI.FiveOfaKind, 'Five', 'O-Kind', scRight + righOffset, scTop + 200, false))
    Board.scoreElement.push(new ScoreElement(UI.Chance, 'Chance', '', scLeft + righOffset, scTop + 300, true))
    UI.renderScoreElements()
  }

  static renderScoreElements() {
    Board.Surface.shadowColor = 'burlywood'
    Board.Surface.shadowBlur = 10
    Board.Surface.shadowOffsetX = 3
    Board.Surface.shadowOffsetY = 3
    for (let i = 0; i < Board.scoreElement.length; i++) {
      Board.scoreElement[i].render('black')
    }
  }

  static buildPlayerElements() {
    Board.playerScoreElements = new Array
    Board.playerScoreElements[0] = new TextElement('', 100, 40, 125, 35, Board.textColor, 'black') //new TextElement('player1', 100, 40)
    Board.playerScoreElements[1] = new TextElement('', 100, 65, 125, 35, Board.textColor, 'black')//new PlayerElement('player2', 100, 65)
    Board.playerScoreElements[2] = new TextElement('', 475, 40, 125, 35, Board.textColor, 'black')//new PlayerElement('player3', 475, 40)
    Board.playerScoreElements[3] = new TextElement('', 475, 65, 125, 35, Board.textColor, 'black')//new PlayerElement('player4', 475, 65)
  }

  static resetPlayersScoreElements() {
    for (var i = 0; i < 4; i++) {
      Board.playerScoreElements[i].textColor = 'black'
      Board.playerScoreElements[i].text = ''
      UI.RenderText(Board.playerScoreElements[i])
    }
  }

  static RenderText(t: TextElement) {
    Board.Surface.fillStyle = t.backgroundColor
    Board.Surface.fillRect(t.rectX, t.rectY, t.width, t.height)
    Board.Surface.fillStyle = t.textColor
    Board.Surface.strokeStyle = t.textColor
    Board.Surface.fillText(t.text, t.left, t.top)
    Board.Surface.strokeText(t.text, t.left, t.top)
  }
}

class ButtonElement {

  left: number
  top: number
  width: number
  height: number
  disabled: boolean = false
  backgroundColor: string = 'black'
  path: Path2D
  firstPass: boolean // used for shadow control
  textLabel: TextElement

  constructor(left: number, top: number, width: number, height: number) {
    this.textLabel = new TextElement('Roll Dice', left + 90, top + 40, width - 25, 40, 'blue', Board.textColor)
    this.left = left
    this.top = top
    this.width = width
    this.height = height
    let path = new Path2D()
    this.path = PathBuilder.BuildRectangle(left, top, width, height)
    this.firstPass = true
    this.render()
  }

  setText(text: string) {
    this.textLabel.text = text
    this.render()
  }

  setBackgroundColor(color: string) {
    this.backgroundColor = color
    this.textLabel.backgroundColor = color
    this.render()
  }

  upDate(text: string, color: string) {
    this.textLabel.text = text
    this.backgroundColor = color
    this.textLabel.backgroundColor = color
    this.render()
  }

  render() {
    if (this.firstPass) {
      // turn shadow on
      Board.Surface.shadowColor = 'burlywood'
      Board.Surface.shadowBlur = 10
      Board.Surface.shadowOffsetX = 3
      Board.Surface.shadowOffsetY = 3
      // end shadow
    }
    Board.Surface.fillStyle = this.backgroundColor
    Board.Surface.fill(this.path);
    Board.Surface.fillStyle = Board.textColor
    if (this.firstPass) {
      this.firstPass = false
      Board.Surface.shadowColor = 'transparent'
      Board.Surface.shadowBlur = 0
      Board.Surface.shadowOffsetX = 0
      Board.Surface.shadowOffsetY = 0
    }
    UI.RenderText(this.textLabel)
  }
}

class TextElement {

  text: string
  left: number
  rectX: number
  top: number
  rectY: number
  width: number
  height: number
  backgroundColor: string
  textColor: string

  constructor(text: string, left: number, top: number, width: number, height: number, backgroundColor: string, textColor: string) {
    this.text = text
    this.left = left
    this.rectX = left - (width * 0.52)
    this.top = top
    this.rectY = top - (height * 0.7)
    this.width = width
    this.height = height
    this.backgroundColor = backgroundColor
    this.textColor = textColor
    UI.RenderText(this)
  }
}
