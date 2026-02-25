import { useEffect, useState } from "react"
import API from "../services/api"
import { useNavigate } from "react-router-dom"
import { FaTrash, FaEdit, FaPlus, FaBriefcase } from "react-icons/fa"
import toast from "react-hot-toast"

const STATUS_OPTIONS = ["All", "Applied", "Interview", "Offer", "Rejected"]

function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [userName, setUserName] = useState("")
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [status, setStatus] = useState("Applied")
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    loadJobs()
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const res = await API.get("/me")
      setUserName(res.data.name)
    } catch {
      console.log("Failed to load user")
    }
  }

  const loadJobs = async () => {
    try {
      const res = await API.get("/jobs")
      setJobs(res.data)
    } catch {
      toast.error("Failed to load jobs")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/", { replace: true })
  }

  const addJob = async () => {
    if (!title || !company) {
      toast.error("Please fill in title and company")
      return
    }

    try {
      await API.post("/jobs", { title, company, status })
      toast.success("Job added!")
      setTitle("")
      setCompany("")
      setStatus("Applied")
      loadJobs()
    } catch {
      toast.error("Failed to add job")
    }
  }

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return

    try {
      await API.delete(`/jobs/${id}`)
      toast.success("Job deleted")
      loadJobs()
    } catch {
      toast.error("Failed to delete job")
    }
  }

  const startEdit = (job) => {
    setEditingId(job.id)
    setTitle(job.title)
    setCompany(job.company)
    setStatus(job.status)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setTitle("")
    setCompany("")
    setStatus("Applied")
  }

  const updateJob = async () => {
    try {
      await API.put(`/jobs/${editingId}`, { title, company, status })
      toast.success("Job updated!")
      setEditingId(null)
      setTitle("")
      setCompany("")
      setStatus("Applied")
      loadJobs()
    } catch {
      toast.error("Failed to update job")
    }
  }

  const stats = {
    applied: jobs.filter((j) => j.status === "Applied").length,
    interview: jobs.filter((j) => j.status === "Interview").length,
    offer: jobs.filter((j) => j.status === "Offer").length,
    rejected: jobs.filter((j) => j.status === "Rejected").length,
  }

  const filteredJobs = jobs.filter((j) => {
    const matchesFilter = filter === "All" || j.status === filter
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="dashboard">

      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-left">
          <h2>Job Tracker</h2>
          {userName && (
            <span className="welcome-msg">
              Welcome, <strong>{userName}</strong> 😇
            </span>
          )}
        </div>
        <button onClick={logout}>Logout</button>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat applied">
          <h3>{stats.applied}</h3>
          <p>Applied</p>
        </div>

        <div className="stat interview">
          <h3>{stats.interview}</h3>
          <p>Interviews</p>
        </div>

        <div className="stat offer">
          <h3>{stats.offer}</h3>
          <p>Offers</p>
        </div>

        <div className="stat rejected">
          <h3>{stats.rejected}</h3>
          <p>Rejected</p>
        </div>
      </div>

      {/* Job Form */}
      <div className="job-form">
        <input
          placeholder="Job title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>

        {editingId ? (
          <>
            <button className="update" onClick={updateJob}>
              Update
            </button>

            <button className="cancel" onClick={cancelEdit}>
              Cancel
            </button>
          </>
        ) : (
          <button onClick={addJob}>
            <FaPlus /> Add
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="search-filter">
        <input
          className="search-input"
          placeholder="Search by title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-tabs">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loader-container">
          <div className="loader" />
          <p>Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state">
          <FaBriefcase className="empty-icon" />
          <h3>{jobs.length === 0 ? "No jobs yet" : "No results found"}</h3>
          <p>
            {jobs.length === 0
              ? "Add your first job application above!"
              : "Try a different search or filter"}
          </p>
        </div>
      ) : (
        <div className="jobs">
          {filteredJobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <p>{job.company}</p>

              <span className={`badge ${job.status}`}>
                {job.status}
              </span>

              <div className="actions">
                <button onClick={() => startEdit(job)}>
                  <FaEdit />
                </button>

                <button onClick={() => deleteJob(job.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard