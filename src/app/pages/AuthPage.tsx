import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";

export function AuthPage() {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<"login" | "signup">("login");

  const [formData, setFormData] =
    useState({
      name: "",
      age: "",
      email: "",
      password: "",
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      // =====================
      // SIGNUP
      // =====================
      if (activeTab === "signup") {
        const response = await axios.post(API_ENDPOINTS.SIGNUP, {
          name: formData.name,
          age: formData.age,
          email: formData.email,
          password: formData.password,
        });

        const data = response.data;
        if (data?.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          navigate("/");
          return;
        }

        alert("Signup successful, please login");
        setActiveTab("login");
      } else {
        const response = await axios.post(API_ENDPOINTS.LOGIN, {
          email: formData.email,
          password: formData.password,
        });

        const data = response.data;

        if (data?.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          navigate("/");
          return;
        }

        alert("Login failed: missing token");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">StyleVibe</h1>
            <p className="text-white/80">Your Fashion Social Hub</p>
          </div>

          <div className="flex gap-2 mb-6 bg-white/10 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 rounded-xl ${activeTab === "login"
                ? "bg-white text-purple-600"
                : "text-white/80"
                }`}
            >
              Login
            </button>

            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-3 rounded-xl ${activeTab === "signup"
                ? "bg-white text-purple-600"
                : "text-white/80"
                }`}
            >
              Signup
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {activeTab === "signup" && (
              <>
                <input
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-white/20 text-white"
                />

                <input
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-white/20 text-white"
                />
              </>
            )}

            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-white/20 text-white"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-white/20 text-white"
            />

            <button className="w-full p-3 bg-white text-purple-600 rounded-xl font-bold">
              {activeTab === "login" ? "Login" : "Signup"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}