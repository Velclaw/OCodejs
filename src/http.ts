export interface FetchJsonOptions extends RequestInit {
  throwOnHttpError?: boolean;
  /** Abort the request after this many milliseconds. Must be a positive finite number. */
  timeoutMs?: number;
}

/** Fetch JSON and throw useful errors for HTTP failures, timeouts, or invalid JSON. */
export async function fetchJson<T = unknown>(input: RequestInfo | URL, init: FetchJsonOptions = {}): Promise<T> {
  const { throwOnHttpError = true, timeoutMs, signal: callerSignal, ...requestInit } = init;

  if (timeoutMs !== undefined && (!Number.isFinite(timeoutMs) || timeoutMs <= 0)) {
    throw new RangeError("timeoutMs must be a positive finite number");
  }

  const controller = timeoutMs === undefined ? undefined : new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const forwardAbort = () => controller?.abort(callerSignal?.reason);
  if (controller && callerSignal) {
    if (callerSignal.aborted) forwardAbort();
    else callerSignal.addEventListener("abort", forwardAbort, { once: true });
  }
  if (controller && timeoutMs !== undefined) {
    timeout = setTimeout(() => controller.abort(new DOMException("The request timed out", "TimeoutError")), timeoutMs);
  }

  try {
    const response = await fetch(input, {
      ...requestInit,
      ...(controller ? { signal: controller.signal } : callerSignal ? { signal: callerSignal } : {}),
    });
    if (throwOnHttpError && !response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error("HTTP " + response.status + " " + response.statusText + (body ? ": " + body.slice(0, 300) : ""));
    }
    try { return await response.json() as T; }
    catch (cause) { throw new TypeError("Response body is not valid JSON", { cause }); }
  } catch (cause) {
    if (controller?.signal.aborted && timeoutMs !== undefined && timeout !== undefined && controller.signal.reason instanceof DOMException && controller.signal.reason.name === "TimeoutError") {
      throw new Error("Request timed out after " + timeoutMs + "ms", { cause });
    }
    throw cause;
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
    if (controller && callerSignal) callerSignal.removeEventListener("abort", forwardAbort);
  }
}

export function jsonHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  if (!result.has("Accept")) result.set("Accept", "application/json");
  if (!result.has("Content-Type")) result.set("Content-Type", "application/json");
  return result;
}
export function jsonRequest<T>(body: T, init: RequestInit = {}): RequestInit {
  const serialized = JSON.stringify(body);
  if (serialized === undefined) throw new TypeError("Request body is not JSON-serializable");
  return { ...init, headers: jsonHeaders(init.headers), body: serialized };
}
