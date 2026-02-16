import React from "react";
import { Link, NavLink } from "react-router-dom";
import { MdOutlinePhone, MdOutlineMail } from "react-icons/md";
import { FaWhatsapp, FaFacebook } from "react-icons/fa6";
import { IoMapOutline, IoLogoInstagram } from "react-icons/io5";
import { HiUsers, HiEye } from "react-icons/hi";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useStats } from "../context/StatsContext";
import visa from "../assets/visa.png";
import master from "../assets/master.jpg";
import upi from "../assets/upi.jpg";
import w from "../assets/w.jpg";

function Footer() {
  const { isDark } = useTheme();
  const { stats, loading } = useStats();

  return (
    <footer className={`rounded-lg py-10 px-6 md:px-16 transition-colors duration-300 ${isDark
        ? 'bg-gray-900 text-gray-300'
        : 'bg-gray-100 text-gray-700'
      }`}>
      {/* Animated Grid */}
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-2 gap-8 md:grid-cols-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        {/* Quick Links */}
        <motion.div whileHover={{ scale: 1.02 }}>
          <h1 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>Quick Links</h1>
          <ul className="space-y-2">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact Us" },
              { to: "/cart", label: "My Orders" },
              { to: "/account", label: "My Account" },
              { to: "/pay", label: "Payment Policy" },
              { to: "/terms", label: "Terms & Conditions" },
              { to: "/refund-policy", label: "Refund Policy" },
            ].map((link, index) => (
              <motion.li
                key={index}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `hover:underline transition ${isDark
                      ? `hover:text-white ${isActive ? "text-white font-medium" : ""}`
                      : `hover:text-gray-900 ${isActive ? "text-gray-900 font-medium" : ""}`
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div whileHover={{ scale: 1.02 }}>
          <h1 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>Get In Touch</h1>
          <ul className="space-y-3 text-sm">
            <motion.li
              className="flex items-center gap-2"
              whileHover={{ x: 6 }}
            >
              <MdOutlinePhone className="text-[#008585] text-lg" /> 7889588384
            </motion.li>
            <motion.li
              className="flex items-center gap-2"
              whileHover={{ x: 6 }}
            >
              <FaWhatsapp className="text-green-500 text-lg" /> 7889588384
            </motion.li>
            <motion.li
              className="flex items-center gap-2"
              whileHover={{ x: 6 }}
            >
              <MdOutlineMail className="text-red-400 text-lg" /> sshubjk@gmail.com
            </motion.li>
            <motion.li
              className="flex items-start gap-2"
              whileHover={{ x: 6 }}
            >
              <IoMapOutline className="text-blue-400 text-lg mt-1" />
              <span>Main Bazar, Rajouri, Jammu & Kashmir - 185131</span>
            </motion.li>
          </ul>
        </motion.div>

        {/* Payments */}
        <motion.div whileHover={{ scale: 1.02 }}>
          <h1 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>We Accept</h1>
          <motion.div
            className="flex gap-3 items-center flex-wrap"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <img src={visa} alt="visa" className="h-8 w-auto" />
            <img src={master} alt="master" className="h-8 w-auto" />
            <img src={upi} alt="upi" className="h-8 w-auto" />
            <img src={w} alt="wallet" className="h-8 w-auto" />
          </motion.div>
        </motion.div>

        {/* Social */}
        <motion.div whileHover={{ scale: 1.02 }}>
          <h1 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>Social</h1>
          <div className="flex flex-col gap-3">
            <motion.div whileHover={{ x: 6 }}>
              <Link
                to="#facebook"
                className={`flex items-center gap-2 transition ${isDark ? 'hover:text-white' : 'hover:text-gray-900'
                  }`}
              >
                <FaFacebook className="text-blue-500" /> Facebook
              </Link>
            </motion.div>
            <motion.div whileHover={{ x: 6 }}>
              <Link
                to="#instagram"
                className={`flex items-center gap-2 transition ${isDark ? 'hover:text-white' : 'hover:text-gray-900'
                  }`}
              >
                <IoLogoInstagram className="text-pink-500" /> Instagram
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Bar */}
      <motion.div
        className={`border-t mt-10 pt-5 text-sm transition-colors duration-300 ${isDark
            ? 'border-gray-700 text-gray-400'
            : 'border-gray-300 text-gray-500'
          }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} SHIVALIK SERVICE HUB. All Rights Reserved.
          </div>

          {/* Stats */}
          {!loading && (
            <motion.div
              className="flex items-center gap-4 text-xs"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                title={`Total Users: ${stats.totalUsers.toLocaleString()}`}
              >
                <HiUsers className="text-blue-500" />
                <span>{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                title={`Total Views: ${stats.totalViews.toLocaleString()}`}
              >
                <HiEye className="text-green-500" />
                <span>{stats.totalViews.toLocaleString()}</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </footer>
  );
}

export default Footer;
