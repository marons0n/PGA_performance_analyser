import { useState } from "react"
import { Box, Stack, TextField, Button } from "@mui/material"



const style = {
    position: 'absolute',
    top: '30%',
    left: '35%',
    width: '30%',
    bgcolor: 'rgb(3, 75, 0)',
    color: 'white',
    p: 4,
    borderRadius: '8px',
    '& .MuiInputBase-input': { color: 'white' },
    '& .MuiInputLabel-root': { color: 'white' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: 'white' },
        '&:hover fieldset': { borderColor: 'white' },
        '&.Mui-focused fieldset': { borderColor: 'white' },
    },

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
                body: JSON.stringify({ email, password }),
                credentials: 'include'
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
            <h2 className="auth-title">Login</h2>
            <Stack spacing={2}>
                <TextField required label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField required type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Stack>

            <Button className="auth-primary-btn" disabled={!formValid} onClick={handleLogin}>Login</Button>
            <Button className="auth-secondary-btn" onClick={toggleSignup}>No account? Sign Up Here</Button>
        </Box>
    </>)
}