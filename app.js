const express = require('express')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/players/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//GET List Of Player API
app.get('/players/', async (request, response) => {
  const getListOfPlayersQuery = `
    SELECT *
    FROM cricket_team;
   `
  const playersList = await db.all(getListOfPlayersQuery)
  const playersArray = playersList => {
    return {
      playerId: playersList.player_id,
      playerName: playersList.player_name,
      jerseyNumber: playersList.jersey_number,
      role: playersList.role,
    }
  }
  response.send(playersList.map(eachPlayer => playersArray(eachPlayer)))
})

//Add New Player API
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role) VALUES('${playerName}',${jerseyNumber},'${role}');`
  const dbResponse = await db.run(addPlayerQuery)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

//GET player API
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`
  let player = await db.get(getPlayerQuery)
  response.send(player)
})

//Update Player Details API
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
UPDATE cricket_team
SET player_name='${playerName}',
jersey_number=${jerseyNumber},
role='${role}';`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Delete player API
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerDetails = `DELETE FROM cricket_team WHERE player_id=${playerId};`
  await db.run(deletePlayerDetails)
  response.send('Player Removed')
})
