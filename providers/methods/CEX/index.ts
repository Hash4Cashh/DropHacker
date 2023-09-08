import { EExchanges } from "@types";
import okex from "./okex";

const cexExchanges = {
    [EExchanges.OKEX]: okex
}

export default cexExchanges;