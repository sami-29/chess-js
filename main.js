// Helper functions
function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

function includesArray(a, b) {
    for (let i = 0; i < a.length; i++){
        if(arrayEquals(a[i],b)){return true}
    }
    return false
}

// Loading stuff
let testing = false
let requests = false
let ConfigObj = undefined
let PiecesObj = undefined
let turn = 'white'
let eaten = []

function sendHttpRequest(method, file) {
    const promise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open(method, file)
        xhr.onload = () => {
            resolve(JSON.parse(xhr.response))
        }
        xhr.send()
    })
    return promise
}

// End(0)

// Board setup
let board = document.querySelector('.board')
function Cases() {
    let array = []
    let row = []
    let count = 1
    for (let i = 1; i < 128; i = i + 2){
        row.push(board.childNodes[i])
        if (count % 8 == 0) { array.push(row); row = [] }
        count++
    }
    return array
}let cases = Cases()
function BlackandWhite() {
    for (let row = 0; row < 8; row++){
        for (let col = 0; col < 8; col++){
            let isdark = (row % 2) != (col % 2)
            if (isdark) { cases[row][col].style.cssText = `background-color: ${ConfigObj.colorBlack}`}
        }
    }
    for (let row = 0; row < 8; row++){
        for (let col = 0; col < 8; col++){
            let isdark = (row % 2) != (col % 2)
            if (!isdark) { cases[row][col].style.cssText = `background-color: ${ConfigObj.colorWhite}`}
        }
    }
}
// End
let CasesState
function putpieces() {
    let initial
    if(!ConfigObj.normal) {
        initial = ConfigObj.CUSTOM
    }
    else if (ConfigObj.whiteOnTop) {
        initial = ConfigObj.WHITEONTOP
    }
    else if(!ConfigObj.whiteOnTop) {
        initial = ConfigObj.BLACKONTOP
    }
    return initial
}



function drawpieces() {
    for (let i = 0; i < 8; i++){
        for (let j = 0; j < 8; j++){
            switch (CasesState[i][j]) {
                case ('WP'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.pawn.white} draggable = "false">`
                    break
                case ('BP'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.pawn.black} draggable = "false">`
                    break
                case ('WR'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.rook.white} draggable = "false">`
                    break
                case ('BR'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.rook.black} draggable = "false">`
                    break
                case ('WN'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.knight.white} draggable = "false">`
                    break
                case ('BN'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.knight.black} draggable = "false">`
                    break
                case ('WB'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.bishop.white} draggable = "false">`
                    break
                case ('BB'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.bishop.black} draggable = "false">`
                    break
                case ('WQ'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.queen.white} draggable = "false">`
                    break
                case ('BQ'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.queen.black} draggable = "false">`
                    break
                case ('WK'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.king.white} draggable = "false">`
                    break
                case ('BK'):
                    cases[i][j].innerHTML = `<img src = ${PiecesObj.king.black} draggable = "false">`
                    break
                

            }
        }
    }

}
// Event listners
function showMoves(row, col) {
    if (arrayEquals(legalmove(row,col),[])) {
        cases[row][col].style.cssText = `background-color : ${ConfigObj.colorifnothing}`

    }
    else {
        const colored = legalmove(row, col)
        colored.forEach((Index) => {
            if (CasesState[Index[0]][Index[1]] !== null) {
                cases[Index[0]][Index[1]].style.cssText = `background-color:${ConfigObj.colorifEat}`
            }
            else {
               cases[Index[0]][Index[1]].style.cssText = `background-color:${ConfigObj.colorOnClick}` 
            }
        }
        )
        cases[row][col].style.cssText = `background-color:${ConfigObj.colorTargeted}`
    }
}
function clearup(colors, lastindex, row, col) {
    const Indexes = legalmove(lastindex[0], lastindex[1])
    Indexes.push([lastindex[0],lastindex[1]])
    
    for (let i = 0; i < Indexes.length; i++){
        cases[Indexes[i][0]][Indexes[i][1]].style.backgroundColor = colors[i]
    }
}

function listen() {
    let state = 'unselected'
    let Move = 0
    let legal = []
    let colors = []
    let turns = ['white', 'black']
    let LastIndex = null

    let goNext= true

    function selected(i, j) {
        if (arrayEquals([i, j], LastIndex)) {
            clearup(colors[Move], LastIndex, i, j)
            state='unselected'
            goNext = false
        }
        if (includesArray(legal[Move], [i, j])) {
            clearup(colors[Move],LastIndex,i,j)
            move(LastIndex,[i,j])
            if (turn === 'white') { turn = 'black' }
            else {turn = 'white'}
            state = 'unselected'
            goNext= false
        }
        else {
            clearup(colors[Move],LastIndex,i,j)
            state = 'unselected'
        }
        Move++
    }
    function unselected(i, j) {
        const LEGAL = legalmove(i, j)
        LEGAL.push([i, j])
        const array = []
        for (let i = 0; i < LEGAL.length; i++){
            console.log(LEGAL)
            array.push(cases[LEGAL[i][0]][LEGAL[i]
            [1]].style.backgroundColor)
        }
        LEGAL.pop()
        colors.push(array)
        showMoves(i, j)
        state = 'selected'
        legal.push(LEGAL)
        LastIndex = [i, j]
        
    }
    for (let i = 0; i < 8; i++){
        for (let j = 0; j < 8; j++){
            cases[i][j].addEventListener("mousedown", () => {
                console.log(eaten)
                if (state === 'selected') {
                    selected(i,j)
                }
                if (state === 'unselected') {
                    if (goNext) {
                        unselected(i,j)
                    }
                    goNext= true
                }
            })
        }
    }
}
// Legal moves

function legalmove(row, col) {
    const Case = CasesState[row][col]
    if (Case === null) { return [] }
    //legalmovesindex.push([row,col])
    const legalmovesindex = []
    const color = CasesState[row][col].charAt(0)
    const PieceType = CasesState[row][col].charAt(1)
    if (color == 'W') {
        if(turn === 'black'){return []}
        switch (PieceType) {
            case ("P"):
                return pawn(row,col,'B')
            case ('N'):
                return knight(row, col, 'W')
            case ('B'):
                return bishop(row, col, 'B')
            case ('R'):
                return rook(row, col, 'B')
            case ('Q'):
                return bishop(row, col, 'B').concat(rook(row, col, 'B'))
            case ('K'):
                return king(row, col, 'B')
        }
    }
    if (color == 'B') {
        if(turn === 'white'){return []}
        switch (PieceType) {
            case ("P"):
                return pawn(row,col,'W')
            case ("N"):
                return knight(row, col, 'B')
            case ('B'):
                return bishop(row, col, 'W')
            case ('R'):
                return rook(row, col, 'W')
            case ('Q'):
                return bishop(row, col, 'W').concat(rook(row, col, 'W'))
            case ('K'):
                return king(row, col, 'W')
        }
    }
    return []
}

// White knight moves
function pawn(row, col, color) {
    let legalmovesindex = []
    if (!ConfigObj.whiteOnTop && color == 'B'
    ||ConfigObj.whiteOnTop && color == 'W') {
        if (row == 6) {
            if (CasesState[5][col] == null && CasesState[4][col] == null) {
                legalmovesindex.push([4, col])
            }
        }
        if (row !== 0) {
            if (CasesState[row - 1][col] == null) {
                legalmovesindex.push([row - 1, col])
            }
        }
                
        if (row > 0) {
            if (CasesState[row - 1][col - 1] !== null && CasesState[row - 1][col - 1] !== undefined) {
                if (CasesState[row - 1][col - 1].charAt(0) == color) {
                    legalmovesindex.push([row - 1, col - 1])
                }
            }
            if (CasesState[row - 1][col + 1] !== null && CasesState[row - 1][col + 1] !== undefined) {
                if (CasesState[row - 1][col + 1].charAt(0) == color) {
                    legalmovesindex.push([row - 1, col + 1])
                }
            }
        }
        return legalmovesindex
    }
    if (ConfigObj.whiteOnTop && color == 'B'
    ||!ConfigObj.whiteOnTop && color == 'W') {
        if (row == 1) {
                    if (CasesState[3][col] == null&&CasesState[2][col]==null) {
                        legalmovesindex.push([3, col])
                    }
                    
                }
                if (row !== 7) {
                   if (CasesState[row + 1][col] == null) {  
                        legalmovesindex.push([row + 1, col])
                } 
                }
                if (row < 7) {
                    if (CasesState[row + 1][col - 1] !== null && CasesState[row + 1][col - 1] !== undefined) {
                    if (CasesState[row + 1][col - 1].charAt(0) == color) {
                        legalmovesindex.push([row + 1, col - 1])
                    }
                }
                if (CasesState[row + 1][col + 1] !== null && CasesState[row + 1][col + 1] !== undefined) {
                    if (CasesState[row + 1][col + 1].charAt(0) == color) {
                        legalmovesindex.push([row+1,col+1])
                }
                }
        }
        return legalmovesindex
    }
}
function knight(row, col, color) {//Color not to eat(will fix later
    let legalmovesindex= []
    if (row > 1) {
                    if (col > 0) {
                        legalmovesindex.push([row - 2, col - 1])
                        if (CasesState[row - 2][col - 1]!== null) {
                            if (CasesState[row - 2][col - 1].charAt(0) == color) {
                                legalmovesindex.pop()
                            }
                        }
                    }
                    if (col < 7) {
                        legalmovesindex.push([row - 2, col + 1])
                        if (CasesState[row - 2][col + 1]!== null) {
                            if (CasesState[row - 2][col + 1].charAt(0) == color) {
                                legalmovesindex.pop()
                            }
                        }
                    }
                }
                if (row < 6) {
                    if (col > 0) {
                        legalmovesindex.push([row + 2, col - 1])
                        if (CasesState[row + 2][col - 1]!== null) {
                            if (CasesState[row + 2][col - 1].charAt(0) == color) {
                                legalmovesindex.pop()
                            }
                        }
                    }
                    if (col < 7) {
                        legalmovesindex.push([row + 2, col + 1])
                        if (CasesState[row + 2][col + 1]!== null) {
                            if (CasesState[row + 2][col + 1].charAt(0) == color) {
                                legalmovesindex.pop()
                            }
                        }
                    }
                }
                if (col > 1) {
                    if (row > 0) {
                        legalmovesindex.push([row - 1, col - 2])
                        if (CasesState[row - 1][col - 2] !== null) {
                            if (CasesState[row - 1][col - 2].charAt(0) == color) {
                                legalmovesindex.pop()
                            }
                        }
                    }
                    if(row<7){
                        legalmovesindex.push([row + 1, col - 2])
                        if (CasesState[row + 1][col - 2]!== null) {
                            if (CasesState[row + 1][col - 2].charAt(0) == color) {
                                legalmovesindex.pop()
                            }
                        }
                    }
                }
                if (col < 6) {
                    if (row > 0) {
                        legalmovesindex.push([row - 1, col + 2])
                        if (CasesState[row - 1][col + 2] !== null) {
                            if (CasesState[row - 1][col + 2].charAt(0) == color) {
                                legalmovesindex.pop()
                            }
                        }
                    }
                    if(row<7){
                        legalmovesindex.push([row + 1, col + 2])
                        if (CasesState[row + 1][col + 2]!== null) {
                            if (CasesState[row + 1][col + 2].charAt(0) == color) {
                                legalmovesindex.pop()
                            }
                        }
                    }
                    
    }
    return legalmovesindex
}
function bishop(row, col, color) {
    let legalmovesindex = []
    // Left Up move
    let i = 1
    let Break = false
    while (row - i !== -1 && col - i !== -1 && !Break) {
        if (CasesState[row - i][col - i] == null) {
            legalmovesindex.push([row - i,col - i])
            i++
        }
        else if (CasesState[row - i][col - i].charAt(0) == color) {
            legalmovesindex.push([row - i,col - i])
            Break = true
        }
        else {
            Break = true
        }
    }
    // Right Up move
    i = 1
    Break = false
    while (row - i !== -1 && col + i !== 8 && !Break) {
        if (CasesState[row - i][col + i] == null) {
            legalmovesindex.push([row - i,col + i])
            i++
        }
        else if (CasesState[row - i][col + i].charAt(0) == color) {
            legalmovesindex.push([row - i,col + i])
            Break = true
        }
        else {
            Break = true
        }
    }
    // Left Down
    i = 1
    Break = false
    while (row + i !== 8 && col - i !== -1 && !Break) {
        if (CasesState[row + i][col - i] == null) {
            legalmovesindex.push([row + i,col - i])
            i++
        }
        else if (CasesState[row + i][col - i].charAt(0) == color) {
            legalmovesindex.push([row + i,col - i])
            Break = true
        }
        else {
            Break = true
        }
    }
    // Right Down
    i = 1
    Break = false
    while (row + i !== 8 && col + i !== 8 && !Break) {
        if (CasesState[row + i][col + i] == null) {
            legalmovesindex.push([row + i,col + i])
            i++
        }
        else if (CasesState[row + i][col + i].charAt(0) == color) {
            legalmovesindex.push([row + i,col + i])
            Break = true
        }
        else {
            Break = true
        }
    }
    return legalmovesindex
}
function rook(row, col, color) {
    let legalmovesindex = []
    // Up move
    let i = 1
    let Break = false
    while (row - i !== -1 && !Break) {
        if (CasesState[row - i][col] == null) {
            legalmovesindex.push([row - i,col])
            i++
        }
        else if (CasesState[row - i][col].charAt(0) == color) {
            legalmovesindex.push([row - i,col])
            Break = true
        }
        else {
            Break = true
        }
    }
    // Down move
    i = 1
    Break = false
    while (row + i !== 8 && !Break) {
        if (CasesState[row + i][col] == null) {
            legalmovesindex.push([row + i,col])
            i++
        }
        else if (CasesState[row + i][col].charAt(0) == color) {
            legalmovesindex.push([row + i,col])
            Break = true
        }
        else {
            Break = true
        }
    }
    // Left move
    i = 1
    Break = false
    while (col - i !== -1 && !Break) {
        if (CasesState[row][col - i] == null) {
            legalmovesindex.push([row,col - i])
            i++
        }
        else if (CasesState[row][col - i].charAt(0) == color) {
            legalmovesindex.push([row,col - i])
            Break = true
        }
        else {
            Break = true
        }
    }

    //Right move
    i = 1
    Break = false
    while (col + i !== 8 && !Break) {
        if (CasesState[row][col + i] == null) {
            legalmovesindex.push([row,col + i])
            i++
        }
        else if (CasesState[row][col + i].charAt(0) == color) {
            legalmovesindex.push([row,col + i])
            Break = true
        }
        else {
            Break = true
        }
    }
    return legalmovesindex
}
function king(row, col, color) {
    let legalmovesindex = []
    // up
    if (row - 1 !== -1) {
        // strictly up
        if (CasesState[row - 1][col] == null) {
            legalmovesindex.push([row - 1, col])
        }
        else if (CasesState[row - 1][col].charAt(0) == color) {
            legalmovesindex.push([row - 1, col])
        }
        if (col - 1 !== -1) {
            // left
            if (CasesState[row - 1][col - 1] == null) {
                legalmovesindex.push([row - 1, col - 1])
            }
            else if (CasesState[row - 1][col - 1].charAt(0) == color) {
                legalmovesindex.push([row - 1, col - 1])
            }
        }
        if (col + 1 !== 8) {
            // right
            if (CasesState[row - 1][col + 1] == null) {
                legalmovesindex.push([row - 1, col + 1])
            }
            else if (CasesState[row - 1][col + 1].charAt(0) == color) {
                legalmovesindex.push([row - 1, col + 1])
            }
        }
    }
    // down
    if (row + 1 !== 8) {
        if (CasesState[row + 1][col] == null) {
            legalmovesindex.push([row + 1, col])
        }
        else if (CasesState[row + 1][col].charAt(0) == color) {
            legalmovesindex.push([row + 1, col])
        }
        if (col - 1 !== -1) {
            // left
            if (CasesState[row + 1][col - 1] == null) {
                legalmovesindex.push([row + 1, col - 1])
            }
            else if (CasesState[row + 1][col - 1].charAt(0) == color) {
                legalmovesindex.push([row + 1, col - 1])
            }
        }
        if (col + 1 !== 8) {
            // right
            if (CasesState[row + 1][col + 1] == null) {
                legalmovesindex.push([row + 1, col + 1])
            }
            else if (CasesState[row + 1][col + 1].charAt(0) == color) {
                legalmovesindex.push([row + 1, col + 1])
            }
        }
    }
    if (col - 1 !== -1) {
        // left
        if (CasesState[row][col - 1] == null) {
            legalmovesindex.push([row, col - 1])
        }
        else if (CasesState[row][col - 1].charAt(0) == color) {
            legalmovesindex.push([row, col - 1])
        }
    }
    if (col + 1 !== 8) {
        // left
        if (CasesState[row][col + 1] == null) {
            legalmovesindex.push([row, col + 1])
        }
        else if (CasesState[row][col + 1].charAt(0) == color) {
            legalmovesindex.push([row, col + 1])
        }
    }
    return legalmovesindex
}
// Move

function move(a, b) {
    cases[b[0]][b[1]].innerHTML = cases[a[0]][a[1]].innerHTML
    cases[a[0]][a[1]].innerHTML = ""
    if (CasesState[b[0]][b[1]] !== null) {
        eaten.push(CasesState[b[0]][b[1]])
    }
    CasesState[b[0]][b[1]] = CasesState[a[0]][a[1]]
    CasesState[a[0]][a[1]] = null
}

// Main
function main() {
    // Put pieces in place
    BlackandWhite()
    drawpieces()
    listen()


}


sendHttpRequest('Get', 'config.json')
    .then((Data) => {
        ConfigObj = Data
        sendHttpRequest('Get', 'pieces.json')
            .then((Data) => {
                PiecesObj = Data
                CasesState = putpieces()
                main()
    })
})
