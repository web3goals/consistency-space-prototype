import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const accounts = [];
if (process.env.PRIVATE_KEY_1) {
  accounts.push(process.env.PRIVATE_KEY_1);
}
if (process.env.PRIVATE_KEY_2) {
  accounts.push(process.env.PRIVATE_KEY_2);
}

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    zoraTestnet: {
      url: process.env.RPC_URL_ZORA_TESTNET as string,
      accounts: accounts,
    },
    sepolia: {
      url: process.env.RPC_URL_SEPOLIA as string,
      accounts: accounts,
    },
    modeTestnet: {
      url: process.env.RPC_URL_MODE_TESTNET as string,
      accounts: accounts,
    },
  },
};

export default config;
