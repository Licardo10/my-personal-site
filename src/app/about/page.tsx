import { Github, Mail, MapPin, Code2, BookOpen, Camera } from "lucide-react";

const skills = ["JavaScript / TypeScript", "React", "Vue.js", "Node.js", "Python", "Git", "Docker", "RESTful API", "SQL", "Linux"];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
      <h1 className="section-title">关于我</h1>
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="md:col-span-1">
          <div className="card">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-accent-dark mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white">Y</div>
            <h2 className="text-xl font-bold text-white text-center mb-2">YuMo</h2>
            <p className="text-dark-400 text-sm text-center mb-4">开发者 / 学习者</p>
            <div className="space-y-2 text-sm text-dark-400">
              <p className="flex items-center gap-2"><MapPin size={14} /> China</p>
              <p className="flex items-center gap-2"><Code2 size={14} /> 全栈开发</p>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <a href="https://github.com/Licardo10" target="_blank" rel="noopener noreferrer"
                className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 text-dark-300 hover:text-accent transition-all" aria-label="GitHub"><Github size={18} /></a>
              <a href="mailto:yumo@example.com"
                className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 text-dark-300 hover:text-accent transition-all" aria-label="Email"><Mail size={18} /></a>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><BookOpen size={20} className="text-accent" />个人简介</h3>
            <div className="text-dark-300 leading-relaxed space-y-3">
              <p>你好！我是一名热爱技术的开发者，目前正在寻找实习机会。我对 Web 开发、系统设计和新技术探索充满热情。</p>
              <p>这个网站是我记录技术学习过程的空间——我会在这里分享技术文章的阅读笔记、实践项目的心得体会，以及一些生活中的摄影作品。</p>
              <p>我相信持续学习是成长的关键，期待在未来的工作中不断提升自己，与优秀的团队一起创造有价值的产品。</p>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Code2 size={20} className="text-accent" />技能</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-dark-700 rounded-lg text-sm text-dark-300 border border-dark-600">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><Camera size={20} className="text-accent" />兴趣爱好</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Code2, title: "编程", desc: "探索新技术，构建有趣的项目" },
            { icon: BookOpen, title: "阅读", desc: "技术书籍与文章" },
            { icon: Camera, title: "摄影", desc: "用镜头记录生活的美好" },
          ].map((item) => (
            <div key={item.title} className="card-hover">
              <item.icon className="text-accent mb-3" size={24} />
              <h4 className="text-white font-medium mb-1">{item.title}</h4>
              <p className="text-dark-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
