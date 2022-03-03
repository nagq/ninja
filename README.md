# ninja cli


## ninja branch

`npm install -g ninja-knife`

在一个git项目中运行 `ninja branch`, 命令会检查 `.git` 文件夹下是否有 `ninja-config.json`文件。

若没有则会创建文件，格式如下:

```js
{
    "config": {
    },
    "data": [
        {
            "branch": "main",
            "title": "主分支"
        },
        {
            "branch": "release",
            "title": "发布分支，提交中带feat,fix会触发发布"
        },
        {
            "branch": "test",
            "title": "测试分支",
            "hide": true
        }
    ]
}

```

若存在则会显示分支及备注

```
bash# ninja branch
* main               主分支
  release            发布分支，提交中带feat,fix会触发发布
```

```
ninja branch:  创建配置文件，或者显示分支及备注
    -a 显示全部，包括 hide:true
    -o 打开配置文件
```
