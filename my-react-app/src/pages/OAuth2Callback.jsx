import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Spin } from "antd"
import { setAccessToken } from "../api/tokenStorage"
import userService from "../api/userService"
import { useAuth } from "../contexts/AuthContext"

export default function OAuth2Callback() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get("accessToken")

    if (!accessToken) {
      navigate("/login?error=oauth2_failed", { replace: true })
      return
    }

    const completeLogin = async () => {
      try {
        setAccessToken(accessToken)

        const profileRes = await userService.getProfile()
        const userData = profileRes.data.data
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)

        navigate("/dashboard", { replace: true })
      } catch {
        navigate("/login?error=oauth2_failed", { replace: true })
      }
    }
    completeLogin()
  }, [navigate, setUser])

  return (
    <div className="vh-center-screen">
      <Spin size="large" />
      <h2 className="vh-h3" style={{ margin: 0 }}>Đang đăng nhập...</h2>
    </div>
  )
}
