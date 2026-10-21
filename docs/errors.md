---
description: Understand Groq API error codes, response structures, and best practices for error handling and debugging.
title: API Error Codes and Responses - GroqDocs
image: https://console.groq.com/og_cloudv5.jpg
---

# API Error Codes and Responses

Our API uses standard HTTP response status codes to indicate the success or failure of an API request. In cases of errors, the body of the response will contain a JSON object with details about the error. Below are the error codes you may encounter, along with their descriptions and example response bodies.

## [Success Codes](#success-codes)

* **200 OK**: The request was successfully executed. No further action is needed.

## [Client Error Codes](#client-error-codes)

* **400 Bad Request**: The server could not understand the request due to invalid syntax. Review the request format and ensure it is correct.
* **401 Unauthorized**: The request was not successful because it lacks valid authentication credentials for the requested resource. Ensure the request includes the necessary authentication credentials and the api key is valid.
* **403 Forbidden**: The request is not allowed due to permission restrictions. Ensure the request includes the necessary permissions to access the resource or that your permissions are configured correctly to make a request to the resource.
* **404 Not Found**: The requested resource could not be found. Check the request URL and the existence of the resource.
* **413 Request Entity Too Large**: The request body is too large. Please reduce the size of the request body.
* **422 Unprocessable Entity**: The request was well-formed, but could not be followed due to semantic errors or model hallucinations. Verify the data provided for correctness and completeness or retry your request.
* **424 Failed Dependency**: The request failed because the dependent request failed. This may occur when using [Remote MCP](https://console.groq.com/docs/mcp) in the case of authentication issues.
* **429 Too Many Requests**: Too many requests were sent in a given timeframe. Implement request throttling and respect rate limits.
* **498 Custom: Flex Tier Capacity Exceeded**: This is a custom status code we use and will return in the event that the flex tier is at capacity and the request won't be processed. You can try again later.
* **499 Custom: Request Cancelled**: This is a custom status code we use in our logs page to signify when the request is cancelled by the caller.

## [Server Error Codes](#server-error-codes)

You will not be charged for requests that return server error codes.

* **500 Internal Server Error**: A generic error occurred on the server. Try the request again later or contact support if the issue persists.
* **502 Bad Gateway**: The server received an invalid response from an upstream server. This may be a temporary issue; retrying the request might resolve it.
* **503 Service Unavailable**: The server is not ready to handle the request, often due to maintenance or overload. Wait before retrying the request.

## [Informational Codes](#informational-codes)

* **206 Partial Content**: Only part of the resource is being delivered, usually in response to range headers sent by the client. Ensure this is expected for the request being made.

## [Error Object Explanation](#error-object-explanation)

When an error occurs, our API returns a structured error object containing detailed information about the issue. This section explains the components of the error object to aid in troubleshooting and error handling.

## [Error Object Structure](#error-object-structure)

The error object follows a specific structure, providing a clear and actionable message alongside an error type classification:

JSON

```
{
  "error": {
    "message": "String - description of the specific error",
    "type": "invalid_request_error"
  }
}
```

## [Components](#components)

* **`error` (object):** The primary container for error details.  
  * **`message` (string):** A descriptive message explaining the nature of the error, intended to aid developers in diagnosing the problem.
  * **`type` (string):** A classification of the error type, such as `"invalid_request_error"`, indicating the general category of the problem encountered.