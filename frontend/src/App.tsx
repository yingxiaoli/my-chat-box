import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { ApolloProvider } from "@apollo/client";
import client from "./graphql/client";
import Chat from "./components/Chat";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <ApolloProvider client={client}>
      <Chat />
    </ApolloProvider>
  );
}

export default App;
