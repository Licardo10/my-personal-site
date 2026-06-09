#!/bin/bash
# ==============================
# 云服务器初始化脚本 (Ubuntu 22.04+)
# ==============================
set -e

echo ">>> 更新系统..."
sudo apt update && sudo apt upgrade -y

echo ">>> 安装 Docker..."
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

echo ">>> 安装 Docker Compose..."
sudo apt install -y docker-compose-plugin

echo ">>> 配置防火墙 (允许 80/443)..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

echo ">>> 克隆项目并启动..."
cd ~
git clone https://github.com/Licardo10/my-personal-site.git
cd my-personal-site
docker compose up -d --build

echo ""
echo "✅ 部署完成！"
echo "   请将域名 A 记录指向本机 IP，"
echo "   然后运行: docker compose exec web certbot"  # 注意：此处需要手动配 SSL
echo ""
echo "   或者使用 Caddy 自动 HTTPS (推荐):"
echo "   https://caddyserver.com/docs/quick-starts/reverse-proxy"
