const Order = require('../models/orderModel');
const Meja = require('../models/mejaModel');
const Menu = require('../models/menuModel');

// Fungsi untuk membuat pesanan baru
// const createOrder = async (req, res) => {
//     const { tableNumber, items } = req.body;

//     try {
//         // Cek apakah meja tersedia
//         const meja = await Meja.findOne({ tableNumber, status: 'available' });
//         if (!meja) {
//             return res.status(400).json({ success: false, error: 'Meja tidak tersedia atau sedang dipesan' });
//         }

//         // Cek apakah semua item menu valid
//         const menuItems = await Menu.find({ _id: { $in: items.map(item => item.menuId) } });
//         if (menuItems.length !== items.length) {
//             return res.status(400).json({ success: false, error: 'Beberapa item menu tidak valid' });
//         }

//         // Hitung total harga
//         const total = items.reduce((acc, item) => {
//             const menuItem = menuItems.find(menu => menu._id.equals(item.menuId));
//             return acc + (menuItem.price * item.quantity);
//         }, 0);

//         // Buat pesanan
//         const order = new Order({
//             tableNumber,
//             items,
//             total,
//             status: 'pending'
//         });

//         const savedOrder = await order.save();

//         // Update status meja menjadi 'occupied'
//         await Meja.findOneAndUpdate({ tableNumber }, { status: 'occupied' });

//         res.status(201).json({ success: true, data: savedOrder });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

const createOrder = async (req, res, next) => {
    const { tableNumber, items } = req.body;

    try {
        // Cek apakah meja tersedia
        const meja = await Meja.findOne({ tableNumber, status: 'available' });
        if (!meja) {
            const error = new Error('Meja tidak tersedia atau sedang dipesan');
            error.statusCode = 400;
            throw error;
        }

        // Cek apakah semua item menu valid
        const menuItems = await Menu.find({ _id: { $in: items.map(item => item.menuId) } });
        if (menuItems.length !== items.length) {
            const error = new Error('Beberapa item menu tidak valid');
            error.statusCode = 400;
            throw error;
        }

        // Hitung total harga
        const total = items.reduce((acc, item) => {
            const menuItem = menuItems.find(menu => menu._id.equals(item.menuId));
            return acc + (menuItem.price * item.quantity);
        }, 0);

        // Buat pesanan
        const order = new Order({
            tableNumber,
            items,
            total,
            status: 'pending'
        });

        const savedOrder = await order.save();

        // Update status meja menjadi 'occupied'
        await Meja.findOneAndUpdate({ tableNumber }, { status: 'occupied' });

        res.status(201).json({ success: true, data: savedOrder });
    } catch (error) {
        next(error); // Lanjutkan ke error handling middleware
    }
};

// Fungsi untuk mengambil semua pesanan
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Fungsi untuk mengupdate status pesanan
const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' });
        }

        // Jika status pesanan selesai, kembalikan status meja menjadi 'available'
        if (status === 'completed') {
            await Meja.findOneAndUpdate({ tableNumber: order.tableNumber }, { status: 'available' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    updateOrderStatus
};