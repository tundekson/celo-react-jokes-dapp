import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Notification } from "./components/ui/Notifications";
import Wallet from "./components/Wallet";
import Cover from "./components/Cover";
import { useBalance, useJokeContract, useJokeNftContract } from "./hooks";
import "./App.css";
import Index from "./components/views/Index";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Profile from "./components/views/Profile";
import Leaderboard from "./components/views/Leaderboard";

const App = function AppWrapper() {
  const { address, destroy, connect } = useContractKit();
  const { balance } = useBalance();

  const jokeContract = useJokeContract();

  const jokeNftContract = useJokeNftContract();

  return (
    <>
      <Notification />
      <BrowserRouter>
        {address ? (
          <Container fluid="md">
            <Nav className="pt-3 pb-5">
              <Nav.Item className="ml-auto">
                <Navbar.Brand to="/">
                  <Link to={"/"}><h3>Jokes</h3></Link>
                </Navbar.Brand>
                
              </Nav.Item>
              <Nav.Item className="ms-auto">
                {/*display user wallet*/}
                <Wallet
                  address={address}
                  amount={balance.CELO}
                  symbol="CELO"
                  destroy={destroy}
                />
              </Nav.Item>
            </Nav>
            {/* display cover */}
            <main>
              <section className="container-fluid about">
                <Routes>

                  {/* <Index /> */}
                  <Route index element={<Index address={address} jokeContract={jokeContract} />} />
                  <Route path="profile/:paramAddress?" element={<Profile address={address} jokeContract={jokeContract} jokeNftContract={jokeNftContract}/>} />
                  <Route path="leaderboard" element={<Leaderboard address={address} jokeContract={jokeContract} />} />
                </Routes>
              </section>
            </main>
          </Container>
        ) : (
          // display cover if user is not connected
          <div className="App">
            <header className="App-header">
              <Cover connect={connect} />
            </header>
          </div>
        )}
      </BrowserRouter>
    </>
  );
};

export default App;
