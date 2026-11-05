# 圣诞树动画合集

同一仓库内的两个独立静态网页项目。

| 项目 | 入口 | 说明 |
| --- | --- | --- |
| 圣诞树 2D | [christmas-2d/index.html](christmas-2d/index.html) | [运行与部署](christmas-2d/README.md) |
| 圣诞树 3D | [christmas-3d/index.html](christmas-3d/index.html) | [运行与部署](christmas-3d/README.md) |

## 同时预览

在仓库根目录执行 `python -m http.server 8000`，然后访问：

- 2D：http://localhost:8000/christmas-2d/
- 3D：http://localhost:8000/christmas-3d/

两个项目可以分别部署，发布目录分别选择 `christmas-2d` 和 `christmas-3d`。无需安装依赖或执行构建。
GitHub 仓库用于存放成品源码；上传仓库本身不会自动启用网站托管。

## 版本来源

两个项目分别取自对应聊天的最终发布包，并与桌面“圣诞动画/部署”中的副本进行了 SHA-256 一致性核对。
保留网页运行所需资源，未纳入旧版、重复发布 ZIP 和开发临时文件。

## 素材

音乐、字体和引用内容保留原有权利归属；字体许可文件随项目保留。本仓库未额外授予第三方素材的使用许可。
