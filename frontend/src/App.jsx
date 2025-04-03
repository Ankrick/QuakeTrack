import { Outlet } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import { Analytics } from "@vercel/analytics/react"

function App() {

  return (
    <>
      <Navbar/>
      <div className="p-5 h-screen">
        <Outlet/>
        <Analytics/>
      </div>
    </>
  )
}

export default App
