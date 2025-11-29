import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import bcrypt from 'bcryptjs'


// import { query } from './db/postgres.js';
import { supabase } from './db/supabase.js'; // Adjust path as needed


// create the app
const app = express()
// it's nice to set the port number so it's always the same
app.set('port', process.env.PORT || 3000);
// set up some middleware to handle processing body requests
app.use(express.json())
// set up some midlleware to handle cors
app.use(cors())


// Helper functions

const API_KEY = process.env.SPORTSDATA_KEY
const GOLF_API = "https://api.sportsdata.io/golf/v2/json"

async function sportsApi(endpoint) { // Makes a request to sportsdata.io
    const url = `${GOLF_API}/${endpoint}?key=${API_KEY}`
    const res = await fetch(url)
    return res.json()
}


app.get('/', (req, res) => {
    res.send("Welcome to the PGA Player Performance Analyzer API!")
})

app.get('/up', (req, res) => {
    res.json({ status: 'up' })
})

//AUTHENTICATION

// Register user
// Register user
app.post('/auth/register', async (req, res) => {
    const { email, password, firstName, lastName, age } = req.body

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const { error } = await supabase
        .from('users')
        .insert([{ email, password: hashedPassword, firstName, lastName, age }])

    if (error) {
        console.error(error)
        return res.status(500).json({ error: error.message })
    }

    res.json({ success: true })
})

// Login user
// Login user
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body

    const { data, error } = await supabase.from('users').select('*').eq('email', email)

    if (error) {
        console.error(error)
        return res.status(500).json({ error: error.message })
    }

    if (data.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = data[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" })
    }

    res.json({ success: true, user: user })
})


// Player Routes

// Search players
app.get('/players/search', async (req, res) => {
    const queryString = req.query.query

    const players = await sportsApi(`Players`) //Use external API directly (simple)

    const filtered = players.filter(p =>
        p.FirstName.toLowerCase().includes(queryString.toLowerCase()) ||
        p.LastName.toLowerCase().includes(queryString.toLowerCase())
    )

    res.json(filtered)
})


// Get player details
app.get('/players/:id', async (req, res) => {
    const id = req.params.id

    const { data: cached } = await supabase.from('players').select('*').eq('id', id)

    if (cached && cached.length > 0) {
        return res.json(cached[0])
    }

    //else get player from api
    const players = await sportsApi(`Players`)
    const player = players.find(p => p.PlayerID == id)

    if (!player) {
        return res.status(404).json({ error: "Player not found" })
    }

    //and then after, cache into db so we dont needa get it again
    await supabase.from('players').insert([{
        id: player.PlayerID,
        name: player.FirstName + " " + player.LastName,
        country: player.Country,
        json_data: player
    }])

    res.json(player)

})


//plater season stats
app.get('/players/:id/stats', async (req, res) => {
    const id = req.params.id

    const stats = await sportsApi(`PlayerSeasonStats/${id}`)
    res.json(stats)
})


//Compare
app.get('/players/compare', async (req, res) => {
    const ids = req.query.ids.split(',')

    const allPlayers = await sportsApi(`Players`)
    const selected = allPlayers.filter(p => ids.includes(p.PlayerID.toString()))

    res.json(selected)
})


// tourney Routes

app.get('/tournaments/search', async (req, res) => {
    const queryString = req.query.query
    const tournaments = await sportsApi(`Tournaments`)

    const filtered = tournaments.filter(t => t.Name.toLowerCase().includes(queryString.toLowerCase()))

    res.json(filtered)
})

app.get('/tournaments/:id', async (req, res) => {
    const id = req.params.id
    const leaderboard = await sportsApi(`Leaderboard/${id}`)
    res.json(leaderboard)
})




//server start
app.listen(app.get('port'), () => {
    console.log('App running at http://localhost:%d', app.get('port'))
})

