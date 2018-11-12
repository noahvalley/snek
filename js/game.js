const canvas = document.getElementById('thecanvas')
const ctx = canvas.getContext('2d')
const stepTime = 180
const fieldsWitdth = 20
const fieldsHeight = 12
canvas.width = ((window.innerWidth-260)-fieldsWitdth)-((window.innerWidth-300)-fieldsWitdth)%fieldsWitdth
canvas.height = (canvas.width)/fieldsWitdth*fieldsHeight
const oneField = canvas.width/fieldsWitdth
if(localStorage.getItem('highscores') === null){
	localStorage.setItem('highscores', JSON.stringify([
		{name : 'niemand', score : 0},
		{name : 'niemand', score : 0},
		{name : 'niemand', score : 0},
		{name : 'niemand', score : 0},
		{name : 'niemand', score : 0}
	]))
}
var lastHighscorer = 'Unknown Snek'
var game = {}

const draw = () => {
	ctx.clearRect(0,0,canvas.width,canvas.height)
	// Food
	ctx.beginPath()
	ctx.arc(game.food.x, game.food.y, oneField/4, 0, 2*Math.PI)
	ctx.fillStyle ='green'
	ctx.fill()
	ctx.closePath()
	// Schwanz
	for (var dot in game.player.tail){
		var dotRadius = oneField/(2+Math.sqrt((game.player.tail.length-dot)*.01))
		// Böppel
		ctx.beginPath()
		ctx.arc(game.player.tail[dot].x, game.player.tail[dot].y, dotRadius, 0, 2*Math.PI)
		ctx.fillStyle ='black'
		ctx.fill()
		ctx.closePath()
		// Hals
		ctx.beginPath()
		var halsWidth = 1
		ctx.fillStyle ='black'
		switch (game.player.tail[dot].direction.toString()){
			case [1, 0].toString():
				//right
				ctx.fillRect(game.player.tail[dot].x, game.player.tail[dot].y-halsWidth/2, oneField, halsWidth)
				break
			case [0, 1].toString():
				//bottom
				ctx.fillRect(game.player.tail[dot].x-halsWidth/2, game.player.tail[dot].y, halsWidth, oneField)
				break
			case [-1, 0].toString():
				//left
				ctx.fillRect(game.player.tail[dot].x, game.player.tail[dot].y-halsWidth/2, -oneField, halsWidth)
				break
			case [0, -1].toString():
				//top
				ctx.fillRect(game.player.tail[dot].x-halsWidth/2, game.player.tail[dot].y, halsWidth, -oneField)
				break
		}
		ctx.closePath()

	}
	// Kopf
	ctx.beginPath()
	ctx.arc(game.player.x, game.player.y, oneField/2, 0, 2*Math.PI)
	ctx.fillStyle ='black'
	ctx.fill()
	ctx.closePath()	
	// Mund
	var percentage = (game.player.tail.length+1)/200
	var startWinkel = .5
	ctx.beginPath()
	if (game.player.eating){
		ctx.arc(game.player.x, game.player.y+oneField/4, oneField/6, 0, 2*Math.PI)
		ctx.fillStyle = "yellow";
		ctx.fill();
	}else{
		ctx.arc(game.player.x, game.player.y, oneField/3, Math.PI/2-startWinkel-((Math.PI/2-startWinkel)*percentage), Math.PI/2+startWinkel+((Math.PI/2-startWinkel)*percentage))		
	}
	ctx.strokeStyle = 'yellow'
	ctx.lineWidth = 2
	ctx.stroke()
	ctx.closePath()
	//Auge 1
	ctx.beginPath()
	ctx.arc(game.player.x-oneField*.2, game.player.y-oneField*0.2, oneField/7, 0, 2*Math.PI)
	ctx.fillStyle = 'white'
	ctx.fill()
	ctx.closePath()
	//Auge 1 - Inneres
	ctx.beginPath()
	ctx.arc(game.player.x-oneField*.2+oneField/13*game.player.direction[0], game.player.y-oneField*0.2+oneField/13*game.player.direction[1], oneField/17, 0, 2*Math.PI)
	ctx.fillStyle = 'black'
	ctx.fill()
	ctx.closePath()
	//Auge 2	
	ctx.beginPath()
	ctx.arc(game.player.x+oneField*.2, game.player.y-oneField*0.2, oneField/7, 0, 2*Math.PI)
	ctx.fillStyle = 'white'
	ctx.fill()
	ctx.closePath()
	//Auge 2 - Inneres
	ctx.beginPath()
	ctx.arc(game.player.x+oneField*.2+oneField/13*game.player.direction[0], game.player.y-oneField*0.2+oneField/13*game.player.direction[1], oneField/17, 0, 2*Math.PI)
	ctx.fillStyle = 'black'
	ctx.fill()
	ctx.closePath()
	var scoreText = document.createTextNode(game.player.tail.length+1)
	var node = document.getElementById('score')
	node.removeChild(node.lastChild)
	node.appendChild(scoreText)

}
const doesCollideWithWurm = (x,y) => {
	if ((game.player.x === x) && (game.player.y === y)){
		return true
	}else{
		return (game.player.tail.filter((dot) => {return((dot.y === y)&&(dot.x === x))}).length !== 0)
	}
}
const spawnFood = () => {
	var x = oneField*(Math.floor(Math.random() * (fieldsWitdth-1)) + 1)+oneField/2
	var y = oneField*(Math.floor(Math.random() * (fieldsHeight-1)) + 1)+oneField/2
	if (doesCollideWithWurm(x,y)){
		spawnFood()
	}else{
		game.food.x = x
		game.food.y = y
	}
}
const GameOver = () => {
	var highscore = JSON.parse(localStorage.getItem('highscores'))
	if ((game.player.tail.length+1) > highscore[4].score){
		var person = prompt('Game Over! Neuer Highscore! Und dein Name ist?', lastHighscorer)
		lastHighscorer = person
		highscore.pop()
		highscore.push({name:person, score:game.player.tail.length+1})
		highscore.sort((a,b)=>{ return (b.score-a.score) })
		localStorage.setItem('highscores', JSON.stringify(highscore))
		if (window.confirm('Nochmal?')){
			init()
		}
	}else{
		if (window.confirm('Game Over! Nochmal?')){
			init()
		}
	}
}
const drawLeaderboard = () => {
	var highscore = JSON.parse(localStorage.getItem('highscores'))
	var ul = document.getElementById('highscore')
	while (ul.hasChildNodes()) {
	    ul.removeChild(ul.lastChild)
	}
	for (var person in highscore){
		var spanName = document.createElement('span')
		var textName = document.createTextNode(highscore[person].name)
		spanName.appendChild(textName)

		var spanScore = document.createElement('span')
		var textScore = document.createTextNode('('+highscore[person].score+')')
		spanScore.appendChild(textScore)

		var li = document.createElement('li')
		li.appendChild(spanName)
		li.appendChild(spanScore)
		ul.appendChild(li)
	}
}
const redraw = () => {
	// Move Player
	game.player.tail.push({x: game.player.x, y: game.player.y, direction : game.player.direction})
	if (!game.player.eating){
		game.player.tail.shift()
	}
	game.player.x += game.player.direction[0]*oneField
	game.player.y += game.player.direction[1]*oneField
	if (game.player.x > canvas.width){
		game.player.x = oneField/2
	}
	// Check if Player other Side
	if (game.player.x < 0){
		game.player.x = (fieldsWitdth-1)*oneField+oneField/2
	}
	if (game.player.y > canvas.height){
		game.player.y = oneField/2
	}
	if (game.player.y < 0){
		game.player.y = (fieldsHeight-1)*oneField+oneField/2
	}
	// Check if Player on Food
	if ((game.player.x === game.food.x)&(game.player.y === game.food.y)){
		game.player.eating = true
		spawnFood()
	}else{
		game.player.eating = false
	}
	if (game.player.tail.filter((dot) => {return((dot.y === game.player.y)&&(dot.x === game.player.x))}).length===0){
		draw()
		setTimeout(redraw, stepTime)
	}else{
		GameOver()
	}
	game.player.moved = false
}

const init = () => {
	game = {
		player : {
			x : 8*oneField+oneField/2,
			y : 5*oneField+oneField/2,
			width : canvas.width/fieldsWitdth,
			height : canvas.width/fieldsWitdth,
			radius : oneField/2,
			moveSpeed : 5,
			direction : [1, 0],
			moved : false,
			eating : false,
			tail : [{
				x : 8*oneField+oneField/2,
				y : 5*oneField+oneField/2,
			}]
		},
		food : {
			x : -1,
			y : -1		
		}
	}
	drawLeaderboard()
	spawnFood()
	setTimeout(redraw, stepTime)
}

init()

document.body.onkeydown = (e) => {
	if (!game.player.moved){
		switch (e.keyCode){
			case 37:
				//left
				if (game.player.direction.toString() !== [1, 0].toString()){
					game.player.direction = [-1, 0]
					game.player.moved = true
				}
			break
			case 39:
				//right
				if (game.player.direction.toString() !== [-1, 0].toString()){
					game.player.direction = [1, 0]
					game.player.moved = true
				}
			break
			case 38:
				//up
				if (game.player.direction.toString() !== [0, 1].toString()){
					game.player.direction = [0, -1]
					game.player.moved = true
				}
			break
			case 40:
				//down
				if (game.player.direction.toString() !== [0, -1].toString()){
					game.player.direction = [0, 1]
					game.player.moved = true
				}
			break
		}
	}
}
