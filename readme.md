# Leveraging SLMs on your browser

1. This repo contains a simple example of how to leverage various web technologies to run a Small Language Model right on your browser.
2. You can have a read at the medium article here: 
2. The tech stack includes:
   1. React because it's the best Frontend library ;)
   2. Typescript, cause I don't like JS.
   3. Web GPU APIs enabling the browser to use GPU power.
   4. Transformer.js for SLM inference
   5. Vite for bundling

---
# How to run this locally

1. Clone this repo with `git clone --recursive git@github.com:Tarun047/linky.git`
2. Then we need to install and build the dependencies of the transformers v3 (pre-release), at some point in future when the stable version of this library is out we don't need  this but for now run `cd transformers.js && npm install && npm run build && cd ..`
3. Then we need to install and build the dependencies of this project by running `cd linky-ui && npm install`
4. Now we can launch the dev server by running `npm run dev` and fireup a browser that supports WebGPU like chrome and head to `http://localhost:5173` to experience the SLM.
