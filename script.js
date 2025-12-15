const { createFFmpeg, fetchFile } = FFmpeg;

// បង្កើត instance របស់ FFmpeg និងបើក Log ដើម្បីមើលដំណើរការ
const ffmpeg = createFFmpeg({ 
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js', // កំណត់ Path ឱ្យច្បាស់
    logger: ({ message }) => {
        const logsDiv = document.getElementById('logs');
        logsDiv.innerHTML += `<br>${message}`;
        logsDiv.scrollTop = logsDiv.scrollHeight; // Scroll ចុះក្រោម
    }
});

const load = async () => {
    try {
        await ffmpeg.load();
        document.getElementById('status').innerText = '✅ FFmpeg ដំណើរការរួចរាល់! សូម Upload វីដេអូ។';
        document.getElementById('status').style.color = 'green';
        document.getElementById('uploader').disabled = false;
    } catch (error) {
        console.error(error);
        document.getElementById('status').innerText = '❌ Load បរាជ័យ! សូមពិនិត្យមើល _headers file';
    }
};

// ដំណើរការពេលបើកវេបសាយភ្លាម
load();

const uploader = document.getElementById('uploader');
const trimBtn = document.getElementById('trim-btn');
const originalVideo = document.getElementById('original-video');
const outputVideo = document.getElementById('output-video');

// ពេល User ជ្រើសរើសវីដេអូ
uploader.addEventListener('change', async ({ target: { files } }) => {
    const file = files[0];
    // បង្ហាញវីដេអូដើម
    originalVideo.src = URL.createObjectURL(file);
    
    // សរសេរ file ចូលក្នុង Memory របស់ FFmpeg (Virtual File System)
    // ដាក់ឈ្មោះវាថា 'input.mp4' ដើម្បីស្រួលហៅប្រើ
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));

    trimBtn.disabled = false;
});

// ពេលចុចប៊ូតុង "កាត់"
trimBtn.addEventListener('click', async () => {
    document.getElementById('status').innerText = 'កំពុងកាត់ត... សូមរង់ចាំ (កុំបិទ Tab)';
    
    // *** នេះជាកន្លែងសរសេរ Command ដូចប្រើក្នុង Terminal ***
    // -i input.mp4 : យកវីដេអូចូល
    // -t 3 : យកតែរយៈពេល 3 វិនាទី
    // output.mp4 : ឈ្មោះវីដេអូដែលចេញមកវិញ
    await ffmpeg.run('-i', 'input.mp4', '-t', '3', 'output.mp4');

    // អានវីដេអូដែលធ្វើរួចចេញពី Memory
    const data = ffmpeg.FS('readFile', 'output.mp4');

    // បង្កើត URL ដើម្បីឱ្យមើលកើតក្នុង Browser
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    
    outputVideo.src = url;
    document.getElementById('status').innerText = '🎉 រួចរាល់!';
});
