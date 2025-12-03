import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'


// import { query } from './db/postgres.js';
import { supabase } from './db/supabase.js'; // Adjust path as needed


// create the app
const app = express()
// it's nice to set the port number so it's always the same
app.set('port', process.env.PORT || 3000);

// set up some middleware to handle processing body requests
app.use(express.json())
app.use(cookieParser())

// set up some midlleware to handle cors
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))


// Helper functions

app.get("/schedule/2024", async (req, res) => {
    try {
        const apiKey = process.env.RAPIDAPI_KEY;
        const apiHost = process.env.RAPIDAPI_HOST_LIVE;

        if (!apiKey || !apiHost) {
            return res.status(500).json({ error: "Missing RAPIDAPI_KEY or RAPIDAPI_HOST in .env" });
        }

        const url = "https://live-golf-data.p.rapidapi.com/schedule?orgId=1&year=2024";

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-rapidapi-key": apiKey,
                "x-rapidapi-host": apiHost
            }
        });

        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch schedule" });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("Schedule Fetch Error:", error);
        res.status(500).json({ error: "Server error fetching schedule" });
    }
});

app.get("/world-rankings", async (req, res) => {
    try {
        const apiKey = process.env.RAPIDAPI_KEY;
        const apiHost = process.env.RAPIDAPI_HOST;

        if (!apiKey || !apiHost) {
            return res.status(500).json({
                error: "Missing RAPIDAPI_KEY or RAPIDAPI_HOST in .env"
            });
        }

        const url = "https://golf-leaderboard-data.p.rapidapi.com/world-rankings";

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-rapidapi-key": apiKey,
                "x-rapidapi-host": apiHost,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch world rankings" });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("World Rankings Fetch Error:", error);
        res.status(500).json({ error: "Server error fetching world rankings" });
    }
});

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "58c51c9bfemsh5ae42472b4e6e96p188532jsnd6e194609cdf"
const SLASH_GOLF_URL = "https://live-golf-data.p.rapidapi.com"

async function fetchSlashGolf(endpoint, params = {}) {
    const url = new URL(`${SLASH_GOLF_URL}/${endpoint}`)
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    while (true) {
        try {
            const res = await fetch(url, {
                headers: {
                    'x-rapidapi-host': 'live-golf-data.p.rapidapi.com',
                    'x-rapidapi-key': RAPIDAPI_KEY
                }
            })

            if (!res.ok) {
                // If rate limited or server error, wait and retry
                console.log(`API Error ${res.status}: Retrying in 2 seconds...`)
                await new Promise(resolve => setTimeout(resolve, 2000))
                continue
            }

            return await res.json()
        } catch (err) {
            console.error("Network Error: Retrying in 2 seconds...", err)
            await new Promise(resolve => setTimeout(resolve, 2000))
        }
    }
}


app.get('/', (req, res) => {
    res.send("Welcome to the PGA Player Performance Analyzer API!")
})

app.get('/up', (req, res) => {
    res.json({ status: 'up' })
})

app.get("/rankings/2025", async (req, res) => {
    try {
        const apiKey = process.env.SPORTSDATA_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Missing SPORTS_DATA_API_KEY in .env" });
        }

        const url = `https://api.sportsdata.io/golf/v2/json/Rankings/2025?key=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch rankings" });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("Rankings Fetch Error:", error);
        res.status(500).json({ error: "Server error fetching rankings" });
    }
});

app.get("/api/golf/courses", async (req, res) => {
    try {
        const allCourses = [];
        // Fetch 5 pages to get ~100 courses
        for (let page = 1; page <= 5; page++) {
            const apiUrl = `https://api.golfcourseapi.com/v1/courses?page=${page}`;
            const response = await fetch(apiUrl, {
                headers: {
                    "Authorization": `Key ${process.env.GOLF_API_KEY}`
                }
            });

            if (!response.ok) {
                console.error(`Failed to fetch page ${page}: ${response.statusText}`);
                continue;
            }

            const data = await response.json();
            if (data.courses && Array.isArray(data.courses)) {
                allCourses.push(...data.courses);
            }
        }

        res.json({ courses: allCourses });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

app.get("/api/golf/search", async (req, res) => {
    const userQuery = req.query.query;

    if (!userQuery) {
        return res.status(400).json({ error: "Missing search query" });
    }

    try {
        const apiUrl = `https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(userQuery)}`;

        const response = await fetch(apiUrl, {
            headers: {
                "Authorization": `Key ${process.env.GOLF_API_KEY}`
            }
        });

        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch search results" });
    }
});

//AUTHENTICATION

// Register user
app.post('/auth/register', async (req, res) => {
    const { email, password, firstName, lastName, age } = req.body

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const { data, error } = await supabase
        .from('users')
        .insert([{ email, password: hashedPassword, firstName, lastName, age }])
        .select()

    if (error) {
        console.error(error)
        return res.status(500).json({ error: error.message })
    }

    // Set cookie
    if (data && data.length > 0) {
        res.cookie('token', data[0].id, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }) // 1 day
        res.json({ success: true, user: data[0] })
    } else {
        res.json({ success: true })
    }
})

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

    // Set cookie
    res.cookie('token', user.id, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }) // 1 day

    res.json({ success: true, user: user })
})

// Check auth status
app.get('/auth/me', async (req, res) => {
    const token = req.cookies.token

    if (!token) {
        return res.json({ user: null })
    }

    const { data, error } = await supabase.from('users').select('*').eq('id', token).single()

    if (error || !data) {
        return res.json({ user: null })
    }

    res.json({ user: data })
})

// Logout
app.post('/auth/logout', (req, res) => {
    res.clearCookie('token')
    res.json({ success: true })
})


// Player Routes

// Get all players (Top Rankings)
app.get('/players', async (req, res) => {
    try {
        // Fetch OWGR Rankings (Stat ID 186)
        const data = await fetchSlashGolf('stats', { year: '2025', statId: '186' })

        // Helper to handle potential MongoDB-style number objects
        const extractValue = (val) => {
            if (val && typeof val === 'object') {
                if (val.$numberDouble) return val.$numberDouble
                if (val.$numberInt) return val.$numberInt
                if (val.$numberLong) return val.$numberLong
            }
            return val
        }

        // Map to a simplified format
        const players = data.rankings.map(p => ({
            id: p.playerId,
            name: `${p.firstName} ${p.lastName}`,
            rank: `No. ${p.rank}`,
            country: p.country || 'Unknown',
            wins: extractValue(p.numWins),
            top10s: extractValue(p.numTop10s),
            events: extractValue(p.events),
            points: extractValue(p.totalPoints)
        }))

        res.json(players)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to fetch players" })
    }
})


app.get('/players/:id', async (req, res) => {
    const id = req.params.id;

    // check cache
    const { data: cached } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

    if (cached) {
        return res.json(cached);
    }

    // fetch from Slash Golf
    const player = await fetchSlashGolf('players', { playerId: id });

    if (!player || !player.players || player.players.length === 0) {
        return res.status(404).json({ error: "Player not found" });
    }

    const p = player.players[0];

    // save to DB
    await supabase.from('players').insert([{
        id: p.playerId,
        name: `${p.firstName} ${p.lastName}`,
        country: p.country,
        json_data: p
    }]);

    res.json(p);
});



app.get('/players/:id/stats', async (req, res) => {
    const id = req.params.id;

    const data = await fetchSlashGolf('stats', { playerId: id });

    res.json(data);
});



app.get('/players/compare', async (req, res) => {
    const ids = req.query.ids.split(',');

    const results = [];

    for (const id of ids) {
        const player = await fetchSlashGolf('players', { playerId: id });
        if (player.players && player.players.length > 0) {
            results.push(player.players[0]);
        }
    }

    res.json(results);
});



// tourney Routes

app.get('/tournaments/search', async (req, res) => {
    const queryString = req.query.query.toLowerCase();

    const schedule = await fetchSlashGolf('schedule', {
        year: '2025',
        orgId: '1'
    });

    const filtered = schedule.tournaments.filter(t =>
        t.tournName.toLowerCase().includes(queryString)
    );

    res.json(filtered);
});


app.get('/tournaments/:id', async (req, res) => {
    const id = req.params.id;

    const leaderboard = await fetchSlashGolf('leaderboard', {
        tournId: id,
        year: '2025',
        orgId: '1'
    });

    res.json(leaderboard);
});


// tourney Routes

app.get('/tournaments/search', async (req, res) => {
    const queryString = req.query.query.toLowerCase();

    const schedule = await fetchSlashGolf('schedule', {
        year: '2025',
        orgId: '1'
    });

    const filtered = schedule.tournaments.filter(t =>
        t.tournName.toLowerCase().includes(queryString)
    );

    res.json(filtered);
});


app.get('/tournaments/:id', async (req, res) => {
    const id = req.params.id;

    const leaderboard = await fetchSlashGolf('leaderboard', {
        tournId: id,
        year: '2025',
        orgId: '1'
    });

    res.json(leaderboard);
});

// Get all tournaments from DB
app.get('/tournaments', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tournaments')
            .select('*')
            .order('start_date', { ascending: true });

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(500).json({ error: "Failed to fetch tournaments" });
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Enrich Tournament (Image)
app.post('/api/golf/tournaments/enrich', async (req, res) => {
    const { tournament } = req.body;
    if (!tournament || !tournament.id) return res.status(400).json({ error: "Invalid tournament data" });

    try {
        // 1. Check if image already exists in DB
        const { data: cached, error: dbError } = await supabase
            .from('tournaments')
            .select('*')
            .eq('id', tournament.id)
            .single();

        if (cached && cached.image_url) {
            return res.json(cached);
        }

        // 2. Fetch Image if missing
        console.log(`Fetching image for tournament: ${tournament.name}`);
        const query = `${tournament.name} golf`;
        let imageUrl = null;

        try {
            const serpResult = await new Promise((resolve, reject) => {
                getJson({
                    q: query,
                    engine: "google_images",
                    ijn: "0",
                    tbs: "isz:l",
                    api_key: process.env.SERPAPI_KEY
                }, (json) => {
                    if (json.error) reject(json.error);
                    else resolve(json);
                });
            });

            if (serpResult["images_results"]?.length > 0) {
                const validImage = serpResult["images_results"].find(img =>
                    img.original &&
                    !img.original.includes("fbsbx.com") &&
                    !img.original.includes("facebook.com") &&
                    !img.original.includes("instagram.com")
                );
                imageUrl = validImage ? validImage.original : serpResult["images_results"][0].thumbnail;
            }
        } catch (serpErr) {
            console.error("SerpApi Failed:", serpErr);
        }

        // 3. Update Supabase
        if (imageUrl) {
            const { data: updated, error: updateError } = await supabase
                .from('tournaments')
                .update({ image_url: imageUrl })
                .eq('id', tournament.id)
                .select()
                .single();

            if (updateError) {
                console.error("Supabase Update Error:", updateError);
                // Return data with image even if save failed
                return res.json({ ...tournament, image_url: imageUrl });
            }
            return res.json(updated);
        }

        // No image found
        res.json(tournament);

    } catch (err) {
        console.error("Tournament Enrichment Error:", err);
        res.status(500).json({ error: "Failed to enrich tournament" });
    }
});

//server start
app.listen(app.get('port'), () => {
    console.log('App running at http://localhost:%d', app.get('port'))
})

