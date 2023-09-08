import { Provider } from "@prisma/client";
import { EChains } from "@types";
import { BigNumberish, providers, utils } from "ethers";

export async function initialiseGasPrice(gasPrice: BigNumberish | undefined, prov: providers.JsonRpcProvider, provider: Provider) {

    if(gasPrice) {
        return gasPrice
    }

    if(provider && provider.gasPrice) {
        let _gasPrice = await prov.getGasPrice()
        let _block = await prov.getBlock("pending")
        let numberGas = Math.ceil( Number(provider.gasPrice))
        numberGas = (100 + numberGas)
        
        const resultGas = _gasPrice.mul(numberGas).div(100)

        console.log("baseFeePerGas", _block.baseFeePerGas?.toString)
        console.log(`initialiseGasPrice\nGasPrice: ${_gasPrice?.toString()}\nCustomGasPercent: ${numberGas}\nResultGas: ${resultGas.toString()}`)
        // throw `${utils.formatUnits(_block.baseFeePerGas || "0", "gwei")} - ${utils.formatUnits(_gasPrice, "gwei")} - ${utils.formatUnits(resultGas, "gwei")}`
        return resultGas

        // return utils.parseUnits(provider.gasPrice, "gwei") 
    }

    return await prov.getGasPrice()
}