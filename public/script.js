const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Thay bằng địa chỉ contract thật
const abi = [
    "function setFeePercent(uint256 newFee) public"
];

async function setFeePercent(newFee) {
    console.log("🔵 Bắt đầu cập nhật phí giao dịch...");

    if (typeof window.ethereum !== "undefined") {
        console.log("✅ MetaMask đã được tìm thấy");

        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("✅ Tài khoản đã được kết nối");

        try {
            console.log("📡 Khởi tạo provider...");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            console.log("✅ Provider khởi tạo thành công:", provider);

            console.log("🖊️ Lấy signer...");
            const signer = provider.getSigner();
            console.log("✅ Signer đã sẵn sàng:", await signer.getAddress());

            console.log("🏛️ Khởi tạo smart contract...");
            const contract = new ethers.Contract(contractAddress, abi, signer);
            console.log("✅ Contract đã sẵn sàng:", contract);

            console.log(`📌 Gửi giao dịch với newFee = ${newFee}`);
            const tx = await contract.setFeePercent(newFee);
            console.log("⏳ Đang chờ xác nhận giao dịch...");
            await tx.wait();
            console.log("✅ Giao dịch thành công:", tx);
            alert(`Phí giao dịch được cập nhật thành ${newFee / 100}%`);
        } catch (error) {
            console.error("❌ Lỗi khi thực thi setFeePercent():", error);
            alert("Giao dịch thất bại! Xem console để biết chi tiết.");
        }
    } else {
        console.error("❌ MetaMask chưa được cài đặt!");
        alert("Vui lòng cài đặt MetaMask!");
    }
}
