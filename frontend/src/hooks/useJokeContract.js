import { useContract } from "./useContract";
import Joke from "../contracts/JokesContract.json";
import JokeAddress from "../contracts/JokesContractAddress.json";

// export interface for smart contract
export const useJokeContract = () =>
  useContract(Joke.abi, JokeAddress.JokesContract);
