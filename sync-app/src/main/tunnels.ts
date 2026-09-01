import { ChildProcess, spawn } from "child_process";
import net from "net";

export interface TunnelConfig {
  /** e.g. "user@old-server.example.com" */
  sshHost: string;
  sshPort?: number;
  localPort: number;
  /** port the target mongod listens on, from the remote box's own perspective (default 27017) */
  remotePort?: number;
  /** default "localhost" - the remote mongod is only reachable from the box itself */
  remoteHost?: string;
}

export interface TunnelHandle {
  process: ChildProcess;
  config: TunnelConfig;
}

export type SpawnFn = typeof spawn;

export interface OpenTunnelDeps {
  spawnFn?: SpawnFn;
  checkPort?: (port: number) => Promise<boolean>;
  pollIntervalMs?: number;
  timeoutMs?: number;
}

function defaultCheckPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });
}

/**
 * Opens an SSH local port-forward the same way `open-tunnels.sh` does, but
 * from the app itself: `ssh -N -L <localPort>:<remoteHost>:<remotePort>
 * <sshHost>`. Resolves once the local port actually accepts connections (not
 * just once the process spawns), or rejects with ssh's own stderr if it
 * exits early (e.g. auth failure) - assumes passwordless key-based SSH, per
 * how this project already connects to its servers.
 */
export async function openTunnel(
  config: TunnelConfig,
  deps: OpenTunnelDeps = {}
): Promise<TunnelHandle> {
  const {
    spawnFn = spawn,
    checkPort = defaultCheckPort,
    pollIntervalMs = 300,
    timeoutMs = 15000,
  } = deps;

  const args = [
    "-N",
    "-o",
    "BatchMode=yes",
    "-o",
    "ConnectTimeout=10",
    "-L",
    `${config.localPort}:${config.remoteHost ?? "localhost"}:${config.remotePort ?? 27017}`,
  ];
  if (config.sshPort) {
    args.push("-p", String(config.sshPort));
  }
  args.push(config.sshHost);

  const child = spawnFn("ssh", args);

  let stderr = "";
  child.stderr?.on("data", (chunk: Buffer) => {
    stderr += chunk.toString();
  });

  const exitedEarly = new Promise<never>((_, reject) => {
    child.once("exit", (code) => {
      const trimmed = stderr.trim() || "no error output";
      const hint = /permission denied/i.test(trimmed)
        ? `\n\nThis usually means passwordless SSH key login isn't set up for this host yet. ` +
          `In Terminal, run:\n  ssh-copy-id ${config.sshHost}\n` +
          `then confirm "ssh ${config.sshHost}" logs in with no password prompt before trying again here.`
        : "";
      reject(new Error(`ssh exited (code ${code}) before the tunnel came up: ${trimmed}${hint}`));
    });
    child.once("error", (err) => {
      reject(new Error(`Failed to start ssh: ${err.message}`));
    });
  });

  const waitUntilUp = (async () => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await checkPort(config.localPort)) return;
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
    throw new Error(`Timed out waiting for the tunnel on port ${config.localPort} to come up`);
  })();

  try {
    await Promise.race([waitUntilUp, exitedEarly]);
  } catch (err) {
    child.kill();
    throw err;
  }

  return { process: child, config };
}

export function closeTunnel(handle: TunnelHandle): void {
  handle.process.kill();
}
