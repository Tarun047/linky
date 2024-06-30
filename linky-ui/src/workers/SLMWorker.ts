import {
    AutoTokenizer,
    PreTrainedTokenizer,
    PreTrainedModel,
    AutoModelForCausalLM,
    Message, TextStreamer, round
} from "@xenova/transformers";
import {SLMWorkerArgs} from "./types/SLMWorkerArgs.ts";
import {
    FileProgressIndicator,
    SLMWorkerDownloadStatusUpdateResponse,
    SLMWorkerStreamingMessageResponse,
    SLMWorkerUpdateResponse
} from "./types/SLMWorkerResponse.ts";
import {Tensor} from "@xenova/transformers/types/utils/tensor";

class CallbackTextStreamer extends TextStreamer {
    constructor(public tokenizer: PreTrainedTokenizer, public callback: (output: string) => void) {
        super(tokenizer, {
            skip_prompt: true,
            decode_kwargs: {
                skip_special_tokens: true
            }
        });
    }

    on_finalized_text(text: string, _: boolean) {
        this.callback(text)
    }
}

class SLMWorker {
    private tokenizer: PreTrainedTokenizer;
    private model: PreTrainedModel;
    private static instance: SLMWorker;

    private constructor(model: PreTrainedModel, tokenizer: PreTrainedTokenizer) {
        this.model = model;
        this.tokenizer = tokenizer;
    }

    public async generate(messages: Message[]): Promise<void> {
        const inputs = this.tokenizer.apply_chat_template(messages, {
            add_generation_prompt: true,
            return_dict: true,
        }) as {
            input_ids: number[] | Tensor | number[][],
            attention_mask: number[] | Tensor | number[][],
            token_type_ids?: number[] | Tensor | number[][]
        };

        let numTokens = 0;
        let start = performance.now();

        const streamer = new CallbackTextStreamer(this.tokenizer, (output) => {
            numTokens++;
            const tps = round(numTokens / (performance.now() - start) * 1000, 2);
            self.postMessage(new SLMWorkerStreamingMessageResponse("streaming_message", output, tps))
        });

        const outputs = await this.model.generate({
            ...inputs,
            max_new_tokens: 512,
            streamer: streamer
        }) as Tensor;

        this.tokenizer.batch_decode(outputs, {skip_special_tokens: false});
         postMessage(new SLMWorkerUpdateResponse("update", "generation_done"));
    }

    public static async getInstance(model_id: string) {
        if (!SLMWorker.instance) {
            const progress_callback = (progressIndicator: FileProgressIndicator) => {
                postMessage(new SLMWorkerDownloadStatusUpdateResponse("download_update", progressIndicator));
            }
            postMessage(new SLMWorkerUpdateResponse("update", "Downloading model ..."));
            const model = await AutoModelForCausalLM.from_pretrained(model_id, {
                use_external_data_format: true,
                device: "webgpu",
                dtype: 'q4',
                progress_callback
            })
            const tokenizer = await AutoTokenizer.from_pretrained(model_id, {legacy: true});
            SLMWorker.instance = new SLMWorker(model, tokenizer);
            const inputs = tokenizer('a');
            await model.generate({...inputs, max_new_tokens: 1, progress_callback});
            postMessage(new SLMWorkerUpdateResponse("update", "ready"));
        }
        return SLMWorker.instance;
    }
}

let generator: SLMWorker;
self.addEventListener('message', async (event: MessageEvent<SLMWorkerArgs>) => {
    const args = event.data;
    if (args.task == 'init') {
        generator = await SLMWorker.getInstance(args.model_id);
    }

    if (args.task == 'generate') {
        await generator.generate(args.messages);
    }
})