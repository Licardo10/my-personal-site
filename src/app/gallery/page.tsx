import { Film, Image as ImageIcon } from "lucide-react";

const photos = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, title: `示例照片 ${i + 1}`, desc: "照片描述" }));
const videos = [{ id: 1, title: "示例视频", platform: "YouTube" }];

export default function GalleryPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
      <h1 className="section-title">影集</h1>
      <p className="text-dark-400 mb-12 max-w-2xl">一些生活中的影像记录。</p>
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2"><ImageIcon size={22} className="text-accent" />照片墙</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="card-hover group cursor-pointer overflow-hidden">
              <div className="aspect-square bg-dark-700 rounded-lg mb-3 flex items-center justify-center group-hover:bg-dark-600 transition-colors">
                <ImageIcon size={48} className="text-dark-500" />
              </div>
              <h3 className="text-white font-medium text-sm">{photo.title}</h3>
              <p className="text-dark-500 text-xs mt-1">{photo.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2"><Film size={22} className="text-accent" />视频</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="card">
              <div className="aspect-video bg-dark-700 rounded-lg mb-3 flex items-center justify-center">
                <p className="text-dark-500 text-sm flex items-center gap-2"><Film size={20} />嵌入视频占位</p>
              </div>
              <h3 className="text-white font-medium">{video.title}</h3>
              <p className="text-dark-500 text-xs mt-1">{video.platform}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
