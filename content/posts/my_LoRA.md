---
title: "LLM微调初尝试之——LoRA"
date: 2026-06-13
tags: ["LoRA", "实战", "入门"]
pinned: false
excerpt: "用 LoRA 对 Qwen2-0.5B 做微调，从下载模型到推理测试，完整流程实现。（CPU的负重前行）"
---

## 写在前面

之前学习了RAG，也写了一篇博客。后来我就在想，既然RAG是给LLM加入外部知识库，那有没有什么办法让模型学会我想让它做的事呢？

我找到了答案，那就是**微调**。

但我第一次听到"微调"时，心里想的是：“是类似于提示词一样给AI指令吗？”。了解过后想的又是“我的电脑跑得动吗？”担心的事在微调过程中果然发生了，我们文中再细讲。同时我也有一个疑惑，请移步代码部分：6.开始训练

在网上搜索教程了解到 **LoRA（Low-Rank Adaptation）**——它只训练极少量参数，效果却与全量训练相差无几。这篇文章就用 Qwen2-0.5B 跑一遍完整的 LoRA 微调流程，代码全部贴出来，你可以直接复制。

## LoRA 是什么？

现在的大模型功能强大、知识库丰富，参数量自然也十分庞大，动辄百亿、千亿，全量微调既耗费算力，又需要大量时间。而LoRA解决了这个问题，它的思路很巧妙：

> 不改动原始权重，而是在原始权重旁边"并联"一小路可训练的低秩矩阵，训练时只更新这一小路的参数，推理时再合并回去。

画个图理解：



&#x09;原始权重 W（冻结）

&#x20;   ┌──────────────────┐

&#x20;   │   Frozen 矩阵     			│  ← 不动

&#x20;   └──────────────────┘

&#x20;         +

&#x20;   ┌──────────────────┐

&#x20;   │   A × B 低秩矩阵  			│  ← 只训练这个

&#x20;   └──────────────────┘

&#x20; （参数量仅为原始 W 的万分之一）



它的实现思路是：对原始的权重矩阵 W，用两个小矩阵 A 和 B 相乘来近似它的更新量 ΔW。训练时原始 W 冻结，只更新 A 和 B。因为 A 和 B 的维度远小于 W，需要计算的参数量就大大减少了。

比如 Qwen2-0.5B 有 4.94 亿参数，用 LoRA 微调只需要训练约 \*\*80 万\*\*个参数，占比不到 0.2%。

## 我的完整代码

这个脚本把所有步骤串在了一起：下载模型 → 加载 → 准备数据 → 配置 LoRA → 训练 → 保存 → 测试。

### 1\. 从 ModelScope 下载 Qwen2-0.5B

`python
import os
from modelscope.hub.snapshot\_download import snapshot\_download

model\_id = "Qwen/Qwen2-0.5B"
local\_model\_path = "./Qwen2-0.5B/Qwen/Qwen2-0\_\_\_5B"

if not os.path.exists(local\_model\_path):
print("正在从 ModelScope 下载模型，请稍候...")
snapshot\_download(model\_id, cache\_dir=local\_model\_path)
print("下载完成！")
else:
print(f"模型已存在于 {local\_model\_path}")
`

这里用的是 **ModelScope** 镜像，在国内下载比 HuggingFace 快很多。注意下载后的目录路径——Qwen2-0\_\_\_5B 这个奇怪的目录名不是写错了，是 ModelScope 缓存时的自动命名。我花费很多时间在 HuggingFace ，但无论是挂梯子还是走镜像网站，一直下载失败。所以转向**ModelScope**

### 2\. 加载模型和分词器

`python
from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from\_pretrained(local\_model\_path, use\_fast=False)
model = AutoModelForCausalLM.from\_pretrained(local\_model\_path)

if tokenizer.pad\_token is None:
tokenizer.pad\_token = tokenizer.eos\_token
model.config.pad\_token\_id = model.config.eos\_token\_id
`

注意：Qwen2 默认没有 pad\_token，而数据批处理时又需要它。解决方式是用 eos\_token 替换。

### 3\. 准备训练数据

`python
train\_texts = \[
"RAG 是检索增强生成，它结合了信息检索和文本生成。",
"LoRA 是一种高效的模型微调方法，只训练少量参数。",
"FastAPI 是一个现代 Python Web 框架，用于构建 API。",
]

def tokenizer\_function(examples):
return tokenizer(
examples\["text"], truncation=True, max\_length=128, padding="max\_length"
)

dataset = Dataset.from\_dict({"text": train\_texts})
tokenized\_dataset = dataset.map(tokenizer\_function, batched=True)
`
为了快速演示，我只准备了 3 条数据，训练效果不好。实际使用时，这里应该换成至少千条高质量数据才能保证训练效果。

### 4\. 配置 LoRA——最关键的一步

`python
from peft import LoraConfig, get\_peft\_model

lora\_config = LoraConfig(
r=8,
lora\_alpha=32,
target\_modules=\["q\_proj", "k\_proj", "v\_proj", "o\_proj"],
lora\_dropout=0.1,
bias="none",
task\_type="CAUSAL\_LM",
)

model = get\_peft\_model(model, lora\_config)
model.print\_trainable\_parameters()
`

这几个参数展开说说：

|参数|我的取值|含义|
|-|-|-|
|r|8|低秩矩阵的秩。r 越小参数量越少，但表达能力也越弱。常见取值 8、16、32|
|lora\_alpha|32|缩放系数，控制 LoRA 权重的影响程度，通常设为 r 的 2\~4 倍|
|arget\_modules|4 个注意力层|选择要对哪些模块做 LoRA。Qwen2 的注意力层就是这 4 个|
|lora\_dropout|0.1|防止过拟合，训练时随机丢弃一部分 LoRA 参数|



model.print\_trainable\_parameters() 会输出类似下面的信息：

ext trainable params: 786,432 || all params: 494,030,848 || trainable%: 0.1592

可见只有 0.16% 的参数需要训练，这就是 LoRA 的高效。



### 5\. 配置训练参数

`python training\_args = TrainingArguments( output\_dir="./lora\_output", per\_device\_train\_batch\_size=2, gradient\_accumulation\_steps=1, num\_train\_epochs=10, logging\_steps=5, save\_steps=50, learning\_rate=2e-4, fp16=False, report\_to="none", )



data\_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)



trainer = Trainer( model=model, args=training\_args, train\_dataset=tokenized\_dataset, data\_collator=data\_collator, ) `



这里面有个微妙的地方：DataCollatorForLanguageModeling 的 mlm=False 表示做因果语言模型的遮蔽（也就是自回归预测下一个 token），而不是 BERT 那种双向遮蔽。



eport\_to="none" 则是关掉杂乱的日志上报，本地跑的时候界面更简洁。

### 6\. 开始训练

`python print("开始训练") trainer.train() `

输出会像这样：

`	ext 开始训练 Step  Training Loss 5     3.456700 10    2.345600 ... `

虽然 3 条数据 × 10 个 epoch的 step 量很少，但是由于我虽然用的是N卡，但CUDA的配置一直没办法完成，导致只能用CPU跑，花了将近一个小时的时间才跑完，这个耗时是不合常理的。即使是用CPU，但也应该在几分钟内完成，目前还没排查出问题出在哪，如果有读者知道问题所在，欢迎联系我。

### 7\. 保存 LoRA 适配器

`python model.save\_pretrained("./my\_lora\_adapter") tokenizer.save\_pretrained("./my\_lora\_adapter") print("LoRA 适配器已保存至 ./my\_lora\_adapter") `

保存的只是 LoRA 的那一小路参数，不是完整的模型。文件很小，仅几 MB。

### 8\. 推理测试

`python
base\_model = AutoModelForCausalLM.from\_pretrained(local\_model\_path)
lora\_model = PeftModel.from\_pretrained(base\_model, "./my\_lora\_adapter")

input\_text = "RAG 技术的主要作用是"
inputs = tokenizer(input\_text, return\_tensors="pt")
outputs = lora\_model.generate(
\*\*inputs, max\_new\_tokens=30, do\_sample=True, temperature=0.7
)
generated = tokenizer.decode(outputs\[0], skip\_special\_tokens=True)
print(f"生成: {generated}")
`

推理时，先把基座模型加载出来，然后再把 LoRA 适配器挂上去。因为微调数据里包含"RAG 是检索增强生成"这条，所以模型能比较顺畅地接上相关内容。

## 跑完之后的感受

第一次跑通 LoRA 时，最让我惊讶的是它真的实现了对模型的改变，至于它最大的特点--**训练速度**。我还没有体会到，等今后解决了显卡的问题再来体会吧。

当然，这只是个学习用的小 demo ，离真正可用还有一段距离。想要实打实的效果，需要注意几个关键点：

### 如果要认真做微调

1. **数据质量 > 数据数量**——10 条精心标注的数据往往好过 1000 条噪声数据。先整理数据，再调参数
2. **r 值不是越大越好**——r=8 对大多数场景已经够用，盲目增大 r 只会增加过拟合风险
3. **target_modules 选什么**——一般先从注意力层的 Q/K/V/O 开始，效果好再考虑扩展到 FFN 层
4. **学习率要小**——LoRA 的 lr 通常在 1e-4 到 5e-4 之间，比全量微调高但比从头训练低很多
5. **融合推理 vs. 动态加载**——训练完的 LoRA 权重可以合并回原始模型，也可以单独保存按需加载。后者更灵活，一个基座模型可以挂不同的 LoRA 做不同任务

## 总结

从下载模型到训练完成拿到结果，整个流程没有我想象中的简单。环境问题、网络问题、配置问题轮番出现。不过最终跑通的那一刻还是很开心的。LoRA 让我感觉到"大模型微调不是那么遥不可及"。

如果你也在学 LLM 微调，我的建议是：**先跑通一个最小闭环，再一点点往里面塞数据、改参数**。只有亲手跑一遍，才能有所体会。

下一步我打算先解决配置问题，然后再拿优质数据好好跑一遍。
