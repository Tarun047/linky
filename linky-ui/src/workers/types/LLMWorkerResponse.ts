export class LLMWorkerUpdateResponse {
    public constructor(
        public type: "update",
        public content: string,
    ) {
    }
}

export class FileProgressIndicator {
    public constructor(
        public file: string,
        public loaded: number,
        public name: string,
        public progress: number,
        public status: "progress" | "done",
        public total: number) {
    }
}

export class LLMWorkerDownloadStatusUpdateResponse {
    public constructor(
        public type: "download_update",
        public progressIndicator: FileProgressIndicator
    ) {
    }
}

export class LLMWorkerStreamingMessageResponse {
    public constructor(
        public type: "streaming_message",
        public content: string,
        public tokensPerSecond: number
    ) {

    }
}

export type LLMWorkerResponse =
    LLMWorkerUpdateResponse
    | LLMWorkerStreamingMessageResponse
    | LLMWorkerDownloadStatusUpdateResponse