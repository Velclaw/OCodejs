---
description: Get up and running with the Groq API in minutes: create an API key, set up your environment, and make your first request.
title: Quickstart - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg
---

# Quickstart

Get up and running with the Groq API in a few minutes, with the steps below.

For additional support, catch our [onboarding video](https://console.groq.com/docs/overview).

## [Create an API Key](#create-an-api-key)

Please visit [here](https://console.groq.com/keys) to create an API Key.

## [Set up your API Key (recommended)](#set-up-your-api-key-recommended)

Configure your API key as an environment variable. This approach streamlines your API usage by eliminating the need to include your API key in each request. Moreover, it enhances security by minimizing the risk of inadvertently including your API key in your codebase.

### [In your terminal of choice:](#in-your-terminal-of-choice)

shell

```
export GROQ_API_KEY=<your-api-key-here>
```

## [Requesting your first chat completion](#requesting-your-first-chat-completion)

curlJavaScriptPythonJSON

### [Install the Groq Python library:](#install-the-groq-python-library)

shell

```
pip install groq
```

### [Performing a Chat Completion:](#performing-a-chat-completion)

Python

```
import os

from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Explain the importance of fast language models",
        }
    ],
    model="llama-3.3-70b-versatile",
)

print(chat_completion.choices[0].message.content)
```

## [Using third-party libraries and SDKs](#using-thirdparty-libraries-and-sdks)

Vercel AI SDKLiteLLMLangChain

### [Using AI SDK:](#using-ai-sdk)

[AI SDK](https://ai-sdk.dev/) is a Javascript-based open-source library that simplifies building large language model (LLM) applications. Documentation for how to use Groq on the AI SDK [can be found here](https://console.groq.com/docs/ai-sdk/).

  
First, install the `ai` package and the Groq provider `@ai-sdk/groq`:

  
shell

```
pnpm add ai @ai-sdk/groq
```

  
Then, you can use the Groq provider to generate text. By default, the provider will look for `GROQ_API_KEY` as the API key.

  
JavaScript

```
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

const { text } = await generateText({
  model: groq('llama-3.3-70b-versatile'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

Now that you have successfully received a chat completion, you can try out the other endpoints in the API.

### [Next Steps](#next-steps)

* Check out the [Playground](https://console.groq.com/playground) to try out the Groq API in your browser
* Join our GroqCloud [developer community](https://community.groq.com/)
* Add a how-to on your project to the [Groq API Cookbook](https://github.com/groq/groq-api-cookbook)