import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { navItems } from "./Header";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-terminals-gray-900 text-terminals-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Logo className="text-terminals-white" />
            <p className="text-terminals-gray-300 text-sm leading-relaxed max-w-md">
              The Terminals is a university-oriented intellectual group dedicated to 
              empowering minds and connecting communities through knowledge sharing, 
              research, and academic excellence.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-terminals-gray-300">terminals.1444@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-terminals-gray-300">+8801511241012</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-terminals-gray-300">IIT, University of Dhaka</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-terminals-white">Quick Links</h4>
            <ul className="space-y-2">
              {navItems.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-terminals-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-terminals-gray-700">
          <div className="flex justify-center">
            <div className="text-sm text-terminals-gray-400">
              © {currentYear} The Terminals. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;