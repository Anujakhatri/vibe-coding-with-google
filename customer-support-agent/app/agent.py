# ruff: noqa
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import litellm
litellm.model_alias_map = {"openai/gpt-oss-120b": "groq/llama-3.3-70b-versatile"}

from typing import Literal

from pydantic import BaseModel, Field

from google.adk.workflow import Workflow, node
from google.adk.events.event import Event
from google.adk.agents.context import Context
from google.adk.agents import LlmAgent
from google.adk.apps import App
from google.genai import types

class Classification(BaseModel):
    category: Literal["shipping", "unrelated"] = Field(
        description="The category of the user query."
    )

classifier_agent = LlmAgent(
    name="classifier",
    model="openai/gpt-oss-120b",
    instruction="Classify if the user query is related to shipping (rates, tracking, delivery, returns) or unrelated.",
    output_schema=Classification,
)

@node
def route_query(node_input: dict, ctx: Context) -> Event:
    category = node_input.get("category", "unrelated")
    user_query = ctx.state.get("user_query", "")
    return Event(output=user_query, route=category)

@node
def decline_query(node_input: str):
    msg = "I'm sorry, I can only assist with questions related to our shipping company (rates, tracking, delivery, returns)."
    yield Event(content=types.Content(role="model", parts=[types.Part.from_text(text=msg)]))
    yield Event(output="Declined")

shipping_faq_agent = LlmAgent(
    name="shipping_faq",
    model="openai/gpt-oss-120b",
    instruction="You are a shipping company customer support agent. Answer questions about shipping rates, tracking, delivery, and returns accurately and politely.",
)

@node
def extract_query(node_input: types.Content, ctx: Context) -> types.Content:
    if node_input and node_input.parts:
        ctx.state["user_query"] = node_input.parts[0].text
    else:
        ctx.state["user_query"] = ""
    return node_input

workflow = Workflow(
    name="customer_support_workflow",
    edges=[
        ("START", extract_query),
        (extract_query, classifier_agent),
        (classifier_agent, route_query),
        (route_query, {"shipping": shipping_faq_agent, "unrelated": decline_query}),
    ],
)

app = App(
    root_agent=workflow,
    name="app",
)
