# LVhome — Livy 的海上楼阁

一座漂在海上的四层小楼，一层一个展厅，要坐船进去。

纯静态，没有构建步骤。Three.js 和字体都放在 `assets/vendor/`，国内也能打开。

```sh
python3 -m http.server 8080   # 打开 http://localhost:8080
```

## 参观路线

1. **开场：** 夜里的海，远处一座楼。点"登船"（一张船票），或者点"直接进楼"。
2. **坐船：** 乌篷船从远处划到码头，大约 15 秒，可以跳过。
3. **上岸：** 镜头走上码头，穿过牌坊，进门。
4. **展厅：** 从 1F 序厅开始。拖动环顾，点画作走近看，右侧可以换楼层（键盘 ↑ ↓）。
5. **出楼观海：** 绕着楼转一圈，点任意一层直接进去。

## 改什么去哪里

| 想改的 | 文件 |
| --- | --- |
| 所有文字（中英双语）、每个展厅的主题和作品 | `assets/js/content.js` |
| 楼、码头、海、天空、月亮、船长什么样 | `assets/js/world.js` |
| 画挂在墙上哪里、画框和立轴的样式 | `assets/js/gallery.js` |
| 示例画作（用代码画的） | `assets/js/art.js` |
| 参观流程、镜头、按钮 | `assets/js/main.js` |
| 海浪声 | `assets/js/sound.js` |

## 换上真正的作品

1. 把图片放进 `assets/art/`（建议 jpg，长边 2000px 左右）。原图可以放 `assets/art/_originals/`，那里不会上传。
2. 在 `content.js` 对应作品上加 `image: 'assets/art/xxx.jpg'`。`size` 写作品在墙上显示的尺寸（米），比例要和图片一致。
3. 有了 `image`，就不再用代码画的示例。

每个展厅的作品数量可以不同。1F 和 3F 放 4 件，2F 放 5 件，4F 放 3 件，挂起来正合适；最多 7 件。

## 深链接

- `?hall=2` 直接进 3F（编号从 0 开始）；`?hall=1&work=0` 直接看 2F 的第一件作品。
- `?ride` 直接开始坐船；`?outside` 直接在楼外。

## 部署

计划和 Chris 的网站一样：托管在 Cloudflare Workers 的静态资源上，连私有 GitHub 仓库 `rsm-zhl232/LVhome`，push 到 `main` 就会自动部署。

- `wrangler.jsonc`：部署配置。买好域名后加到 `routes` 里。
- `.assetsignore`：不公开的文件。
- `_headers`：缓存设置。
