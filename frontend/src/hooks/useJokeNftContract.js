import { useContract } from "./useContract";
import JokeNFT from "../contracts/JokeNFT.json";
import JokeNFTAddress from "../contracts/JokeNFTAddress.json";

// export interface for smart contract
export const useJokeNftContract = () =>
  useContract(JokeNFT.abi, JokeNFTAddress.JokeNFT);
