import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./LoginForm.css";

function LoginForm({ setIsLoggedIn }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    localStorage.setItem("loggedIn", "true");
    setIsLoggedIn(true);
    navigate("/"); // go to dashboard
    const userInfo = {
      name: data.username,
    };
    localStorage.setItem("userInfo", JSON.stringify(userInfo));

  };

  return (
    <div className="container">
      <div className="login-image" />
      <div className="login-form-wrapper">
        {isSignIn ? (
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <p className="login-heading">Sign In</p>
            <input
              type="text"
              id="username"
              placeholder="Username"
              {...register("username", {
                required: "Username is required",
              })}
            />
            {errors.username && (
              <p className="error">{errors.username.message}</p>
            )}

            <div className="pass-holder">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              <div className="eye" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {errors.password && (
              <p className="error">{errors.password.message}</p>
            )}
            <a href="#" className="forgot-pass">
              Forgot password?
            </a>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>

            <p className="toggle-link">
              Don't have an account? <span onClick={toggleMode}>Sign Up</span>
            </p>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <p className="login-heading">Sign Up</p>
            <input
              type="text"
              id="username"
              placeholder="Username"
              {...register("username", {
                required: "Username is required",
              })}
            />
            {errors.username && (
              <p className="error">{errors.username.message}</p>
            )}

            <input
              type="email"
              id="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
            />
            {errors.email && <p className="error">{errors.email.message}</p>}

            <div className="pass-holder">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              <div className="eye" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {errors.password && (
              <p className="error">{errors.password.message}</p>
            )}

            <div className="pass-holder">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
                })}
              />
              <div className="eye" onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword.message}</p>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Sign Up"}
            </button>

            <p className="toggle-link">
              Already have an account? <span onClick={toggleMode}>Sign In</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
