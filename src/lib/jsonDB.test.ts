// src/lib/jsonDB.test.ts
import { describe, it, expect, vi } from 'vitest'; // Or 'jest' if that's the setup
import { getUsers, getProducts, getUserById, getProductById, getAllData } from './jsonDB';

// Mock the database.json import
vi.mock('../data/database.json', () => ({
  default: {
    users: [
      { id: 1, name: 'Test User 1', email: 'test1@example.com' },
      { id: 2, name: 'Test User 2', email: 'test2@example.com' },
    ],
    products: [
      { id: 101, name: 'Test Product 1', price: 100 },
      { id: 102, name: 'Test Product 2', price: 200 },
    ],
  }
}));

describe('jsonDB utility functions', () => {
  describe('getUsers', () => {
    it('should return all users from the mock data', () => {
      const users = getUsers();
      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('Test User 1');
    });
  });

  describe('getProducts', () => {
    it('should return all products from the mock data', () => {
      const products = getProducts();
      expect(products).toHaveLength(2);
      expect(products[0].name).toBe('Test Product 1');
    });
  });

  describe('getUserById', () => {
    it('should return the correct user when a valid ID is provided', () => {
      const user = getUserById(1);
      expect(user).toBeDefined();
      expect(user?.name).toBe('Test User 1');
    });

    it('should return undefined when an invalid ID is provided', () => {
      const user = getUserById(999);
      expect(user).toBeUndefined();
    });
  });

  describe('getProductById', () => {
    it('should return the correct product when a valid ID is provided', () => {
      const product = getProductById(101);
      expect(product).toBeDefined();
      expect(product?.name).toBe('Test Product 1');
    });

    it('should return undefined when an invalid ID is provided', () => {
      const product = getProductById(999);
      expect(product).toBeUndefined();
    });
  });

  describe('getAllData', () => {
    it('should return all data from the mock data', () => {
      const data = getAllData();
      expect(data.users).toHaveLength(2);
      expect(data.products).toHaveLength(2);
      expect(data.users[0].name).toBe('Test User 1');
      expect(data.products[0].name).toBe('Test Product 1');
    });
  });
});
