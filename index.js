let express = require('express'),
    { random, floor } = Math,
    map = [],
    turn = 1, // 1 for player 1, -1 for player 2
    playerProduction = { '-1': 0, '1': 0 },
    playerID = {}; // unique ID to give when a player claim permission

function uniqueID(side) {
    if (!playerID[side])
        playerID[side] = floor(random() * 1000000).toString();
    return playerID[side];
}

function lookUpID(id) {
    for (let side in playerID)
        if (playerID[side] === id)
            return side;
    return null;
}

// create map
for (let i = 0; i < 10; i++) {
    map.push([]);
    let row = map[i];
    for (let j = 0; j < 10; j++) {
        row.push({});
        let cell = row[j];
        cell.env = floor(random() * 8);
        cell.side = Math.round(random() * 2 - 1);
    }
}

function getNeighbor(x, y) {
    let neighbors = { '-1': 0, '0': 0, '1': 0 };
    x = parseInt(x);
    y = parseInt(y);

    for (let i = -1; i <= 1; i++)
        for (let j = -1; j <= 1; j++) {
            if (
                map[y + i] === undefined
                || map[y + i][x + j] === undefined
            ) continue;
            let neighbor = map[y + i][x + j];
            if (neighbor)
                neighbors[neighbor.side]++;
        }

    return neighbors;
}

function tick() {
    for (let row in map)
        for (let col in map[row]) {
            let cell = map[row][col],
                neighbors = getNeighbor(col, row);
            let env = cell.env;

            if (
                neighbors['-1'] > neighbors['1']
                && neighbors['-1'] > env
            )
                cell.nextSide = -1;
            else if (
                neighbors['-1'] < neighbors['1']
                && neighbors['1'] > env
            )
                cell.nextSide = 1;
            else if (
                neighbors['-1'] < env
                || neighbors['1'] < env
            )
                cell.nextSide = 0;
            else
                cell.nextSide = cell.side;
        }

    for (let row of map)
        for (let cell of row) {
            playerProduction[cell.side]++;
            cell.side = cell.nextSide;
        }
}

// simple express html server
let app = express();

function returnError(res) {
    res.status(404);
    res.send('Not found, could be error');
}

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// send available side
app.get('/player', (req, res) => {
    res.send([
        playerID['-1']? '' : '-1',
        playerID['1']? '' : '1',
    ]);
});

app.post('/player', (req, res) => {
    if (playerID[req.body.side] || req.body.side == 0)
        returnError(res);
    else {
        playerID[req.body.side] = uniqueID(req.body.side);
        res.send(playerID[req.body.side]);
    }
});

app.get('/map', (req, res) => {
    res.send(map);
})

app.post('/place', (req, res) => {
    let side = lookUpID(req.body.id),
        x = req.body.x,
        y = req.body.y;

    if (
        !side
        || side != turn
        || map[y][x].side != 0
        || map[y][x].env == 0
        || playerProduction[side] < map[y][x].env
        || getNeighbor(x, y)[side] == 0
    ) {
        console.log(map[y][x].side)
        console.log(map[y][x].env)
        console.log(getNeighbor(x, y)[side])
        returnError(res);
    }
    else {
        map[y][x].side = side;
        playerProduction[side] -= map[y][x].env;
        res.send('OK');
    }
})

app.get('/tick', (req, res) => {
    res.send({
        turn,
        playerProduction
    });
})

app.post('/tick', (req, res) => {
    let side = lookUpID(req.body.id);
    if (!side || side != turn)
        returnError(res);
    else {
        tick();
        turn = -turn;
        res.send('OK');
    }
})

app.listen(8000)