import React, { useEffect, useState } from 'react';
import { getUsers } from '@/lib/jsonDB'; // Adjusted path
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: number;
  name: string;
  email: string;
}

const JsonUserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = () => {
      try {
        const allUsers = getUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users from JSON DB:", error);
        // Handle error appropriately in a real app
      }
    };

    fetchUsers();
  }, []);

  if (users.length === 0) {
    return <p>No users found in JSON data.</p>;
  }

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>Users from JSON DB</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {users.map(user => (
            <li key={user.id} className="mb-2 p-2 border rounded">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default JsonUserList;
