---
title: "从零开始实现一个 RAG API 服务：ChromaDB + FastAPI 实战"
date: 2026-06-11
tags: ["RAG", "FastAPI", "ChromaDB", "AI"]
pinned: true
excerpt: "从文本分块到向量检索，再到 LLM 生成和工具调用，一步步搭建一个可用的 RAG API 服务。"
---

## 写在前面

上一篇内容聊过 LangChain，它是一个很棒的编排框架。但我真正手写一遍 RAG 后，我对 RAG 底层原理的理解又加深了。

这段时间我用 FastAPI + ChromaDB 从头做了一个 RAG API 服务，没有框架封装，每一步都是自己实现的。写完之后，对 RAG 的理解又上了一个台阶。

这篇文章就把我的实现思路和代码拆开来讲，希望能帮到正在学 RAG 的朋友。

## 整体架构

先看项目结构，很简洁：

```
my_RAG_API/
├── main.py          # FastAPI 入口，定义路由
├── config.py        # 全局配置（API Key、模型、分块参数）
├── ChromaDB.py      # 向量数据库操作（嵌入生成、存储、检索）
├── RAG_engine.py    # RAG 核心引擎（分块 + 检索 + 生成）
├── llm_client.py    # LLM 客户端（封装 DeepSeek API）
├── tools.py         # 工具函数（计算器 Function Calling）
├── data/            # 知识库文档
└── chroma_db/       # 向量数据持久化目录
```

整个流程长这样：

```text
用户提问
  │
  ▼
将问题转为 Embedding ──► 去 ChromaDB 语义检索
                              │
                              ▼
                    找到 Top-K 最相关文本块
                              │
                              ▼
                    拼装 Prompt（上下文 + 问题）
                              │
                              ▼
                    发给 DeepSeek LLM 生成回答
                              │
                              ▼
                            返回结果
```

## 第一步：配置文件，隐藏敏感信息

所有可变的参数统一放在 `config.py`，方便管理：

```python
# config.py
SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY")   # 向量模型 API Key
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")         # LLM API Key
EMBEDDING_MODEL = "BAAI/bge-m3"                          # 开源中文嵌入模型
LLM_MODEL = "deepseek-chat"                              # DeepSeek 对话模型
CHROMA_PERSIST_DIR = "./chroma_db"                       # 向量库持久化目录
CHUNK_SIZE = 500                                         # 文本分块大小
CHUNK_OVERLAP = 50                                       # 分块重叠大小
DOCUMENT_PATH = "./data/tech_article.txt"                # 知识库文件路径
```

API Key 存在 `.env` 里，`load_dotenv()` 自动加载，不上传到 Git，安全省心。

## 第二步：文本分块，RAG 的第一步门槛

原始的文档不能直接丢给向量数据库，需要先切分成小块。这里我实现了一个**智能分块**函数：

```python
def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    chunks = []
    start = 0
    text_len = len(text)
    while start < text_len:
        end = min(start + chunk_size, text_len)
        # 尽量在句号/问号/感叹号处断开，保持语义完整
        if end < text_len:
            for sep in ["。", "？", "！", "\n", ".", "?", "!"]:
                last_sep = text.rfind(sep, start, end)
                if last_sep > start + chunk_size // 2:
                    end = last_sep + 1
                    break
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap if end < text_len else end
    return chunks
```

核心思路是：

- 从文本开头开始，每 500 字符切一块
- 但不会生硬地切在中间——它会**往回找最近的句号**，保证每个 chunk 是完整的句子
- 相邻块之间**重叠 50 字符**，避免信息刚好被切散

这个细节很重要，我一开始没做重叠，结果有些跨 chunk 的关键信息检索不到，改完立马好多了。

## 第三步：Embedding + ChromaDB，搭建向量知识库

嵌入模型我选的是硅基流动（SiliconFlow）托管的 **BAAI/bge-m3**，一款国产开源的中文嵌入模型，在中文场景的使用效果还算不错，而且调用有免费额度。

```python
import chromadb
import requests
from config import SILICONFLOW_API_KEY, EMBEDDING_API_URL, EMBEDDING_MODEL

# 调用嵌入 API
def get_embeddings(texts):
    headers = {
        "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": EMBEDDING_MODEL,
        "input": texts if isinstance(texts, list) else [texts],
        "encoding_format": "float",
    }
    resp = requests.post(EMBEDDING_API_URL, json=payload, headers=headers, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    return [item["embedding"] for item in data["data"]]

# 初始化持久化集合
def init_collection():
    chromadb_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    collection = chromadb_client.get_or_create_collection(name="rag_docs")
    return collection

# 添加文档（自动生成嵌入向量）
def add_documents(collection, documents, ids, metadatas):
    embeddings = get_embeddings(documents)
    collection.add(documents=documents, embeddings=embeddings, ids=ids, metadatas=metadatas)
```

ChromaDB 的 `PersistentClient` 会把向量数据存到本地磁盘，下次启动不用重新生成，省时又省力。

## 第四步：RAG 引擎，把一切串起来

`RAGEngine` 是我整个服务的核心类，负责**初始化知识库、检索上下文、生成回答**三件事：

```python
class RAGEngine:
    def __init__(self, collection=None):
        self.collection = collection if collection else init_collection()
        self.is_initialized = False

    # 从文本文件初始化向量库（自动去重）
    def init_from_text_file(self, file_path: str):
        if self.collection.count() > 0:
            print(f"向量库已存在，共 {self.collection.count()} 个向量")
            return
        with open(file_path, "r", encoding="UTF-8") as f:
            raw_text = f.read()
        chunks = chunk_text(raw_text)
        ids = [f"chunk_{i}" for i in range(len(chunks))]
        metadatas = [{"source": file_path, "chunk_index": i} for i in range(len(chunks))]
        add_documents(self.collection, chunks, ids, metadatas)

    # 语义检索 Top-3
    def retrieve(self, query: str, n_results: int = 3):
        results = self.collection.query(
            query_embeddings=[get_embeddings(query)[0]],
            n_results=n_results,
            include=["documents", "distances", "metadatas"],
        )
        return results

    # 根据检索结果生成回答
    def generate_answer(self, query: str, context_chunks: list) -> str:
        context = "\n\n---\n\n".join(context_chunks)
        prompt = f"""
        你是一个专业的技术助手。请基于以下【参考资料】回答用户的问题。
        如果参考资料中没有相关信息，请如实说"资料中没有提及"，不要编造。

        【参考资料】
        {context}

        【用户问题】
        {query}

        【回答】"""
        return get_LLM_response(prompt, temperature=0.3)

    def query(self, query: str) -> str:
        results = self.collection.query(
            query_embeddings=[get_embeddings(query)[0]],
            n_results=3,
            include=["documents"],
        )
        chunks = results["documents"][0]
        if not chunks:
            return "没有找到相关信息"
        return self.generate_answer(query, chunks)
```

有一个很实用的细节：每次服务重启时，`init_from_text_file` 会先检查向量库是否已存在，避免重复生成嵌入向量。提高了效率。

## 第五步：FastAPI 包装成 API 接口

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

RAG = RAGEngine()
RAG.init_from_text_file(DOCUMENT_PATH)

app = FastAPI(title="RAG API", description="基于 ChromaDB + DeepSeek 的问答服务")

class Question(BaseModel):
    question: str

@app.post("/chat")
def chat(q: Question):
    try:
        answer = RAG.query(q.question)
        return {"question": q.question, "answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}
```

两个接口，清晰明了：

- `POST /chat` — 传入问题，返回基于知识库的答案
- `GET /health` — 健康检查，便于部署时排查错误

## 进阶：Function Calling，让 LLM 学会用工具

除了问答外，我还加了一个 **计算器工具** 的端点。当用户问"123 × 456 等于多少"时，LLM 会主动调用工具来算，而不是自己瞎编：

```python
# tools.py — 定义工具
calculate_tool = {
    "type": "function",
    "function": {
        "name": "calculator",
        "description": "执行数学计算，支持加减乘除、幂运算等",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "数学表达式，例如 '123 * 456'",
                }
            },
            "required": ["expression"],
        },
    },
}

def run_calculator(expression: str) -> str:
    allowed_chars = set("0123456789+-*/().%**")
    if not all(c in allowed_chars for c in expression):
        return "错误：表达式包含非法字符"
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"计算错误: {e}"
```

在 `/agent` 端点中，我实现了标准的 **工具调用循环**：

```python
@app.post("/agent")
def agent_endpoint(req: Question):
    messages = [{"role": "user", "content": req.question}]

    # 第一轮：LLM 决定是否调用工具
    first_response = LLM_client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        tools=[calculate_tool],
        tool_choice="auto",
    )
    message = first_response.choices[0].message

    # 如果没调用工具，直接返回
    if not message.tool_calls:
        return {"question": req.question, "answer": message.content}

    # 如果有工具调用，执行工具并把结果发回给 LLM
    for tool_call in message.tool_calls:
        if tool_call.function.name == "calculator":
            args = json.loads(tool_call.function.arguments)
            result = run_calculator(args.get("expression", ""))
            messages.append(message)
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result,
            })

    # 第二轮：LLM 结合工具结果给出最终回答
    final_response = LLM_client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
    )
    return {"question": req.question, "answer": final_response.choices[0].message.content}
```

流程就是：**用户提问 → LLM 判断需要计算 → 提取表达式 → 执行计算 → 结果注入上下文 → LLM 组织最终答案**。这一套下来，感觉离真正的 Agent 又近了一步。

## 启动服务

```bash
uvicorn main:app --reload
```

启动后访问 `http://127.0.0.1:8000/docs`，Swagger 文档就出来了，可以直接在页面上测试接口。因为只是个人练手的项目，所以没有部署到云端，等今后业务精进了，把它变成能投入生产的服务后再部署吧

## 总结与心得

在写这个 RAG 服务的过程中，有几个体会很深：

1. **分块策略直接影响检索质量**——无重叠的硬切会让信息刚好断在两块之间，加上重叠和语义断句后效果提升明显
2. **Embedding 模型选对语言很重要**——中文场景用 BAAI/bge-m3 比通用模型准确不少
3. **向量库去重是个容易被忽略的细节**——服务重启时重复写入会导致检索结果被稀释，提前判断 `count()` 能避免
4. **Function Calling 让 RAG 不止于问答**——加上工具调用后，LLM 的边界被大大扩展了

当然这个版本也比较简陋：没有流式输出、没有多轮对话记忆、没有异步处理。不过作为**理解 RAG 原理的起点**够用了。

下一步我打算加上对话历史和流式响应，并用LangChain重写，让它更像一个真正的 AI 助手。欢迎提出意见
