# JSExpertHub
### Processing videos on browsers
<hr />

<img width=100% src="./demo.gif">
<br/>

### Prerequisites
<hr />

- Node.js v18.17.0
- O ideal é que você use o projeto em ambiente Unix (Linux). Se você estiver no Windows, é recomendado que use o [Windows Subsystem Linux](https://www.omgubuntu.co.uk/how-to-install-wsl2-on-windows-10) pois nas aulas são mostrados comandos Linux que possam não existir no Windows.
<br/>

### Running
<hr />

- Execute `npm ci` na pasta que contém o arquivo `package.json` para restaurar os pacotes
- Execute `npm start` e em seguida vá para o seu navegador em [http://localhost:3000](http://localhost:3000) para visualizar a página acima
<br/>

### Features
<hr />

- [x] Deve entender videos em formato MP4 mesmo se não estiverem fragmentados
- [x] Deve processar itens em threads isoladas com Web Workers
- [x] Deve converter fragmentos de videos em formato `144p`
- [x] Deve renderizar frames em tempo real em elemento canvas
- [x] Deve gerar arquivos WebM a partir de fragmentos
<br/>

### Challenges
<hr />

- [ ] Encodar em 360p e 720p
- [ ] Fazer encoding/decoding track de áudio
- [ ] Fazer também upload de track de áudio
- [ ] Concatenar o arquivo final no servidor em um arquivo só
- [ ] Corrigir problema do Webm de não mostrar a duração do video
- [ ] Corrigir a responsividade do site
- [ ] Tentar usar outros muxers
  - https://github.com/Vanilagy/webm-muxer
  - https://github.com/Vanilagy/mp4-muxer
<br/>

### Concepts
<hr/>

##### WebCodecs API

- ##### VideoEncoder (Webcodecs API)
  - Responsável por transformar o vídeo
  - trocar formato do audio, resolução tipo do arquivo
  - alta pra baixa resolução 

- ##### VideoDecoder (Webcodecs API)
  - entender o video encodado e voltar ao estado original

##### Web Workers
  - Threads no navegador

##### Muxer
  - Agrupar segmentos em um unico arquivo
  - Arquivo transformado para gerar arquivo em formato webm

##### Demuxer
  - Iniciar o processamento de um video existente
  - Identifcar formato origianl, duração, quebrar em pequenos pedaços
  - mp4box.js

<br/>

### Steps
<hr/>

1. Get mp4 file on demand.
2. `Demuxer` file using `mp4box.js`, to gather information about the file and break into fragments.
3. Encode each fragment using `VideoEncoder`, transforming each fragment from high resolution to low resolution.
4. `Muxer` each fragment, to generate small videos in webm format.
5. Upload each webm fragment to server.
6. Decode each fragment using `VideoDecoder`, to render the video turning into a HTML element.

<br/>


### Issues
<hr />

##### browser-sync está lançando erros no Windows e nunca inicializa:
Solução: Trocar o browser-sync pelo http-server.
1. instale o **http-server**  com `npm i -D http-server`
2. no package.json apague todo o comando do `browser-sync` e substitua por `npx http-server .`
3. agora o projeto vai estar executando na :8080 então vá no navegador e tente acessar o http://localhost:8080/

A única coisa, é que o projeto não vai reiniciar quando voce alterar algum código, vai precisar dar um F5 na página toda vez que alterar algo.

<br />

### References
<hr />

- https://github.com/ErickWendel/editing-videos-nodejs-ffmpeg/blob/main/recorded/src/index.js
- https://github.com/ffmpegwasm/ffmpeg.wasm/tree/main
- https://blog.scottlogic.com/2020/11/23/ffmpeg-webassembly.html
- https://github.com/ColinEberhardt/ffmpeg-wasm-streaming-video-player/tree/main
- https://ffmpegwasm.netlify.app/docs/getting-started/usage/

- https://developer.chrome.com/articles/fetch-streaming-requests/
- https://stackoverflow.com/a/69400632/4087199

- https://github.com/scalarhq/videotranscode.space
- https://docs.modfy.video/docs/processing#client-side-caveats
- https://www.w3.org/2021/03/media-production-workshop/talks/slides/qiang-fu-video-transcoding.pdf
- https://www.w3.org/2021/03/media-production-workshop/talks/qiang-fu-video-transcoding.html
- https://www.gumlet.com/learn/video-transcoding-what-is-transcoding/
- https://imagekit.io/blog/video-transcoding/
- https://developer.chrome.com/articles/webcodecs/
- https://portal.gitnation.org/contents/pushing-the-limits-of-video-encoding-in-browsers-with-webcodecs

- https://www.w3.org/TR/webcodecs-codec-registry/
- https://github.com/w3c/webcodecs/blob/f3ec7c962db46c0f211b4548fd89623d05de90b6/explainer.md#codec-configuration
- https://w3c.github.io/webcodecs/#dictdef-videodecoderconfig
- https://github.com/nickdesaulniers/netfix/blob/67b684e5f5b26d222cb913dde5a6cc46f6a5353e/demo/bufferAll.html

- https://transform.tools/json-to-jsdoc
- https://github.com/thenickdude/webm-writer-js
- https://github.com/Vanilagy/mp4-muxer
- https://github.com/Vanilagy/webm-muxer

- https://github.com/vjeux/mp4-h264-re-encode/blob/3f912f3d1ed448e507466206375ed7a06819d2d1/mp4box.html#L50-L62

- https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder/configure
- https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk