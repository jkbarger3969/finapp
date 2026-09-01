import { EventEmitter } from "events";
import { describe, expect, it, vi } from "vitest";

import { closeTunnel, openTunnel } from "./tunnels";

function fakeChildProcess() {
  const child: any = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = vi.fn();
  return child;
}

describe("openTunnel", () => {
  it("resolves once the local port starts accepting connections", async () => {
    const child = fakeChildProcess();
    const spawnFn = vi.fn().mockReturnValue(child);
    let checkCount = 0;
    const checkPort = vi.fn().mockImplementation(async () => {
      checkCount++;
      return checkCount >= 3; // "up" on the third poll
    });

    const handle = await openTunnel(
      { sshHost: "user@old-server", localPort: 27101 },
      { spawnFn, checkPort, pollIntervalMs: 1, timeoutMs: 5000 }
    );

    expect(handle.process).toBe(child);
    expect(checkPort).toHaveBeenCalledTimes(3);
    expect(spawnFn).toHaveBeenCalledWith(
      "ssh",
      expect.arrayContaining(["-L", "27101:localhost:27017", "user@old-server"])
    );
  });

  it("includes -p when a non-default ssh port is given", async () => {
    const child = fakeChildProcess();
    const spawnFn = vi.fn().mockReturnValue(child);
    const checkPort = vi.fn().mockResolvedValue(true);

    await openTunnel(
      { sshHost: "user@old-server", localPort: 27101, sshPort: 2222 },
      { spawnFn, checkPort, pollIntervalMs: 1 }
    );

    expect(spawnFn).toHaveBeenCalledWith("ssh", expect.arrayContaining(["-p", "2222"]));
  });

  it("rejects with ssh's stderr if the process exits before the tunnel comes up", async () => {
    const child = fakeChildProcess();
    const spawnFn = vi.fn().mockReturnValue(child);
    const checkPort = vi.fn().mockResolvedValue(false);

    const promise = openTunnel(
      { sshHost: "user@bad-host", localPort: 27101 },
      { spawnFn, checkPort, pollIntervalMs: 1, timeoutMs: 5000 }
    );

    child.stderr.emit("data", Buffer.from("Permission denied (publickey).\n"));
    child.emit("exit", 255);

    await expect(promise).rejects.toThrow(/Permission denied/);
    expect(child.kill).toHaveBeenCalled();
  });

  it("adds an actionable hint when ssh fails with a permission/auth error", async () => {
    const child = fakeChildProcess();
    const spawnFn = vi.fn().mockReturnValue(child);
    const checkPort = vi.fn().mockResolvedValue(false);

    const promise = openTunnel(
      { sshHost: "kbarger@172.16.2.3", localPort: 27101 },
      { spawnFn, checkPort, pollIntervalMs: 1, timeoutMs: 5000 }
    );

    child.stderr.emit(
      "data",
      Buffer.from("kbarger@172.16.2.3: Permission denied (publickey,password).\n")
    );
    child.emit("exit", 255);

    await expect(promise).rejects.toThrow(/ssh-copy-id kbarger@172\.16\.2\.3/);
  });

  it("does not add the auth hint for unrelated ssh failures", async () => {
    const child = fakeChildProcess();
    const spawnFn = vi.fn().mockReturnValue(child);
    const checkPort = vi.fn().mockResolvedValue(false);

    const promise = openTunnel(
      { sshHost: "user@unreachable-host", localPort: 27101 },
      { spawnFn, checkPort, pollIntervalMs: 1, timeoutMs: 5000 }
    );

    child.stderr.emit("data", Buffer.from("ssh: Could not resolve hostname unreachable-host: nodename nor servname provided\n"));
    child.emit("exit", 255);

    await expect(promise).rejects.not.toThrow(/ssh-copy-id/);
  });

  it("rejects with a timeout error if the port never comes up and ssh never exits", async () => {
    const child = fakeChildProcess();
    const spawnFn = vi.fn().mockReturnValue(child);
    const checkPort = vi.fn().mockResolvedValue(false);

    await expect(
      openTunnel(
        { sshHost: "user@old-server", localPort: 27101 },
        { spawnFn, checkPort, pollIntervalMs: 1, timeoutMs: 20 }
      )
    ).rejects.toThrow(/Timed out/);
    expect(child.kill).toHaveBeenCalled();
  });
});

describe("closeTunnel", () => {
  it("kills the underlying process", async () => {
    const child = fakeChildProcess();
    const spawnFn = vi.fn().mockReturnValue(child);
    const handle = await openTunnel(
      { sshHost: "user@old-server", localPort: 27101 },
      { spawnFn, checkPort: async () => true, pollIntervalMs: 1 }
    );

    closeTunnel(handle);

    expect(child.kill).toHaveBeenCalled();
  });
});
