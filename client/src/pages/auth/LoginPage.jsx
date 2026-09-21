import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const ROLE_HOME = { OWNER: "/owner", ADMIN: "/admin", TENANT: "/tenant" };

const PHOTO_URL = "";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("sessionExpired")) {
      sessionStorage.removeItem("sessionExpired");
      setError("Sesi kamu telah berakhir. Silakan login kembali.");
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}.`);
      navigate(ROLE_HOME[user.role] || "/login");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="organic-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-10 sm:px-12">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-lg font-bold text-white">
                T
              </div>
              <span className="text-lg font-semibold tracking-tight text-gray-900">
                Tinggal<span className="text-primary-600">.in</span>
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">WELCOME BACK</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to manage your kost.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            <p className="mb-1 font-medium text-gray-600">Demo accounts (password: password123)</p>
            <p>Owner: owner@kostdemo.local</p>
            <p>Admin: admin@kostdemo.local</p>
            <p>Tenant: tenant@kostdemo.local</p>
          </div>
        </div>

        <div
          className="relative hidden min-h-[420px] md:block"
          style={
            PHOTO_URL
              ? { backgroundImage: `url(${PHOTO_URL})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!PHOTO_URL && (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-4.5a2.25 2.25 0 00-4.5 0V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white/90">
                Tinggal<span className="text-white/60">.in</span>
              </p>
              <p className="text-xs text-white/70">
                Ganti gambar ini dengan foto kost kamu: simpan file di{" "}
                <code className="rounded bg-white/10 px-1 py-0.5">client/public/</code> lalu isi{" "}
                <code className="rounded bg-white/10 px-1 py-0.5">PHOTO_URL</code> di LoginPage.jsx
              </p>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}