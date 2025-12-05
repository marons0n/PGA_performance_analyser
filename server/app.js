import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import fs from 'fs/promises';


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



const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "58c51c9bfemsh5ae42472b4e6e96p188532jsnd6e194609cdf"
const SLASH_GOLF_URL = "https://live-golf-data.p.rapidapi.com"

async function fetchSlashGolf(endpoint, params = {}, host = 'live-golf-data.p.rapidapi.com') {
    const baseUrl = `https://${host}`;
    const url = new URL(`${baseUrl}/${endpoint}`)
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    while (true) {
        try {
            const res = await fetch(url, {
                headers: {
                    'x-rapidapi-host': host,
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


// to fetch players from the table
app.get('/players', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('players')
            .select('id, first_name, last_name, rank_current')
            .order('rank_current', { ascending: true });

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(500).json({ error: "Failed to fetch players" });
        }

        const mapped = data.map(p => ({
            id: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
            rank: p.rank_current
        }));

        res.json(mapped);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});



// to update the table with new rankings/players
app.get('/players/update', async (req, res) => {
    try {
        // Fetch from RapidAPI
        const response = await fetch('https://live-golf-data1.p.rapidapi.com/rankings', {
            headers: {
                'x-rapidapi-host': 'live-golf-data1.p.rapidapi.com',
                'x-rapidapi-key': process.env.RAPIDAPI_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const rankings = data.rankings; // array of ranking entries

        // Clear table
        const { error: deleteErr } = await supabase
            .from('players')
            .delete()
            .neq('id', -1); // hack to delete all rows

        if (deleteErr) throw deleteErr;

        // Insert all players
        const rows = rankings.map(r => ({
            id: r.athlete.id,
            first_name: r.athlete.firstName,
            last_name: r.athlete.lastName,
            rank_current: r.current,
            rank_previous: r.previous,
            rank_trend: r.trend,
            age: r.athlete.age,
            country: r.athlete.birthPlace?.country,
            total_points: r.recordStats.find(s => s.name === "totalPoints")?.value || null,
            average_points: r.recordStats.find(s => s.name === "averagePoints")?.value || null,
            total_events: r.recordStats.find(s => s.name === "totalEvents")?.value || null,
            flag_url: r.athlete.flag?.href
        }));

        const { error: insertErr } = await supabase
            .from('players')
            .insert(rows);

        if (insertErr) throw insertErr;

        res.json({ message: "Player rankings updated", count: rows.length });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});




app.get('/players/:id/details', async (req, res) => {
    try {
        const id = req.params.id;

        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', id)
            .single(); // ensures exactly one row

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows found
            console.error("Supabase Error:", error);
            return res.status(500).json({ error: "Failed to fetch player" });
        }

        if (!data) {
            return res.status(404).json({ error: "Player not found" });
        }

        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});







// tourney Routes




// tourney Routes



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

