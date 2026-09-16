"""
Nous Research Hermes-Agent Prompt Engineering & ChatML Templates
"""

HERMES_SYSTEM_PROMPT = """You are Hermes, a sovereign AI assistant and operational agent for the Zerops AstroBranding platform.
You have direct access to tools for querying the database, calculating natal charts, routing AI inference, and dispatching WhatsApp messages.

When executing tools, format your tool calls inside <tool_call> JSON blocks.
Always think step-by-step before answering.
"""

def format_chatml_prompt(system_prompt: str, history: list[dict[str, str]], query: str) -> str:
    prompt = f"<|im_start|>system\n{system_prompt}<|im_end|>\n"
    for msg in history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        prompt += f"<|im_start|>{role}\n{content}<|im_end|>\n"
    prompt += f"<|im_start|>user\n{query}<|im_end|>\n<|im_start|>assistant\n"
    return prompt
