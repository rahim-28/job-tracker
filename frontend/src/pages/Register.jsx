import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../services/api"

function RegisterPage() {

  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const register = async () => {

    try {

      await API.post("/register", {
        name,
        email,
        password
      })

      alert("Account created!")

      navigate("/login")

    } catch (err) {
      alert(err.response?.data?.detail || "Error creating account")
    }
  }

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h2>Create Account</h2>

        <input
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={register}>Register</button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>

    </div>
  )
}

export default RegisterPage