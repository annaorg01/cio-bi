import dbData from '../data/database.json';

// Define interfaces for our data structures
interface User {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Database {
  users: User[];
  products: Product[];
}

// Function to get all users
export const getUsers = (): User[] => {
  return (dbData as Database).users;
};

// Function to get all products
export const getProducts = (): Product[] => {
  return (dbData as Database).products;
};

// Function to get user by ID
export const getUserById = (id: number): User | undefined => {
  return (dbData as Database).users.find(user => user.id === id);
};

// Function to get product by ID
export const getProductById = (id: number): Product | undefined => {
  return (dbData as Database).products.find(product => product.id === id);
};

// Potentially, you could add functions to get all data
export const getAllData = (): Database => {
  return dbData as Database;
};
