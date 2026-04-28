import { Zap, Mail, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg p-2 mr-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                 SkillNova
                </h2>
                <p className="text-xs text-gray-400 leading-none">
                  Powered by AI
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Revolutionizing resume analysis with AI-powered insights to help
              you land your dream job.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/in/parshotamlal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-blue-400 transition-colors"
              >
                <Linkedin className="h-5 w-5 text-gray-400" />
              </a>
              <a
                href="https://github.com/parshotamlal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hover:text-blue-400 transition-colors"
              >
                <Github className="h-5 w-5 text-gray-400" />
              </a>
              <a
                href="https://twitter.com/parshotamsinghx"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-5 w-5 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button type="button" className="hover:text-white">
                  Home
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white">
                  Upload Resume
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white">
                  Features
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white">
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button type="button" className="hover:text-white">
                  About Us
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white">
                  Blog
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white">
                  Careers
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400 mb-4">
              <li>
                <button type="button" className="hover:text-white">
                  Help Center
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white">
                  Terms of Service
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white">
                  Status
                </button>
              </li>
            </ul>
            <div className="flex items-center text-sm text-gray-400">
              <Mail className="h-4 w-4 mr-2" />
              <a href="mailto:parshotamworks@gmail.com" className="hover:underline">
                parshotamworks@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SkillNova. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
            <button type="button" className="hover:text-white">
              Privacy
            </button>
            <button type="button" className="hover:text-white">
              Terms
            </button>
            <button type="button" className="hover:text-white">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
