const Customer = require("../models/Customer");

/**
 * Create a new customer
 */
const createCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required"
      });
    }

    // prevent duplicate phone numbers
    const existingCustomer = await Customer.findOne({ where: { phone } });
    if (existingCustomer) {
      return res.status(409).json({
        message: "Customer with this phone number already exists"
      });
    }

    const customer = await Customer.create({ name, phone });

    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create customer"
    });
  }
};

/**
 * Get customer by ID
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch customer"
    });
  }
};

/**
 * Get all customers
 */
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch customers"
    });
  }
};

module.exports = {
  createCustomer,
  getCustomerById,
  getAllCustomers
};
