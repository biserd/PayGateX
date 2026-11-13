import type { PaymentPayload, PaymentRequired, PaymentRequirements, SettleResponse } from "@x402/core/types";
import type { FacilitatorClient } from "@x402/core/server";
import { createPublicClient, http, parseAbi, parseAbiItem, parseEventLogs, parseUnits, type Address, type Hex } from "viem";
import { baseSepolia } from "viem/chains";
import { getNetworkConfig } from "../services/network-config";
import type { OperationInput } from "@shared/paygate";
import type { Purchase } from "./store";

const base = getNetworkConfig("base-sepolia");
export const network = `eip155:${base.chainId}` as const;
export const asset = base.usdcAddress as Address;
export const requirements = (op: OperationInput): PaymentRequirements => ({
  scheme: "exact", network, asset, payTo: op.payTo,
  amount: parseUnits(op.price, 6).toString(), maxTimeoutSeconds: 90,
  extra: { name: "USDC", version: "2" },
});
export const challenge = (p: Purchase): PaymentRequired => ({
  x402Version: 2, error: "Payment required", resource: p.resource, accepts: [p.requirement],
});
export const paymentPrefix = "PayGate402";
export const randomIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export interface Payments extends Pick<FacilitatorClient, "verify" | "settle"> {
  reconcile(purchase: Purchase): Promise<SettleResponse | undefined>;
}

export function same(a: unknown, b: unknown) {
  const encode = (v: unknown): string => {
    if (Array.isArray(v)) return "[" + v.map(encode).join(",") + "]";
    if (v && typeof v === "object") return "{" + Object.keys(v).sort().map(k =>
      JSON.stringify(k) + ":" + encode((v as Record<string, unknown>)[k])).join(",") + "}";
    return JSON.stringify(v);
  };
  return encode(a) === encode(b);
}

// Read only. Reconcile an uncertain settle by confirming both the authorization
// and the exact transfer in the same confirmed receipt. Never broadcast again.
export function paymentService(facilitator: FacilitatorClient, rpcUrl = base.rpcUrl): Payments {
  const rpc = createPublicClient({ chain: baseSepolia, transport: http(rpcUrl, { timeout: 7000, retryCount: 0 }) });
  const used = parseAbiItem("event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce)");
  const transfer = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");
  const abi = parseAbi(["function authorizationState(address authorizer, bytes32 nonce) view returns (bool)"]);
  return {
    verify: (payload: PaymentPayload, req) => facilitator.verify(payload, req),
    settle: (payload: PaymentPayload, req) => facilitator.settle(payload, req),
    async reconcile(p) {
      const a = p.evm_authorization;
      if (!a) return;
      const token = p.requirement.asset as Address;
      const from = a.from as Address, nonce = a.nonce as Hex;
      if (!await rpc.readContract({ address: token, abi, functionName: "authorizationState", args: [from, nonce] })) return;
      const toBlock = await rpc.getBlockNumber();
      // Search the bounded Base Sepolia reconciliation window. Older incidents
      // stay unknown and require operator investigation.
      for (let offset = 0n; offset < 7200n && toBlock >= offset; offset += 1500n) {
        const end = toBlock - offset;
        const logs = await rpc.getLogs({
          address: token, event: used, args: { authorizer: from, nonce }, fromBlock: end > 1499n ? end - 1499n : 0n, toBlock: end,
        });
        for (const log of logs) {
          if (log.blockNumber === null || toBlock < log.blockNumber + 2n || !log.transactionHash) continue;
          const receipt = await rpc.getTransactionReceipt({ hash: log.transactionHash });
          if (receipt.status !== "success") continue;
          const matching = receipt.logs.filter(l => l.address.toLowerCase() === token.toLowerCase());
          if (parseEventLogs({ abi: [transfer], logs: matching }).some(l =>
            l.args.from.toLowerCase() === from.toLowerCase() &&
            l.args.to.toLowerCase() === a.to.toLowerCase() && l.args.value === BigInt(a.value))) {
            return { success: true, transaction: receipt.transactionHash, network, payer: from };
          }
        }
      }
    },
  };
}
