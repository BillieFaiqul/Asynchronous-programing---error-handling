const Menu = require("../models/menuModel");

// Wrapper untuk mengubah Promise menjadi callback style
function withCallback(promise, callback) {
  promise
    .then(data => callback(null, data))
    .catch(err => callback(err));
}

// Fungsi untuk membuat menu item
const createMenuItem = (req, res) => {
  const newMenuItem = new Menu(req.body);
  
  withCallback(newMenuItem.save(), (err, savedItem) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(savedItem);
  });
};

// Fungsi untuk mengambil semua menu item
const getAllMenuItems = (req, res) => {
  withCallback(Menu.find({}), (err, items) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(items);
  });
};

const getMenuByCategory = (req, res) => {
    const category = req.params.category;
  
    withCallback(Menu.find({ category }), (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      if (items.length === 0) return res.status(404).json({ error: `Menu with category '${category}' not found` });
  
      res.json(items);
    });
  };

// Ekspor fungsi-fungsi sebagai objek
module.exports = {
    getAllMenuItems, 
    createMenuItem,
    getMenuByCategory
};

