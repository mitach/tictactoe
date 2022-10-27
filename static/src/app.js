/* globals io */

document.getElementById('init-form').addEventListener('submit', onSubmit);

function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const roomId = formData.get('room');

    init(roomId);
}

function init(roomId) {
    socket = io();

    socket.on('connect', () => {
        socket.emit('selectRoom', roomId);
    });


socket.on('symbol', newSymbol => {
    symbol = newSymbol;
    socket.on('position', place);
    socket.on('newGame', newGame);
    startGame();
});

socket.on('error', (error) => {
    alert(error)
})


}

let symbol = '';
let socket = null;

const combinations = [
    ['00', '01', '02'],
    ['10', '11', '12'],
    ['20', '21', '22'],
    ['00', '10', '20'],
    ['01', '11', '21'],
    ['02', '12', '22'],
    ['00', '11', '22'],
    ['02', '11', '20'],
];


function startGame() {
    document.getElementById('init').style.display = 'none';
    const board = document.getElementById('board');
    board.style.display = 'block';

    board.addEventListener('click', onClick);
    newGame();
}

function newGame() {
    [...document.querySelectorAll('.cell')].forEach(e => e.textContent = '');
}


function onClick(event) {
    if (event.target.classList.contains('cell')) {
        if (event.target.textContent == '') {
            const id = event.target.id;
            console.log(id);
            // place(id);
            socket.emit('position', {
                id,
                symbol
            })
        }
    }
}

function place(data) {
    document.getElementById(data.id).textContent = data.symbol;
    setTimeout(hasCombination, 0);
}

function hasCombination() {
    for (let combination of combinations) {
        const result = combination.map(pos => document.getElementById(pos).textContent).join('');
        if (result == 'XXX') {
            endGame('X');
        } else if (result == 'OOO') {
            endGame('O');
        }
    }
}

function endGame(winner) {
    const choice = confirm(`PLayer ${winner} wins!\nDo you want a rematch?`);
    if (choice) {
        socket.emit('newGame');
        // newGame();
    }
}