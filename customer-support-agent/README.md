# customer-support-agent
Simple ReAct agent
> Generated with `agents-cli` version `0.5.0`

A graph-based customer support workflow agent built with the [Google Agents Development Kit (ADK 2.0)](https://adk.dev/).

The agent classifies incoming user queries as **shipping-related** or **unrelated**, and routes them to the appropriate handler using a directed workflow graph.

---

## How It Works

Every message flows through a fixed graph of nodes:

```
START
  │
  ▼
extract_query        ← saves raw text to session state
  │
  ▼
classifier_agent     ← LLM returns {"category": "shipping" | "unrelated"}
  │
  ▼
route_query          ← reads category, sets Event.route for branching
  │
  ├──[shipping]──► shipping_faq_agent    (answers rates, tracking, delivery, returns)
  │
  └──[unrelated]─► decline_query         (politely declines off-topic questions)
```

### Nodes at a glance

| Node | Type | Role |
|------|------|------|
| `extract_query` | `@node` function | Pulls the user's text out of the raw `Content` input and saves it to `ctx.state` |
| `classifier_agent` | `LlmAgent` | Classifies the query as `"shipping"` or `"unrelated"` using a structured output schema |
| `route_query` | `@node` function | Reads the classifier's JSON output and sets `Event.route` for conditional branching |
| `shipping_faq_agent` | `LlmAgent` | Answers questions about shipping rates, tracking, delivery timelines, and returns |
| `decline_query` | `@node` function | Terminal node — yields a polite decline for off-topic questions |

---

## Project Structure

```
customer-support-agent/
├── app/
│   ├── agent.py            # Workflow graph, nodes, and App definition
│   ├── __init__.py         # Exposes `app` to the ADK runtime
│   ├── fast_api_app.py     # Optional FastAPI server wrapper
│   └── app_utils/          # Utility helpers
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── eval/               # Evaluation datasets
├── env                     # Environment variables (API keys)
├── pyproject.toml          # Dependencies and project config
├── agents-cli-manifest.yaml# ADK project metadata
├── GEMINI.md               # AI-assisted development guide
└── Dockerfile              # Container image definition
```

> 💡 **Tip:** Use [Gemini CLI](https://github.com/google-gemini/gemini-cli) for AI-assisted development — project context is pre-configured in `GEMINI.md`.

---

## Requirements

- **uv** — Python package manager — [Install](https://docs.astral.sh/uv/getting-started/installation/)
- **agents-cli** — Install with `uv tool install google-agents-cli`
- **Groq API key** — The agent uses `groq/llama-3.3-70b-versatile` via LiteLLM

---

## Quick Start

**1. Install `agents-cli` and its skills (first time only):**
```bash
uvx google-agents-cli setup
```

**2. Install project dependencies:**
```bash
agents-cli install
```

**3. Load environment variables:**
```bash
source env
```

**4. Run a query:**
```bash
agents-cli run "What are your shipping rates?"
```

---

## Example Queries

**Shipping-related (routes to FAQ agent):**
```bash
agents-cli run "What are your shipping rates?"
agents-cli run "How do I track my package?"
agents-cli run "What is your return policy?"
```

**Unrelated (routes to polite decline):**
```bash
agents-cli run "How do I bake a cake?"
agents-cli run "What's the weather today?"
```

**Multi-turn conversation (continue a session):**
```bash
agents-cli run "Can I track it internationally?" --session-id <session-id>
```

---

## Commands

| Command | Description |
|---------|-------------|
| `agents-cli install` | Install dependencies using uv |
| `agents-cli run "<message>"` | Send a message and get a response |
| `agents-cli playground` | Launch local development environment |
| `agents-cli lint` | Run code quality checks |
| `agents-cli eval` | Evaluate agent behavior |
| `uv run pytest tests/unit tests/integration` | Run unit and integration tests |

---

## Project Management

| Command | What It Does |
|---------|--------------|
| `agents-cli scaffold enhance` | Add CI/CD pipelines and Terraform infrastructure |
| `agents-cli infra cicd` | One-command setup of entire CI/CD pipeline + infrastructure |
| `agents-cli scaffold upgrade` | Auto-upgrade to latest version while preserving customizations |

---

## Development

Edit your agent logic in [`app/agent.py`](app/agent.py) and test with `agents-cli playground` — it auto-reloads on save.

### Modifying the workflow

- **Add a new node**: Define a function with `@node` or create a new `LlmAgent`, then add it to the `edges` list in the `Workflow`.
- **Change routing logic**: Update the `route_query` node to return a different `Event.route` value, and add a matching key to the conditional edge dict.
- **Change the model**: Update `litellm.model_alias_map` at the top of `agent.py` to reroute to a different provider/model.

---

## Observability

Built-in telemetry exports to Cloud Trace, BigQuery, and Cloud Logging.
