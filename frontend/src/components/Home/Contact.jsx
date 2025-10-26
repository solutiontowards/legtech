import React, { useState } from "react";
import { Mail, Phone, Send, Loader2, Building, ChevronDown, User, MessageSquare, BookUser, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Restrict mobile input to 10 digits and only numbers
    if (name === "mobile") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" }); // clear error when typing
    }
  };

  // validate inputs
  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!formData.subject) {
      newErrors.subject = "Please select a subject";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const encode = (data) => {
    return Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
      )
      .join("&");
  };

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({ "form-name": "contact", ...formData }),
    })
      .then(() => {
        setFormData({ name: "", mobile: "", subject: "", message: "" });
        toast.success("Thank you! Your message has been sent.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-100/80 rounded-full mb-4">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contact <span className="text-blue-600">Our Team</span>
          </h2>
          <p className="text-lg text-gray-600">
            We'd love to hear from you! Reach out for inquiries or support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT SIDE → Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h3>
              <p className="text-gray-500 mb-8">We're here to help. Reach out to us anytime.</p>
              
              <div className="space-y-6">
                <InfoItem 
                  icon={<Mail className="w-5 h-5 text-blue-500" />} 
                  title="Email Us" 
                  content="support@legtech.com" 
                  href="mailto:support@legtech.com"
                />
                <InfoItem 
                  icon={<Phone className="w-5 h-5 text-blue-500" />} 
                  title="Call Us" 
                  content="+91-7029959582" 
                  href="tel:+917029959582"
                />
                <InfoItem 
                  icon={<Building className="w-5 h-5 text-blue-500" />} 
                  title="Our Office" 
                  content="Swami Vivekananda Rd, Kolkata, West Bengal 700157" 
                />
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-64 lg:h-80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58934.84952375276!2d88.425126660884!3d22.60048363666464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02754a79bf63bf%3A0xbbbcc2e3c00e3980!2sNew%20Town%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1755708470366!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  className="border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" 
                  title="LegTech Location"
                ></iframe>
              </div>
          </div>

          {/* RIGHT SIDE → Contact Form */}
          <div className="lg:col-span-7 bg-gradient-to-br from-white to-slate-50 p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Send a Message</h3>
            <p className="text-gray-500 mb-8">Have a question or project? Drop us a line.</p>

            <form
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* This hidden input is still needed for Netlify's build bot */}
              <input type="hidden" name="bot-field" />
              <input type="hidden" name="form-name" value="contact"></input>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-10 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.name
                      ? "border-red-500 focus:ring-red-500 pr-10"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    placeholder="John Doe"
                  />
                  {errors.name && <AlertCircle className="w-5 h-5 text-red-500 absolute right-3.5 top-1/2 -translate-y-1/2" />}
                </div>
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1.5">{errors.name}</p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="mobile"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength="10"
                    className={`w-full pl-11 pr-10 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.mobile
                      ? "border-red-500 focus:ring-red-500 pr-10"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    placeholder="9876543210"
                  />
                  {errors.mobile && <AlertCircle className="w-5 h-5 text-red-500 absolute right-3.5 top-1/2 -translate-y-1/2" />}
                </div>
                {errors.mobile && (
                  <p className="text-red-600 text-sm mt-1.5">{errors.mobile}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Subject
                </label>
                <div className="relative">
                  <BookUser className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full appearance-none pl-11 pr-10 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.subject
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      } ${!formData.subject ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    <option value="" >Select a subject</option>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.subject && (
                  <p className="text-red-600 text-sm mt-1.5">{errors.subject}</p>
                )}
              </div>

              {/* Message (optional) */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Your Message (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="w-5 h-5 text-gray-400 absolute left-3.5 top-4" />
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const InfoItem = ({ icon, title, content, href }) => {
  const contentClass = "text-sm text-gray-600 group-hover:text-blue-600 transition-colors";
  const Wrapper = href ? 'a' : 'div';
  
  return (
    <Wrapper href={href} className="flex items-start group">
      <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className={contentClass}>{content}</p>
      </div>
    </Wrapper>
  );
};

export default Contact;
