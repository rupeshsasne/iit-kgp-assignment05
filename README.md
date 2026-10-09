# Assignment 05

Poetry-managed environment for `Logistics_Operations_RAG_Assistant_Starter.ipynb`
(document loading, MiniLM embeddings, Chroma, and a local Llama 3.2 RAG chain).

Works on macOS (Apple Silicon) and Windows. CPU is enough. Apple Silicon uses MPS.
On Windows, Ollama uses an NVIDIA GPU when one is present.

## Briefing

Read [docs/index.html](docs/index.html) before the notebook. It explains the assignment, the fixed spec, the ideas behind each section, and what each solved cell did. The page is updated after every cell that runs cleanly.

GitHub Pages, once enabled on `main` / `docs`, serves it at
`https://rupeshsasne.github.io/iit-kgp-assignment05/`.

## Prerequisites

- Python 3.12 (3.10 or 3.11 also satisfy `requires-python`)
- [Poetry](https://python-poetry.org/docs/#installation) 2.x

## Setup

From this directory:

```bash
poetry install
poetry run python -m ipykernel install --user \
  --name=assignment05 \
  --display-name="Assignment05 (.venv)"
```

On Windows PowerShell the line continuation is a backtick:

```powershell
poetry install
poetry run python -m ipykernel install --user `
  --name=assignment05 `
  --display-name="Assignment05 (.venv)"
```

Select kernel **Assignment05 (.venv)** in the notebook.

## Ollama

The language-model cells use Ollama `llama3.2:3b` at temperature 0. Install Ollama, then pull the model before those cells.

macOS:

```bash
brew install ollama
ollama pull llama3.2:3b
```

Windows: install from [ollama.com/download/windows](https://ollama.com/download/windows), then in a new terminal:

```powershell
ollama pull llama3.2:3b
```

## Runtime

- Embeddings: `sentence-transformers/all-MiniLM-L6-v2` (CPU, Apple MPS, or CUDA if PyTorch already has it).
- Vector store: persistent Chroma collection `logistics_rag`.
- Language model: Ollama `llama3.2:3b`.

NLTK English stopwords download on first use. Gemini (`langchain-google-genai`) is an optional API alternative and is not installed here.
