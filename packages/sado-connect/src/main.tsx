import React from "react";
import ReactDOM from "react-dom/client";
import { useBalance } from "./hooks/useBalance";
import { useSend } from "./hooks/useSend";
import { SadoConnectKit, useSign } from "./index";
import { SadoConnectProvider, useSadoContext } from "./providers/SadoContext";
import "./style.css";

function SampleComponent() {
  const [send, error, loading] = useSend();
  const [getBalance] = useBalance();
  const [sign] = useSign();
  const [result, setResult] = React.useState("");
  const [balance, setBalance] = React.useState(0);

  const { address } = useSadoContext();

  return (
    <div>
      <span>{balance > 0 && `Wallet Balance: ${balance}`}</span>
      <span>{address && `Connected Address: ${address}`}</span>
      <span>{result && `Transaction ID: ${result}`}</span>
      <span>{error && `Error: ${error}`}</span>
      <span>{loading && `Loading`}</span>
      <button
        onClick={async () => {
          const txId = await send(
            "tb1qgypdud5xr0x0wugf5yv62z03ytkwxusjwsr9kq",
            1,
            2,
          );
          if (typeof txId === "string") setResult(txId);
        }}
      >
        Send money
      </button>
      <button
        onClick={async () => {
          const walletBalance = await getBalance();
          if (typeof walletBalance === "number") setBalance(walletBalance);
        }}
      >
        Check balance
      </button>
      <button
        onClick={async () => {
          const signed = await sign(
            "cHNidP8BAFICAAAAARXJoLPdXB0nA98DsK0PaC5ABbmJbxKPAZ+WUvKJYgieAAAAAAD/////AaRCDwAAAAAAFgAUQQLeNoYbzPdxCaEZpQnxIuzjchIAAAAAAAEBH2QAAAAAAAAAFgAUQQLeNoYbzPdxCaEZpQnxIuzjchIBAwSDAAAAAAA=",
            { extractTx: false },
          );
          console.log(signed);
        }}
      >
        Sign PSBT
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SadoConnectProvider initialNetwork={"testnet"} initialSafeMode={true}>
      <SampleComponent />
      <SadoConnectKit />
    </SadoConnectProvider>
  </React.StrictMode>,
);
