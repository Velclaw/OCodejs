---
description: Understand Groq API rate limits, headers, and best practices for managing request and token quotas in your applications.
title: Rate Limits - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg
---

# Rate Limits

Rate limits act as control measures to regulate how frequently users and applications can access our API within specified timeframes. These limits help ensure service stability, fair access, and protection against misuse so that we can serve reliable and fast inference for all.

## [Understanding Rate Limits](#understanding-rate-limits)

Rate limits are measured in:

* **RPM:** Requests per minute
* **RPD:** Requests per day
* **TPM:** Tokens per minute
* **TPD:** Tokens per day
* **ASH:** Audio seconds per hour
* **ASD:** Audio seconds per day
* **ITPM:** Input tokens per minute
* **OTPM:** Output tokens per minute

[Cached tokens](https://console.groq.com/docs/prompt-caching) do not count towards your rate limits.

Rate limits apply at the organization level, not individual users. You can hit any limit type depending on which threshold you reach first.

**Example:** Let's say your RPM = 50 and your TPM = 200K. If you were to send 50 requests with only 100 tokens within a minute, you would reach your limit even though you did not send 200K tokens within those 50 requests.

### [Input and Output Token Rate Limits (ITPM / OTPM)](#input-and-output-token-rate-limits-itpm--otpm)

In addition to the combined TPM limit, some organizations are also subject to separate per-minute limits on input tokens (ITPM) and output tokens (OTPM). For example, an OTPM limit caps how many completion tokens your organization can generate per minute, regardless of how many input tokens are sent.

If these limits are configured on your account, you'll see your TPM value on the [Limits page](https://console.groq.com/settings/limits) — hover over it to see the **"X in / Y out"** breakdown. If no breakdown appears, your organization has a single combined TPM cap with no separate input/output limits.

## [Rate Limits](#rate-limits)

The following is a high level summary and there may be exceptions to these limits. You can view the current, exact rate limits for your organization on the [limits page](https://console.groq.com/settings/limits) in your account settings.

**Need higher rate limits?** Upgrade to [Developer plan](https://console.groq.com/settings/billing/plans) to access higher limits, [Batch](https://console.groq.com/docs/batch) and [Flex](https://console.groq.com/docs/flex-processing) processing, and more. Note that the limits shown below are the base limits for the Developer plan, and higher limits are available for select workloads and enterprise use cases.

|          |     |     |     |     |     |     |
| -------- | --- | --- | --- | --- | --- | --- |
| MODEL ID | RPM | RPD | TPM | TPD | ASH | ASD |

| canopylabs/orpheus-arabic-saudi     | 10 | 100   | 1.2K | 3.6K | \-   | \-    |
| ----------------------------------- | -- | ----- | ---- | ---- | ---- | ----- |
| canopylabs/orpheus-v1-english       | 10 | 100   | 1.2K | 3.6K | \-   | \-    |
| meta-llama/llama-prompt-guard-2-22m | 30 | 14.4K | 15K  | 500K | \-   | \-    |
| meta-llama/llama-prompt-guard-2-86m | 30 | 14.4K | 15K  | 500K | \-   | \-    |
| openai/gpt-oss-120b                 | 30 | 1K    | 8K   | 200K | \-   | \-    |
| openai/gpt-oss-20b                  | 30 | 1K    | 8K   | 200K | \-   | \-    |
| openai/gpt-oss-safeguard-20b        | 3  | 1K    | 2K   | 200K | \-   | \-    |
| qwen/qwen3.8-27b                    | 30 | 1K    | 8K   | 200K | \-   | \-    |
| whisper-large-v3                    | 20 | 2K    | \-   | \-   | 7.2K | 28.8K |
| whisper-large-v3-turbo              | 20 | 2K    | \-   | \-   | 7.2K | 28.8K |

## [Rate Limit Headers](#rate-limit-headers)

In addition to viewing your limits on your account's [limits](https://console.groq.com/settings/limits) page, you can also view rate limit information such as remaining requests and tokens in HTTP response headers as follows:

The following headers are set (values are illustrative):

| Header                         | Value    | Notes                                    |
| ------------------------------ | -------- | ---------------------------------------- |
| retry-after                    | 2        | In seconds                               |
| x-ratelimit-limit-requests     | 14400    | Always refers to Requests Per Day (RPD)  |
| x-ratelimit-limit-tokens       | 18000    | Always refers to Tokens Per Minute (TPM) |
| x-ratelimit-remaining-requests | 14370    | Always refers to Requests Per Day (RPD)  |
| x-ratelimit-remaining-tokens   | 17997    | Always refers to Tokens Per Minute (TPM) |
| x-ratelimit-reset-requests     | 2m59.56s | Always refers to Requests Per Day (RPD)  |
| x-ratelimit-reset-tokens       | 7.66s    | Always refers to Tokens Per Minute (TPM) |

## [Handling Rate Limits](#handling-rate-limits)

When you exceed rate limits, our API returns a `429 Too Many Requests` HTTP status code.

**Note**: `retry-after` is only set if you hit the rate limit and status code 429 is returned. The other headers are always included.