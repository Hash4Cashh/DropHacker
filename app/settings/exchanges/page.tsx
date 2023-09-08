import { ExchangesContainer } from "@components/settings/exchangesContainer";
import { Exchange } from "@prisma/client";
import { EExchanges } from "@types";
import { apiGetRequest, apiMethodRequest } from "@utils/apiRequest";
import axios from "axios";

async function fetchProviders(): Promise<Array<Exchange>> {
  return await apiGetRequest("/api/settings/exchanges", {
    next: { tags: ["exchanges"] },
  });
}

export default async function Exchanges() {
  let exchanges = await fetchProviders();

  if (!exchanges?.length) {
    exchanges = await apiMethodRequest("/api/settings/exchanges", "POST", [
      {
        name: EExchanges.OKEX,
        url: "https://www.okx.com",
        credentials: {
          apiKey: "apiKey",
          secretKey: "secretKey",
          passphrase: "passphrase",
        }
      },
    ]);
  }
  console.log("EXCHANGES", exchanges);
  return (
    <div>
      <ExchangesContainer exchanges={exchanges} />
    </div>
  );
}

{
  /* <div className="card-container settings drop-shadow-lg">
        <h3 className="font-bold text-2xl">Providers</h3>

        <div className="flex flex-inline gap-4 items-center">
          <label
            className="font-bold"
            style={{ minWidth: "120px", fontSize: "1rem" }}
          >
            Mainet
          </label>
          <InputTextDropDown
            value={mainetProvider?.url}
            setValue={setMainetFns.editByKey("url")}
            width="40%"
          />
        </div>

        <div className="flex flex-inline gap-4 items-center">
          <label
            className="font-bold"
            style={{ minWidth: "120px", fontSize: "1rem" }}
          >
            zkSync
          </label>
          <InputTextDropDown
            value={zkSyncProvider?.url}
            setValue={setZkSyncFns.editByKey("url")}
            width="40%"
          />
        </div>

        <div style={{ display: "flex", marginTop: "1rem" }}>
          <BtnPrimary
            prefix={bools.inProgress && <Spinner />}
            inProgress={bools.inProgress}
            text="Save"
            onClick={saveHandler}
          />
        </div>
      </div> */
}
