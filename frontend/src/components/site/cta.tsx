import { motion } from "motion/react";
import {
  MessageSquarePlus,
  Send,
  CheckCircle2,
  Mail,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect, FormEvent } from "react";

export function CTA() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    // Dispatch feedback directly to shaj7492@gmail.com via Gmail Web Compose
    const recipientEmail = "shaj7492@gmail.com";
    const subject = encodeURIComponent("[Zekros Feedback]");
    const body = encodeURIComponent(
      `Sender Email: ${email}\n\nFeedback Message:\n${message}`
    );
    
    // Open Gmail web app compose box directly in a new tab
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");

    setSubmitted(true);
  };

  const handleReset = () => {
    setEmail("");
    setMessage("");
    setSubmitted(false);
  };

  // Auto-dismiss success screen after 4.5 seconds
  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => {
      handleReset();
    }, 4500);
    return () => clearTimeout(timer);
  }, [submitted]);

  return (
    <section id="cta" className="relative px-4 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass group relative overflow-hidden rounded-3xl border border-white/15 bg-black/80 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl transition-all duration-700 hover:border-white/30"
        >
          {/* Background Image: feedback-cta-bg.jpg */}
          <img
            src="/assets/feedback-cta-bg.jpg"
            alt="Zekros Feedback Background"
            className="absolute inset-0 size-full object-cover opacity-65 mix-blend-luminosity pointer-events-none transition-transform duration-1000 group-hover:scale-105"
          />

          {/* Lightened Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/75 pointer-events-none" />
          <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-white/5 blur-3xl transition-all duration-700 group-hover:bg-white/10" />

          {/* Form Content */}
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 font-mono text-xs text-white/90 uppercase tracking-widest backdrop-blur-md">
              <MessageSquarePlus className="size-3.5 text-white" />
              <span>Feedback & Community</span>
            </div>

            <h2 className="text-gradient mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Shape the Future of Zekros.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70 font-normal">
              Found a bug, have a feature request, or want to suggest a new arena mode? Send us your thoughts directly.
            </p>

            {submitted ? (
              /* Success State Card */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-8 text-center backdrop-blur-md"
              >
                <div className="mx-auto grid size-12 place-items-center rounded-full border border-emerald-400/40 bg-emerald-500/10">
                  <CheckCircle2 className="size-6 text-emerald-400" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-white">
                  Feedback Received!
                </h3>
                <p className="mt-2 text-xs text-white/70 max-w-md mx-auto leading-relaxed">
                  Thank you for helping us refine Zekros. Your message has been sent to our development team.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-mono font-medium text-white transition-all hover:bg-white/20 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              /* Feedback Form */
              <form onSubmit={handleSubmit} className="mt-8 text-left space-y-4">
                
                {/* Email Input */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Your Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full h-11 rounded-xl border border-white/15 bg-black/60 pl-10 pr-4 text-xs font-sans text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                    />
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                    Message / Details
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    className="w-full rounded-xl border border-white/15 bg-black/60 p-3.5 text-xs font-sans text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-xs font-semibold text-black transition-all hover:bg-white/90 cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  <Send className="size-3.5" />
                  <span>Send Feedback</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
