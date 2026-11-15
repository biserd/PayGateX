import express, { type Express } from "express";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import ganache from "ganache";
import solc from "solc";
import { createPublicClient, createWalletClient, http, parseAbi, toHex, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { x402Facilitator } from "@x402/core/facilitator";
import { ExactEvmScheme } from "@x402/evm/exact/facilitator";
import { toFacilitatorEvmSigner } from "@x402/evm";
import { asset, network } from "../server/paygate/payment";

export async function listen(app: Express | Server, port = 0, host = "127.0.0.1") {
  const server = typeof app === "function" ? createServer(app) : app;
  server.listen(port, host);
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No local port");
  return { server, origin: `http://127.0.0.1:${address.port}`, port: address.port,
    close: () => new Promise<void>((resolve, reject) => {
      server.close(err => err ? reject(err) : resolve());
      server.closeAllConnections();
    }),
  };
}

// Only installed on the isolated local chain. Real EIP-712 verification, nonce
// consumption, balance changes and logs; no bridge to the actual Base Sepolia network.
const source = `
pragma solidity ^0.8.20;
contract SandboxUSDC {
    string public constant name = "USDC";
    string public constant version = "2";
    uint8 public constant decimals = 6;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(bytes32 => bool)) public authorizationState;
    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);
    event Transfer(address indexed from, address indexed to, uint256 value);
    function mint(address to, uint256 value) external { balanceOf[to] += value; }
    function transferWithAuthorization(address from, address to, uint256 value,
        uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external {
        require(block.timestamp > validAfter && block.timestamp < validBefore, "authorization expired");
        require(!authorizationState[from][nonce], "authorization used");
        bytes32 domain = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(name)), keccak256(bytes(version)), block.chainid, address(this)));
        bytes32 body = keccak256(abi.encode(
            keccak256("TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"),
            from, to, value, validAfter, validBefore, nonce));
        require(from != address(0) && ecrecover(keccak256(abi.encodePacked(hex"1901", domain, body)), v, r, s) == from, "invalid signature");
        authorizationState[from][nonce] = true;
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit AuthorizationUsed(from, nonce);
        emit Transfer(from, to, value);
    }
}`;
const tokenAbi = parseAbi(["function mint(address to, uint256 value)", "function balanceOf(address) view returns (uint256)"]);
const secret = "local-inventory-demo-credential";
export { secret };

export async function sandboxDatabase(cleanup: Array<() => Promise<unknown>>) {
  const database = await PGlite.create();
  cleanup.push(() => database.close());
  const baseSchema = execFileSync(process.execPath, ["node_modules/drizzle-kit/bin.cjs", "export"], {
    encoding: "utf8", env: { ...process.env, DATABASE_URL: "postgres://local:local@127.0.0.1/local" },
  });
  await database.exec(baseSchema);
  await database.exec(await readFile(new URL("../migrations/0001_paygate402.sql", import.meta.url), "utf8"));
  await database.exec(await readFile(new URL("../migrations/0002_passwordless_auth.sql", import.meta.url), "utf8"));
  const pg = new PGLiteSocketServer({ db: database, host: "127.0.0.1", port: 0, maxConnections: 12 });
  await pg.start();
  cleanup.push(() => pg.stop());
  process.env.DATABASE_URL = "postgres://sandbox:sandbox@" + pg.getServerConn() + "/postgres";
  return database;
}

export async function sandbox(cleanup: Array<() => Promise<unknown>>) {
  const chain = ganache.server({ chain: { chainId: baseSepolia.id, hardfork: "shanghai" }, logging: { quiet: true } });
  await chain.listen(0, "127.0.0.1");
  cleanup.push(() => chain.close());
  const rpc = "http://127.0.0.1:" + chain.address().port;
  const [settler, buyer, seller] = Object.values(chain.provider.getInitialAccounts()).map(x => privateKeyToAccount(x.secretKey as Hex));
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(rpc) });
  const wallet = createWalletClient({ account: settler, chain: baseSepolia, transport: http(rpc) });
  const compiled = JSON.parse(solc.compile(JSON.stringify({
    language: "Solidity", sources: { "SandboxUSDC.sol": { content: source } },
    settings: { evmVersion: "shanghai", viaIR: true, optimizer: { enabled: true },
      outputSelection: { "*": { "*": ["evm.deployedBytecode.object"] } } },
  })));
  const bytecode = "0x" + compiled.contracts["SandboxUSDC.sol"].SandboxUSDC.evm.deployedBytecode.object;
  const localRpc = async (method: string, params: unknown[] = []) => chain.provider.request({ method, params } as never);
  await localRpc("evm_setAccountCode", [asset, bytecode]);
  const mint = await wallet.writeContract({ address: asset, abi: tokenAbi, functionName: "mint", args: [buyer.address, 10_000_000n] });
  await publicClient.waitForTransactionReceipt({ hash: mint });
  const balance = (address: Address) => publicClient.readContract({ address: asset, abi: tokenAbi, functionName: "balanceOf", args: [address] });
  const mine = async () => { await localRpc("evm_mine"); await localRpc("evm_mine"); await localRpc("evm_mine"); };

  const evm = new ExactEvmScheme(toFacilitatorEvmSigner({
    address: settler.address,
    readContract: args => publicClient.readContract(args),
    verifyTypedData: args => publicClient.verifyTypedData(args as never),
    writeContract: args => wallet.writeContract(args),
    sendTransaction: args => wallet.sendTransaction(args),
    getCode: args => publicClient.getCode(args),
    waitForTransactionReceipt: args => publicClient.waitForTransactionReceipt(args),
  }, { confirmationTimeoutMs: 10_000 }));
  const sdk = new x402Facilitator().register(network, evm);
  const facilitator = express().use(express.json());
  let settlements = 0;
  let loseSettlement = false;
  facilitator.get("/supported", (_req, res) => res.json(sdk.getSupported()));
  facilitator.post("/verify", async (req, res) => {
    try { res.json(await sdk.verify(req.body.paymentPayload, req.body.paymentRequirements)); }
    catch (err) { res.status(400).json((err as { verifyResponse?: unknown }).verifyResponse ?? { isValid: false }); }
  });
  facilitator.post("/settle", async (req, res) => {
    settlements++;
    try {
      const result = await sdk.settle(req.body.paymentPayload, req.body.paymentRequirements);
      if (loseSettlement) { loseSettlement = false; res.destroy(); }
      else res.json(result);
    } catch (err) {
      res.status(400).json((err as { settleResponse?: unknown }).settleResponse ?? { success: false, errorReason: "sandbox_error" });
    }
  });
  const facilitatorServer = await listen(facilitator);
  cleanup.push(facilitatorServer.close);

  const weather = express();
  let reads = 0;
  weather.get("/forecast/:city", async (req, res) => {
    reads++;
    if (req.params.city === "failure") return res.sendStatus(503);
    await new Promise(resolve => setTimeout(resolve, 60));
    res.json({ city: req.params.city, days: Number(req.query.days), condition: "clear" });
  });
  const weatherServer = await listen(weather);
  cleanup.push(weatherServer.close);

  const inventory = express().use(express.json());
  let writes = 0;
  let attempts = 0;
  const reservations = new Map<string, unknown>();
  const missing = new Set<string>();
  inventory.use((req, res, next) => {
    if (req.get("x-api-key") !== secret) return res.sendStatus(401);
    next();
  });
  inventory.post("/reservations", (req, res) => {
    const id = req.get("idempotency-key")!;
    attempts++;
    if (req.body.sku === "NEEDS-RETRY" && !missing.has(id)) { missing.add(id); return; }
    if (req.body.sku === "BAD") return res.sendStatus(422);
    if (!reservations.has(id)) {
      writes++;
      reservations.set(id, { reservation: id, sku: req.body.sku, quantity: req.body.quantity, rush: req.body.rush });
    }
    if (req.body.sku === "TIMEOUT") return;
    res.status(201).json(reservations.get(id));
  });
  inventory.get("/outcome", (req, res) => {
    const id = String(req.query.purchaseId);
    if (reservations.has(id)) return res.json({ state: "succeeded", result: reservations.get(id) });
    res.json({ state: missing.has(id) ? "not_executed" : "pending" });
  });
  const inventoryServer = await listen(inventory);
  cleanup.push(inventoryServer.close);
  return {
    rpc, facilitatorUrl: facilitatorServer.origin, weather: weatherServer.origin, inventory: inventoryServer.origin,
    seller, buyer, balance, mine, publicClient, get reads() { return reads; }, get writes() { return writes; },
    get attempts() { return attempts; }, get settlements() { return settlements; }, loseNextSettlement: () => { loseSettlement = true; },
    encryptionKey: toHex(randomBytes(32)).slice(2),
  };
}
