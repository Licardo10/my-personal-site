import { Github, Mail, MapPin, Code2, BookOpen, Camera, Dumbbell } from "lucide-react";
import aboutData from "../../../content/about.json";

const iconMap: Record<string, any> = { Code2, BookOpen, Camera, Dumbbell };

interface Hobby {
  icon: string;
  title: string;
  desc: string;
}

interface AboutData {
  name: string;
  role: string;
  avatar: string;
  location: string;
  bio: string[];
  skills: string[];
  hobbies: Hobby[];
  social: { github: string; email: string };
}

const data = aboutData as AboutData;

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
      <h1 className="section-title">关于我</h1>
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="md:col-span-1">
          <div className="card">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-accent-dark mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white">
              {data.avatar}
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-2">{data.name}</h2>
            <p className="text-dark-400 text-sm text-center mb-4">{data.role}</p>
            <div className="space-y-2 text-sm text-dark-400">
              <p className="flex items-center gap-2"><MapPin size={14} /> {data.location}</p>
              <p className="flex items-center gap-2"><Code2 size={14} /> 全栈开发</p>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <a href={data.social.github} target="_blank" rel="noopener noreferrer"
                className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 text-dark-300 hover:text-accent transition-all" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href={`mailto:${data.social.email}`}
                className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 text-dark-300 hover:text-accent transition-all" aria-label="Email">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-accent" />个人简介
            </h3>
            <div className="text-dark-300 leading-relaxed space-y-3">
              {data.bio.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Code2 size={20} className="text-accent" />技能
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-dark-700 rounded-lg text-sm text-dark-300 border border-dark-600">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Camera size={20} className="text-accent" />兴趣爱好
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {data.hobbies.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <div key={item.title} className="card-hover">
                {Icon && <Icon className="text-accent mb-3" size={24} />}
                <h4 className="text-white font-medium mb-1">{item.title}</h4>
                <p className="text-dark-400 text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

