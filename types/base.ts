import { Account, AccountsGroup, Coin, CoinBalance } from "@prisma/client";
import { ETimeType } from "./enums";

// $ Base
export interface IAccount {
    id?: string | null;
    name?: string;
    privateKey: string;
    address: string;
    coinBalances?: CoinBalance[];
    group?: AccountsGroup | null;
    groupId?: string | null;
  }
  
  export interface IAccountGroup {
    id?: string;
    name?: string;
    accounts?: Account[];
  }
  
  export interface ICoin {
    id?: string;
    chain: string;
    symbol: string;
    decimals: number;
    address: string;
    balances?: CoinBalance[] | undefined;
  }
  
  export interface ICoinBalance {
    id?: string;
    balance: string;
    updatedAt: Date | string;
  
    coin?: Coin;
    coinId?: string;
    account?: Account;
    accountId?: string;
  }
  
  export interface IContract {
    id?: string;
    chain: string;
    protocol: string;
    name: string;
    address: string;
  }

  export interface IProvider {
    id?: string;
    chain: string;
    url: string;
    gasPrice?: string;
    gasPercent?: number;
  }

  export interface IExchange {
    id?: string;
    name: string;
    url: string;
    credentials: {
      apiKey?: string;
      secretKey?: string;
      passphrase?: string;
    }
  }