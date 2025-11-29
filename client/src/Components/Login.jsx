import { useState } from "react"
import { Box, Stack, TextField, Button } from "@mui/material"



const style = {
    position: 'absolute',
    top: '40%',
    left: '35%',
    width: '30%',
    bgcolor: 'white',
    boxShadow: 10,
    p: 4,
}



export default function Login({ setUser, toggleSignup }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    async function handleLogin(e) {
        e.preventDefault()
        setError("")

        try {
            const res = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            if (!res.ok) {
                setError("Invalid username or password")
                return
            }

            const data = await res.json()
            setUser(data.user)

        } catch (err) {
            console.error(err)
            setError("Server error")
        }
    }


    const formValid = email.trim() && password.trim()


    return (<>
        <Box sx={style}>
            <h2>Login</h2>
            <Stack spacing={2}>
                <TextField required label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField required type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Stack>

            <Button variant="contained" disabled={!formValid} onClick={handleLogin}>Login</Button>
            <Button sx={{ textTransform: 'none', fontSize: '12px' }} onClick={toggleSignup}>No account? Sign Up Here</Button>
        </Box>
    </>)
}