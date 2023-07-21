import { useState } from "react";
import { useSadoContext, Wallet } from "../providers/SadoContext";
import {
  CreatePsbtOptions,
  getAddressType,
  ordit,
} from "@sadoprotocol/ordit-sdk";
import { Psbt } from "bitcoinjs-lib";

type SendFunction = (
  address: string,
  satoshis: number
) => Promise<string | null>;

export function useSend(): [SendFunction, string | null, boolean] {
  const { wallet, network, address, publicKey } = useSadoContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const send: SendFunction = async (toAddress, satoshis) => {
    setLoading(true);
    try {
      setError(null);
      if (!address || !publicKey) throw new Error("No wallet is connected");

      const psbtTemplate: CreatePsbtOptions = {
        format: getAddressType(address, network),
        network,
        pubKey: publicKey,
        ins: [
          {
            address,
          },
        ],
        outs: [
          {
            address: toAddress,
            cardinals: satoshis,
          },
        ],
      };

      const unsignedPsbtBase64 = (
        await ordit.transactions.createPsbt(psbtTemplate)
      ).base64;
      const unsignedPsbt = Psbt.fromBase64(unsignedPsbtBase64);
      let signedPsbt = null;
      if (wallet === Wallet.UNISAT) {
        const signedUnisatPsbt = await ordit.unisat.signPsbt(unsignedPsbt);
        signedPsbt = signedUnisatPsbt.rawTxHex;
      } else if (wallet === Wallet.XVERSE) {
        const xverseSignPsbtOptions = {
          psbt: unsignedPsbt,
          network,
          inputs: [],
        };
        const signedXversePsbt = await ordit.xverse.signPsbt(
          xverseSignPsbtOptions
        );
        signedPsbt = signedXversePsbt.rawTxHex;

        if (!signedPsbt) {
          throw new Error("Xverse signing failed.");
        }
      } else {
        throw new Error("No wallet selected");
      }

      const txId = await ordit.transactions.relayTransaction(
        signedPsbt,
        network
      );
      setLoading(false);
      return txId;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return [send, error, loading];
}
