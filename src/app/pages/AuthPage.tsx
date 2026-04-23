import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall, API_ENDPOINTS } from "../../config/api";
import { Loader } from "lucide-react";

export function AuthPage() {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<"login" | "signup">("login");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] =
    useState({
      name: "",
      age: "",
      email: "",
      password: "",
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(""); // Clear error on input change
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.email || !formData.password) {
        setError("Email and password are required");
        setLoading(false);
        return;
      }

      // =====================
      // SIGNUP
      // =====================
      if (activeTab === "signup") {
        if (!formData.name || !formData.age) {
          setError("Name and age are required for signup");
          setLoading(false);
          return;
        }

        try {
          const data = await apiCall(API_ENDPOINTS.SIGNUP, {
            method: "POST",
            data: {
              name: formData.name,
              age: formData.age,
              email: formData.email,
              password: formData.password,
            },
          });

          if (data?.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);
            console.log("✅ Signup successful");
            navigate("/");
            return;
          }

          setError(data?.message || "Signup failed");
        } catch (err: any) {
          const errorMsg = err?.response?.data?.message || err?.message || "Signup error";
          setError(`Signup failed: ${errorMsg}`);
          console.error("Signup error:", err);
        }
      }
      // =====================
      // LOGIN
      // =====================
      else {
        try {
          const data = await apiCall(API_ENDPOINTS.LOGIN, {
            method: "POST",
            data: {
              email: formData.email,
              password: formData.password,
            },
          });

          if (data?.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);
            console.log("✅ Login successful");
            navigate("/");
            return;
          }

          setError(data?.message || "Login failed: No token received");
        } catch (err: any) {
          const errorMsg = err?.response?.data?.message || err?.message || "Login error";
          setError(`Login failed: ${errorMsg}`);
          console.error("Login error:", err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:p-4 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl -top-32 sm:-top-48 -left-32 sm:-left-48 animate-pulse"></div>
        <div className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl -bottom-32 sm:-bottom-48 -right-32 sm:-right-48 animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">StyleVibe</h1>
            <p className="text-sm sm:text-base text-white/80">Your Fashion Social Hub</p>
          </div>

          <div className="flex gap-2 mb-6 bg-white/10 p-1 rounded-xl sm:rounded-2xl">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all ${activeTab === "login"
                ? "bg-white text-purple-600"
                : "text-white/80 hover:text-white"
                }`}
            >
              Login
            </button>

            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all ${activeTab === "signup"
                ? "bg-white text-purple-600"
                : "text-white/80 hover:text-white"
                }`}
            >
              Signup
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg sm:rounded-xl text-red-100 text-xs sm:text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

            {activeTab === "signup" && (
              <>
                <input
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-white/20 text-white placeholder-white/50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />

                <input
                  name="age"
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-white/20 text-white placeholder-white/50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </>
            )}

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-white/20 text-white placeholder-white/50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-white/20 text-white placeholder-white/50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base bg-white text-purple-600 rounded-lg sm:rounded-xl font-bold hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center gap-2 transition-all min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{activeTab === "login" ? "Logging in..." : "Signing up..."}</span>
                  <span className="sm:hidden">{activeTab === "login" ? "Login..." : "Signup..."}</span>
                </>
              ) : (
                activeTab === "login" ? "Login" : "Signup"
              )}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}