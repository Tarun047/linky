import {Message} from "@xenova/transformers/types/tokenizers";

export class LLMInitArgs {
    public constructor(
        public task: 'init',
        public model_id: string
    ) {
    }
}

export class LLMGenerateArgs {
    public constructor(
        public task: 'generate',
        public messages: Message[]
    ) {
    }
}

export type LLMWorkerArgs = LLMInitArgs | LLMGenerateArgs;