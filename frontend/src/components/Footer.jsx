import { Mail, Github, Twitter, Linkedin } from "lucide-react";
import Logo from "../../public/SkillNova-Logo.png";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 p-1">
                <img src={Logo} alt="ResumeAI Online — AI Resume Builder Logo" width={48} height={48} />
              </div>
              <div>
                <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ResumeAI Online
                </p>
                <p className="text-xs text-gray-400 leading-none">
                  Powered by AI
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              AI-powered resume builder and ATS checker helping 100,000+ job seekers
              in India, USA, UK & Canada land their dream jobs.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/in/parshotamlal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ResumeAI Online on LinkedIn"
                className="hover:text-blue-400 transition-colors"
              >
                <Linkedin className="h-5 w-5 text-gray-400" />
              </a>
              <a
                href="https://github.com/parshotamlal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ResumeAI Online on GitHub"
                className="hover:text-blue-400 transition-colors"
              >
                <Github className="h-5 w-5 text-gray-400" />
              </a>
              <a
                href="https://twitter.com/parshotamsinghx"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ResumeAI Online on Twitter/X"
                className="hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-5 w-5 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Product — use <Link> so Google can crawl these */}
          <nav aria-label="Product navigation">
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-white transition-colors">
                  AI Resume Analyzer
                </Link>
              </li>
              <li>
                <Link to="/check-ats-score" className="hover:text-white transition-colors">
                  ATS Score Checker
                </Link>
              </li>
              <li>
                <Link to="/templates" className="hover:text-white transition-colors">
                  Resume Templates
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company navigation">
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/parshotamlal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:parshotamworks@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support navigation">
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400 mb-4">
              <li>
                <Link
                  to="/help-center"
                  className="hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/Privacy-Policy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/Terms-of-Service"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/status"
                  className="hover:text-white transition-colors"
                >
                  Status
                </Link>
              </li>
            </ul>
            <div className="flex items-center text-sm text-gray-400">
              <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
              <a
                href="mailto:parshotamworks@gmail.com"
                className="hover:underline"
              >
                parshotamworks@gmail.com
              </a>
            </div>
          </nav>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} ResumeAI Online. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
            <Link to="/Privacy-Policy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/Terms-of-Service" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/help-center" className="hover:text-white transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
