import { ProviderContainer } from "@components/settings/providerContainer";
import { EChains, IProvider } from "@types";
import { apiGetRequest, apiMethodRequest } from "@utils/apiRequest";

async function fetchProviders(): Promise<Array<IProvider>> {
  return await apiGetRequest("/api/settings/providers", {
    next: { tags: ["providers"] },
  });
}

export default async function Setting() {
  let providers = await fetchProviders();

  if (!providers?.length) {
    providers = await apiMethodRequest("/api/settings/providers", "POST", [
      { chain: EChains.ETH, url: "https://mainnet.infura.io/v3/API_KEY" },
      { chain: EChains.ZKSYNC, url: "https://mainnet.era.zksync.io" },
    ]);
  }
  return (
    <div>
      <ProviderContainer providers={providers} />
    </div>
  );
}