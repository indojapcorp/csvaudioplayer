const wasmWorker = (uInt8Array) => {
    fetch('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/sql-wasm.wasm')
    .then(response => {
        if (response.ok) {
            response.arrayBuffer().then(wasmBinary => {
                WebAssembly.instantiate(wasmBinary, {
                    env: {
                        memoryBase: 0,
                        tableBase: 0,
                        memory: new WebAssembly.Memory({ initial: 256 }),
                        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
                    }
                }).then(result => {
                    const SQL = result.instance.exports;
                    postMessage(SQL);
                }).catch(error => {
                    console.error(error);
                });
            });
        } else {
            console.error('Failed to fetch sql-wasm.wasm');
        }
    }).catch(error => {
        console.error(error);
    });
};

onmessage = (event) => {
    wasmWorker(event.data);
};