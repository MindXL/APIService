import { watch } from 'chokidar';
import { ChildProcess, spawn } from 'child_process';

spawn('yarn', ['tsc', '-w'], {
    stdio: [process.stderr],
});

// spawn('yarn', ['nodemon', ' -w ./dist', './dist/index.js'], {
//     stdio: [process.stdout, process.stderr],
// });

// mimic nodemon
let node: ChildProcess;
const debouceNode = debouce(() => {
    node && node.kill();
    node = spawn('node', ['./dist/index.js'], {
        stdio: [process.stdout, process.stderr],
    });
}, 1000);
watch('./dist').on('all', (eventName, path) => {
    debouceNode();
});

function debouce(func: Function, delay: number, ...params: any[]): () => any {
    let timer: NodeJS.Timeout;

    return () => {
        let result: any;
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            result = func(...params);
        }, delay);
        return result;
    };
}
