import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../services/api"

function LoginPage() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const login = async () => {

    try {

      const form = new URLSearchParams()

      form.append("username", email)
      form.append("password", password)

      const res = await API.post("/login", form)

      localStorage.setItem("token", res.data.access_token)

      navigate("/dashboard")

    } catch {
      alert("Invalid login")
    }
  }

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h2>Welcome Back</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>

        <p>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>

      </div>

    </div>
  )
}

export default LoginPage