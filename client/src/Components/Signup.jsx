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

export default function Signup({ setUser, toggleLogin }) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [age, setAge] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")

    async function handleSignup(e) {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        try {
            const res = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, firstName, lastName, age }),
                credentials: 'include'
            })

            if (!res.ok) {
                setError("Signup failed")
                return
            }

            const data = await res.json()
            if (data.user) {
                setUser(data.user)
            } else if (data.success) {
                alert("Signup successful. Please login.")
                toggleLogin()
            }

        } catch (err) {
            console.error(err)
            setError("Server error")
        }
    }

    const formValid = firstName.trim() && lastName.trim() && age && email.trim() && password.trim() && confirmPassword.trim()

    return (
        <Box sx={style}>
            <h2 className="auth-title">Sign Up</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                    <TextField required label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
                    <TextField required label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
                </Stack>
                <TextField required label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                <TextField required label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField required type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <TextField required type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </Stack>

            <Button className="auth-primary-btn" disabled={!formValid} onClick={handleSignup}>Sign Up</Button>
            <Button className="auth-secondary-btn" onClick={toggleLogin}>Already have an account? Login Here</Button>
        </Box>
    )
}
