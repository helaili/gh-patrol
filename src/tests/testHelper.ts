import { InvocationContext, HttpRequest, HttpRequestParams } from "@azure/functions";
import { Blob } from "buffer";
import { FormData, Headers } from "undici";

export const buildContext = (): InvocationContext => ({
  functionName: '',
  invocationId: '',
  extraOutputs: undefined,
  extraInputs: undefined, 
  options: undefined,
  traceContext: undefined, 
  log: () => {},
  error: () => {},
  info: () => {},
  warn: () => {},
  trace: () => {},
  debug: () => {}
});

export const buildHttpRequest = (): HttpRequest => {
  const request: HttpRequest = {
    url: 'https://example.com',
    method: 'POST',
    query: new URLSearchParams(),
    headers: new Headers(),
    params: undefined,
    body: undefined,
    text: async () => '',
    json: async () => ({}),
    user: undefined,
    bodyUsed: false,
    arrayBuffer: function (): Promise<ArrayBuffer> {
      throw new Error("Function not implemented.");
    },
    blob: function (): Promise<Blob> {
      throw new Error("Function not implemented.");
    },
    formData: function (): Promise<FormData> {
      throw new Error("Function not implemented.");
    },
    clone: function (): HttpRequest {
      throw new Error("Function not implemented.");
    }
  };
  return request;
};
