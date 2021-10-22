const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname,'public')))

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
let kingMoved = false
let ConfigObj = undefined
let PiecesObj = undefined
let turn = 'white'
let eaten = []
let playerscount = 0
let players = {
    white: {
        color: 'white',
        id: null
    },
    black: {
        color: 'black',
        id: null
    }
}

// End(0)

// Board setup

let CasesState

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
    if (color == 'W') {
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
    if (color == 'B') {
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



// Main
let colors = [null,'white','black']

io.on('connection', socket => {
    playerscount++
    socket.emit('message', 'welcome to chess')
    socket.broadcast.emit('message', 'your opponent has joined');

    socket.on('disconnect', () => {
        playerscount--
        io.emit('message', 'your opponent has left')
    })
    socket.on('move', Data => {
        CasesState = Data
        io.emit('requestDraw',CasesState)
    })

    
    socket.on('start', CasesState => {
        socket.emit('requeststart', CasesState)
        socket.emit('private',colors[playerscount])
    })
})

const PORT = 3000 || process.env.PORT


server.listen(PORT, ()=> console.log(PORT))