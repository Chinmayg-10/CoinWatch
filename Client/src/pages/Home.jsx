// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { Wallet, BarChart3, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f12] text-gray-100">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 py-20 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Smarter <span className="text-indigo-400">Finance</span> Starts Here
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            Track, analyze, and optimize your spending with real-time insights and a modern, easy-to-use platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg font-semibold bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg font-semibold border border-gray-600 hover:border-indigo-500 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {[
          {
            icon: <Wallet className="text-indigo-400" size={40} />,
            title: "Expense Tracking",
            desc: "Log and categorize every expense with ease and precision."
          },
          {
            icon: <BarChart3 className="text-indigo-400" size={40} />,
            title: "Analytics Dashboard",
            desc: "Get clear, interactive visual reports of your spending."
          },
          {
            icon: <Target className="text-indigo-400" size={40} />,
            title: "Smart Budgeting",
            desc: "Set monthly budgets and receive real-time alerts."
          }
        ].map((feature, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 text-center py-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} CoinWatch. Built for smarter money management.
      </footer>
    </div>
  );
}




