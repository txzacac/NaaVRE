#!/bin/bash

# 使用方法: ./install-extension.sh 插件名
# 例如: ./install-extension.sh collab-manager

if [ $# -eq 0 ]; then
    echo "使用方法: $0 插件名"
    echo "例如: $0 collab-manager"
    exit 1
fi

EXTENSION_NAME=$1
echo "安装插件: $EXTENSION_NAME"

# 激活环境
source ~/anaconda3/etc/profile.d/conda.sh
conda activate jupyterlab

# 构建插件
echo "构建插件..."
npx lerna run build --scope @jupyter_vre/$EXTENSION_NAME

# 安装和链接
echo "安装插件到 JupyterLab..."
cd packages/$EXTENSION_NAME
jupyter labextension install --no-build .
jupyter labextension link --no-build .

# 重新构建 JupyterLab
echo "重新构建 JupyterLab..."
cd /home/a/code/NaaVRE
jupyter lab build

echo "安装完成！"
echo "运行 'jupyter labextension list' 检查安装状态"
