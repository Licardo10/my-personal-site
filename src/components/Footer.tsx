import { Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-dark-700/50 mt-20">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-400 text-sm">
            &copy; {new Date().getFullYear()} YuMo. Built with Next.js &amp; Tailwind CSS.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Licardo10" target="_blank" rel="noopener noreferrer"
              className="text-dark-400 hover:text-accent transition-colors" aria-label="GitHub">
              <Github size={20} />
            </a>
            <a href="mailto:yumo@example.com"
              className="text-dark-400 hover:text-accent transition-colors" aria-label="Email">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
