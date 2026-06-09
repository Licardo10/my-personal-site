"use client";

import { useState } from "react";
import { Image, Film, Play } from "lucide-react";
import Carousel from "@/components/Carousel";
import galleryData from "../../../content/gallery.json";

interface AlbumItem {
  url: string;
  title: string;
}

interface Album {
  id: string;
  title: string;
  description: string;
  cover: string;
  type: "image" | "video";
  items: AlbumItem[];
}

function AlbumCard({ album, onClick }: { album: Album; onClick: () => void }) {
  return (
    <div className="card-hover group cursor-pointer overflow-hidden relative" onClick={onClick}>
      <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-dark-700">
        {album.cover ? (
          <img src={album.cover} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {album.type === "video" ? <Film size={48} className="text-dark-500" /> : <Image size={48} className="text-dark-500" />}
          </div>
        )}
        {album.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-accent/80 flex items-center justify-center">
              <Play size={20} className="text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
      <h3 className="text-white font-semibold mb-1">{album.title}</h3>
      <p className="text-dark-400 text-xs">{album.description} · {album.items.length} 项</p>
      <span className="inline-block mt-2 px-2 py-0.5 bg-dark-700 rounded text-xs text-dark-400">
        {album.type === "video" ? "🎬 视频" : "🖼️ 图片"}
      </span>
    </div>
  );
}

export default function GalleryPage() {
  const [carousel, setCarousel] = useState<{ album: Album; index: number } | null>(null);
  const data = galleryData as { albums: Album[] };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
      <h1 className="section-title">影集</h1>
      <p className="text-dark-400 mb-12 max-w-2xl">用镜头记录生活点滴，滑动滚轮浏览精彩瞬间。</p>

      {data.albums.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-dark-400 text-lg mb-2">暂无相册</p>
          <p className="text-dark-500 text-sm">内容正在准备中，敬请期待...</p>
        </div>
      ) : (
        <div className="space-y-16">
          {data.albums.map((album) => (
            <section key={album.id}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">{album.title}</h2>
                <span className="text-dark-500 text-sm">{album.items.length} 项</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {album.items.map((item, i) => (
                  <div key={i}
                    className="group cursor-pointer relative aspect-square rounded-lg overflow-hidden bg-dark-700"
                    onClick={() => setCarousel({ album, index: i })}>
                    {album.type === "video" ? (
                      <>
                        <video src={item.url} preload="metadata" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={32} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <img src={item.url} alt={item.title || ""} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate">{item.title}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {carousel && (
        <Carousel items={carousel.album.items} initialIndex={carousel.index} type={carousel.album.type} onClose={() => setCarousel(null)} />
      )}
    </div>
  );
}
