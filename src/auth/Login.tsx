
import { useState, type FormEvent } from "react";
import API from "../services/api";

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

function Login({ onLoginSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("vickstack_token", response.data.token);

      localStorage.setItem(
        "vickstack_user",
        JSON.stringify(response.data.user)
      );

      onLoginSuccess();
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const axiosError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        setError(
          axiosError.response?.data?.message ||
            "Login failed. Please try again."
        );
      } else {
        setError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-heading">
          <h2>Welcome back!</h2>
          <p>Sign in to continue shopping with VICKSTACK.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="password-wrapper">
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button type="button" onClick={onSwitchToRegister}>
            Create account
          </button>
        </p>
      </div>
    </section>
  );
}

export default Login;
