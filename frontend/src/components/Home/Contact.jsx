import React, { useState } from "react";
import {
  Mail,
  Phone,
  Send,
  Loader2,
  Building,
  ChevronDown,
  User,
  MessageSquare,
  BookUser,
  AlertCircle,
} from "lucide-react";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    if (!formData.subject) newErrors.subject = "Please select a subject";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const encode = (data) => {
    return Object.keys(data)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  };

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
      .finally(() => setLoading(false));
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50 overflow-hidden" id="contact">
      <div className="w-full mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 text-xs font-semibold tracking-wide text-blue-600 uppercase bg-blue-100 rounded-full">
            Contact Us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 leading-tight">
            Get in Touch with <span className="text-blue-600">Our Team</span>
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            We're here to support you. Reach out for inquiries, assistance, or collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT SIDE CONTACT INFO */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h3>
              <p className="text-gray-500 mb-8">Feel free to reach us anytime. We're always happy to assist.</p>

              <div className="space-y-6">
                <InfoItem
                  icon={<Mail className="w-6 h-6 text-blue-500" />}
                  title="Email"
                  content="support@legtech.com"
                  href="mailto:support@legtech.com"
                />
                <InfoItem
                  icon={<Phone className="w-6 h-6 text-blue-500" />}
                  title="Phone"
                  content="+91-7029959582"
                  href="tel:+917029959582"
                />
                <InfoItem
                  icon={<Building className="w-6 h-6 text-blue-500" />}
                  title="Office"
                  content="Swami Vivekananda Rd, Kolkata, West Bengal 700157"
                />
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200 h-72 md:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58934.84952375276!2d88.425126660884!3d22.60048363666464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02754a79bf63bf%3A0xbbbcc2e3c00e3980!2sNew%20Town%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1755708470366!5m2!1sen!2sin"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="LegTech Location"
              ></iframe>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="lg:col-span-7 p-10 bg-white rounded-3xl shadow-2xl border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Send a Message</h3>
            <p className="text-gray-500 mb-8">Have questions? We'd love to hear from you.</p>

            <form
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <input type="hidden" name="bot-field" />
              <input type="hidden" name="form-name" value="contact" />

              {/* Name */}
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                icon={<User className="w-5 h-5 text-gray-400" />}
                placeholder="John Doe"
              />

              {/* Mobile */}
              <FormInput
                label="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                error={errors.mobile}
                icon={<Phone className="w-5 h-5 text-gray-400" />}
                placeholder="9876543210"
              />

              {/* Subject */}
              <FormSelect
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                error={errors.subject}
              />

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="relative">
                  <MessageSquare className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <textarea
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center disabled:bg-blue-400"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const FormInput = ({ label, icon, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
      <input
        {...props}
        className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:ring-2 transition-all ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      {error && <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />}
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

const FormSelect = ({ label, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <BookUser className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <select
        {...props}
        className={`w-full pl-11 pr-10 py-3 bg-white border rounded-xl appearance-none focus:ring-2 transition-all ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
        }`}
      >
        <option value="">Select a subject</option>
        <option value="support">Technical Support</option>
        <option value="sales">Sales Inquiry</option>
        <option value="partnership">Partnership</option>
        <option value="other">Other</option>
      </select>
      <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

const InfoItem = ({ icon, title, content, href }) => {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper href={href} className="flex items-start group cursor-pointer">
      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-all">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">{content}</p>
      </div>
    </Wrapper>
  );
};

export default Contact;