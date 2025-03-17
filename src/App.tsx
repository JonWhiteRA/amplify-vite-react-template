import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

const client = generateClient<Schema>();

function App() {
  const { signOut, user } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [userWidgetExpanded, setUserWidgetExpanded] = useState(false);
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [userRole, setUserRole] = useState("DEFAULT_ROLE");
  const [userAccessKey, setUserAccessKey] = useState("xxx");
  
  useEffect(() => {
    async function getUserInfo() {
      try {
        // Try to get current user info
        const currentUser = await getCurrentUser();
        console.log("Current user:", currentUser);
  
        // Try to get the session which might have additional info
        const session = await fetchAuthSession();
        console.log("Auth session:", session);
        console.log(session.tokens?.accessToken?.toString())

        // Check if we can find email in different locations
        if (user && user.signInDetails) {
          console.log("User from useAuthenticator:", user);
          
          // Only set these values if they exist
          if (user.signInDetails.loginId) {
            setUserEmail(user.signInDetails.loginId);
          }
          
          if (user.signInDetails.authFlowType) {
            setUserRole(user.signInDetails.authFlowType);
          }
          
          if (session.credentials?.accessKeyId) {
            setUserAccessKey(session.credentials.accessKeyId);
          }
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    }
    
    getUserInfo();
  }, [user]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  const userInitial = userEmail.charAt(0).toUpperCase();

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function toggleUserWidget() {
    setUserWidgetExpanded(!userWidgetExpanded);
  }

  return (
    <main>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 100
      }}>
        <div 
          onClick={toggleUserWidget}
          style={{
            backgroundColor: '#4f46e5',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '18px'
          }}
        >
          {userInitial}
        </div>
        
        {userWidgetExpanded && (
          <div style={{
            position: 'absolute',
            top: '45px',
            right: '0',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            width: '250px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Email:</strong> {userEmail}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Role:</strong> <em>{userRole}</em>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Access Key:</strong> <em>{userAccessKey}</em>
            </div>
            <button 
              onClick={signOut}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li
            onClick={() => deleteTodo(todo.id)} 
            key={todo.id}>
            {todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default App;