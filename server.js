const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); // Phục vụ file tĩnh từ thư mục public

// Địa chỉ contract đã deploy trên Hardhat localhost
const contractAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'; // Địa chỉ của bạn

app.post('/setFee', (req, res) => {
    const { feePercent } = req.body;

    console.log(`Received request to set fee to: ${feePercent}`); // Log để debug

    // Mở terminal ảo và chạy Hardhat console
    const hardhatConsole = spawn('npx', ['hardhat', 'console', '--network', 'localhost'], {
        shell: true, // Dùng shell để chạy lệnh (cmd trên Windows)
        stdio: ['pipe', 'pipe', 'pipe'] // Cho phép tương tác với stdin/stdout/stderr
    });

    let output = '';
    let replies = []; // Lưu trữ reply từ Hardhat console

    // Lắng nghe output từ Hardhat console
    hardhatConsole.stdout.on('data', (data) => {
        const reply = data.toString().trim();
        console.log('Hardhat reply:', reply);
        output += reply + '\n';
        if (reply && !reply.includes('>')) { // Bỏ qua prompt ">"
            replies.push(reply);
        }
    });

    // Lắng nghe lỗi từ Hardhat console
    hardhatConsole.stderr.on('data', (data) => {
        const error = data.toString().trim();
        console.error('Hardhat error:', error);
        output += error + '\n';
        replies.push(error);
    });

    // Khi Hardhat console đóng
    hardhatConsole.on('close', (code) => {
        console.log(`Hardhat console closed with code ${code}`);
        console.log('All replies:', replies);

        // Lấy giá trị feePercent từ reply cuối cùng (lệnh `(await myToken.feePercent()).toString()`)
        const feeResult = replies[replies.length - 1] || 'Unknown';

        if (code === 0) {
            res.json({ feePercent: feeResult, replies: replies });
        } else {
            res.status(500).json({ error: 'Failed to execute Hardhat commands', replies: replies });
        }
    });

    // Gửi từng lệnh đến Hardhat console
    const commands = [
        `const MyToken = await ethers.getContractFactory("MyToken");\n`,
        `const myToken = await MyToken.attach("${contractAddress}");\n`,
        `await myToken.setFeePercent(${feePercent});\n`,
        `(await myToken.feePercent()).toString();\n`,
        '.exit\n' // Thoát Hardhat console
    ];

    // Gửi từng lệnh một cách tuần tự
    let commandIndex = 0;
    const sendNextCommand = () => {
        if (commandIndex < commands.length) {
            console.log('Sending command:', commands[commandIndex].trim());
            hardhatConsole.stdin.write(commands[commandIndex]);
            commandIndex++;
            // Chờ lâu hơn để đảm bảo Hardhat console trả về reply
            setTimeout(sendNextCommand, 2000); // Tăng thời gian chờ lên 2 giây
        }
    };

    // Bắt đầu gửi lệnh đầu tiên
    sendNextCommand();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});